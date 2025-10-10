from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import httpx
import os
import asyncio

router = APIRouter(tags=["query"])

# Configuration - can be overridden via environment variables
RELAY_SERVER_URL = os.getenv('RELAY_SERVER_URL', 'http://0.0.0.0:9007')
MPC_NODE_1_URL = os.getenv('MPC_NODE_1_URL', 'http://0.0.0.0:9000')
MPC_NODE_2_URL = os.getenv('MPC_NODE_2_URL', 'http://0.0.0.0:9001')
MPC_NODE_3_URL = os.getenv('MPC_NODE_3_URL', 'http://0.0.0.0:9002')

# =========================
# Pydantic Models
# =========================

class QueryRequest(BaseModel):
    email: str
    category: str
    query_str: str
    company_name: str
    year: int
    start_date: str
    end_date: str
    relay_server_url: Optional[str] = None
    mpc_node_urls: Optional[List[str]] = None

class ScoreGenerationRequest(BaseModel):
    email: str
    company_name: str
    year: int
    start_date: str
    end_date: str
    relay_server_url: Optional[str] = None
    mpc_node_urls: Optional[List[str]] = None

class PollRequest(BaseModel):
    task_ids: List[Dict[str, Any]]
    relay_id: str

# =========================
# Scoring Logic
# =========================

QUERIES = {
    'banking': [
        'AvgBankBalance',
        'AnnualBouncedCheques',
        'AnnualDigitalSalesAmt',
        'AnnualDigitalTxn',
        'AnnualEmi',
        'AnnualPOSSalesAmt',
        'AnnualPOSTnx',
        'AnnualUtilityBillPaid'
    ],
    'credit': ['GetLoanDefaultCounts'],
    'financial': [
        'GetDebtToEquity',
        'GetProfitMargin',
        'GetRevenueGrowthRate',
        'GetEmployeeCount'
    ],
    'tax': [
        'GetFilingStatus',
        'GetGSTTaxFilingStatus',
        'GetITRFiled'
    ]
}

def calculate_metric_score(metric: str, value: Any) -> float:
    """Calculate score for a specific metric based on its value"""
    if value is None or value == '':
        return 0.0

    try:
        val = float(value)
    except (ValueError, TypeError):
        # Handle string values (Filed/Not Filed)
        if metric in ['GetFilingStatus', 'GetITRFiled']:
            val_str = str(value).lower()
            if 'filed on time' in val_str or val_str == 'filed on time':
                return 10.0
            elif 'filed late' in val_str or val_str == 'filed late':
                return 2.5
            elif 'filed' in val_str:
                return 10.0  # Assume on time if just "filed"
            return 0.0
        if metric == 'GetGSTTaxFilingStatus':
            return 10.0 if 'filed' in str(value).lower() else 0.0
        return 0.0

    # Financial Health metrics
    if metric == 'GetProfitMargin':
        # Value is already in percentage format (12.62 means 12.62%, not 0.1262)
        percent = val  # Don't multiply by 100
        if percent < 0: return 0.0
        if percent < 5: return 2.5
        if percent < 10: return 5.0
        if percent < 20: return 7.5
        return 10.0

    if metric == 'GetDebtToEquity':
        if val < 0.5: return 10.0
        if val < 1: return 7.5
        if val < 1.5: return 5.0
        if val < 2: return 2.5
        return 0.0

    if metric == 'GetRevenueGrowthRate':
        # Value is already in percentage format (0.69 means 0.69%, not 0.0069)
        percent = val  # Don't multiply by 100
        if percent < 2.5: return 0.0
        if percent < 5: return 2.5
        if percent < 10: return 5.0
        if percent < 15: return 7.5
        return 10.0

    # Liquidity & Repayment metrics
    if metric == 'AvgBankBalance':
        if val < 5000: return 0.0
        if val < 10000: return 2.5
        if val < 15000: return 5.0
        if val < 20000: return 7.5
        return 10.0

    if metric == 'AnnualBouncedCheques':
        if val == 0: return 10.0
        if val == 1: return 7.5
        if val == 2: return 5.0
        return 0.0

    # Compliance Behavior metrics
    if metric == 'GetLoanDefaultCounts':
        if val == 0: return 10.0
        if val == 1: return 7.5
        if val == 2: return 5.0
        return 0.0

    # Operational Size & Stability metrics
    if metric == 'GetEmployeeCount':
        if val < 50: return 5.0
        if val < 100: return 7.5
        return 10.0

    if metric == 'AnnualUtilityBillPaid':
        if val < 20000: return 0.0
        if val < 35000: return 2.5
        if val < 45000: return 5.0
        if val < 55000: return 7.5
        return 10.0

    if metric == 'AnnualPOSTnx':
        if val < 30000: return 0.0
        if val < 45000: return 2.5
        if val < 60000: return 5.0
        if val < 75000: return 7.5
        return 10.0

    return 0.0

def get_metric_weight(metric: str) -> float:
    """Get the weight percentage for a metric"""
    weights = {
        # Financial Health (35%)
        'GetProfitMargin': 15.0,
        'GetDebtToEquity': 10.0,
        'GetRevenueGrowthRate': 10.0,

        # Liquidity & Repayment (25%)
        'AvgBankBalance': 10.0,
        'EMICoverageRatio': 10.0,  # Calculated from multiple queries
        'AnnualBouncedCheques': 5.0,

        # Compliance Behavior (20%)
        'GetFilingStatus': 10.0,  # Tax Return Filed
        'GetGSTTaxFilingStatus': 5.0,  # GST Filing History
        'GetLoanDefaultCounts': 5.0,  # Loan Default Count

        # Operational Size & Stability (20%)
        'GetEmployeeCount': 5.0,
        'AnnualUtilityBillPaid': 5.0,
        'AnnualPOSTnx': 10.0
    }
    return weights.get(metric, 0.0)

def calculate_emi_coverage_ratio(all_results: Dict[str, Dict[str, Any]]) -> float:
    """Calculate EMI Coverage Ratio: (Digital Sales + Digital Txn + POS Sales) / Annual EMI"""
    try:
        banking_results = all_results.get('banking', {})

        # Extract values
        digital_sales = 0.0
        digital_txn = 0.0
        pos_sales = 0.0
        annual_emi = 0.0

        for query_name, data in banking_results.items():
            if isinstance(data, dict) and 'error' not in data:
                if query_name == 'AnnualDigitalSalesAmt':
                    for key, value in data.items():
                        if key != 'query' and value is not None:
                            digital_sales = float(value)
                elif query_name == 'AnnualDigitalTxn':
                    for key, value in data.items():
                        if key != 'query' and value is not None:
                            digital_txn = float(value)
                elif query_name == 'AnnualPOSSalesAmt':
                    for key, value in data.items():
                        if key != 'query' and value is not None:
                            pos_sales = float(value)
                elif query_name == 'AnnualEmi':
                    for key, value in data.items():
                        if key != 'query' and value is not None:
                            annual_emi = float(value)

        # Calculate ratio
        if annual_emi > 0:
            return (digital_sales + digital_txn + pos_sales) / annual_emi
        return 0.0
    except:
        return 0.0

def calculate_emi_coverage_score(ratio: float) -> float:
    """Score EMI Coverage Ratio"""
    if ratio < 15: return 0.0
    if ratio < 25: return 2.5
    if ratio < 35: return 5.0
    if ratio < 45: return 7.5
    return 10.0

def calculate_total_score(all_results: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate total weighted score from all query results with detailed breakdown"""
    category_scores = {
        'Financial Health': {'score': 0.0, 'weight': 35.0, 'details': []},
        'Liquidity & Repayment': {'score': 0.0, 'weight': 25.0, 'details': []},
        'Compliance Behavior': {'score': 0.0, 'weight': 20.0, 'details': []},
        'Operational Size & Stability': {'score': 0.0, 'weight': 20.0, 'details': []}
    }

    # Calculate EMI Coverage Ratio separately
    emi_coverage_ratio = calculate_emi_coverage_ratio(all_results)
    emi_coverage_score = calculate_emi_coverage_score(emi_coverage_ratio)
    emi_weight = get_metric_weight('EMICoverageRatio')

    category_scores['Liquidity & Repayment']['details'].append({
        'metric': 'EMI Coverage Ratio',
        'value': emi_coverage_ratio,
        'score': emi_coverage_score,
        'weight': emi_weight,
        'product': (emi_coverage_score / 10.0) * emi_weight
    })
    category_scores['Liquidity & Repayment']['score'] += (emi_coverage_score / 10.0) * emi_weight

    # Map queries to categories
    category_mapping = {
        'GetProfitMargin': 'Financial Health',
        'GetDebtToEquity': 'Financial Health',
        'GetRevenueGrowthRate': 'Financial Health',
        'AvgBankBalance': 'Liquidity & Repayment',
        'AnnualBouncedCheques': 'Liquidity & Repayment',
        'GetFilingStatus': 'Compliance Behavior',
        'GetITRFiled': 'Compliance Behavior',
        'GetGSTTaxFilingStatus': 'Compliance Behavior',
        'GetLoanDefaultCounts': 'Compliance Behavior',
        'GetEmployeeCount': 'Operational Size & Stability',
        'AnnualUtilityBillPaid': 'Operational Size & Stability',
        'AnnualPOSTnx': 'Operational Size & Stability'
    }

    for category, queries in all_results.items():
        for query_name, data in queries.items():
            # Skip queries used in EMI Coverage calculation
            if query_name in ['AnnualEmi', 'AnnualDigitalSalesAmt', 'AnnualDigitalTxn', 'AnnualPOSSalesAmt']:
                continue

            # Skip if not in mapping
            if query_name not in category_mapping:
                continue

            if data and not isinstance(data, dict) or (isinstance(data, dict) and 'error' not in data):
                if isinstance(data, dict):
                    for key, value in data.items():
                        if key != 'query':
                            score = calculate_metric_score(query_name, value)
                            weight = get_metric_weight(query_name)
                            product = (score / 10.0) * weight

                            cat_name = category_mapping[query_name]
                            category_scores[cat_name]['details'].append({
                                'metric': query_name,
                                'value': value,
                                'score': score,
                                'weight': weight,
                                'product': product
                            })
                            category_scores[cat_name]['score'] += product

    # Calculate total
    total_score = sum(cat['score'] for cat in category_scores.values())

    return {
        'total_score': round(total_score, 2),
        'category_breakdown': category_scores,
        'emi_coverage_ratio': emi_coverage_ratio
    }

def get_tier_rating(score: int) -> Dict[str, str]:
    """Get tier rating based on score"""
    if score >= 75:
        return {
            'tier': 'A',
            'interpretation': 'Strong financials & low risk',
            'recommendation': 'Eligible for full credit approval'
        }
    if score >= 60:
        return {
            'tier': 'B',
            'interpretation': 'Moderate strength; some flags',
            'recommendation': 'Lending with collateral or limits'
        }
    return {
        'tier': 'C',
        'interpretation': 'High concerns or weak fundamentals',
        'recommendation': 'Deprioritize or decline'
    }

async def poll_query_result(task_ids: List[Dict], max_attempts: int = 60, poll_interval: int = 2) -> Dict:
    """Poll MPC nodes for query results"""
    for attempt in range(max_attempts):
        await asyncio.sleep(poll_interval)

        all_success = True
        results = []

        async with httpx.AsyncClient(timeout=10.0) as client:
            for task in task_ids:
                if task['status'] == 'success':
                    try:
                        response = await client.get(f"{task['url']}/node/query/{task['task_id']}")
                        result = response.json()

                        if result.get('status') == 'success' and result.get('error') is None:
                            results.append(result.get('result'))
                        elif result.get('error'):
                            all_success = False
                        else:
                            all_success = False
                    except Exception:
                        all_success = False
                else:
                    all_success = False

        if all_success and len(results) == 3:
            return {'success': True, 'data': results[0]}

    return {'success': False, 'error': 'Polling timeout'}

def check_category_has_data(category_results: List[Dict]) -> bool:
    """Check if ALL queries in a category have valid data (no N/A values)"""
    for result in category_results:
        if result['result']['success'] and result['result']['data']:
            query_has_valid_data = False
            for key, value in result['result']['data'].items():
                if key != 'query':
                    if isinstance(value, (int, float)) or (isinstance(value, str) and value != ''):
                        query_has_valid_data = True
            if not query_has_valid_data:
                return False
        else:
            return False
    return True

# =========================
# API Endpoints
# =========================

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

@router.post("/api/execute-query")
async def execute_query(request: QueryRequest):
    """Execute MPC query on all three nodes"""
    try:
        # Use provided URLs or defaults
        relay_server = request.relay_server_url or RELAY_SERVER_URL

        # Default MPC node URLs
        default_node_urls = [MPC_NODE_1_URL, MPC_NODE_2_URL, MPC_NODE_3_URL]
        node_urls = request.mpc_node_urls if request.mpc_node_urls and len(request.mpc_node_urls) == 3 else default_node_urls

        # First generate relay ID
        async with httpx.AsyncClient() as client:
            relay_response = await client.post(f'{relay_server}/relay')
            if relay_response.status_code != 200:
                raise HTTPException(status_code=500, detail="Failed to generate relay ID")

            relay_data = relay_response.json()
            relay_id = relay_data["relay_id"]

        # Extract host and port from relay_server for WebSocket endpoint
        # Replace 127.0.0.1 with 0.0.0.0 for WebSocket endpoint (required by relay server)
        relay_ws = relay_server.replace('http://', 'ws://').replace('https://', 'wss://')
        relay_ws = relay_ws.replace('127.0.0.1', '0.0.0.0').replace('localhost', '0.0.0.0')
        relay_endpoint = f"{relay_ws}/relay/{relay_id}"

        mpc_nodes = [
            {'url': f'{node_urls[0]}/node/query', 'party_index': 0},
            {'url': f'{node_urls[1]}/node/query', 'party_index': 1},
            {'url': f'{node_urls[2]}/node/query', 'party_index': 2}
        ]

        results = []

        async with httpx.AsyncClient(timeout=30.0) as client:
            for i, node in enumerate(mpc_nodes):
                payload = {
                    "email": request.email,
                    "query_type": request.category,
                    "query_str": request.query_str,
                    "party_index": node['party_index'],
                    "relay_server_endpoint": relay_endpoint,
                    "year": request.year
                }

                # Add optional fields only if they have values
                if request.start_date:
                    payload["start_date"] = request.start_date
                if request.end_date:
                    payload["end_date"] = request.end_date
                if request.category:
                    payload["category"] = request.category
                if request.company_name:
                    payload["company_name"] = request.company_name

                try:
                    response = await client.post(node['url'], json=payload)
                    if response.status_code in [200, 201]:
                        result = response.json()
                        results.append({
                            "node": i + 1,
                            "status": "success",
                            "task_id": result.get("task_id"),
                            "url": node['url'].replace('/node/query', '')
                        })
                    else:
                        results.append({
                            "node": i + 1,
                            "status": "error",
                            "error": f"HTTP {response.status_code}"
                        })
                except Exception as e:
                    results.append({
                        "node": i + 1,
                        "status": "error",
                        "error": str(e)
                    })

        return {
            "relay_id": relay_id,
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/query-status/{node_url}/{task_id}")
async def query_status(node_url: str, task_id: str):
    """Check the status of a query task"""
    try:
        # Decode node_url (it's base64 encoded to handle slashes in URL)
        import base64
        decoded_url = base64.b64decode(node_url).decode('utf-8')

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{decoded_url}/node/query/{task_id}")
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=response.status_code, detail="Failed to get status")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/poll-results")
async def poll_results(request: PollRequest):
    """Poll for query results from all MPC nodes"""
    max_attempts = 60
    poll_interval = 2

    for attempt in range(max_attempts):
        await asyncio.sleep(poll_interval)

        all_success = True
        results = []
        node_statuses = []

        async with httpx.AsyncClient(timeout=10.0) as client:
            for task in request.task_ids:
                node_status = {
                    'node': task.get('node'),
                    'status': 'pending'
                }

                if task.get('status') == 'success':
                    try:
                        response = await client.get(f"{task['url']}/node/query/{task['task_id']}")
                        result = response.json()

                        if result.get('status') == 'success' and result.get('error') is None:
                            results.append(result.get('result'))
                            node_status['status'] = 'success'
                            node_status['time_taken'] = result.get('time_taken')
                        elif result.get('error'):
                            node_status['status'] = 'error'
                            node_status['error'] = result.get('error')
                            all_success = False
                        else:
                            node_status['status'] = result.get('status', 'pending')
                            all_success = False
                    except Exception as e:
                        node_status['status'] = 'error'
                        node_status['error'] = str(e)
                        all_success = False
                else:
                    node_status['status'] = 'error'
                    node_status['error'] = task.get('error', 'Task failed')
                    all_success = False

                node_statuses.append(node_status)

        if all_success and len(results) == 3:
            # All nodes completed successfully
            final_result = results[0]

            # Check if result has any meaningful data
            has_data = False
            for key, value in final_result.items():
                if key != 'query' and value is not None and value != '' and value != 0:
                    has_data = True
                    break

            return {
                'completed': True,
                'success': True,
                'relay_id': request.relay_id,
                'node_statuses': node_statuses,
                'result': final_result,
                'has_data': has_data
            }

        # Still polling
        if attempt < max_attempts - 1:
            # Return current status
            continue

    # Timeout reached
    return {
        'completed': True,
        'success': False,
        'relay_id': request.relay_id,
        'node_statuses': node_statuses,
        'error': 'Polling timeout reached',
        'timeout': True
    }

@router.post("/api/generate-score")
async def generate_score(request: ScoreGenerationRequest):
    """Execute all queries and generate complete score"""
    try:
        relay_server = request.relay_server_url or RELAY_SERVER_URL
        default_node_urls = [MPC_NODE_1_URL, MPC_NODE_2_URL, MPC_NODE_3_URL]
        node_urls = request.mpc_node_urls if request.mpc_node_urls and len(request.mpc_node_urls) == 3 else default_node_urls

        all_results = {}
        category_details = []

        # Iterate through all categories and queries
        for category, queries in QUERIES.items():
            all_results[category] = {}
            category_results = []

            for query_str in queries:
                # Execute query with new relay ID
                query_request = QueryRequest(
                    email=request.email,
                    category=category,
                    query_str=query_str,
                    company_name=request.company_name,
                    year=request.year,
                    start_date=request.start_date,
                    end_date=request.end_date,
                    relay_server_url=relay_server,
                    mpc_node_urls=node_urls
                )

                # Execute the query
                query_response = await execute_query(query_request)
                relay_id = query_response['relay_id']
                task_ids = query_response['results']

                # Poll for results
                query_result = await poll_query_result(task_ids)

                category_results.append({
                    'query_str': query_str,
                    'relay_id': relay_id,
                    'result': query_result
                })

                all_results[category][query_str] = query_result['data'] if query_result['success'] else {'error': query_result.get('error')}

                # Small delay between queries
                await asyncio.sleep(1)

            # Check if category has valid data
            category_has_data = check_category_has_data(category_results)

            # Build category details for response
            for result in category_results:
                detail = {
                    'category': category,
                    'query': result['query_str'],
                    'relay_id': result['relay_id'],
                    'status': 'success' if result['result']['success'] else 'error',
                    'has_data': category_has_data
                }

                if result['result']['success']:
                    if category_has_data and result['result']['data']:
                        detail['data'] = result['result']['data']
                    else:
                        detail['data'] = None
                        detail['message'] = 'No output'
                else:
                    detail['error'] = result['result'].get('error')

                category_details.append(detail)

        # Calculate total score with breakdown
        score_result = calculate_total_score(all_results)
        total_score = round(score_result['total_score'], 1)
        tier_info = get_tier_rating(int(total_score))

        # Format breakdown for display
        formatted_breakdown = []
        for cat_name, cat_data in score_result['category_breakdown'].items():
            formatted_category = {
                'category': cat_name,
                'weight': cat_data['weight'],
                'score': round(cat_data['score'], 2),
                'metrics': []
            }

            for detail in cat_data['details']:
                formatted_metric = {
                    'metric': detail['metric'],
                    'value': detail['value'],
                    'score': detail['score'],
                    'weight': detail['weight'],
                    'multiplier': round(detail['weight'] / 10.0, 1),
                    'product': round(detail['product'], 2)
                }
                formatted_category['metrics'].append(formatted_metric)

            formatted_breakdown.append(formatted_category)

        return {
            'score': total_score,
            'tier': tier_info['tier'],
            'interpretation': tier_info['interpretation'],
            'recommendation': tier_info['recommendation'],
            'details': category_details,
            'raw_results': all_results,
            'breakdown': formatted_breakdown,
            'emi_coverage_ratio': round(score_result['emi_coverage_ratio'], 2)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
