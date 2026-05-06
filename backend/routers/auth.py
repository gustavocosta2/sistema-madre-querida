from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models
import schemas
import database
import auth

router = APIRouter(tags=["Autenticação"])

@router.post("/login", response_model=schemas.TokenResponse)
def login(login_data: schemas.LoginRequest, db: Session = Depends(database.get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.username == login_data.username).first()
    if not usuario or not auth.verificar_senha(login_data.password, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")
    
    usuario.ultima_login = models.func.now()
    db.commit()
    
    return {"access_token": auth.criar_token_acesso(data={"sub": usuario.username, "role": usuario.role}), "token_type": "bearer", "role": usuario.role, "username": usuario.username}
