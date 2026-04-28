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
        if "quantidade" in payload: bebida.quantidade = int(payload["quantidade"])
        
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
        "id_produto": b.id_bebida, "nome": b.produto.nome,
        "preco": b.preco_venda, "quantidade": b.quantidade, 
        "disponivel": b.produto.disponivel, "preco_pontos": b.produto.preco_pontos
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
        nb = models.Bebida(id_bebida=np.id_produto, preco_venda=Decimal(str(payload.get("preco", 0))), quantidade=int(payload.get("quantidade", 0)))
        db.add(nb); db.commit()
        return {"id": np.id_produto}
    except Exception as e:
        db.rollback(); raise HTTPException(400, str(e))

@app.post("/pedidos")
def criar_pedido(p_in: schemas.PedidoCreate, db: Session = Depends(database.get_db)):
    print(f"DEBUG: Recebendo pedido de {p_in.cpf_cliente}")
    print(f"DEBUG: Dados financeiros -> rec:{p_in.valor_recebido}, taxa:{p_in.taxa_entrega}, troco:{p_in.troco}")
    try:
        # 1. Busca o produto genérico "Pizza" para associar aos itens
        p_pizza = db.query(models.Produto).filter_by(nome="Pizza").first()
        if not p_pizza:
            # Caso não exista, cria um genérico para não quebrar a FK
            p_pizza = models.Produto(nome="Pizza", tipo_produto="Pizza")
            db.add(p_pizza); db.flush()

        itens_processados = []
        valor_total_calculado = Decimal("0.00")

        # 2. Processa cada item para calcular o preço real no servidor
        for it in p_in.itens:
            preco_final_venda = Decimal("0.00") # O que o cliente vai pagar por este item
            preco_original_item = Decimal("0.00") # O preço real do produto (sem desconto de pontos)

            if it.tipo == 'pizza':
                if not it.sabores:
                    raise HTTPException(400, "Pizza sem sabores selecionados")
                
                precos_sabores = db.query(models.Precificado.preco_base).filter(
                    models.Precificado.id_tamanho == it.id_tamanho,
                    models.Precificado.id_sabor.in_(it.sabores)
                ).all()

                if not precos_sabores:
                    sabor_nomes = [s.nome_sabor for s in db.query(models.Sabor).filter(models.Sabor.id_sabor.in_(it.sabores)).all()]
                    tam = db.get(models.Tamanho, it.id_tamanho)
                    tam_nome = tam.nome_tamanho if tam else f"ID {it.id_tamanho}"
                    raise HTTPException(400, f"Preços não configurados para sabores [{', '.join(sabor_nomes)}] no tamanho {tam_nome}")
                
                maior_preco_base = max(p[0] for p in precos_sabores)
                preco_borda = Decimal("0.00")
                if it.id_borda:
                    borda = db.get(models.Borda, it.id_borda)
                    if borda: preco_borda = borda.preco_adicional
                
                preco_original_item = maior_preco_base + preco_borda
                # Se o frontend enviou preco 0, entendemos que é um resgate de pontos
                preco_final_venda = Decimal("0.00") if it.preco == 0 else preco_original_item
            
            else: # Bebida
                bebida = db.query(models.Bebida).filter_by(id_bebida=it.id_produto).first()
                if not bebida:
                    raise HTTPException(404, f"Bebida {it.id_produto} não encontrada")
                
                if bebida.quantidade <= 0:
                    raise HTTPException(400, f"Estoque insuficiente para: {bebida.produto.nome} (Estoque: {bebida.quantidade})")
                
                bebida.quantidade -= 1
                preco_original_item = bebida.preco_venda
                preco_final_venda = Decimal("0.00") if it.preco == 0 else preco_original_item

            valor_total_calculado += preco_final_venda
            itens_processados.append({
                "schema": it,
                "preco_validado": preco_original_item # Salvamos o preço real no histórico
            })

        # 3. Calcula o total final (Soma taxa de entrega ao total dos itens já processados)
        t_final = valor_total_calculado + (p_in.taxa_entrega or Decimal("0.00"))
        
        # VALIDAÇÃO DE SEGURANÇA: O valor recebido não pode ser menor que o total
        # (Exceto se não for pagamento em dinheiro, mas aqui tratamos a regra geral)
        if p_in.valor_recebido and p_in.valor_recebido > 0 and p_in.valor_recebido < t_final:
             raise HTTPException(400, f"Valor recebido (R$ {p_in.valor_recebido}) é menor que o total do pedido (R$ {t_final})")

        # 4. Cria o registro do Pedido com todos os campos financeiros
        # Forçamos a conversão para Decimal e garantimos que não seja None
        def to_decimal(val):
            if val is None: return Decimal("0.00")
            return Decimal(str(val))

        v_rec = to_decimal(p_in.valor_recebido)
        v_troco = to_decimal(p_in.troco)
        v_taxa = to_decimal(p_in.taxa_entrega)
        v_km = to_decimal(p_in.quilometragem)

        print(f"DEBUG FINAL: rec={v_rec}, troco={v_troco}, taxa={v_taxa}")

        novo = models.Pedido(
            id_cliente=p_in.cpf_cliente, 
            id_endereco_entrega=p_in.id_endereco_entrega, 
            valor_total=t_final, 
            valor_recebido=v_rec,
            troco=v_troco,
            taxa_entrega=v_taxa,
            quilometragem=v_km,
            status="Recebido"
        )
        db.add(novo); db.flush()

        # 5. Registra Histórico Inicial
        db.add(models.HistoricoStatusPedido(id_pedido=novo.id_pedido, status="Recebido"))

        # 6. Salva os registros de Pagamento
        if p_in.pagamentos:
            for pag in p_in.pagamentos:
                # Evita salvar pagamentos com valor zero que podem quebrar a constraint do banco
                if pag.valor_pago > 0:
                    db.add(models.Pagamento(
                        id_pedido=novo.id_pedido,
                        forma_pagamento=pag.forma_pagamento,
                        valor_pago=pag.valor_pago
                    ))

        # 7. Atualiza pontos do cliente se houver
        if p_in.cpf_cliente:
            cli = db.get(models.Cliente, p_in.cpf_cliente)
            if cli:
                # Regra: Ganha 1 ponto a cada R$ 1,00 gasto (ajustável)
                cli.saldo_pontos = (cli.saldo_pontos or 0) - (p_in.pontos_resgatados or 0) + int(t_final)
                cli.ultima_visita = func.now()

        # 8. Salva os Itens e seus detalhes
        for proc in itens_processados:
            it = proc["schema"]
            # Fallback para p_pizza caso o produto genérico tenha sido criado
            id_p = it.id_produto if it.tipo == 'bebida' else p_pizza.id_produto
            
            if not id_p:
                print(f"AVISO: Produto para item {it.tipo} não encontrado. Usando fallback.")
                # Se ainda não tiver ID, busca ou cria novamente (caso extremo)
                p_pizza = db.query(models.Produto).filter_by(nome="Pizza").first()
                id_p = p_pizza.id_produto if p_pizza else 1

            item_obj = models.ItemPedido(
                id_pedido=novo.id_pedido, 
                id_produto=id_p, 
                quantidade=1, 
                preco_unitario_vendido=proc["preco_validado"],
                observacao=it.observacao
            )
            db.add(item_obj); db.flush()

            if it.tipo == 'pizza':
                db.add(models.ItemPizzaDetalhe(
                    id_item=item_obj.id_item, 
                    id_tamanho=it.id_tamanho or 3, 
                    id_borda=it.id_borda or 1
                ))
                for s_id in it.sabores:
                    db.add(models.PizzaSabor(
                        id_item=item_obj.id_item, 
                        id_sabor=s_id, 
                        fracao=Decimal("1.0")/len(it.sabores)
                    ))

        db.commit()
        return {"id": novo.id_pedido, "total": float(t_final)}
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc() # Isso aparecerá no console do backend
        if isinstance(e, HTTPException): raise e
        print(f"ERRO AO CRIAR PEDIDO: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/pedidos/ativos")
def listar_ativos(db: Session = Depends(database.get_db)):
    q = db.query(models.Pedido).filter(models.Pedido.status.notin_(["Finalizado", "Cancelado"])).order_by(models.Pedido.data_hora_criacao.asc()).all()
    res = []
    for p in q:
        items = []
        for i in p.itens:
            d = i.detalhe_pizza
            if d:
                items.append({
                    "id_item": i.id_item,
                    "tipo": "pizza",
                    "nome": "Pizza",
                    "quantidade": i.quantidade,
                    "preco_unitario": float(i.preco_unitario_vendido),
                    "observacao": i.observacao,
                    "detalhes_pizza": {
                        "tamanho": d.tamanho.nome_tamanho,
                        "borda": d.borda.tipo if d.borda else "Sem Borda",
                        "sabores": [s.sabor.nome_sabor for s in d.sabores]
                    }
                })
            else:
                items.append({
                    "id_item": i.id_item,
                    "tipo": "bebida",
                    "nome": i.produto.nome if i.produto else "Item",
                    "quantidade": i.quantidade,
                    "preco_unitario": float(i.preco_unitario_vendido),
                    "observacao": i.observacao
                })
        res.append({
            "id_pedido": p.id_pedido, 
            "status": p.status, 
            "data_hora": p.data_hora_criacao, 
            "valor_total": float(p.valor_total),
            "origem": p.origem,
            "itens": items, 
            "endereco": f"{p.endereco.logradouro}, {p.endereco.numero}" if p.endereco else "Balcão",
            "cliente_nome": p.cliente.pessoa.nome if p.cliente else "Balcão"
        })
    return res


@app.get("/pedidos/historico_dia")
def historico(db: Session = Depends(database.get_db)):
    q = db.query(models.Pedido).filter(models.Pedido.status.in_(["Finalizado", "Cancelado"]), func.date(models.Pedido.data_hora_criacao) == func.current_date()).all()
    return [{"id_pedido": p.id_pedido, "status": p.status, "valor_total": float(p.valor_total), "data_hora": p.data_hora_criacao, "cliente": p.cliente.pessoa.nome if p.cliente else "Balcão", "itens": []} for p in q]

@app.get("/pedidos/{id_pedido}")
def detalhes_pedido(id_pedido: int, db: Session = Depends(database.get_db)):
    p = db.get(models.Pedido, id_pedido)
    if not p:
        raise HTTPException(404, "Pedido não encontrado")
    
    items = []
    for i in p.itens:
        d = i.detalhe_pizza
        if d:
            items.append({
                "id_item": i.id_item,
                "tipo": "pizza",
                "nome": "Pizza",
                "quantidade": i.quantidade,
                "preco_unitario": float(i.preco_unitario_vendido),
                "observacao": i.observacao,
                "detalhes_pizza": {
                    "tamanho": d.tamanho.nome_tamanho,
                    "borda": d.borda.tipo if d.borda else "Sem Borda",
                    "sabores": [s.sabor.nome_sabor for s in d.sabores]
                }
            })
        else:
            items.append({
                "id_item": i.id_item,
                "tipo": "bebida",
                "nome": i.produto.nome if i.produto else "Item",
                "quantidade": i.quantidade,
                "preco_unitario": float(i.preco_unitario_vendido),
                "observacao": i.observacao
            })

    return {
        "id_pedido": p.id_pedido,
        "status": p.status,
        "data_hora": p.data_hora_criacao,
        "valor_total": float(p.valor_total),
        "valor_recebido": float(p.valor_recebido or 0),
        "troco": float(p.troco or 0),
        "taxa_entrega": float(p.taxa_entrega or 0),
        "itens": items,
        "cliente": {
            "nome": p.cliente.pessoa.nome if p.cliente else "Balcão",
            "cpf": p.id_cliente
        },
        "endereco": f"{p.endereco.logradouro}, {p.endereco.numero} - {p.endereco.bairro}" if p.endereco else "Retirada",
        "pagamentos": [{"forma": pag.forma_pagamento, "valor": float(pag.valor_pago)} for pag in p.pagamentos]
    }

@app.get("/clientes/buscar/{termo}")
def buscar_clientes(termo: str, db: Session = Depends(database.get_db)):
    q = db.query(models.Cliente).join(models.Pessoa).filter((models.Pessoa.cpf.like(f"%{termo}%")) | (models.Pessoa.nome.ilike(f"%{termo}%"))).all()
    return [{"cpf": c.cpf_cliente, "nome": c.pessoa.nome, "pontos": c.saldo_pontos} for c in q]

@app.get("/clientes/{cpf}/ultimo_pedido")
def ultimo_pedido_cliente(cpf: str, db: Session = Depends(database.get_db)):
    p = db.query(models.Pedido).filter(
        models.Pedido.id_cliente == cpf,
        models.Pedido.status == "Finalizado"
    ).order_by(models.Pedido.data_hora_criacao.desc()).first()
    
    if not p:
        return None
        
    items_resumo = []
    for i in p.itens:
        if i.detalhe_pizza:
            items_resumo.append(f"Pizza {i.detalhe_pizza.tamanho.nome_tamanho} (" + " / ".join([s.sabor.nome_sabor for s in i.detalhe_pizza.sabores]) + ")")
        else:
            items_resumo.append(i.produto.nome if i.produto else "Item")
            
    return {
        "id_pedido": p.id_pedido,
        "data": p.data_hora_criacao,
        "valor": float(p.valor_total),
        "resumo_itens": ", ".join(items_resumo)
    }

@app.get("/clientes/{cpf}/enderecos")
def listar_enderecos(cpf: str, db: Session = Depends(database.get_db)): return db.query(models.Endereco).filter_by(cpf_pessoa=cpf).all()

@app.post("/enderecos")
def criar_endereco(end_in: schemas.EnderecoCreate, db: Session = Depends(database.get_db)):
    try:
        novo_end = models.Endereco(**end_in.model_dump())
        db.add(novo_end)
        db.commit()
        return {"id": novo_end.id_endereco}
    except Exception as e:
        db.rollback()
        raise HTTPException(400, str(e))

@app.post("/clientes/completo")
def criar_cliente_completo(c_in: schemas.ClienteCompletoCreate, db: Session = Depends(database.get_db)):
    try:
        # 1. Cria Pessoa
        pessoa = db.get(models.Pessoa, c_in.cpf)
        if not pessoa:
            pessoa = models.Pessoa(cpf=c_in.cpf, nome=c_in.nome)
            db.add(pessoa)
            db.flush()

        # 2. Cria Cliente
        cliente = db.get(models.Cliente, c_in.cpf)
        if not cliente:
            cliente = models.Cliente(cpf_cliente=c_in.cpf)
            db.add(cliente)
            db.flush()

        # 3. Cria Endereço
        novo_end = models.Endereco(
            cpf_pessoa=c_in.cpf,
            logradouro=c_in.logradouro,
            numero=c_in.numero,
            complemento=c_in.complemento,
            bairro=c_in.bairro,
            cep=c_in.cep,
            ponto_referencia=c_in.ponto_referencia,
            e_principal=True
        )
        db.add(novo_end)

        # 4. Cria Telefones
        for tel in c_in.telefones:
            db.add(models.Telefone(cpf_pessoa=c_in.cpf, numero=tel))

        db.commit()
        return {"status": "sucesso"}
    except Exception as e:
        db.rollback()
        raise HTTPException(400, str(e))

@app.get("/motoboys")
def listar_motoboys(db: Session = Depends(database.get_db)):
    # Join entre Motoboy -> Funcionario -> Pessoa para pegar Nome e Placa
    q = db.query(
        models.Pessoa.nome,
        models.Pessoa.cpf,
        models.Motoboy.placa_veiculo
    ).join(models.Funcionario, models.Pessoa.cpf == models.Funcionario.cpf_funcionario)\
     .join(models.Motoboy, models.Funcionario.cpf_funcionario == models.Motoboy.cpf_motoboy)\
     .all()
    
    return [{"nome": m.nome, "cpf": m.cpf, "placa": m.placa_veiculo} for m in q]

@app.patch("/pedidos/{id}/status")
def patch_status(id: int, novo_status: str, db: Session = Depends(database.get_db)):
    p = db.get(models.Pedido, id)
    if not p:
        raise HTTPException(404, "Pedido não encontrado")

    # REGRA DE NEGÓCIO: Se o pedido for cancelado, devolve as bebidas ao estoque
    if novo_status == "Cancelado" and p.status != "Cancelado":
        for item in p.itens:
            # Verifica se o item é uma bebida (pode ser checado pelo tipo_produto do produto vinculado)
            if item.produto and item.produto.tipo_produto == 'Bebida':
                bebida = db.query(models.Bebida).filter_by(id_bebida=item.id_produto).first()
                if bebida:
                    bebida.quantidade += item.quantidade
                    print(f"DEBUG: Estornando {item.quantidade} un de {item.produto.nome} ao estoque.")

    p.status = novo_status
    # Alimenta o histórico para auditoria/BI
    db.add(models.HistoricoStatusPedido(id_pedido=id, status=novo_status))
    db.commit()
    return {"status": "ok"}

@app.patch("/pedidos/{id}/despachar")
def despachar(id: int, cpf_motoboy: str, db: Session = Depends(database.get_db)):
    p = db.get(models.Pedido, id)
    if p: 
        p.status = "Em Rota"
        p.id_motoboy = cpf_motoboy
        # REGRA DE NEGÓCIO: Alimenta o histórico para auditoria/BI
        db.add(models.HistoricoStatusPedido(id_pedido=id, status="Em Rota"))
        db.commit()
    return {"status": "ok"}

@app.get("/gestao/dashboard")
def get_dashboard(db: Session = Depends(database.get_db)):
    # 1. Faturamento Total de Hoje (IGNORA CANCELADOS)
    hoje = func.current_date()
    fat_hoje = db.query(func.sum(models.Pedido.valor_total)).filter(
        func.date(models.Pedido.data_hora_criacao) == hoje,
        models.Pedido.status != "Cancelado"
    ).scalar() or 0
    
    # 2. Total de Pedidos de Hoje (IGNORA CANCELADOS)
    pedidos_hoje = db.query(func.count(models.Pedido.id_pedido)).filter(
        func.date(models.Pedido.data_hora_criacao) == hoje,
        models.Pedido.status != "Cancelado"
    ).scalar() or 0
    
    # 3. Ticket Médio (Hoje)
    ticket_medio = fat_hoje / pedidos_hoje if pedidos_hoje > 0 else 0
    
    # 4. Top Sabores (Mais vendidos - IGNORA CANCELADOS)
    top_sabores = db.query(
        models.Sabor.nome_sabor,
        func.count(models.PizzaSabor.id_sabor).label("total")
    ).join(models.PizzaSabor).join(models.ItemPizzaDetalhe).join(models.ItemPedido).join(models.Pedido).filter(
        models.Pedido.status != "Cancelado"
    ).group_by(models.Sabor.nome_sabor).order_by(text("total DESC")).limit(5).all()
    
    # 5. Distribuição por Forma de Pagamento (Hoje - IGNORA CANCELADOS)
    pagamentos = db.query(
        models.Pagamento.forma_pagamento,
        func.sum(models.Pagamento.valor_pago).label("total")
    ).join(models.Pedido).filter(
        func.date(models.Pedido.data_hora_criacao) == hoje,
        models.Pedido.status != "Cancelado"
    ).group_by(models.Pagamento.forma_pagamento).all()

    return {
        "faturamento_hoje": float(fat_hoje),
        "pedidos_hoje": pedidos_hoje,
        "ticket_medio": float(ticket_medio),
        "top_sabores": [{"nome": s.nome_sabor, "vendas": s.total} for s in top_sabores],
        "pagamentos": [{"forma": p.forma_pagamento, "valor": float(p.total)} for p in pagamentos]
    }

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
    uvicorn.run(app, host="0.0.0.0", port=8000)
