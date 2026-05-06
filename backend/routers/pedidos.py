from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import models
import schemas
import database
import auth

router = APIRouter(tags=["Pedidos & Logística"], dependencies=[Depends(auth.get_current_user)])

@router.post("/pedidos")
def criar_pedido(p_in: schemas.PedidoCreate, db: Session = Depends(database.get_db)):
    try:
        # 1. Cria Pedido Base
        novo_pedido = models.Pedido(
            id_cliente=p_in.cpf_cliente,
            id_endereco_entrega=p_in.id_endereco_entrega,
            valor_total=sum(it.preco for it in p_in.itens),
            pontos_resgatados=p_in.pontos_resgatados,
            valor_recebido=p_in.valor_recebido,
            troco=p_in.troco,
            taxa_entrega=p_in.taxa_entrega,
            quilometragem=p_in.quilometragem,
            status="Recebido"
        )
        db.add(novo_pedido)
        db.flush()

        # 2. Processa Itens
        for it in p_in.itens:
            item_db = models.ItemPedido(
                id_pedido=novo_pedido.id_pedido,
                tipo_item=it.tipo.capitalize(),
                preco_unitario_vendido=it.preco,
                observacao=it.observacao
            )
            
            if it.tipo == 'pizza':
                item_db.id_produto = 1 # ID base para pizza
                db.add(item_db)
                db.flush()
                # Detalhes da Pizza
                detalhe = models.ItemPizzaDetalhe(
                    id_item=item_db.id_item,
                    id_tamanho=it.id_tamanho,
                    id_borda=it.id_borda
                )
                db.add(detalhe)
                db.flush()
                # Sabores
                for s_id in it.sabores:
                    db.add(models.PizzaSabor(id_item=item_db.id_item, id_sabor=s_id, fracao=1.0/len(it.sabores)))
            else:
                item_db.id_produto = it.id_produto
                db.add(item_db)
                # Baixa estoque bebida
                bebida = db.query(models.Bebida).filter_by(id_bebida=it.id_produto).first()
                if bebida:
                    if bebida.quantidade <= 0:
                        raise HTTPException(400, f"Estoque insuficiente para a bebida: {bebida.produto.nome}")
                    bebida.quantidade -= 1

        # 3. Processa Pagamentos
        for pag in p_in.pagamentos:
            db.add(models.Pagamento(
                id_pedido=novo_pedido.id_pedido,
                forma_pagamento=pag.forma_pagamento,
                valor_pago=pag.valor_pago
            ))
            
            # Integração automática com o Caixa (se houver caixa aberto)
            caixa = db.query(models.Caixa).filter(models.Caixa.status == "Aberto").first()
            if caixa:
                db.add(models.FluxoCaixa(
                    id_caixa=caixa.id_caixa,
                    id_pedido=novo_pedido.id_pedido,
                    tipo_movimentacao="Entrada Venda",
                    forma_pagamento=pag.forma_pagamento,
                    valor=pag.valor_pago,
                    descricao=f"Venda Pedido #{novo_pedido.id_pedido}"
                ))
                if pag.forma_pagamento == "Dinheiro":
                    caixa.valor_fechamento_esperado += pag.valor_pago

        # 4. Atualiza pontos fidelidade
        if p_in.cpf_cliente:
            cliente = db.get(models.Cliente, p_in.cpf_cliente)
            if cliente:
                # Ganha 1 ponto a cada 10 reais (exemplo)
                pontos_ganhos = int(novo_pedido.valor_total // 10)
                cliente.saldo_pontos = (cliente.saldo_pontos or 0) + pontos_ganhos - (p_in.pontos_resgatados or 0)
                cliente.ultima_visita = func.now()

        db.commit()
        return {"status": "sucesso", "id_pedido": novo_pedido.id_pedido}
    except Exception as e:
        db.rollback()
        raise HTTPException(400, str(e))

@router.get("/pedidos/ativos")
def listar_ativos(db: Session = Depends(database.get_db)):
    q = db.query(models.Pedido).filter(models.Pedido.status.notin_(["Finalizado", "Cancelado"])).order_by(models.Pedido.data_hora_criacao.asc()).all()
    res = []
    for p in q:
        itens = []
        for it in p.itens:
            d = {"tipo": it.tipo_item.lower(), "quantidade": 1, "preco_unitario": float(it.preco_unitario_vendido), "observacao": it.observacao}
            if it.tipo_item == 'Pizza':
                d["detalhes_pizza"] = {
                    "tamanho": it.detalhe_pizza.tamanho.nome_tamanho,
                    "borda": it.detalhe_pizza.borda.tipo if it.detalhe_pizza.borda else "Sem Borda",
                    "sabores": [s.sabor.nome_sabor for s in it.detalhe_pizza.sabores]
                }
            else:
                d["nome"] = it.bebida.produto.nome if it.bebida else "Produto"
            itens.append(d)
        
        res.append({
            "id_pedido": p.id_pedido,
            "status": p.status,
            "data_hora": p.data_hora_criacao,
            "valor_total": float(p.valor_total),
            "taxa_entrega": float(p.taxa_entrega or 0),
            "endereco": f"{p.endereco.logradouro}, {p.endereco.numero}" if p.endereco else "Balcão",
            "cliente_nome": p.cliente.pessoa.nome if p.cliente else "Visitante",
            "itens": itens,
            "pagamentos": [{"forma": pag.forma_pagamento, "valor": float(pag.valor_pago)} for pag in p.pagamentos],
            "troco": float(p.troco or 0)
        })
    return res

@router.get("/pedidos/historico_dia")
def historico_dia(db: Session = Depends(database.get_db)):
    q = db.query(models.Pedido).filter(models.Pedido.status.in_(["Finalizado", "Cancelado"]), func.date(models.Pedido.data_hora_criacao) == func.current_date()).all()
    return [{
        "id": p.id_pedido,
        "cliente": p.cliente.pessoa.nome if p.cliente else "Balcão",
        "total": float(p.valor_total),
        "status": p.status,
        "hora": p.data_hora_criacao.strftime("%H:%M")
    } for p in q]

@router.get("/pedidos/{id_pedido}")
def detalhes_pedido(id_pedido: int, db: Session = Depends(database.get_db)):
    p = db.get(models.Pedido, id_pedido)
    if not p: raise HTTPException(404, "Pedido não encontrado")
    
    itens = []
    for it in p.itens:
        d = {"tipo": it.tipo_item.lower(), "quantidade": 1, "preco_unitario": float(it.preco_unitario_vendido), "observacao": it.observacao}
        if it.tipo_item == 'Pizza':
            d["detalhes_pizza"] = {
                "tamanho": it.detalhe_pizza.tamanho.nome_tamanho,
                "borda": it.detalhe_pizza.borda.tipo if it.detalhe_pizza.borda else "Sem Borda",
                "sabores": [s.sabor.nome_sabor for s in it.detalhe_pizza.sabores]
            }
        else:
            d["nome"] = it.bebida.produto.nome if it.bebida else "Bebida"
        itens.append(d)

    return {
        "id_pedido": p.id_pedido,
        "status": p.status,
        "data_hora": p.data_hora_criacao,
        "valor_total": float(p.valor_total),
        "taxa_entrega": float(p.taxa_entrega or 0),
        "endereco": f"{p.endereco.logradouro}, {p.endereco.numero} ({p.endereco.bairro})" if p.endereco else "Balcão",
        "cliente_nome": p.cliente.pessoa.nome if p.cliente else "Visitante",
        "itens": itens,
        "pagamentos": [{"forma": pag.forma_pagamento, "valor": float(pag.valor_pago)} for pag in p.pagamentos],
        "troco": float(p.troco or 0)
    }

@router.patch("/pedidos/{id}/status")
def atualizar_status_pedido(id: int, status: str, db: Session = Depends(database.get_db)):
    pedido = db.get(models.Pedido, id)
    if not pedido: raise HTTPException(404, "Pedido não encontrado")
    pedido.status = status
    db.commit()
    return {"status": "sucesso"}

@router.patch("/pedidos/{id}/despachar")
def despachar_pedido(id: int, id_motoboy: str, db: Session = Depends(database.get_db)):
    pedido = db.get(models.Pedido, id)
    if not pedido: raise HTTPException(404, "Pedido não encontrado")
    pedido.id_motoboy = id_motoboy
    pedido.status = "Em Rota"
    db.commit()
    return {"status": "sucesso"}
