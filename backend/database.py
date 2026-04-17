from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Pega a URL do banco do arquivo .env
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# O Engine é o motor que realmente conversa com o PostgreSQL
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Cada vez que precisarmos mexer no banco, usaremos uma Session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Essa é a classe base que usaremos para criar nossas tabelas no Python (Models)
Base = declarative_base()

# Função utilitária para abrir e fechar a conexão automaticamente
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
