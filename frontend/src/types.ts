export interface Sabor { 
    id_sabor: number; 
    nome_sabor: string; 
    ingredientes: string; 
    disponivel?: boolean; 
}

export interface Tamanho { 
    id_tamanho: number; 
    nome_tamanho: string; 
    qtd_sabor_max: number; 
}

export interface Borda { 
    id_borda: number; 
    tipo: string; 
    preco_adicional: string; 
}

export interface Preco { 
    id_sabor: number; 
    id_tamanho: number; 
    preco_base: string; 
}

export interface Bebida { 
    id_produto: number; 
    nome: string; 
    volume: number; 
    preco: string; 
    disponivel?: boolean; 
}

export interface ItemCarrinho { 
    id: string; // Hash aleatório para o Carrinho (UI)
    id_original?: number; // ID Real do Banco (id_produto ou id_sabor)
    tipo: 'pizza' | 'bebida'; 
    nome: string; 
    preco: number; 
    sabores?: number[]; 
    id_tamanho?: number; 
    id_borda?: number; 
    detalhe?: string; 
}

export interface Motoboy { 
    cpf: string; 
    nome: string; 
    placa: string; 
    vinculo: string; 
}

export interface ClienteBusca { 
    cpf: string; 
    nome: string; 
    pontos: number; 
}

export interface Endereco { 
    id_endereco: number; 
    logradouro: string; 
    numero: string; 
    bairro: string; 
    complemento?: string; 
    cep: string; 
    ponto_referencia?: string; 
}

export interface PedidoAtivo {
    id_pedido: number;
    status: string;
    data_hora: string;
    itens: {
        sabor: string;
        ingredientes: string;
        tamanho: string;
        borda: string;
        quantidade: number;
    }[];
    endereco?: string;
}
