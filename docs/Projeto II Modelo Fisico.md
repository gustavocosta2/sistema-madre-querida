# Dicionário de Dados: Modelo Físico (PostgreSQL)

Este documento fornece o mapeamento técnico completo do banco de dados da Pizzaria Madre Querida, detalhando metadados, restrições de integridade e a lógica física implementada.

---

## 1. Tipos de Dados Customizados (Enums)

Para garantir a integridade dos estados do sistema, utilizamos tipos enumerados nativos do PostgreSQL:

| Tipo | Valores Permitidos | Descrição |
| :--- | :--- | :--- |
| **`status_pedido_enum`** | `Recebido`, `Em Preparo`, `Aguardando Entrega`, `Em Rota`, `Finalizado`, `Cancelado` | Controla o ciclo de vida operacional do pedido. |
| **`origem_pedido_enum`** | `WhatsApp`, `Telefone`, `Balcão`, `iFood` | Identifica o canal de entrada da venda para fins de BI. |

---

## 2. Módulo de Identidade e Segurança

### Tabela: `pessoas`
Entidade base para o padrão de herança Table-Per-Type (TPT).

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `cpf` | `VARCHAR(14)` | **PK**, `NOT NULL` | Identificador único nacional. Formato esperado: `000.000.000-00`. |
| `nome` | `VARCHAR(100)` | `NOT NULL` | Nome completo do indivíduo. |
| `criado_em` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Registro cronológico de inserção no sistema. |

### Tabela: `usuarios`
Contas de acesso ao backend/frontend.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id_usuario` | `SERIAL` | **PK** | Identificador autoincremental. |
| `username` | `VARCHAR(50)` | `NOT NULL`, `UNIQUE` | Nome de login único. |
| `senha_hash` | `VARCHAR(255)` | `NOT NULL` | Hash da senha (armazenado via BCrypt ou similar). |
| `role` | `VARCHAR(20)` | `DEFAULT 'funcionario'` | Papel no sistema (`admin` ou `funcionario`). |
| `ativo` | `BOOLEAN` | `DEFAULT TRUE` | Flag de controle de acesso (Soft Delete). |
| `ultima_login` | `TIMESTAMPTZ` | `NULLABLE` | Registro do último acesso bem-sucedido. |

---

## 3. Localização e CRM

### Tabela: `enderecos_pessoa`
| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id_endereco` | `SERIAL` | **PK** | Identificador único do endereço. |
| `cpf_pessoa` | `VARCHAR(14)` | **FK** (`pessoas.cpf`), `NOT NULL` | Referência à pessoa dona do endereço. `ON DELETE CASCADE`. |
| `logradouro` | `VARCHAR(100)` | `NOT NULL` | Nome da rua, avenida, etc. |
| `numero` | `VARCHAR(10)` | `NULLABLE` | Número da residência ou S/N. |
| `complemento` | `VARCHAR(50)` | `NULLABLE` | Apto, bloco, casa de fundos, etc. |
| `bairro` | `VARCHAR(50)` | `NULLABLE` | Bairro para cálculo de logística. |
| `cidade` | `VARCHAR(50)` | `DEFAULT 'São João del Rei'` | Cidade de operação principal. |
| `cep` | `VARCHAR(9)` | `NULLABLE` | Código de Endereçamento Postal. |
| `ponto_referencia`| `TEXT` | `NULLABLE` | Descrição para auxiliar o motoboy. |
| `e_principal` | `BOOLEAN` | `DEFAULT FALSE` | Indica se é o endereço padrão para entregas. |

### Tabela: `clientes`
| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `cpf_cliente` | `VARCHAR(14)` | **PK**, **FK** (`pessoas.cpf`) | Herança de `pessoas`. `ON DELETE CASCADE`. |
| `saldo_pontos` | `INTEGER` | `DEFAULT 0`, `CHECK >= 0` | Saldo acumulado no programa de fidelidade. |
| `ultima_visita` | `TIMESTAMPTZ` | `NULLABLE` | Data da última compra registrada. |

---

## 4. Catálogo de Produtos e Precificação

### Tabela: `produtos`
Entidade genérica para itens de venda.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id_produto` | `SERIAL` | **PK** | Identificador único global do produto. |
| `nome` | `VARCHAR(100)` | `NOT NULL` | Nome comercial do item. |
| `disponivel` | `BOOLEAN` | `DEFAULT TRUE` | Controla visibilidade no PDV (Soft Toggle). |
| `descricao` | `TEXT` | `NULLABLE` | Detalhamento técnico ou ingredientes. |
| `tipo_produto` | `VARCHAR(20)` | `NOT NULL` | Discriminador de tipo: `Bebida`, `Pizza`, `Adicional`. |
| `preco_pontos` | `INTEGER` | `DEFAULT 0` | Valor em pontos necessário para resgate. |

### Tabela: `precificado` (Matriz Sabor x Tamanho)
Esta tabela resolve a complexidade de preços dinâmicos por tamanho.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id_sabor` | `INT` | **CPK**, **FK** (`sabores.id_sabor`) | Referência ao sabor. `ON DELETE CASCADE`. |
| `id_tamanho` | `INT` | **CPK**, **FK** (`tamanhos.id_tamanho`) | Referência ao tamanho. `ON DELETE CASCADE`. |
| `preco_base` | `NUMERIC(10,2)` | `NOT NULL`, `CHECK > 0` | Valor base do sabor para aquele tamanho específico. |

---

## 5. Vendas e Operações

### Tabela: `pedidos`
| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id_pedido` | `SERIAL` | **PK** | Número do pedido para o cliente. |
| `id_cliente` | `VARCHAR(14)` | **FK** (`clientes.cpf_cliente`) | Opcional para vendas balcão/anônimas. |
| `status` | `status_pedido_enum`| `DEFAULT 'Recebido'` | Estado atual no fluxo de produção. |
| `origem` | `origem_pedido_enum`| `DEFAULT 'WhatsApp'` | Canal por onde o pedido foi realizado. |
| `valor_total` | `NUMERIC(10,2)` | `DEFAULT 0`, `CHECK >= 0` | Soma final (Itens + Taxa - Descontos). |
| `taxa_entrega` | `NUMERIC(10,2)` | `DEFAULT 0`, `CHECK >= 0` | Valor cobrado pelo serviço de entrega. |
| `data_hora_criacao`| `TIMESTAMPTZ` | `DEFAULT NOW()` | Timestamp de abertura do pedido. |

### Tabela: `itens_pedido`
| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id_item` | `SERIAL` | **PK** | Identificador da linha do pedido. |
| `id_pedido` | `INT` | **FK** (`pedidos.id_pedido`) | Vinculação ao cabeçalho. `ON DELETE CASCADE`. |
| `id_produto` | `INT` | **FK** (`produtos.id_produto`) | O que está sendo vendido. |
| `quantidade` | `INTEGER` | `DEFAULT 1`, `CHECK > 0` | Quantidade de unidades do item. |
| `preco_unitario_vendido` | `NUMERIC(10,2)` | `NOT NULL` | **Snapshot de Preço**: Garante que alterações futuras no cardápio não alterem o histórico de vendas. |

---

## 6. Logística e Gestão de Entregas

### Tabela: `motoboys`
| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `cpf_motoboy` | `VARCHAR(14)` | **PK**, **FK** (`funcionarios.cpf_funcionario`) | Herança de funcionários. `ON DELETE CASCADE`. |
| `placa_veiculo` | `VARCHAR(10)` | `NOT NULL` | Identificação do veículo para rastreio. |
| `tipo_vinculo` | `VARCHAR(20)` | `DEFAULT 'Freelancer'` | `Próprio` ou `Freelancer`. |

---

## 7. Histórico e Rastreabilidade

### Tabela: `historico_status_pedido`
Essencial para cálculos de Lead Time e auditoria.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id_historico` | `SERIAL` | **PK** | Identificador único do log. |
| `id_pedido` | `INT` | **FK** (`pedidos.id_pedido`) | Referência ao pedido auditado. `ON DELETE CASCADE`. |
| `status` | `status_pedido_enum`| `NOT NULL` | Status que o pedido atingiu. |
| `data_hora` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Momento exato da transição. |
| `observacao` | `TEXT` | `NULLABLE` | Motivo de cancelamento ou notas da cozinha. |

---
*Documentação detalhada atualizada em 29 de Abril de 2026.*
