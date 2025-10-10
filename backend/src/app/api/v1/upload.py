from fastapi import APIRouter, HTTPException, File, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import io
import json
import base64
import hashlib
import random
import httpx
import numpy as np
import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

router = APIRouter(tags=["upload"])

# Configuration - can be overridden via environment variables
RELAY_SERVER_URL = os.getenv('RELAY_SERVER_URL', 'http://0.0.0.0:9007')
MPC_NODE_1_URL = os.getenv('MPC_NODE_1_URL', 'http://0.0.0.0:9000')
MPC_NODE_2_URL = os.getenv('MPC_NODE_2_URL', 'http://0.0.0.0:9001')
MPC_NODE_3_URL = os.getenv('MPC_NODE_3_URL', 'http://0.0.0.0:9002')

# Custom JSON encoder to handle NaN/inf values
class NanInfEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, float):
            if np.isnan(obj) or np.isinf(obj):
                return None
        return super().default(obj)

def clean_data(obj):
    """Recursively clean NaN and Inf values from nested data structures"""
    if isinstance(obj, dict):
        return {k: clean_data(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_data(item) for item in obj]
    elif isinstance(obj, float):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return obj
    else:
        return obj

# =========================
# Cryptography Functions
# =========================

FIELD_POWER = 64
DECIMAL_PRECISION = 10
p = 2**255 - 19
q = 2**252 + 27742317777372353535851937790883648493
d = -121665 * pow(121666, p - 2, p) % p

def sha512(s):
    return hashlib.sha512(s).digest()

def hmac(key: bytes, message: bytes) -> bytes:
    block_size = hashlib.sha256().block_size
    if len(key) > block_size:
        key = hashlib.sha256(key).digest()
    if len(key) < block_size:
        key = key + b"\x00" * (block_size - len(key))
    o_key_pad = bytes((x ^ 0x5C) for x in key)
    i_key_pad = bytes((x ^ 0x36) for x in key)
    inner_hash = hashlib.sha256(i_key_pad + message).digest()
    return hashlib.sha256(o_key_pad + inner_hash).digest()

def hkdf_extract(salt: bytes, input_key_material: bytes) -> bytes:
    if salt is None or len(salt) == 0:
        salt = b"\x00" * hashlib.sha256().digest_size
    return hmac(key=salt, message=input_key_material)

def hkdf_expand(prk: bytes, info: bytes, length: int) -> bytes:
    hash_len = hashlib.sha256().digest_size
    if length > 255 * hash_len:
        raise ValueError("Cannot expand to more than 255 * HashLen bytes of output")
    okm = b""
    block = b""
    block_index = 1
    while len(okm) < length:
        block = hmac(key=prk, message=block + info + bytes([block_index]))
        okm += block
        block_index += 1
    return okm[:length]

def modp_inv(x):
    return pow(x, p - 2, p)

def point_add(P, Q):
    A, B = (P[1] - P[0]) * (Q[1] - Q[0]) % p, (P[1] + P[0]) * (Q[1] + Q[0]) % p
    C, D = 2 * P[3] * Q[3] * d % p, 2 * P[2] * Q[2] % p
    E, F, G, H = B - A, D - C, D + C, B + A
    return (E * F, G * H, F * G, E * H)

def point_mul(s, P):
    Q = (0, 1, 1, 0)
    while s > 0:
        if s & 1:
            Q = point_add(Q, P)
        P = point_add(P, P)
        s >>= 1
    return Q

modp_sqrt_m1 = pow(2, (p - 1) // 4, p)

def recover_x(y, sign):
    if y >= p:
        return None
    x2 = (y * y - 1) * modp_inv(d * y * y + 1)
    if x2 == 0:
        if sign:
            return None
        else:
            return 0
    x = pow(x2, (p + 3) // 8, p)
    if (x * x - x2) % p != 0:
        x = x * modp_sqrt_m1 % p
    if (x * x - x2) % p != 0:
        return None
    if (x & 1) != sign:
        x = p - x
    return x

g_y = 4 * modp_inv(5) % p
g_x = recover_x(g_y, 0)
G = (g_x, g_y, 1, g_x * g_y % p)

def point_compress(P):
    zinv = modp_inv(P[2])
    x = P[0] * zinv % p
    y = P[1] * zinv % p
    return int.to_bytes(y | ((x & 1) << 255), 32, "little")

def point_decompress(s):
    if len(s) != 32:
        raise Exception("Invalid input length for decompression")
    y = int.from_bytes(s, "little")
    sign = y >> 255
    y &= (1 << 255) - 1
    x = recover_x(y, sign)
    if x is None:
        return None
    else:
        return (x, y, 1, x * y % p)

def convert2wei(P):
    zinv = modp_inv(P[2])
    y = P[1] * zinv % p
    delta = 19298681539552699237261830834781317975544997444273427339909597334652188435537
    oneplusy = (1 + y) % p
    oneminusy = (1 - y) % p
    invoneminusy = modp_inv(oneminusy)
    t = (oneplusy * invoneminusy) % p
    x = (t + delta) % p
    return x

def generate_keys():
    private_key_bytes = random.randbytes(32)
    private_key = int.from_bytes(private_key_bytes[:32], "little")
    private_key &= (1 << 254) - 8
    private_key |= 1 << 254
    public_key = point_mul(private_key, G)
    compressed_pk = point_compress(public_key)
    nonce = random.randbytes(32)
    return (compressed_pk, private_key, nonce)

def get_shared_key(private_key):
    server_pk_b64 = "ZzEeC1F+lWB6Qc9HcLtsm3KRNC9gpGdqx0fvhN25rj8="
    server_nonce_b64 = "bwKOJaOVuaN/B+jL3vneKxI329OmV2oa9ogZrqVXiwU="

    server_pk = base64.b64decode(server_pk_b64)
    server_nonce = base64.b64decode(server_nonce_b64)
    remote_public_key = point_decompress(server_pk)
    if remote_public_key is None:
        return None
    mul_val = point_mul(private_key, remote_public_key)
    shared_key = convert2wei(mul_val).to_bytes(32, "big")
    return shared_key, server_nonce

def get_xored_nonce(bytes_your_nonce: bytes, bytes_remote_nonce: bytes) -> bytes:
    out = b""
    for b1, b2 in zip(bytes_your_nonce, bytes_remote_nonce):
        out += (b1 ^ b2).to_bytes(length=1, byteorder="big")
    return out

def get_session_key(xored_nonce: bytes, shared_key: bytes):
    salt = b""
    for i in range(20):
        salt += xored_nonce[i].to_bytes(length=1, byteorder="big")
    prk = hkdf_extract(salt=salt, input_key_material=shared_key)
    session_key = hkdf_expand(prk=prk, info=b"", length=32)
    return session_key

def get_iv(xored_nonce: bytes):
    iv = b""
    for i in range(12):
        iv += xored_nonce[i + 20].to_bytes(length=1, byteorder="big")
    return iv

def encrypt_gcm(plaintext, key, iv, associated_data=None):
    encryptor = Cipher(
        algorithms.AES(key), modes.GCM(iv), backend=default_backend()
    ).encryptor()

    if associated_data:
        encryptor.authenticate_additional_data(associated_data)

    ciphertext = encryptor.update(plaintext) + encryptor.finalize()
    return ciphertext, encryptor.tag

def get_ciphertext(data_bytes: bytes, iv: bytes, session_key: bytes):
    ciphertext, _tag = encrypt_gcm(data_bytes, session_key, iv)
    return ciphertext

def get_num_pltext_byte(value):
    num = int(float(value) * 2**DECIMAL_PRECISION).to_bytes(FIELD_POWER // 8, "big")
    return num

def get_banking_plaintext(entry):
    pltext = b""
    company_name = entry.get("Company Legal Name", "")
    pltext += company_name.encode("utf-8")
    pltext += b"\x00" * (60 - len(company_name))
    pltext += get_num_pltext_byte(str(entry.get("Year", 0)))
    pltext += get_num_pltext_byte(str(entry.get("Month", 0)))

    primary_bank = entry.get("Primary Bank", "")
    pltext += primary_bank.encode("utf-8")
    pltext += b"\x00" * (20 - len(primary_bank))

    banking_fields = [
        "Monthly POS Transactions",
        "Monthly POS Sales Amount",
        "Monthly Digital Transactions",
        "Monthly Digital Sales Amount",
        "Monthly Utility Bill Paid",
        "Monthly Bank Balance",
        "Monthly EMI",
        "Monthly Number of Bounced Cheques"
    ]

    for field in banking_fields:
        pltext += get_num_pltext_byte(str(entry.get(field, 0)))

    return pltext

def get_financial_plaintext(entry):
    pltext = b""
    company_name = entry.get("Company Legal Name", "")
    pltext += company_name.encode("utf-8")
    pltext += b"\x00" * (60 - len(company_name))
    pltext += get_num_pltext_byte(str(entry.get("Year", 0)))

    financial_fields = [
        "Annual Revenue",
        "Net Profit",
        "Total Liabilities",
        "Total Debt",
        "Shareholder Equity",
        "Employees"
    ]

    for field in financial_fields:
        pltext += get_num_pltext_byte(str(entry.get(field, 0)))

    return pltext

def get_tax_plaintext(entry):
    pltext = b""
    company_name = entry.get("Company Legal Name", "")
    pltext += company_name.encode("utf-8")
    pltext += b"\x00" * (60 - len(company_name))
    pltext += get_num_pltext_byte(str(entry.get("Year", 0)))

    tax_filed = entry.get("Income tax Return Filed", "")
    if tax_filed == "Yes":
        pltext += get_num_pltext_byte("1")
    else:
        pltext += get_num_pltext_byte("0")

    filing_status = entry.get("Filing Status", "")
    pltext += filing_status.encode("utf-8")
    pltext += b"\x00" * (15 - len(filing_status))

    gst_status = entry.get("GST/Tax Filing Status", "")
    pltext += gst_status.encode("utf-8")
    pltext += b"\x00" * (10 - len(gst_status))

    return pltext

def get_credit_plaintext(entry):
    pltext = b""
    company_name = entry.get("Company Legal Name", "")
    pltext += company_name.encode("utf-8")
    pltext += b"\x00" * (60 - len(company_name))
    pltext += get_num_pltext_byte(str(entry.get("Year", 0)))
    pltext += get_num_pltext_byte(str(entry.get("Loan Default Count", 0)))
    return pltext

# =========================
# Helper Functions
# =========================

def safe_float(value, default=0.0):
    """Safely convert value to float, handling None and NaN"""
    if value is None or (isinstance(value, float) and (pd.isna(value) or value == float('inf') or value == float('-inf'))):
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default

def safe_int(value, default=0):
    """Safely convert value to int, handling None and NaN"""
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return default
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

# =========================
# Pydantic Models
# =========================

class CompanyDataRequest(BaseModel):
    company: str
    excel_data: Dict[str, List[Dict[str, Any]]]

class CiphertextRequest(BaseModel):
    category: str
    data: Dict[str, List[Dict[str, Any]]]

class PostToMPCRequest(BaseModel):
    category: str
    ciphertext: List[Dict[str, str]]
    client_info: Dict[str, str]
    email: str
    start_date: str
    end_date: str
    relay_id: str
    relay_server_url: Optional[str] = None
    mpc_node_urls: Optional[List[str]] = None

# =========================
# API Endpoints
# =========================

@router.post("/api/upload-excel")
async def upload_excel(file: UploadFile = File(...)):
    """Upload and process Excel file, return available companies"""
    try:
        contents = await file.read()
        print(f"Received file: {file.filename}, size: {len(contents)} bytes")

        # Load all sheets
        sheet_names = ['Open Banking Data', 'Financial statements - SME self', 'Tax Authorities', 'Credit Bureaus']
        sheets_data = {}
        companies = set()

        for sheet_name in sheet_names:
            try:
                df = pd.read_excel(io.BytesIO(contents), sheet_name=sheet_name, skiprows=1)
                print(f"Loaded sheet {sheet_name}: {len(df)} rows")
                # Replace NaN and inf values with None
                df = df.replace([np.inf, -np.inf], np.nan)
                sheets_data[sheet_name] = df.to_dict('records')

                # Extract companies
                if 'Company Legal Name' in df.columns:
                    companies.update(df['Company Legal Name'].dropna().unique())
            except Exception as e:
                print(f"Error reading sheet {sheet_name}: {e}")
                import traceback
                traceback.print_exc()
                continue

        response_data = {
            "status": "success",
            "companies": sorted(list(companies)),
            "sheets_data": sheets_data
        }

        # Clean NaN/Inf values before returning
        cleaned_data = clean_data(response_data)
        return JSONResponse(content=cleaned_data)
    except Exception as e:
        print(f"Upload error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/api/generate-json")  
async def generate_json(request: CompanyDataRequest):
    """Generate JSON files for a specific company"""
    try:
        company = request.company
        excel_data = request.excel_data

        result = {
            "openBanking": [],
            "financialStatements": [],
            "taxAuthorities": [],
            "creditBureaus": []
        }

        # Process Open Banking Data
        if 'Open Banking Data' in excel_data:
            for row in excel_data['Open Banking Data']:
                if row.get('Company Legal Name') == company:
                    result["openBanking"].append({
                        'Company Legal Name': row.get('Company Legal Name'),
                        'Year': safe_int(row.get('Year'), 0),
                        'Month': safe_int(row.get('Month'), 0),
                        'Primary Bank': row.get('Primary Bank') if row.get('Primary Bank') else 'N/A',
                        'Monthly POS Transactions': safe_int(row.get('Monthly POS Transactions'), 0),
                        'Monthly POS Sales Amount': safe_float(row.get('Monthly POS Sales Amount'), 0),
                        'Monthly Digital Transactions': safe_int(row.get('Monthly Digital Transactions'), 0),
                        'Monthly Digital Sales Amount': safe_float(row.get('Monthly Digital Sales Amount'), 0),
                        'Monthly Utility Bill Paid': safe_float(row.get('Monthly Utility Bill Paid'), 0),
                        'Monthly Bank Balance': safe_float(row.get('Monthly Bank Balance'), 0),
                        'Monthly EMI': safe_float(row.get('Monthly EMI'), 0),
                        'Monthly Number of Bounced Cheques': safe_int(row.get('Monthly Number of Bounced Cheques'), 0)
                    })

        # Process Financial Statements
        if 'Financial statements - SME self' in excel_data:
            for row in excel_data['Financial statements - SME self']:
                if row.get('Company Legal Name') == company:
                    result["financialStatements"].append({
                        'Company Legal Name': row.get('Company Legal Name'),
                        'Year': safe_int(row.get('Year'), 0),
                        'Annual Revenue': safe_float(row.get('Annual Revenue'), 0),
                        'Net Profit': safe_float(row.get('Net Profit'), 0),
                        'Total Liabilities': safe_float(row.get('Total Liabilities'), 0),
                        'Total Debt': safe_float(row.get('Total Debt'), 0),
                        'Shareholder Equity': safe_float(row.get('Shareholder Equity'), 0),
                        'Employees': safe_int(row.get('Employees'), 0)
                    })

        # Process Tax Authorities
        if 'Tax Authorities' in excel_data:
            for row in excel_data['Tax Authorities']:
                if row.get('Company Legal Name') == company:
                    result["taxAuthorities"].append({
                        'Company Legal Name': row.get('Company Legal Name'),
                        'Year': safe_int(row.get('Year'), 0),
                        'Income tax Return Filed': row.get('Income tax Return Filed'),
                        'Filing Status': row.get('Filing Status'),
                        'GST/Tax Filing Status': row.get('GST/Tax Filing Status')
                    })

        # Process Credit Bureaus
        if 'Credit Bureaus' in excel_data:
            for row in excel_data['Credit Bureaus']:
                if row.get('Company Legal Name') == company:
                    result["creditBureaus"].append({
                        'Company Legal Name': row.get('Company Legal Name'),
                        'Year': safe_int(row.get('Year'), 0),
                        'Loan Default Count': safe_int(row.get('Loan Default Count'), 0)
                    })

        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/api/generate-ciphertext")
async def generate_ciphertext(request: CiphertextRequest):
    """Generate ciphertext for a specific category"""
    try:
        category = request.category
        data = request.data

        # Generate client keys
        self_pk, self_sk, self_nonce = generate_keys()

        # Get shared key and derive session key
        shared_key, server_nonce = get_shared_key(self_sk)
        xored_nonce = get_xored_nonce(self_nonce, server_nonce)
        iv = get_iv(xored_nonce)
        session_key = get_session_key(xored_nonce, shared_key)

        # Process and encrypt the selected category
        results = {}

        # Banking data
        if category == "banking":
            banking_data = data.get("openBanking", [])
            banking_pltext = b""
            for entry in banking_data:
                banking_pltext += get_banking_plaintext(entry)
            banking_cipher = get_ciphertext(banking_pltext, iv, session_key)
            ciph_b64 = base64.b64encode(banking_cipher).decode('ascii')
            results["banking"] = ciph_b64
        else:
            empty_cipher = get_ciphertext(b"", iv, session_key)
            ciph_b64 = base64.b64encode(empty_cipher).decode('ascii')
            results["banking"] = ciph_b64

        # Financial data
        if category == "financial":
            financial_data = data.get("financialStatements", [])
            financial_pltext = b""
            for entry in financial_data:
                financial_pltext += get_financial_plaintext(entry)
            financial_cipher = get_ciphertext(financial_pltext, iv, session_key)
            ciph_b64 = base64.b64encode(financial_cipher).decode('ascii')
            results["financial"] = ciph_b64
        else:
            empty_cipher = get_ciphertext(b"", iv, session_key)
            ciph_b64 = base64.b64encode(empty_cipher).decode('ascii')
            results["financial"] = ciph_b64

        # Tax data
        if category == "tax":
            tax_data = data.get("taxAuthorities", [])
            tax_pltext = b""
            for entry in tax_data:
                tax_pltext += get_tax_plaintext(entry)
            tax_cipher = get_ciphertext(tax_pltext, iv, session_key)
            ciph_b64 = base64.b64encode(tax_cipher).decode('ascii')
            results["tax"] = ciph_b64
        else:
            empty_cipher = get_ciphertext(b"", iv, session_key)
            ciph_b64 = base64.b64encode(empty_cipher).decode('ascii')
            results["tax"] = ciph_b64

        # Credit data
        if category == "credit":
            credit_data = data.get("creditBureaus", [])
            credit_pltext = b""
            for entry in credit_data:
                credit_pltext += get_credit_plaintext(entry)
            credit_cipher = get_ciphertext(credit_pltext, iv, session_key)
            ciph_b64 = base64.b64encode(credit_cipher).decode('ascii')
            results["credit"] = ciph_b64
        else:
            empty_cipher = get_ciphertext(b"", iv, session_key)
            ciph_b64 = base64.b64encode(empty_cipher).decode('ascii')
            results["credit"] = ciph_b64

        # Return both ciphertext and client_info
        client_info = {
            "public_key": base64.b64encode(self_pk).decode('ascii'),
            "nonce": base64.b64encode(self_nonce).decode('ascii')
        }

        return {
            "ciphertext": [results],
            "client_info": client_info
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/api/generate-relay-id")
async def generate_relay_id(relay_url: Optional[str] = None):
    """Generate a new relay ID by calling the relay server"""
    try:
        relay_server = relay_url or RELAY_SERVER_URL
        async with httpx.AsyncClient() as client:
            response = await client.post(f'{relay_server}/relay')
            if response.status_code == 200:
                data = response.json()
                return {"relay_id": data["relay_id"]}
            else:
                raise HTTPException(status_code=response.status_code, detail="Failed to generate relay ID")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/post-to-mpc-nodes")
async def post_to_mpc_nodes(request: PostToMPCRequest):
    """Post ciphertext to all three MPC nodes"""
    try:
        # Use provided URLs or defaults
        relay_server = request.relay_server_url or RELAY_SERVER_URL

        # Convert HTTP relay URL to WebSocket
        # Replace 127.0.0.1 with 0.0.0.0 for WebSocket endpoint (required by relay server)
        relay_ws = relay_server.replace('http://', 'ws://').replace('https://', 'wss://')
        relay_ws = relay_ws.replace('127.0.0.1', '0.0.0.0').replace('localhost', '0.0.0.0')
        relay_endpoint = f"{relay_ws}/relay/{request.relay_id}"

        # Default MPC node URLs
        default_node_urls = [MPC_NODE_1_URL, MPC_NODE_2_URL, MPC_NODE_3_URL]
        node_urls = request.mpc_node_urls if request.mpc_node_urls and len(request.mpc_node_urls) == 3 else default_node_urls

        mpc_nodes = [
            f'{node_urls[0]}/node/userdata',
            f'{node_urls[1]}/node/userdata',
            f'{node_urls[2]}/node/userdata'
        ]

        results = []

        # Create client with connection pooling disabled to avoid keep-alive issues
        limits = httpx.Limits(max_keepalive_connections=0, max_connections=10)
        async with httpx.AsyncClient(timeout=120.0, limits=limits) as client:
            for i, node_url in enumerate(mpc_nodes):
                payload = {
                    "email": request.email,
                    "ciphertext": request.ciphertext,
                    "relay_server_endpoint": relay_endpoint,
                    "start_date": request.start_date,
                    "end_date": request.end_date,
                    "category": request.category,
                    "client_info": request.client_info
                }

                try:
                    print(f"Sending to node {i+1} at {node_url}")
                    print(f"Relay endpoint: {relay_endpoint}")
                    print(f"Payload size: {len(str(payload))} chars")
                    response = await client.post(node_url, json=payload)
                    print(f"Node {i+1} response status: {response.status_code}")
                    if response.status_code in [200, 201]:  # Accept both 200 OK and 201 Created
                        result = response.json()
                        print(f"Node {i+1} response: {result}")
                        results.append({
                            "node": i + 1,
                            "status": "success",
                            "task_id": result.get("task_id"),
                            "url": node_url.replace('/node/userdata', '')
                        })
                    else:
                        print(f"Node {i+1} error status: {response.status_code}")
                        results.append({
                            "node": i + 1,
                            "status": "error",
                            "error": f"HTTP {response.status_code}"
                        })
                except Exception as e:
                    print(f"Node {i+1} exception: {e}")
                    results.append({
                        "node": i + 1,
                        "status": "error",
                        "error": str(e)
                    })

        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
