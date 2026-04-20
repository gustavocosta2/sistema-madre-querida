from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

# Configurações de Segurança
SECRET_KEY = os.getenv("SECRET_KEY", "madre-querida-secreto-123456")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480 

# Trocamos 'bcrypt' por 'pbkdf2_sha256' para garantir compatibilidade total com Python 3.13+
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# Funções para Senha
def verificar_senha(senha_pura, senha_hash):
    return pwd_context.verify(senha_pura, senha_hash)

def gerar_hash_senha(senha):
    return pwd_context.hash(senha)

# Funções para Token JWT
def criar_token_acesso(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decodificar_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except:
        return None
