from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
import database
import auth

router = APIRouter(tags=["Produtos & Cardápio"], dependencies=[Depends(auth.get_current_user)])

@router.get("/sabores", response_model=List[schemas.Sabor])
def listar_sabores(db: Session = Depends(database.get_db)):
    return db.query(models.Sabor).all()

@router.post("/sabores", dependencies=[Depends(auth.require_admin)])
def criar_sabor(payload: dict, db: Session = Depends(database.get_db)):
    try:
        novo = models.Sabor(
            nome_sabor=payload.get("nome_sabor"),
            ingredientes=payload.get("ingredientes"),
            disponivel=True,
            preco_pontos=payload.get("preco_pontos", 0)
        )
        db.add(novo)
        db.flush()
        
        # Preços por tamanho
        if "precos_por_tamanho" in payload:
            for tam_id, preco in payload["precos_por_tamanho"].items():
                db.add(models.Precificado(id_sabor=novo.id_sabor, id_tamanho=int(tam_id), preco_base=preco))
        
        db.commit()
        return {"id": novo.id_sabor}
    except Exception as e:
        db.rollback()
        raise HTTPException(400, str(e))

@router.patch("/sabores/{id_sabor}", dependencies=[Depends(auth.require_admin)])
def atualizar_sabor(id_sabor: int, payload: schemas.SaborUpdate, db: Session = Depends(database.get_db)):
    sabor = db.get(models.Sabor, id_sabor)
    if not sabor: raise HTTPException(404, "Sabor não encontrado")
    
    if payload.nome_sabor: sabor.nome_sabor = payload.nome_sabor
    if payload.ingredientes: sabor.ingredientes = payload.ingredientes
    if payload.preco_pontos is not None: sabor.preco_pontos = payload.preco_pontos
    
    if payload.precos_por_tamanho:
        for tam_id, preco in payload.precos_por_tamanho.items():
            pre_obj = db.query(models.Precificado).filter_by(id_sabor=id_sabor, id_tamanho=tam_id).first()
            if pre_obj: pre_obj.preco_base = preco
            else: db.add(models.Precificado(id_sabor=id_sabor, id_tamanho=tam_id, preco_base=preco))
            
    db.commit()
    return {"status": "sucesso"}

@router.get("/bebidas")
def listar_bebidas(db: Session = Depends(database.get_db)):
    res = db.query(models.Bebida).join(models.Produto).all()
    return [{
        "id_produto": b.id_bebida,
        "nome": b.produto.nome,
        "preco": float(b.preco_venda),
        "quantidade": b.quantidade,
        "disponivel": b.produto.disponivel,
        "preco_pontos": b.produto.preco_pontos
    } for b in res]

@router.post("/bebidas", dependencies=[Depends(auth.require_admin)])
def criar_bebida(payload: dict, db: Session = Depends(database.get_db)):
    try:
        # 1. Cria Produto Base
        novo_prod = models.Produto(
            nome=payload.get("nome"),
            tipo_produto="Bebida",
            disponivel=True,
            preco_pontos=payload.get("preco_pontos", 0)
        )
        db.add(novo_prod)
        db.flush()

        # 2. Cria Detalhe Bebida
        nova_bebida = models.Bebida(
            id_bebida=novo_prod.id_produto,
            preco_venda=payload.get("preco"),
            quantidade=payload.get("quantidade")
        )
        db.add(nova_bebida)
        db.commit()
        return {"id": novo_prod.id_produto}
    except Exception as e:
        db.rollback()
        raise HTTPException(400, str(e))

@router.patch("/bebidas/{id_prod}", dependencies=[Depends(auth.require_admin)])
def atualizar_bebida(id_prod: int, payload: schemas.BebidaUpdate, db: Session = Depends(database.get_db)):
    bebida = db.get(models.Bebida, id_prod)
    if not bebida: raise HTTPException(404, "Bebida não encontrada")
    
    if payload.nome: bebida.produto.nome = payload.nome
    if payload.preco is not None: bebida.preco_venda = payload.preco
    if payload.quantidade is not None: bebida.quantidade = payload.quantidade
    if payload.preco_pontos is not None: bebida.produto.preco_pontos = payload.preco_pontos
    
    db.commit()
    return {"status": "sucesso"}

@router.get("/tamanhos")
def listar_tamanhos(db: Session = Depends(database.get_db)): return db.query(models.Tamanho).all()

@router.get("/bordas")
def listar_bordas(db: Session = Depends(database.get_db)): return db.query(models.Borda).all()

@router.get("/precos")
def listar_precos(db: Session = Depends(database.get_db)): return db.query(models.Precificado).all()
