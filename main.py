from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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