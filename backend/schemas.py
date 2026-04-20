from pydantic import BaseModel
from typing import Optional, List, Dict
from decimal import Decimal

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
    volume: int
    preco: Decimal
    disponivel: Optional[bool] = True
    preco_pontos: Optional[int] = 0
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
    volume: Optional[int] = None
    preco_pontos: Optional[int] = None

class ClienteCompletoCreate(BaseModel):
    cpf: str
    nome: str
    logradouro: str
    numero: str
    complemento: Optional[str] = None
    bairro: str
    cep: str
    ponto_referencia: Optional[str] = None

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

class PedidoCreate(BaseModel):
    cpf_cliente: Optional[str] = None
    id_endereco_entrega: Optional[int] = None
    itens: List[ItemPedidoCreate]
    pontos_resgatados: Optional[int] = 0

# --- SEGURANÇA ---
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str
