from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal

# --- LEITURA ---
class Sabor(BaseModel):
    id_sabor: int
    nome_sabor: str
    ingredientes: Optional[str]
    class Config: from_attributes = True

class Tamanho(BaseModel):
    id_tamanho: int
    nome_tamanho: str
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

# --- CRIAÇÃO DE PEDIDO (O que vem do Front-end) ---

class ItemPedidoCreate(BaseModel):
    id_sabor: int
    id_tamanho: int
    id_borda: int
    preco: Decimal

class PedidoCreate(BaseModel):
    cpf_cliente: Optional[str] = "111.111.111-11"
    itens: List[ItemPedidoCreate]
