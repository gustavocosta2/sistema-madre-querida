# Dicionário de Dados: Modelo Físico (PostgreSQL)

Este documento fornece o mapeamento técnico completo do banco de dados da Pizzaria Madre Querida, detalhando metadados, restrições de integridade e a lógica física implementada para uma operação estável e profissional.

---

## 1. Tipos de Dados Customizados (Enums)

| Tipo | Valores Permitidos | Descrição |
| :--- | :--- | :--- |
| **`status_pedido_enum`** | `Recebido`, `Em Preparo`, `Aguardando Entrega`, `Em Rota`, `Finalizado`, `Cancelado` | Controla o ciclo de vida operacional do pedido. |
| **`origem_pedido_enum`** | `WhatsApp`, `Telefone`, `Balcão`, `iFood` | Identifica o canal de entrada da venda para fins de BI. |

---

## 2. Módulo de Identidade e Segurança

### Tabela: `pessoas`
Entidade base central para clientes e funcionários.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `cpf` | `VARCHAR(14)` | **PK**, `NOT NULL` | Identificador único nacional. Ex: `000.000.000-00`. |
| `nome` | `VARCHAR(100)` | `NOT NULL` | Nome completo do indivíduo. |
| `data_nascimento` | `DATE` | `NULLABLE` | Data para CRM e alertas de aniversário. |
| `criado_em` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Registro cronológico de inserção. |

### Tabela: `usuarios`
| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id_usuario` | `SERIAL` | **PK** | Identificador autoincremental. |
| `username` | `VARCHAR(50)` | `NOT NULL`, `UNIQUE` | Nome de login único. |
| `senha_hash` | `VARCHAR(255)` | `NOT NULL` | Hash da senha (PBKDF2-SHA256). |
| `role` | `VARCHAR(20)` | `DEFAULT 'funcionario'` | Papel no sistema (`admin` ou `funcionario`). |
| `ativo` | `BOOLEAN` | `DEFAULT TRUE` | Controle de acesso (Soft Delete). |
| `ultima_login` | `TIMESTAMPTZ` | `NULLABLE` | Carimbo de tempo do último acesso bem-sucedido. |

---

## 3. Localização e CRM

### Tabela: `enderecos_pessoa`
| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id_endereco` | `SERIAL` | **PK** | ID único do endereço. |
| `cpf_pessoa` | `VARCHAR(14)` | **FK** (`pessoas.cpf`), `NOT NULL` | Vínculo com a pessoa dona do endereço. |
| `logradouro` | `VARCHAR(100)` | `NOT NULL` | Rua, Avenida, Praça. |
| `numero` | `VARCHAR(10)` | `NULLABLE` | Número ou S/N. |
| `bairro` | `VARCHAR(50)` | `NULLABLE` | Bairro para zoneamento logístico. |
| `cep` | `VARCHAR(9)` | `NULLABLE` | Código Postal (00000-000). |
| `ponto_referencia` | `TEXT` | `NULLABLE` | Apoio visual para o entregador. |
| `e_principal` | `BOOLEAN` | `DEFAULT FALSE` | Indica se é o endereço padrão. |

### Tabela: `clientes`
| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `cpf_cliente` | `VARCHAR(14)` | **PK**, **FK** (`pessoas.cpf`) | Herança da entidade Pessoa. |
| `saldo_pontos` | `INTEGER` | `DEFAULT 0` | Pontuação acumulada para troca. |
| `observacao` | `TEXT` | `NULLABLE` | Notas de CRM (ex: "cliente alérgico a camarão"). |
| `ativo` | `BOOLEAN` | `DEFAULT TRUE` | Status de atividade do cliente. |
| `ultima_visita` | `TIMESTAMPTZ` | `NULLABLE` | Data da última interação de compra. |

---

## 4. RH e Equipe

### Tabela: `funcionarios`
| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `cpf_funcionario` | `VARCHAR(14)` | **PK**, **FK** (`pessoas.cpf`) | Herança da entidade Pessoa. |
| `cargo` | `VARCHAR(50)` | `NOT NULL` | Função (Pizzaiolo, Atendente, Gerente). |
| `salario` | `NUMERIC(10,2)` | `CHECK >= 0` | Remuneração mensal base. |
| `data_admissao` | `DATE` | `DEFAULT CURRENT_DATE` | Início do vínculo empregatício. |
| `ativo` | `BOOLEAN` | `DEFAULT TRUE` | Status de atividade. |

---

## 5. Catálogo, Precificação e Itens

### Tabela: `produtos`
| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id_produto` | `SERIAL` | **PK** | ID Global do produto/item. |
| `nome` | `VARCHAR(100)` | `NOT NULL` | Nome exibido no PDV. |
| `tipo_produto` | `VARCHAR(20)` | `NOT NULL` | 'Pizza', 'Bebida', 'Acompanhamento'. |
| `preco_pontos` | `INTEGER` | `DEFAULT 0` | Valor em pontos para resgate. |

### Tabela: `itens_pedido`
| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id_item` | `SERIAL` | **PK** | Identificador da linha do pedido. |
| `id_pedido` | `INT` | **FK** (`pedidos.id_pedido`) | Vínculo com a comanda principal. |
| `id_produto` | `INT` | **FK** (`produtos.id_produto`) | O que está sendo vendido. |
| `tipo_item` | `VARCHAR(20)` | `NOT NULL` | 'Pizza' ou 'Bebida' (facilita filtragem UI). |
| `quantidade` | `INTEGER` | `DEFAULT 1`, `CHECK > 0` | Volume de unidades vendidas. |
| `preco_unitario_vendido`| `NUMERIC(10,2)` | `NOT NULL` | **Imutabilidade:** Preço no ato da venda. |
| `observacao` | `TEXT` | `NULLABLE` | Notas da cozinha (ex: "sem cebola"). |

### Tabela: `item_pizza_detalhe`
Extensão de Itens_Pedido para lógica de Pizzas.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id_item` | `INT` | **PK**, **FK** (`itens_pedido`) | Vínculo 1:1 com a linha do pedido. |
| `id_tamanho` | `INT` | **FK** (`tamanhos`) | Tamanho da pizza. |
| `id_borda` | `INT` | **FK** (`bordas`) | Borda escolhida. |

### Tabela: `pizza_sabores`
Composição do fracionamento da pizza.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id_item` | `INT` | **CPK**, **FK** (`item_pizza_detalhe`) | Vínculo com a pizza customizada. |
| `id_sabor` | `INT` | **CPK**, **FK** (`sabores`) | Sabor adicionado. |
| `fracao` | `NUMERIC(3,2)` | `DEFAULT 1.00` | Proporção (ex: 0.50 para meia-a-meia). |

---

## 6. Módulo Financeiro e Auditoria

### Tabela: `caixas`
| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id_caixa` | `SERIAL` | **PK** | Identificador do turno de caixa. |
| `id_usuario_abertura`| `INT` | **FK** (`usuarios`) | Quem iniciou o turno. |
| `id_usuario_fechamento`| `INT` | **FK** (`usuarios`) | Quem encerrou o turno. |
| `data_abertura` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Carimbo de início. |
| `data_fechamento` | `TIMESTAMPTZ` | `NULLABLE` | Carimbo de fim. |
| `valor_abertura` | `NUMERIC(10,2)` | `DEFAULT 0` | Dinheiro inicial (troco). |
| `valor_fechamento_esperado` | `NUMERIC(10,2)` | `DEFAULT 0` | Saldo teórico (Abertura + Entradas - Saídas). |
| `valor_fechamento_informado` | `NUMERIC(10,2)` | `NULLABLE` | Saldo real contato pelo operador. |
| `status` | `VARCHAR(20)` | `DEFAULT 'Aberto'` | `Aberto` ou `Fechado`. |
| `observacao` | `TEXT` | `NULLABLE` | Ocorrências do turno. |

### Tabela: `fluxo_caixa`
| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id_movimentacao` | `SERIAL` | **PK** | Registro do lançamento financeiro. |
| `id_caixa` | `INT` | **FK** (`caixas`) | Vínculo com o turno. |
| `id_pedido` | `INT` | **FK** (`pedidos`), `NULLABLE` | Vínculo opcional se a origem for uma venda. |
| `tipo_movimentacao` | `VARCHAR(20)` | `NOT NULL` | `Entrada Venda`, `Suprimento`, `Sangria`, `Acerto`. |
| `forma_pagamento` | `VARCHAR(30)` | `NOT NULL` | `Dinheiro`, `Pix`, `Cartão Débito`, `Cartão Crédito`. |
| `valor` | `NUMERIC(10,2)` | `CHECK >= 0` | Valor bruto da movimentação. |
| `descricao` | `TEXT` | `NULLABLE` | Detalhamento (ex: "Compra de Gás"). |
| `data_hora` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Horário do lançamento. |

---

## 7. Regras de Deleção e Ciclo de Vida

O banco de dados da Madre Querida implementa três estratégias para garantir a integridade histórica:

1. **Cascata (`CASCADE`):** Endereços e Telefones são apagados se a Pessoa for removida. Itens de Pedido e Pagamentos são apagados se o Pedido for removido.
2. **Restrição (`RESTRICT`):** O sistema impede apagar Sabores, Tamanhos ou Clientes que já possuam histórico de vendas, protegendo a auditoria financeira.
3. **Lógica (`Soft Delete`):** Funcionários e Clientes possuem o campo `ativo`. Ao "excluir", o sistema apenas altera para `FALSE`, mantendo os dados para relatórios passados, mas ocultando-os das operações atuais.

---
*Documentação técnica atualizada em 06 de Maio de 2026, refletindo a implementação completa do Módulo Financeiro e Gestão de RH.*
