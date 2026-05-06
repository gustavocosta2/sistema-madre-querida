from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from dotenv import load_dotenv

import models
import database
from routers import auth, produtos, clientes, pedidos, rh, financeiro, gestao

load_dotenv()

# --- AUTO-MIGRAÇÃO ---
def garantir_colunas_fidelidade():
    db = database.SessionLocal()
    try:
        db.execute(text("ALTER TABLE produtos ADD COLUMN IF NOT EXISTS preco_pontos INTEGER DEFAULT 0"))
        db.execute(text("ALTER TABLE sabores ADD COLUMN IF NOT EXISTS preco_pontos INTEGER DEFAULT 0"))
        db.execute(text("ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS data_nascimento DATE"))
        db.execute(text("ALTER TABLE clientes ADD COLUMN IF NOT EXISTS observacao TEXT"))
        db.commit()
    except Exception as e:
        print(f"Aviso na migração: {e}")
    finally:
        db.close()

models.Base.metadata.create_all(bind=database.engine)
garantir_colunas_fidelidade()

app = FastAPI(title="Pizzaria Madre Querida API", version="3.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- INCLUSÃO DE ROTEADORES ---
app.include_router(auth.router)
app.include_router(produtos.router)
app.include_router(clientes.router)
app.include_router(pedidos.router)
app.include_router(rh.router, prefix="/gestao")
app.include_router(financeiro.router, prefix="/financeiro/caixa")
app.include_router(gestao.router, prefix="/gestao")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
