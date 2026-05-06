from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

# Configurações de Segurança
# EM PRODUÇÃO: Sempre definir SECRET_KEY no arquivo .env
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    # Fallback apenas para desenvolvimento local. Em prod, isso deve falhar.
    SECRET_KEY = "dev-secret-key-change-me-in-production"
    print("⚠️ AVISO: SECRET_KEY não definida. Usando chave de desenvolvimento.")

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

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
...
# Segurança
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decodificar_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

def require_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores"
        )
    return user
