from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from decimal import Decimal
from datetime import datetime, date

# --- SCHEMAS DE LEITURA (SAÍDA) ---
class Sabor(BaseModel):
    id_sabor: int
    nome_sabor: str
    ingredientes: Optional[str]
    disponivel: bool = True
    preco_pontos: Optional[int] = 0
    class Config: from_attributes = True

class Tamanho(BaseModel):
    id_tamanho: int
    nome_tamanho: str
    qtd_sabor_max: int
    class Config: from_attributes = True

class Borda(BaseModel):
    id_borda: int
    tipo: str
    preco_adicional: Decimal
    class Config: from_attributes = True

class Precificado(BaseModel):
    id_sabor: int
    id_tamanho: int
    preco_base: Decimal
    class Config: from_attributes = True

class Bebida(BaseModel):
    id_produto: int
    nome: str
    preco: Decimal
    quantidade: int = 0
    disponivel: Optional[bool] = True
    preco_pontos: Optional[int] = 0
    class Config: from_attributes = True

class Telefone(BaseModel):
    id_telefone: int
    cpf_pessoa: str
    numero: str
    e_principal: bool
    class Config: from_attributes = True

class Promocao(BaseModel):
    id_promo: int
    nome: str
    status: bool
    valor_desconto: Decimal
    class Config: from_attributes = True

# --- SCHEMAS DE ESCRITA (ENTRADA / UPDATE) ---

class SaborUpdate(BaseModel):
    nome_sabor: Optional[str] = None
    ingredientes: Optional[str] = None
    preco_pontos: Optional[int] = None
    precos_por_tamanho: Optional[Dict[int, float]] = None # Mapeia ID_TAMANHO -> PRECO

class BebidaUpdate(BaseModel):
    nome: Optional[str] = None
    preco: Optional[float] = None
    quantidade: Optional[int] = None
    preco_pontos: Optional[int] = None

class ClienteCompletoCreate(BaseModel):
    cpf: str
    nome: str
    data_nascimento: Optional[date] = None
    observacao: Optional[str] = None
    logradouro: str
    numero: str
    complemento: Optional[str] = None
    bairro: str
    cep: str
    ponto_referencia: Optional[str] = None
    telefones: Optional[List[str]] = []

class EnderecoCreate(BaseModel):
    cpf_pessoa: str
    logradouro: str
    numero: str
    complemento: Optional[str] = None
    bairro: str
    cep: str
    ponto_referencia: Optional[str] = None

# --- PEDIDOS ---
class ItemPedidoCreate(BaseModel):
    tipo: str # 'pizza' ou 'bebida'
    id_produto: Optional[int] = None
    sabores: Optional[List[int]] = []
    id_tamanho: Optional[int] = None
    id_borda: Optional[int] = None
    preco: Decimal
    observacao: Optional[str] = None

class PagamentoCreate(BaseModel):
    forma_pagamento: str
    valor_pago: Decimal

class PedidoCreate(BaseModel):
    cpf_cliente: Optional[str] = None
    id_endereco_entrega: Optional[int] = None
    itens: List[ItemPedidoCreate]
    pontos_resgatados: Optional[int] = 0
    valor_recebido: Optional[Decimal] = Decimal('0.00')
    troco: Optional[Decimal] = Decimal('0.00')
    taxa_entrega: Optional[Decimal] = Decimal('0.00')
    quilometragem: Optional[Decimal] = Decimal('0.00')
    pagamentos: Optional[List[PagamentoCreate]] = []

# --- SEGURANÇA ---
class LoginRequest(BaseModel):
    username: str
    password: str

# --- MÓDULO FINANCEIRO ---
class FluxoCaixaBase(BaseModel):
    id_caixa: int
    id_pedido: Optional[int] = None
    tipo_movimentacao: str # "Entrada Venda", "Suprimento", "Sangria", "Acerto Motoboy"
    forma_pagamento: str
    valor: Decimal = Field(..., ge=0)
    descricao: Optional[str] = None

class FluxoCaixa(FluxoCaixaBase):
    id_movimentacao: int
    data_hora: datetime
    class Config: from_attributes = True

class CaixaBase(BaseModel):
    id_usuario_abertura: int
    valor_abertura: Decimal = Field(..., ge=0)
    observacao: Optional[str] = None

class Caixa(CaixaBase):
    id_caixa: int
    id_usuario_fechamento: Optional[int] = None
    data_abertura: datetime
    data_fechamento: Optional[datetime] = None
    valor_fechamento_esperado: Decimal
    valor_fechamento_informado: Optional[Decimal] = None
    status: str
    movimentacoes: List[FluxoCaixa] = []
    class Config: from_attributes = True

class CaixaFechamento(BaseModel):
    id_usuario_fechamento: int
    valor_fechamento_informado: Decimal = Field(..., ge=0)
    observacao: Optional[str] = None

# --- MÓDULO DE RH / EQUIPE ---
class FuncionarioCreate(BaseModel):
    cpf: str
    nome: str
    cargo: str
    salario: Decimal = Field(..., ge=0)
    placa_veiculo: Optional[str] = None # Apenas se for Motoboy

class FuncionarioUpdate(BaseModel):
    nome: Optional[str] = None
    cargo: Optional[str] = None
    salario: Optional[Decimal] = Field(None, ge=0)
    placa_veiculo: Optional[str] = None

class FuncionarioResponse(BaseModel):
    cpf: str
    nome: str
    cargo: str
    salario: Decimal
    ativo: bool
    placa_veiculo: Optional[str] = None
    class Config: from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str
