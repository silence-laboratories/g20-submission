from pydantic import BaseModel


class GoogleAuthRequest(BaseModel):
    code: str

class GoogleAuthResponse(BaseModel):
    access_token: str
    user: str
    is_first_time: bool