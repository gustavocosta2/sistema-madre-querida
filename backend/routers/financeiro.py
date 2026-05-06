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
    
    # Busca movimentações do caixa atual
    movimentacoes = db.query(models.FluxoCaixa).filter(models.FluxoCaixa.id_caixa == caixa.id_caixa).order_by(models.FluxoCaixa.data_hora.desc()).all()
    
    return {
        "caixa_aberto": True,
        "id_caixa": caixa.id_caixa,
        "data_abertura": caixa.data_abertura,
        "valor_abertura": float(caixa.valor_abertura),
        "valor_esperado": float(caixa.valor_fechamento_esperado),
        "movimentacoes": [{
            "id": m.id_movimentacao,
            "tipo": m.tipo_movimentacao,
            "valor": float(m.valor),
            "descricao": m.descricao,
            "hora": m.data_hora.strftime("%H:%M"),
            "forma": m.forma_pagamento
        } for m in movimentacoes]
    }

@router.post("/abrir")
def abrir_caixa(payload: schemas.CaixaBase, db: Session = Depends(database.get_db), current_user: dict = Depends(auth.get_current_user)):
    try:
        # Busca o ID do usuário pelo username do token
        usuario = db.query(models.Usuario).filter(models.Usuario.username == current_user["sub"]).first()
        if not usuario: raise HTTPException(404, "Usuário não encontrado")

        caixa_aberto = db.query(models.Caixa).filter(models.Caixa.status == "Aberto").first()
        if caixa_aberto: raise HTTPException(400, "Já existe um caixa aberto")
        
        novo_caixa = models.Caixa(
            id_usuario_abertura=usuario.id_usuario,
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

@router.post("/movimentacao")
def criar_movimentacao(mov: schemas.FluxoCaixaBase, db: Session = Depends(database.get_db), current_user: dict = Depends(auth.get_current_user)):
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

@router.post("/fechar")
def fechar_caixa(payload: schemas.CaixaFechamento, db: Session = Depends(database.get_db), current_user: dict = Depends(auth.get_current_user)):
    try:
        # Busca o ID do usuário pelo username do token
        usuario = db.query(models.Usuario).filter(models.Usuario.username == current_user["sub"]).first()
        if not usuario: raise HTTPException(404, "Usuário não encontrado")

        caixa = db.query(models.Caixa).filter(models.Caixa.status == "Aberto").first()
        if not caixa: raise HTTPException(404, "Não há caixa aberto para fechar")
        
        # Calcula resumo por forma de pagamento antes de fechar
        resumo = db.query(
            models.FluxoCaixa.forma_pagamento,
            func.sum(models.FluxoCaixa.valor).label("total")
        ).filter(models.FluxoCaixa.id_caixa == caixa.id_caixa).group_by(models.FluxoCaixa.forma_pagamento).all()
        
        breakdown = {r.forma_pagamento: float(r.total) for r in resumo}
        
        caixa.id_usuario_fechamento = usuario.id_usuario
        caixa.valor_fechamento_informado = payload.valor_fechamento_informado
        caixa.data_fechamento = func.now()
        caixa.status = "Fechado"
        caixa.observacao = (caixa.observacao or "") + "\nFechamento: " + (payload.observacao or "")
        
        db.commit()
        
        esperado = float(caixa.valor_fechamento_esperado)
        informado = float(caixa.valor_fechamento_informado)
        
        return {
            "status": "sucesso",
            "abertura": float(caixa.valor_abertura),
            "esperado_total": esperado,
            "informado": informado,
            "diferenca": informado - esperado,
            "breakdown": breakdown
        }
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException): raise e
        raise HTTPException(400, str(e))
