export interface Sabor { 
    id_sabor: number; 
    nome_sabor: string; 
    ingredientes: string; 
    disponivel?: boolean; 
    preco_pontos?: number;
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
    preco: string; 
    quantidade: number;
    disponivel?: boolean; 
    preco_pontos?: number; 
}

export interface Telefone {
    id_telefone: number;
    cpf_pessoa: string;
    numero: string;
    e_principal: boolean;
}

export interface Promocao {
    id_promo: number;
    nome: string;
    status: boolean;
    valor_desconto: string;
}

export interface ItemCarrinho { 
    id: string; // Hash aleatório para o Carrinho (UI)
    id_original?: number; // ID Real do Banco (id_produto ou id_sabor)
    tipo: 'pizza' | 'bebida'; 
    nome: string; 
    preco: number; 
    pago_com_pontos?: boolean;
    custo_pontos?: number;
    sabores?: number[]; 
    id_tamanho?: number; 
    id_borda?: number; 
    detalhe?: string; // Mapeado para 'observacao' no banco
    observacao?: string;
}
export interface Motoboy { 
    cpf: string; 
    nome: string; 
    placa: string; 
    vinculo: string; 
}

export interface Funcionario {
    cpf: string;
    nome: string;
    cargo: string;
    salario: number;
    ativo: boolean;
    placa_veiculo?: string;
}

export interface ClienteBusca { 
...
    cpf: string; 
    nome: string; 
    pontos: number; 
    telefones?: string[];
    data_nascimento?: string | null;
    observacao?: string | null;
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

export interface Pagamento {
    forma_pagamento: string;
    valor_pago: number;
}

export interface PedidoAtivo {
    id_pedido: number;
    status: string;
    data_hora: string;
    valor_total: number;
    valor_recebido?: number;
    troco?: number;
    taxa_entrega?: number;
    quilometragem?: number;
    origem: string;
    itens: {
        id_item: number;
        tipo: string;
        nome: string;
        quantidade: number;
        preco_unitario: number;
        observacao?: string;
        detalhes_pizza?: {
            tamanho: string;
            borda?: string;
            sabores: string[];
        };
    }[];
    endereco?: string;
    cliente_nome?: string;
    cliente_cpf?: string;
    pagamentos?: Pagamento[];
}
