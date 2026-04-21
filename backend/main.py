from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, text, select
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal
import os
from dotenv import load_dotenv

import models
import schemas
import database
import auth

load_dotenv()

# --- AUTO-MIGRAÇÃO ---
def garantir_colunas_fidelidade():
    db = database.SessionLocal()
    try:
        db.execute(text("ALTER TABLE produtos ADD COLUMN IF NOT EXISTS preco_pontos INTEGER DEFAULT 0"))
        db.execute(text("ALTER TABLE sabores ADD COLUMN IF NOT EXISTS preco_pontos INTEGER DEFAULT 0"))
        db.commit()
    except Exception as e:
        print(f"Aviso na migração: {e}")
    finally:
        db.close()

models.Base.metadata.create_all(bind=database.engine)
garantir_colunas_fidelidade()

app = FastAPI(title="Pizzaria Madre Querida API", version="3.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROTAS DE GESTÃO (ROBUSTAS & SQLALCHEMY 2.0) ---

@app.patch("/sabores/{id_sabor}")
def editar_sabor(id_sabor: int, payload: dict, db: Session = Depends(database.get_db)):
    try:
        # Padrão moderno: db.get() em vez de query().get()
        sabor = db.get(models.Sabor, id_sabor)
        if not sabor: raise HTTPException(404, "Sabor não encontrado")
        
        # Sincroniza com a tabela de produtos (para resgate no PDV)
        old_name = sabor.nome_sabor
        prod_vinculado = db.query(models.Produto).filter_by(nome=old_name, tipo_produto='Pizza').first()

        if "nome_sabor" in payload: 
            sabor.nome_sabor = payload["nome_sabor"]
            if prod_vinculado: prod_vinculado.nome = payload["nome_sabor"]

        if "ingredientes" in payload: 
            sabor.ingredientes = payload["ingredientes"]

        if "preco_pontos" in payload: 
            val = int(payload["preco_pontos"] or 0)
            sabor.preco_pontos = val
            if prod_vinculado: prod_vinculado.preco_pontos = val

        # Atualização de Preços por Tamanho
        precos = payload.get("precos_por_tamanho", {})
        if isinstance(precos, dict):
            for id_t, valor in precos.items():
                if valor is None: continue
                prec = db.query(models.Precificado).filter_by(id_sabor=id_sabor, id_tamanho=int(id_t)).first()
                val_decimal = Decimal(str(valor))
                if prec:
                    prec.preco_base = val_decimal
                else:
                    db.add(models.Precificado(id_sabor=id_sabor, id_tamanho=int(id_t), preco_base=val_decimal))

        db.commit()
        return {"status": "sucesso"}
    except Exception as e:
        db.rollback()
        print(f"ERRO AO EDITAR SABOR: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.patch("/bebidas/{id_prod}")
def editar_bebida(id_prod: int, payload: dict, db: Session = Depends(database.get_db)):
    try:
        bebida = db.get(models.Bebida, id_prod)
        if not bebida: raise HTTPException(404, "Bebida não encontrada")
        
        if "preco" in payload: bebida.preco_venda = Decimal(str(payload["preco"]))
        if "volume" in payload: bebida.volume_ml = int(payload["volume"])
        
        if bebida.produto:
            if "nome" in payload: bebida.produto.nome = payload["nome"]
            if "preco_pontos" in payload: 
                bebida.produto.preco_pontos = int(payload["preco_pontos"] or 0)
        
        db.commit()
        return {"status": "sucesso"}
    except Exception as e:
        db.rollback()
        print(f"ERRO AO EDITAR BEBIDA: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# --- DEMAIS ROTAS ---

@app.get("/sabores", response_model=List[schemas.Sabor])
def listar_sabores(db: Session = Depends(database.get_db)):
    return db.query(models.Sabor).all()

@app.get("/bebidas")
def listar_bebidas(db: Session = Depends(database.get_db)):
    q = db.query(models.Bebida).join(models.Produto).all()
    return [{
        "id_produto": b.id_bebida, "nome": b.produto.nome, "volume": b.volume_ml,
        "preco": b.preco_venda, "disponivel": b.produto.disponivel, "preco_pontos": b.produto.preco_pontos
    } for b in q]

@app.post("/sabores")
def criar_sabor(payload: dict, db: Session = Depends(database.get_db)):
    try:
        nome = payload.get("nome_sabor")
        np = models.Produto(nome=nome, tipo_produto='Pizza', preco_pontos=int(payload.get("preco_pontos", 0)))
        db.add(np); db.flush()
        ns = models.Sabor(nome_sabor=nome, ingredientes=payload.get("ingredientes"), preco_pontos=int(payload.get("preco_pontos", 0)))
        db.add(ns); db.flush()
        precos = payload.get("precos_por_tamanho", {})
        for id_t, val in precos.items():
            db.add(models.Precificado(id_sabor=ns.id_sabor, id_tamanho=int(id_t), preco_base=Decimal(str(val))))
        db.commit()
        return {"id": ns.id_sabor}
    except Exception as e:
        db.rollback(); raise HTTPException(400, str(e))

@app.post("/bebidas")
def criar_bebida(payload: dict, db: Session = Depends(database.get_db)):
    try:
        np = models.Produto(nome=payload.get("nome"), tipo_produto='Bebida', preco_pontos=int(payload.get("preco_pontos", 0)))
        db.add(np); db.flush()
        nb = models.Bebida(id_bebida=np.id_produto, volume_ml=int(payload.get("volume", 0)), preco_venda=Decimal(str(payload.get("preco", 0))))
        db.add(nb); db.commit()
        return {"id": np.id_produto}
    except Exception as e:
        db.rollback(); raise HTTPException(400, str(e))

@app.post("/pedidos")
def criar_pedido(p_in: schemas.PedidoCreate, db: Session = Depends(database.get_db)):
    try:
        p_pizza = db.query(models.Produto).filter_by(nome="Pizza").first()
        t_final = max(Decimal(0), sum(i.preco for i in p_in.itens) - Decimal(p_in.pontos_resgatados))
        novo = models.Pedido(id_cliente=p_in.cpf_cliente, id_endereco_entrega=p_in.id_endereco_entrega, valor_total=t_final, status="Recebido")
        db.add(novo); db.flush()
        db.add(models.HistoricoStatusPedido(id_pedido=novo.id_pedido, status="Recebido"))
        if p_in.cpf_cliente:
            cli = db.get(models.Cliente, p_in.cpf_cliente)
            if cli:
                cli.saldo_pontos = (cli.saldo_pontos or 0) - p_in.pontos_resgatados + int(t_final)
                cli.ultima_visita = func.now()
        for it in p_in.itens:
            id_p = it.id_produto if it.tipo == 'bebida' else p_pizza.id_produto
            item_obj = models.ItemPedido(id_pedido=novo.id_pedido, id_produto=id_p, quantidade=1, preco_unitario_vendido=it.preco)
            db.add(item_obj); db.flush()
            if it.tipo == 'pizza':
                db.add(models.ItemPizzaDetalhe(id_item=item_obj.id_item, id_tamanho=it.id_tamanho or 3, id_borda=it.id_borda or 1))
                for s_id in it.sabores:
                    db.add(models.PizzaSabor(id_item=item_obj.id_item, id_sabor=s_id, fracao=Decimal("1.0")/len(it.sabores)))
        db.commit(); return {"id": novo.id_pedido}
    except Exception as e:
        db.rollback(); raise HTTPException(400, str(e))

@app.get("/pedidos/ativos")
def listar_ativos(db: Session = Depends(database.get_db)):
    q = db.query(models.Pedido).filter(models.Pedido.status.notin_(["Finalizado", "Cancelado"])).order_by(models.Pedido.data_hora_criacao.asc()).all()
    res = []
    for p in q:
        items = []
        for i in p.itens:
            d = i.detalhe_pizza
            name = " / ".join([s.sabor.nome_sabor for s in d.sabores]) if d else (i.produto.nome if i.produto else "Item")
            items.append({"sabor": name, "tamanho": d.tamanho.nome_tamanho if d else "N/A", "borda": d.borda.tipo if d and d.borda else "Sem Borda", "quantidade": i.quantidade})
        res.append({"id_pedido": p.id_pedido, "status": p.status, "data_hora": p.data_hora_criacao, "itens": items, "endereco": f"{p.endereco.logradouro}, {p.endereco.numero}" if p.endereco else "Balcão"})
    return res

@app.get("/pedidos/historico_dia")
def historico(db: Session = Depends(database.get_db)):
    q = db.query(models.Pedido).filter(models.Pedido.status.in_(["Finalizado", "Cancelado"]), func.date(models.Pedido.data_hora_criacao) == func.current_date()).all()
    return [{"id_pedido": p.id_pedido, "status": p.status, "valor_total": float(p.valor_total), "data_hora": p.data_hora_criacao, "cliente": p.cliente.pessoa.nome if p.cliente else "Balcão", "itens": []} for p in q]

@app.get("/clientes/buscar/{termo}")
def buscar_clientes(termo: str, db: Session = Depends(database.get_db)):
    q = db.query(models.Cliente).join(models.Pessoa).filter((models.Pessoa.cpf.like(f"%{termo}%")) | (models.Pessoa.nome.ilike(f"%{termo}%"))).all()
    return [{"cpf": c.cpf_cliente, "nome": c.pessoa.nome, "pontos": c.saldo_pontos} for c in q]

@app.get("/clientes/{cpf}/enderecos")
def listar_enderecos(cpf: str, db: Session = Depends(database.get_db)): return db.query(models.Endereco).filter_by(cpf_pessoa=cpf).all()

@app.patch("/pedidos/{id}/status")
def patch_status(id: int, novo_status: str, db: Session = Depends(database.get_db)):
    p = db.get(models.Pedido, id)
    if p: p.status = novo_status; db.add(models.HistoricoStatusPedido(id_pedido=id, status=novo_status)); db.commit()
    return {"status": "ok"}

@app.patch("/pedidos/{id}/despachar")
def despachar(id: int, cpf_motoboy: str, db: Session = Depends(database.get_db)):
    p = db.get(models.Pedido, id)
    if p: p.status, p.id_motoboy = "Em Rota", cpf_motoboy; db.add(models.HistoricoStatusPedido(id_pedido=id, status="Em Rota")); db.commit()
    return {"status": "ok"}

@app.get("/tamanhos")
def listar_tamanhos(db: Session = Depends(database.get_db)): return db.query(models.Tamanho).all()

@app.get("/bordas")
def listar_bordas(db: Session = Depends(database.get_db)): return db.query(models.Borda).all()

@app.get("/precos")
def listar_precos(db: Session = Depends(database.get_db)): return db.query(models.Precificado).all()

@app.get("/promocoes")
def listar_promocoes(db: Session = Depends(database.get_db)):
    promos = db.query(models.Promocao).all()
    return promos

@app.post("/promocoes")
def criar_promocao(payload: dict, db: Session = Depends(database.get_db)):
    try:
        nova = models.Promocao(
            nome=payload.get("nome"),
            status=payload.get("status", True),
            valor_desconto=Decimal(str(payload.get("valor_desconto", 0)))
        )
        db.add(nova)
        db.flush()

        # Adiciona associações
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

@app.delete("/promocoes/{id_promo}")
def excluir_promocao(id_promo: int, db: Session = Depends(database.get_db)):
    promo = db.get(models.Promocao, id_promo)
    if not promo: raise HTTPException(404, "Promoção não encontrada")
    db.delete(promo)
    db.commit()
    return {"status": "sucesso"}

@app.post("/login", response_model=schemas.TokenResponse)
def login(login_data: schemas.LoginRequest, db: Session = Depends(database.get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.username == login_data.username).first()
    if not usuario or not auth.verificar_senha(login_data.password, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")
    return {"access_token": auth.criar_token_acesso(data={"sub": usuario.username, "role": usuario.role}), "token_type": "bearer", "role": usuario.role, "username": usuario.username}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
