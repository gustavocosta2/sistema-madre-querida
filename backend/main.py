from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
from dotenv import load_dotenv

# Importações absolutas
import models
import schemas
import database

# Carrega as variáveis de ambiente
load_dotenv()

# Cria as tabelas
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Pizzaria Madre Querida API", version="1.0.0")

# CONFIGURAÇÃO DE CORS REFORÇADA
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite qualquer origem para desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os verbos (GET, POST, etc)
    allow_headers=["*"],  # Permite todos os headers
)

@app.get("/")
async def root():
    return {"message": "API Madre Querida Online"}

@app.get("/sabores", response_model=List[schemas.Sabor])
def listar_sabores(db: Session = Depends(database.get_db)):
    print("DEBUG: Recebi requisição em /sabores") # Log para o terminal
    return db.query(models.Sabor).all()

@app.get("/tamanhos", response_model=List[schemas.Tamanho])
def listar_tamanhos(db: Session = Depends(database.get_db)):
    print("DEBUG: Recebi requisição em /tamanhos")
    return db.query(models.Tamanho).all()

@app.get("/bordas", response_model=List[schemas.Borda])
def listar_bordas(db: Session = Depends(database.get_db)):
    print("DEBUG: Recebi requisição em /bordas")
    return db.query(models.Borda).all()

@app.get("/precos", response_model=List[schemas.Precificado])
def listar_precos(db: Session = Depends(database.get_db)):
    print("DEBUG: Recebi requisição em /precos")
    return db.query(models.Precificado).all()

# --- NOVA ROTA: LISTAR MOTOBOYS ---
@app.get("/motoboys")
def listar_motoboys(db: Session = Depends(database.get_db)):
    motoboys = db.query(models.Motoboy).all()
    resultado = []
    for m in motoboys:
        pessoa = db.query(models.Pessoa).filter(models.Pessoa.cpf == m.cpf_motoboy).first()
        resultado.append({
            "cpf": m.cpf_motoboy,
            "nome": pessoa.nome if pessoa else "Desconhecido",
            "placa": m.placa_veiculo,
            "vinculo": m.tipo_vinculo  # Agora enviamos se é Próprio ou Freelancer
        })
    return resultado

# --- NOVA ROTA: FINALIZAR PEDIDO ---
@app.post("/pedidos")
def criar_pedido(pedido_in: schemas.PedidoCreate, db: Session = Depends(database.get_db)):
    try:
        # 1. Calcular valor total do pedido
        total = sum(item.preco for item in pedido_in.itens)

        # 2. Criar o cabeçalho do pedido
        # Se não vier CPF, deixamos nulo (Venda Balcão)
        novo_pedido = models.Pedido(
            id_cliente=pedido_in.cpf_cliente if pedido_in.cpf_cliente != "111.111.111-11" else None,
            valor_total=total,
            status="Recebido"
        )
        db.add(novo_pedido)
        db.flush() # Para gerar o ID do pedido antes de salvar os itens

        # 3. Registrar no Histórico
        historico = models.HistoricoStatusPedido(
            id_pedido=novo_pedido.id_pedido,
            status="Recebido"
        )
        db.add(historico)

        # 4. Criar os itens
        for item in pedido_in.itens:
            # Pega o id_produto base (vamos assumir que o produto 1 é "Pizza Customizada")
            # Nota: Em um sistema real, cada sabor poderia ser um produto, mas aqui simplificamos.
            
            item_obj = models.ItemPedido(
                id_pedido=novo_pedido.id_pedido,
                id_produto=1, # Fixamos como Pizza por enquanto
                quantidade=1,
                preco_unitario_vendido=item.preco
            )
            db.add(item_obj)
            db.flush()

            # Detalhes da Pizza
            detalhe = models.ItemPizzaDetalhe(
                id_item=item_obj.id_item,
                id_tamanho=item.id_tamanho,
                id_borda=item.id_borda
            )
            db.add(detalhe)

            # Sabor da Pizza
            sabor = models.PizzaSabor(
                id_item=item_obj.id_item,
                id_sabor=item.id_sabor,
                fracao=1.00 # Pizza de 1 sabor só por enquanto
            )
            db.add(sabor)

        db.commit()
        return {"id_pedido": novo_pedido.id_pedido, "status": "Sucesso", "total": total}

    except Exception as e:
        db.rollback()
        print(f"ERRO CRÍTICO NO BANCO: {str(e)}") # Isso vai aparecer no seu terminal
        raise HTTPException(status_code=400, detail=f"Erro ao salvar pedido: {str(e)}")

# --- NOVA ROTA: LISTAR PEDIDOS PARA A COZINHA ---
@app.get("/pedidos/ativos")
def listar_pedidos_ativos(db: Session = Depends(database.get_db)):
    # Busca pedidos que não foram Finalizados ou Cancelados
    pedidos = db.query(models.Pedido).filter(
        models.Pedido.status.notin_(["Finalizado", "Cancelado"])
    ).order_by(models.Pedido.data_hora_criacao.asc()).all()
    
    resultado = []
    for p in pedidos:
        itens_formatados = []
        for item in p.itens:
            # Busca detalhes se for pizza
            detalhe = item.detalhe_pizza
            sabor_nome = "Desconhecido"
            tamanho_nome = "N/A"
            borda_nome = "N/A"
            
            if detalhe:
                tamanho_nome = detalhe.tamanho.nome_tamanho
                borda_nome = detalhe.borda.tipo if detalhe.borda else "Sem Borda"
                # Pega o primeiro sabor (simplificado)
                if detalhe.sabores:
                    sabor_nome = detalhe.sabores[0].sabor.nome_sabor
            
            itens_formatados.append({
                "sabor": sabor_nome,
                "tamanho": tamanho_nome,
                "borda": borda_nome,
                "quantidade": item.quantidade
            })
            
        resultado.append({
            "id_pedido": p.id_pedido,
            "status": p.status,
            "data_hora": p.data_hora_criacao,
            "itens": itens_formatados
        })
    return resultado

# --- NOVA ROTA: ATUALIZAR STATUS ---
@app.patch("/pedidos/{id_pedido}/status")
def atualizar_status(id_pedido: int, novo_status: str, db: Session = Depends(database.get_db)):
    pedido = db.query(models.Pedido).filter(models.Pedido.id_pedido == id_pedido).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    pedido.status = novo_status
    
    # Registra no histórico
    historico = models.HistoricoStatusPedido(
        id_pedido=id_pedido,
        status=novo_status
    )
    db.add(historico)
    db.commit()
    return {"status": "Atualizado", "novo_status": novo_status}

# --- NOVA ROTA: DESPACHAR PEDIDO ---
@app.patch("/pedidos/{id_pedido}/despachar")
def despachar_pedido(id_pedido: int, cpf_motoboy: str, db: Session = Depends(database.get_db)):
    pedido = db.query(models.Pedido).filter(models.Pedido.id_pedido == id_pedido).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    pedido.status = "Em Rota"
    pedido.id_motoboy = cpf_motoboy
    
    # Registra no histórico
    historico = models.HistoricoStatusPedido(
        id_pedido=id_pedido,
        status="Em Rota"
    )
    db.add(historico)
    db.commit()
    return {"status": "Em Rota", "motoboy": cpf_motoboy}

if __name__ == "__main__":
    import uvicorn
    # Importante: rodar na porta 8000
    uvicorn.run(app, host="127.0.0.1", port=8000)
