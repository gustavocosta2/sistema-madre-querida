from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
import schemas
import database
import auth

router = APIRouter(tags=["Financeiro & Caixa"], dependencies=[Depends(auth.get_current_user)])

@router.get("/status")
def get_caixa_status(db: Session = Depends(database.get_db)):
    caixa = db.query(models.Caixa).filter(models.Caixa.status == "Aberto").first()
    if not caixa: return {"caixa_aberto": False}
    return {
        "caixa_aberto": True,
        "id_caixa": caixa.id_caixa,
        "data_abertura": caixa.data_abertura,
        "valor_abertura": float(caixa.valor_abertura),
        "valor_esperado": float(caixa.valor_fechamento_esperado)
    }

@router.post("/abrir", dependencies=[Depends(auth.require_admin)])
def abrir_caixa(payload: schemas.CaixaBase, db: Session = Depends(database.get_db)):
    try:
        caixa_aberto = db.query(models.Caixa).filter(models.Caixa.status == "Aberto").first()
        if caixa_aberto: raise HTTPException(400, "Já existe um caixa aberto")
        
        novo_caixa = models.Caixa(
            id_usuario_abertura=payload.id_usuario_abertura,
            valor_abertura=payload.valor_abertura,
            valor_fechamento_esperado=payload.valor_abertura,
            observacao=payload.observacao
        )
        db.add(novo_caixa)
        db.commit()
        return {"id_caixa": novo_caixa.id_caixa}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException): raise e
        raise HTTPException(400, str(e))

@router.post("/movimentacao", dependencies=[Depends(auth.require_admin)])
def criar_movimentacao(mov: schemas.FluxoCaixaBase, db: Session = Depends(database.get_db)):
    try:
        caixa = db.get(models.Caixa, mov.id_caixa)
        if not caixa or caixa.status == "Fechado": raise HTTPException(400, "Caixa não encontrado ou já fechado")
        
        nova_mov = models.FluxoCaixa(**mov.model_dump())
        db.add(nova_mov)
        
        if mov.tipo_movimentacao in ["Entrada Venda", "Suprimento"]:
            caixa.valor_fechamento_esperado += mov.valor
        elif mov.tipo_movimentacao in ["Sangria", "Acerto Motoboy"]:
            caixa.valor_fechamento_esperado -= mov.valor
            
        db.commit()
        return {"status": "sucesso"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException): raise e
        raise HTTPException(400, str(e))

@router.post("/fechar", dependencies=[Depends(auth.require_admin)])
def fechar_caixa(payload: schemas.CaixaFechamento, db: Session = Depends(database.get_db)):
    try:
        caixa = db.query(models.Caixa).filter(models.Caixa.status == "Aberto").first()
        if not caixa: raise HTTPException(404, "Não há caixa aberto para fechar")
        
        caixa.id_usuario_fechamento = payload.id_usuario_fechamento
        caixa.valor_fechamento_informado = payload.valor_fechamento_informado
        caixa.data_fechamento = func.now()
        caixa.status = "Fechado"
        caixa.observacao = (caixa.observacao or "") + "\nFechamento: " + (payload.observacao or "")
        
        db.commit()
        return {
            "status": "sucesso",
            "esperado": float(caixa.valor_fechamento_esperado),
            "informado": float(caixa.valor_fechamento_informado),
            "diferenca": float(caixa.valor_fechamento_informado - caixa.valor_fechamento_esperado)
        }
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException): raise e
        raise HTTPException(400, str(e))
