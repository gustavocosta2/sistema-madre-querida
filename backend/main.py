from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from dotenv import load_dotenv

# Importações absolutas
import models
import schemas
import database
import auth

# Carrega as variáveis de ambiente
load_dotenv()

# Cria as tabelas e usuários iniciais
models.Base.metadata.create_all(bind=database.engine)

def inicializar_usuarios():
    db = database.SessionLocal()
    try:
        # Cria Admin se não existir
        admin = db.query(models.Usuario).filter(models.Usuario.username == "admin").first()
        if not admin:
            novo_admin = models.Usuario(
                username="admin",
                senha_hash=auth.gerar_hash_senha("admin123"),
                role="admin"
            )
            db.add(novo_admin)
        
        # Cria Funcionário único se não existir
        func_user = db.query(models.Usuario).filter(models.Usuario.username == "equipe").first()
        if not func_user:
            novo_func = models.Usuario(
                username="equipe",
                senha_hash=auth.gerar_hash_senha("madre123"),
                role="funcionario"
            )
            db.add(novo_func)
        db.commit()
    finally:
        db.close()

inicializar_usuarios()

app = FastAPI(title="Pizzaria Madre Querida API", version="1.0.0")

# CONFIGURAÇÃO DE CORS REFORÇADA
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "API Madre Querida Online"}

# --- ROTA DE LOGIN ---
@app.post("/login", response_model=schemas.TokenResponse)
def login(login_data: schemas.LoginRequest, db: Session = Depends(database.get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.username == login_data.username).first()
    if not usuario or not auth.verificar_senha(login_data.password, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")
    token = auth.criar_token_acesso(data={"sub": usuario.username, "role": usuario.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": usuario.role,
        "username": usuario.username
    }

# --- BUSCAR CLIENTES ---
@app.get("/clientes/buscar/{termo}")
def buscar_clientes(termo: str, db: Session = Depends(database.get_db)):
    clientes = db.query(models.Cliente).join(models.Pessoa).filter(
        (models.Pessoa.cpf.like(f"%{termo}%")) | (models.Pessoa.nome.ilike(f"%{termo}%"))
    ).all()
    resultado = []
    for c in clientes:
        resultado.append({
            "cpf": c.cpf_cliente,
            "nome": c.pessoa.nome,
            "pontos": c.saldo_pontos
        })
    return resultado

@app.post("/clientes/completo")
def cadastrar_cliente_completo(c_in: schemas.ClienteCompletoCreate, db: Session = Depends(database.get_db)):
    try:
        nova_pessoa = models.Pessoa(cpf=c_in.cpf, nome=c_in.nome)
        db.add(nova_pessoa)
        novo_cliente = models.Cliente(cpf_cliente=c_in.cpf, saldo_pontos=0)
        db.add(novo_cliente)
        novo_end = models.Endereco(
            cpf_pessoa=c_in.cpf, logradouro=c_in.logradouro, numero=c_in.numero,
            complemento=c_in.complemento, bairro=c_in.bairro, cep=c_in.cep,
            ponto_referencia=c_in.ponto_referencia, cidade="São João del Rei", e_principal=True
        )
        db.add(novo_end)
        db.commit()
        return {"cpf": c_in.cpf, "nome": c_in.nome, "id_endereco": novo_end.id_endereco}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/clientes/{cpf}/enderecos")
def listar_enderecos_cliente(cpf: str, db: Session = Depends(database.get_db)):
    return db.query(models.Endereco).filter(models.Endereco.cpf_pessoa == cpf).all()

@app.post("/enderecos")
def criar_endereco(end_in: schemas.EnderecoCreate, db: Session = Depends(database.get_db)):
    novo_end = models.Endereco(
        cpf_pessoa=end_in.cpf_pessoa, logradouro=end_in.logradouro, numero=end_in.numero,
        complemento=end_in.complemento, bairro=end_in.bairro, cep=end_in.cep,
        ponto_referencia=end_in.ponto_referencia, cidade="São João del Rei"
    )
    db.add(novo_end)
    db.commit()
    db.refresh(novo_end)
    return novo_end

@app.get("/sabores", response_model=List[schemas.Sabor])
def listar_sabores(db: Session = Depends(database.get_db)):
    return db.query(models.Sabor).all()

@app.get("/bebidas")
def listar_bebidas(db: Session = Depends(database.get_db)):
    bebidas = db.query(models.Bebida).join(models.Produto).all()
    resultado = []
    for b in bebidas:
        resultado.append({
            "id_produto": b.id_bebida,
            "nome": b.produto.nome,
            "volume": b.volume_ml,
            "preco": b.preco_venda,
            "disponivel": b.produto.disponivel
        })
    return resultado

@app.post("/sabores")
def criar_sabor(s_in: schemas.Sabor, db: Session = Depends(database.get_db)):
    novo_sabor = models.Sabor(nome_sabor=s_in.nome_sabor, ingredientes=s_in.ingredientes, disponivel=True)
    db.add(novo_sabor)
    db.commit()
    db.refresh(novo_sabor)
    return novo_sabor

@app.patch("/sabores/{id_sabor}/disponibilidade")
def alternar_disponibilidade_sabor(id_sabor: int, disponivel: bool, db: Session = Depends(database.get_db)):
    sabor = db.query(models.Sabor).filter(models.Sabor.id_sabor == id_sabor).first()
    if not sabor: raise HTTPException(status_code=404)
    sabor.disponivel = disponivel
    db.commit()
    return sabor

@app.get("/tamanhos", response_model=List[schemas.Tamanho])
def listar_tamanhos(db: Session = Depends(database.get_db)):
    return db.query(models.Tamanho).all()

@app.get("/bordas", response_model=List[schemas.Borda])
def listar_bordas(db: Session = Depends(database.get_db)):
    return db.query(models.Borda).all()

@app.get("/precos", response_model=List[schemas.Precificado])
def listar_precos(db: Session = Depends(database.get_db)):
    return db.query(models.Precificado).all()

@app.get("/motoboys")
def listar_motoboys(db: Session = Depends(database.get_db)):
    motoboys = db.query(models.Motoboy).all()
    resultado = []
    for m in motoboys:
        pessoa = db.query(models.Pessoa).filter(models.Pessoa.cpf == m.cpf_motoboy).first()
        resultado.append({
            "cpf": m.cpf_motoboy, "nome": pessoa.nome if pessoa else "Desconhecido",
            "placa": m.placa_veiculo, "vinculo": m.tipo_vinculo
        })
    return resultado

@app.post("/pedidos")
def criar_pedido(pedido_in: schemas.PedidoCreate, db: Session = Depends(database.get_db)):
    try:
        produto_pizza = db.query(models.Produto).filter(models.Produto.nome == "Pizza").first()
        if not produto_pizza:
            produto_pizza = models.Produto(nome="Pizza", tipo_produto="Pizza", disponivel=True)
            db.add(produto_pizza)
            db.flush()

        total = sum(item.preco for item in pedido_in.itens)
        novo_pedido = models.Pedido(
            id_cliente=pedido_in.cpf_cliente,
            id_endereco_entrega=pedido_in.id_endereco_entrega,
            valor_total=total,
            status="Recebido",
            origem="WhatsApp" # Corrigido para valor aceito pelo ENUM
        )
        db.add(novo_pedido)
        db.flush()

        db.add(models.HistoricoStatusPedido(id_pedido=novo_pedido.id_pedido, status="Recebido"))

        for i_in in pedido_in.itens:
            id_prod = i_in.id_produto if i_in.tipo == 'bebida' else produto_pizza.id_produto
            item_obj = models.ItemPedido(
                id_pedido=novo_pedido.id_pedido, id_produto=id_prod,
                quantidade=1, preco_unitario_vendido=i_in.preco
            )
            db.add(item_obj)
            db.flush()

            if i_in.tipo == 'pizza':
                id_tam = i_in.id_tamanho if i_in.id_tamanho else 3
                id_bor = i_in.id_borda if i_in.id_borda else 1
                detalhe = models.ItemPizzaDetalhe(id_item=item_obj.id_item, id_tamanho=id_tam, id_borda=id_bor)
                db.add(detalhe)
                
                qtd_sabores = len(i_in.sabores) if i_in.sabores else 0
                fracao = 1.0 / qtd_sabores if qtd_sabores > 0 else 1.0
                if i_in.sabores:
                    for s_id in i_in.sabores:
                        db.add(models.PizzaSabor(id_item=item_obj.id_item, id_sabor=s_id, fracao=fracao))

        db.commit()
        return {"id_pedido": novo_pedido.id_pedido, "total": float(total)}
    except Exception as e:
        db.rollback()
        print(f"ERRO: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/pedidos/ativos")
def listar_pedidos_ativos(db: Session = Depends(database.get_db)):
    pedidos = db.query(models.Pedido).filter(
        models.Pedido.status.notin_(["Finalizado", "Cancelado"])
    ).order_by(models.Pedido.data_hora_criacao.asc()).all()
    
    resultado = []
    for p in pedidos:
        itens_formatados = []
        for item in p.itens:
            detalhe = item.detalhe_pizza
            sabor_nome = item.produto.nome if item.produto else "Desconhecido"
            tamanho_nome = "N/A"
            borda_nome = "N/A"
            ingredientes = ""
            
            if detalhe:
                tamanho_nome = detalhe.tamanho.nome_tamanho
                borda_nome = detalhe.borda.tipo if detalhe.borda else "Sem Borda"
                if detalhe.sabores:
                    sabor_nome = " / ".join([s.sabor.nome_sabor for s in detalhe.sabores])
                    ingredientes = " | ".join([f"{s.sabor.nome_sabor}: {s.sabor.ingredientes}" for s in detalhe.sabores])
            
            itens_formatados.append({
                "sabor": sabor_nome, "ingredientes": ingredientes,
                "tamanho": tamanho_nome, "borda": borda_nome, "quantidade": item.quantidade
            })
            
        resultado.append({
            "id_pedido": p.id_pedido, "status": p.status, "data_hora": p.data_hora_criacao,
            "itens": itens_formatados,
            "endereco": f"{p.endereco.logradouro}, {p.endereco.numero} - {p.endereco.bairro}" if p.endereco else "Balcão / Retirada"
        })
    return resultado

@app.patch("/pedidos/{id_pedido}/status")
def atualizar_status(id_pedido: int, novo_status: str, db: Session = Depends(database.get_db)):
    pedido = db.query(models.Pedido).filter(models.Pedido.id_pedido == id_pedido).first()
    if not pedido: raise HTTPException(status_code=404)
    pedido.status = novo_status
    db.add(models.HistoricoStatusPedido(id_pedido=id_pedido, status=novo_status))
    db.commit()
    return {"status": "Atualizado"}

@app.patch("/pedidos/{id_pedido}/despachar")
def despachar_pedido(id_pedido: int, cpf_motoboy: str, db: Session = Depends(database.get_db)):
    pedido = db.query(models.Pedido).filter(models.Pedido.id_pedido == id_pedido).first()
    if not pedido: raise HTTPException(status_code=404)
    pedido.status = "Em Rota"
    pedido.id_motoboy = cpf_motoboy
    db.add(models.HistoricoStatusPedido(id_pedido=id_pedido, status="Em Rota"))
    db.commit()
    return {"status": "Em Rota"}

@app.get("/pedidos/historico_dia")
def listar_historico(db: Session = Depends(database.get_db)):
    from datetime import date
    hoje = date.today()
    pedidos = db.query(models.Pedido).filter(
        models.Pedido.status.in_(["Finalizado", "Cancelado"]),
        func.date(models.Pedido.data_hora_criacao) == hoje
    ).order_by(models.Pedido.data_hora_criacao.desc()).all()
    
    resultado = []
    for p in pedidos:
        resultado.append({
            "id_pedido": p.id_pedido, "status": p.status, "data_hora": p.data_hora_criacao,
            "valor_total": float(p.valor_total),
            "cliente": p.cliente.pessoa.nome if p.cliente else "Balcão",
            "itens": [
                {"nome": "Pizza " + " / ".join([s.sabor.nome_sabor for s in it.detalhe_pizza.sabores]) if it.detalhe_pizza else it.produto.nome, "quantidade": it.quantidade}
                for it in p.itens
            ]
        })
    return resultado

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
