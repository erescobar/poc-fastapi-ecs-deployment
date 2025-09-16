from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class GreetingRequest(BaseModel):
    nombre: str

class GreetingResponse(BaseModel):
    message: str

@app.get("/greetings")
def get_greetings() -> GreetingResponse:
    return {"message": "¡Hola! Bienvenido a nuestra API de saludos"}

@app.post("/greetings")
def post_greetings(request: GreetingRequest) -> GreetingResponse:
    return {"message": f"Hello, {request.nombre}"}