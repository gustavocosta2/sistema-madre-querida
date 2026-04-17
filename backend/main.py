from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

app = FastAPI(title="Pizzaria Madre Querida API", version="1.0.0")

# Configuração de CORS para permitir que o React (Front-end) acesse a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, limitaremos ao endereço do Front-end
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Bem-vindo à API da Pizzaria Madre Querida!",
        "status": "Online",
        "db_configured": bool(os.getenv("DATABASE_URL"))
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
