from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from decimal import Decimal
import models
import database
import auth

router = APIRouter(tags=["Gestão & BI"], dependencies=[Depends(auth.require_admin)])

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(database.get_db)):
    hoje = func.current_date()
    fat_hoje = db.query(func.sum(models.Pedido.valor_total)).filter(func.date(models.Pedido.data_hora_criacao) == hoje, models.Pedido.status == "Finalizado").scalar() or 0
    pedidos_hoje = db.query(models.Pedido).filter(func.date(models.Pedido.data_hora_criacao) == hoje, models.Pedido.status == "Finalizado").count()
    ticket_medio = fat_hoje / pedidos_hoje if pedidos_hoje > 0 else 0
    
    top_sabores = db.query(models.Sabor.nome_sabor, func.count(models.PizzaSabor.id_sabor).label("total"))\
                    .join(models.PizzaSabor, models.Sabor.id_sabor == models.PizzaSabor.id_sabor)\
                    .join(models.ItemPizzaDetalhe, models.PizzaSabor.id_item == models.ItemPizzaDetalhe.id_item)\
                    .join(models.ItemPedido, models.ItemPizzaDetalhe.id_item == models.ItemPedido.id_item)\
                    .join(models.Pedido, models.ItemPedido.id_pedido == models.Pedido.id_pedido)\
                    .filter(func.date(models.Pedido.data_hora_criacao) == hoje, models.Pedido.status == "Finalizado")\
                    .group_by(models.Sabor.nome_sabor).order_by(text("total DESC")).limit(5).all()

    pagamentos = db.query(models.Pagamento.forma_pagamento, func.sum(models.Pagamento.valor_pago).label("total"))\
                   .join(models.Pedido, models.Pagamento.id_pedido == models.Pedido.id_pedido)\
                   .filter(func.date(models.Pedido.data_hora_criacao) == hoje, models.Pedido.status == "Finalizado")\
                   .group_by(models.Pagamento.forma_pagamento).all()

    return {
        "faturamento_hoje": float(fat_hoje),
        "pedidos_hoje": pedidos_hoje,
        "ticket_medio": float(ticket_medio),
        "top_sabores": [{"nome": s.nome_sabor, "vendas": s.total} for s in top_sabores],
        "pagamentos": [{"forma": p.forma_pagamento, "valor": float(p.total)} for p in pagamentos]
    }

@router.get("/promocoes")
def listar_promocoes(db: Session = Depends(database.get_db)):
    return db.query(models.Promocao).all()

@router.post("/promocoes")
def criar_promocao(payload: dict, db: Session = Depends(database.get_db)):
    try:
        nova = models.Promocao(
            nome=payload.get("nome"),
            status=payload.get("status", True),
            valor_desconto=Decimal(str(payload.get("valor_desconto", 0)))
        )
        db.add(nova)
        db.flush()
        if "ids_produtos" in payload:
            for id_p in payload["ids_produtos"]:
                prod = db.get(models.Produto, id_p)
                if prod: nova.produtos.append(prod)
        if "ids_sabores" in payload:
            for id_s in payload["ids_sabores"]:
                sabor = db.get(models.Sabor, id_s)
                if sabor: nova.sabores.append(sabor)
        if "ids_tamanhos" in payload:
            for id_t in payload["ids_tamanhos"]:
                tam = db.get(models.Tamanho, id_t)
                if tam: nova.tamanhos.append(tam)
        db.commit()
        return {"id": nova.id_promo}
    except Exception as e:
        db.rollback()
        raise HTTPException(400, str(e))

@router.delete("/promocoes/{id_promo}")
def excluir_promocao(id_promo: int, db: Session = Depends(database.get_db)):
    promo = db.get(models.Promocao, id_promo)
    if not promo: raise HTTPException(404, "Promoção não encontrada")
    db.delete(promo)
    db.commit()
    return {"status": "sucesso"}
