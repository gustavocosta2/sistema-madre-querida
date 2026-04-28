from sqlalchemy import Column, Integer, String, Boolean, Numeric, ForeignKey, Table, Text, DateTime, func
from sqlalchemy.orm import relationship
from database import Base

# --- MÓDULO DE SEGURANÇA E ACESSO ---
class Usuario(Base):
    __tablename__ = "usuarios"
    id_usuario = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="funcionario") 
    ativo = Column(Boolean, default=True)

# --- MÓDULO DE PESSOAS ---
class Pessoa(Base):
    __tablename__ = "pessoas"
    cpf = Column(String(14), primary_key=True)
    nome = Column(String(100), nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    enderecos = relationship("Endereco", back_populates="pessoa")
    telefones = relationship("Telefone", back_populates="pessoa")

class Endereco(Base):
    __tablename__ = "enderecos_pessoa"
    id_endereco = Column(Integer, primary_key=True, index=True)
    cpf_pessoa = Column(String(14), ForeignKey("pessoas.cpf"))
    logradouro = Column(String(100), nullable=False)
    numero = Column(String(10))
    complemento = Column(String(50))
    bairro = Column(String(50))
    cidade = Column(String(50))
    cep = Column(String(9))
    ponto_referencia = Column(Text)
    e_principal = Column(Boolean, default=False)

    pessoa = relationship("Pessoa", back_populates="enderecos")

class Telefone(Base):
    __tablename__ = "telefones_pessoa"
    id_telefone = Column(Integer, primary_key=True, index=True)
    cpf_pessoa = Column(String(14), ForeignKey("pessoas.cpf"))
    numero = Column(String(20), nullable=False)
    e_principal = Column(Boolean, default=False)

    pessoa = relationship("Pessoa", back_populates="telefones")

class Funcionario(Base):
    __tablename__ = "funcionarios"
    cpf_funcionario = Column(String(14), ForeignKey("pessoas.cpf"), primary_key=True)
    cargo = Column(String(50))
    salario = Column(Numeric(10,2))
    ativo = Column(Boolean, default=True)

    pessoa = relationship("Pessoa")

class Motoboy(Base):
    __tablename__ = "motoboys"
    cpf_motoboy = Column(String(14), ForeignKey("funcionarios.cpf_funcionario"), primary_key=True)
    placa_veiculo = Column(String(10), nullable=False)
    tipo_vinculo = Column(String(20), default="Freelancer") 
    
    funcionario = relationship("Funcionario")

class Cliente(Base):
    __tablename__ = "clientes"
    cpf_cliente = Column(String(14), ForeignKey("pessoas.cpf"), primary_key=True)
    saldo_pontos = Column(Integer, default=0)
    ultima_visita = Column(DateTime(timezone=True))
    
    pessoa = relationship("Pessoa")

# --- MÓDULO DE PRODUTOS E PROMOÇÕES ---
class Produto(Base):
    __tablename__ = "produtos"
    id_produto = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    disponivel = Column(Boolean, default=True)
    descricao = Column(Text)
    tipo_produto = Column(String(20), nullable=False)
    preco_pontos = Column(Integer, nullable=True)

class Bebida(Base):
    __tablename__ = "bebidas"
    id_bebida = Column(Integer, ForeignKey("produtos.id_produto"), primary_key=True)
    preco_venda = Column(Numeric(10, 2), nullable=False)
    quantidade = Column(Integer, default=0, nullable=False)
    
    produto = relationship("Produto")

class Tamanho(Base):
    __tablename__ = "tamanhos"
    id_tamanho = Column(Integer, primary_key=True, index=True)
    nome_tamanho = Column(String(30), unique=True, nullable=False)
    qtd_sabor_max = Column(Integer, nullable=False)

class Sabor(Base):
    __tablename__ = "sabores"
    id_sabor = Column(Integer, primary_key=True, index=True)
    nome_sabor = Column(String(50), nullable=False)
    ingredientes = Column(Text)
    disponivel = Column(Boolean, default=True)
    preco_pontos = Column(Integer, nullable=True)

class Precificado(Base):
    __tablename__ = "precificado"
    id_sabor = Column(Integer, ForeignKey("sabores.id_sabor"), primary_key=True)
    id_tamanho = Column(Integer, ForeignKey("tamanhos.id_tamanho"), primary_key=True)
    preco_base = Column(Numeric(10, 2), nullable=False)

class Borda(Base):
    __tablename__ = "bordas"
    id_borda = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(50), unique=True, nullable=False)
    preco_adicional = Column(Numeric(10, 2), default=0.00)

promocao_produtos_association = Table('promocao_produtos', Base.metadata,
    Column('id_promo', Integer, ForeignKey('promocoes.id_promo')),
    Column('id_produto', Integer, ForeignKey('produtos.id_produto'))
)

promocao_sabores_association = Table('promocao_sabores', Base.metadata,
    Column('id_promo', Integer, ForeignKey('promocoes.id_promo')),
    Column('id_sabor', Integer, ForeignKey('sabores.id_sabor'))
)

promocao_tamanhos_association = Table('promocao_tamanhos', Base.metadata,
    Column('id_promo', Integer, ForeignKey('promocoes.id_promo')),
    Column('id_tamanho', Integer, ForeignKey('tamanhos.id_tamanho'))
)

class Promocao(Base):
    __tablename__ = "promocoes"
    id_promo = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    status = Column(Boolean, default=True)
    valor_desconto = Column(Numeric(10, 2), nullable=False)

    produtos = relationship("Produto", secondary=promocao_produtos_association)
    sabores = relationship("Sabor", secondary=promocao_sabores_association)
    tamanhos = relationship("Tamanho", secondary=promocao_tamanhos_association)

# --- MÓDULO DE PEDIDOS E OPERACIONAL ---
class Pedido(Base):
    __tablename__ = "pedidos"
    id_pedido = Column(Integer, primary_key=True, index=True)
    id_cliente = Column(String(14), ForeignKey("clientes.cpf_cliente"), nullable=True)
    id_motoboy = Column(String(14), ForeignKey("motoboys.cpf_motoboy"), nullable=True)
    id_endereco_entrega = Column(Integer, ForeignKey("enderecos_pessoa.id_endereco"), nullable=True)
    status = Column(String(30), default="Recebido")
    origem = Column(String(30), default="Balcão")
    valor_total = Column(Numeric(10, 2), default=0.00)
    valor_recebido = Column(Numeric(10, 2), nullable=True)
    troco = Column(Numeric(10, 2), default=0.00)
    taxa_entrega = Column(Numeric(10, 2), default=0.00)
    quilometragem = Column(Numeric(10, 2), default=0.00)
    data_hora_criacao = Column(DateTime(timezone=True), server_default=func.now())

    itens = relationship("ItemPedido", back_populates="pedido")
    endereco = relationship("Endereco")
    cliente = relationship("Cliente", foreign_keys=[id_cliente])
    pagamentos = relationship("Pagamento", back_populates="pedido")
    historico = relationship("HistoricoStatusPedido", back_populates="pedido")

class Pagamento(Base):
    __tablename__ = "pagamentos"
    id_pagamento = Column(Integer, primary_key=True, index=True)
    id_pedido = Column(Integer, ForeignKey("pedidos.id_pedido"), nullable=False)
    forma_pagamento = Column(String(30), nullable=False)
    valor_pago = Column(Numeric(10, 2), nullable=False)

    pedido = relationship("Pedido", back_populates="pagamentos")

class HistoricoStatusPedido(Base):
    __tablename__ = "historico_status_pedido"
    id_historico = Column(Integer, primary_key=True, index=True)
    id_pedido = Column(Integer, ForeignKey("pedidos.id_pedido"))
    status = Column(String(30), nullable=False)
    data_hora = Column(DateTime(timezone=True), server_default=func.now())
    observacao = Column(Text, nullable=True)

    pedido = relationship("Pedido", back_populates="historico")

class ItemPedido(Base):
    __tablename__ = "itens_pedido"
    id_item = Column(Integer, primary_key=True, index=True)
    id_pedido = Column(Integer, ForeignKey("pedidos.id_pedido"))
    id_produto = Column(Integer, ForeignKey("produtos.id_produto"))
    quantidade = Column(Integer, default=1)
    preco_unitario_vendido = Column(Numeric(10, 2), nullable=False)
    observacao = Column(Text, nullable=True)

    pedido = relationship("Pedido", back_populates="itens")
    produto = relationship("Produto")
    detalhe_pizza = relationship("ItemPizzaDetalhe", uselist=False, back_populates="item")

class ItemPizzaDetalhe(Base):
    __tablename__ = "item_pizza_detalhe"
    id_item = Column(Integer, ForeignKey("itens_pedido.id_item"), primary_key=True)
    id_tamanho = Column(Integer, ForeignKey("tamanhos.id_tamanho"))
    id_borda = Column(Integer, ForeignKey("bordas.id_borda"), nullable=True)

    item = relationship("ItemPedido", back_populates="detalhe_pizza")
    tamanho = relationship("Tamanho")
    borda = relationship("Borda")
    sabores = relationship("PizzaSabor", back_populates="detalhe")

class PizzaSabor(Base):
    __tablename__ = "pizza_sabores"
    id_item = Column(Integer, ForeignKey("item_pizza_detalhe.id_item"), primary_key=True)
    id_sabor = Column(Integer, ForeignKey("sabores.id_sabor"), primary_key=True)
    fracao = Column(Numeric(3, 2), default=1.00)

    detalhe = relationship("ItemPizzaDetalhe", back_populates="sabores")
    sabor = relationship("Sabor")