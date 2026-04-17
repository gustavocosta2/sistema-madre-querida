# Documentação do Modelo Conceitual: Pizzaria Madre Querida (V2.1 - Refined)

## 1. Visão Geral
Este documento detalha a modelagem conceitual da base de dados da pizzaria **Madre Querida**. A arquitetura foi projetada para suportar uma operação em expansão geográfica, focando na integridade transacional e financeira, mantendo um diagrama visual limpo e eficiente.

---

## 2. Entidades e Atributos

### 2.1 Núcleo Transacional e Rastreabilidade
* **Pedido**: Entidade que centraliza a venda.
    * `ID_Pedido` (PK)
    * `Data_Hora_Criacao`: Registro de entrada do pedido.
    * `Status`: Estado atual (Enum: Recebido, Preparo, Rota, Finalizado, etc).
    * `Valor_Total`: Soma dos itens e taxa de entrega.
    * `Valor_Recebido` / `Troco`: Controle de caixa.
    * `Origem`: Canal de venda (WhatsApp, Balcão, iFood).
* **Historico_Status**: Entidade que registra o "ciclo de vida" do pedido.
    * `ID_Historico` (PK)
    * `Status`: O estado para o qual o pedido mudou.
    * `Data_Hora`: Carimbo de tempo preciso da mudança.
    * `Observacao`: Motivo de cancelamentos ou atrasos.

### 2.2 Gestão de Pessoas
* **Pessoa (Generalização)**: Base para Clientes e Funcionários.
    * `CPF` (PK), `Nome`, `Criado_em`.
    * **`Endereços` (Atributo Multivalorado)**: Representa os múltiplos locais de entrega que uma pessoa pode possuir.
* **Cliente / Funcionario / Motoboy (Especializações)**:
    * `Cliente`: `Saldo_Pontos`.
    * `Funcionario`: `Cargo`, `Salario`, `Ativo`.
    * `Motoboy`: `Placa_Veiculo`, `Tipo_Vinculo` (Próprio/Freelancer).

### 2.3 Catálogo e Itens
* **Produto (Generalização)**: Base para `Bebida` e `Pizza`.
* **Item_Pedido**: Registro histórico da venda.
    * `Quantidade`, **`Preço_Vendido`** (Preço histórico), `Observação`, `Subtotal`.
* **Sabor / Tamanho / Borda**: Componentes de customização da pizza.
* **Precificado (Relacionamento com Atributo)**: Matriz que define o preço base cruzando Sabor + Tamanho.

---

## 3. Relacionamentos e Integridade

| Relacionamento | Entidades Relacionadas | Cardinalidade | Descrição |
| :--- | :--- | :--- | :--- |
| **Registra** | Pedido : Historico_Status | 1 : N | Entidade Fraca: Armazena o "filme" das mudanças de estado do pedido. |
| **Realiza** | Cliente : Pedido | 1 : N | Um cliente pode realizar vários pedidos. |
| **Contém** | Pedido : Item_Pedido | 1 : N | O pedido é composto por um ou mais itens com preços históricos. |
| **Referencia** | Item_Pedido : Produto | N : 1 | Cada item aponta para um produto do catálogo. |
| **Entrega** | Motoboy : Pedido | 1 : N | Um motoboy pode ser responsável por várias entregas. |
| **Possui** | Pizza : Sabor | N : M | Permite a composição de pizzas fracionadas (1/2, 1/3, etc). |
| **Define** | Sabor : Tamanho | N : M | Através da entidade `Precificado`, define o valor base da pizza. |

---

## 4. Regras de Negócio de Nível Sênior (Implementadas)

1.  **Imutabilidade Financeira**: O `Preço_Vendido` é persistido no momento da criação do item. Se o preço do cardápio mudar amanhã, o faturamento de hoje permanece correto.
2.  **Auditoria Operacional**: O `Historico_Status` permite calcular gargalos (ex: tempo médio na cozinha vs tempo médio na rua).
3.  **Integridade de Dados (PostgreSQL)**: Uso de `ENUMs` para status e `CHECK CONSTRAINTS` para garantir que valores financeiros e quantidades nunca sejam negativos.
4.  **Precisão Monetária**: Uso obrigatório de tipos `NUMERIC` para evitar erros de arredondamento.
5.  **Histórico de Endereços**: Embora visualmente simplificado como atributo, o sistema suporta múltiplos endereços por pessoa para viabilizar o delivery.

---

## 5. Arquitetura Tecnológica
*   **Banco de Dados**: PostgreSQL 15 (Dockerizado).
*   **Tipagem**: Timestamps com Timezone (TIMESTAMPTZ) para consistência global.
