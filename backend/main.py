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
        func = db.query(models.Usuario).filter(models.Usuario.username == "equipe").first()
        if not func:
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
    allow_origins=["*"],  # Permite qualquer origem para desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os verbos (GET, POST, etc)
    allow_headers=["*"],  # Permite todos os headers
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
    
    # Gera o Token
    token = auth.criar_token_acesso(data={"sub": usuario.username, "role": usuario.role})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": usuario.role,
        "username": usuario.username
    }

# --- NOVA ROTA: BUSCAR CLIENTES ---
@app.get("/clientes/buscar/{termo}")
def buscar_clientes(termo: str, db: Session = Depends(database.get_db)):
    # Busca por CPF ou Nome (usando ILIKE para ignorar maiúsculas/minúsculas)
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
        # 1. Cria Pessoa
        nova_pessoa = models.Pessoa(cpf=c_in.cpf, nome=c_in.nome)
        db.add(nova_pessoa)
        
        # 2. Cria Cliente
        novo_cliente = models.Cliente(cpf_cliente=c_in.cpf, saldo_pontos=0)
        db.add(novo_cliente)
        
        # 3. Cria Endereço Inicial
        novo_end = models.Endereco(
            cpf_pessoa=c_in.cpf,
            logradouro=c_in.logradouro,
            numero=c_in.numero,
            complemento=c_in.complemento,
            bairro=c_in.bairro,
            cep=c_in.cep,
            ponto_referencia=c_in.ponto_referencia,
            cidade="São João del Rei",
            e_principal=True
        )
        db.add(novo_end)
        
        db.commit()
        return {"cpf": c_in.cpf, "nome": c_in.nome, "id_endereco": novo_end.id_endereco}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="CPF já cadastrado ou erro nos dados.")

# --- NOVA ROTA: ENDEREÇOS DO CLIENTE ---
@app.get("/clientes/{cpf}/enderecos")
def listar_enderecos_cliente(cpf: str, db: Session = Depends(database.get_db)):
    enderecos = db.query(models.Endereco).filter(models.Endereco.cpf_pessoa == cpf).all()
    return enderecos

@app.post("/enderecos")
def criar_endereco(end_in: schemas.EnderecoCreate, db: Session = Depends(database.get_db)):
    novo_end = models.Endereco(
        cpf_pessoa=end_in.cpf_pessoa,
        logradouro=end_in.logradouro,
        numero=end_in.numero,
        complemento=end_in.complemento,
        bairro=end_in.bairro,
        cep=end_in.cep,
        ponto_referencia=end_in.ponto_referencia,
        cidade="São João del Rei"
    )
    db.add(novo_end)
    db.commit()
    db.refresh(novo_end)
    return novo_end

@app.get("/sabores", response_model=List[schemas.Sabor])
def listar_sabores(db: Session = Depends(database.get_db)):
    print("DEBUG: Recebi requisição em /sabores")
    return db.query(models.Sabor).all()

# --- NOVA ROTA: LISTAR BEBIDAS ---
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

# --- ROTAS DE GESTÃO (CRUD) ---

@app.post("/sabores")
def criar_sabor(s_in: schemas.Sabor, db: Session = Depends(database.get_db)):
    novo_sabor = models.Sabor(
        nome_sabor=s_in.nome_sabor,
        ingredientes=s_in.ingredientes,
        disponivel=True
    )
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

@app.post("/bebidas")
def criar_bebida(nome: str, volume: int, preco: float, db: Session = Depends(database.get_db)):
    # 1. Cria o Produto Base
    novo_prod = models.Produto(nome=nome, tipo_produto="Bebida", disponivel=True)
    db.add(novo_prod)
    db.flush()
    # 2. Cria o detalhe da Bebida
    nova_bebida = models.Bebida(id_bebida=novo_prod.id_produto, volume_ml=volume, preco_venda=preco)
    db.add(nova_bebida)
    db.commit()
    return {"status": "Bebida criada"}

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
# --- NOVA ROTA: FINALIZAR PEDIDO (REVISADA) ---
@app.post("/pedidos")
def criar_pedido(pedido_in: schemas.PedidoCreate, db: Session = Depends(database.get_db)):
    try:
        # 1. Obter Produto Base "Pizza"
        produto_pizza = db.query(models.Produto).filter(models.Produto.nome == "Pizza").first()
        if not produto_pizza:
            produto_pizza = models.Produto(nome="Pizza", tipo_produto="Pizza", disponivel=True)
            db.add(produto_pizza)
            db.flush()

        # 2. Criar Pedido
        total = sum(item.preco for item in pedido_in.itens)
        novo_pedido = models.Pedido(
            id_cliente=pedido_in.cpf_cliente,
            id_endereco_entrega=pedido_in.id_endereco_entrega,
            valor_total=total,
            status="Recebido",
            origem="Delivery"
        )
        db.add(novo_pedido)
        db.flush()

        # 3. Registrar Status Inicial
        db.add(models.HistoricoStatusPedido(id_pedido=novo_pedido.id_pedido, status="Recebido"))

        # 4. Processar Itens
        for i_in in pedido_in.itens:
            # Identificar o ID do produto
            id_prod = i_in.id_produto if i_in.tipo == 'bebida' else produto_pizza.id_produto
            
            # Criar Item Genérico
            item_obj = models.ItemPedido(
                id_pedido=novo_pedido.id_pedido,
                id_produto=id_prod,
                quantidade=1,
                preco_unitario_vendido=i_in.preco
            )
            db.add(item_obj)
            db.flush()

            # Se for Pizza, cadastrar detalhes específicos
            if i_in.tipo == 'pizza':
                # Detalhes (Tamanho e Borda)
                detalhe = models.ItemPizzaDetalhe(
                    id_item=item_obj.id_item,
                    id_tamanho=i_in.id_tamanho,
                    id_borda=i_in.id_borda
                )
                db.add(detalhe)
                
                # Sabores e Frações
                qtd_sabores = len(i_in.sabores)
                fracao = 1.0 / qtd_sabores if qtd_sabores > 0 else 1.0
                for s_id in i_in.sabores:
                    sabor_vinc = models.PizzaSabor(
                        id_item=item_obj.id_item,
                        id_sabor=s_id,
                        fracao=fracao
                    )
                    db.add(sabor_vinc)

        db.commit()
        return {"id_pedido": novo_pedido.id_pedido, "total": float(total)}

    except Exception as e:
        db.rollback()
        print(f"ERRO: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

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
                
                # Pega todos os sabores (Tratamento para meio a meio)
                if detalhe.sabores:
                    sabor_nome = " / ".join([s.sabor.nome_sabor for s in detalhe.sabores])
                    ingredientes = " | ".join([f"{s.sabor.nome_sabor}: {s.sabor.ingredientes}" for s in detalhe.sabores])
            
            itens_formatados.append({
                "sabor": sabor_nome,
                "ingredientes": ingredientes,
                "tamanho": tamanho_nome,
                "borda": borda_nome,
                "quantidade": item.quantidade
            })
            
        resultado.append({
        "id_pedido": p.id_pedido,
        "status": p.status,
        "data_hora": p.data_hora_criacao,
        "itens": itens_formatados,
        "endereco": f"{p.endereco.logradouro}, {p.endereco.numero} - {p.endereco.bairro}" if p.endereco else "Balcão / Retirada"
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

# --- NOVA ROTA: HISTÓRICO DE PEDIDOS (CONCLUÍDOS) ---
@app.get("/pedidos/historico")
def listar_historico(db: Session = Depends(database.get_db)):
    from datetime import datetime, date
    
    # Filtra pedidos do dia de hoje que já foram Finalizados ou Cancelados
    hoje = date.today()
    pedidos = db.query(models.Pedido).filter(
        models.Pedido.status.in_(["Finalizado", "Cancelado"]),
        func.date(models.Pedido.data_hora_criacao) == hoje
    ).order_by(models.Pedido.data_hora_criacao.desc()).all()
    
    resultado = []
    for p in pedidos:
        resultado.append({
            "id_pedido": p.id_pedido,
            "status": p.status,
            "data_hora": p.data_hora_criacao,
            "valor_total": float(p.valor_total),
            "cliente": p.cliente.pessoa.nome if p.cliente else "Balcão",
            "itens": [
                {
                    "nome": "Pizza " + " / ".join([s.sabor.nome_sabor for s in it.detalhe_pizza.sabores]) if it.detalhe_pizza else it.produto.nome,
                    "quantidade": it.quantidade
                } for it in p.itens
            ]
        })
    return resultado

if __name__ == "__main__":
    import uvicorn
    # Importante: rodar na porta 8000
    uvicorn.run(app, host="127.0.0.1", port=8000)
