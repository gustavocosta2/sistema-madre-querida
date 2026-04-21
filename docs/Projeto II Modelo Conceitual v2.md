# Documentação do Modelo Conceitual: Pizzaria Madre Querida

## 1. Visão Geral
Este documento detalha a modelagem conceitual da base de dados da pizzaria Madre Querida. A arquitetura foi projetada para suportar uma operação em expansão geográfica (São João del Rei - MG), focando na eliminação de processos manuais e na garantia da integridade transacional.

![Diagrama Conceitual Pizzaria](diagrama-conceitual-pizzaria-v2.png)

---

## 2. Entidades e Atributos

### 2.1 Núcleo Transacional e Rastreabilidade
* **Pedido**: Entidade que centraliza a venda.
    * `ID_Pedido` (PK)
    * `Data_Hora_Criacao`: Registro de entrada do pedido.
    * `Status`: Estado atual (Enum: Recebido, Preparo, Rota, Finalizado, etc).
    * `Valor_Total`: Soma dos itens e taxa de entrega.
    * `Valor_Recebido`: Valor dado pelo cliente.
    * `Troco`: Troco em reais fornecido ao cliente caso seja necessário.
    * `Origem`: Canal de venda (WhatsApp, Balcão, iFood).

* **Historico_Status**: Entidade **fraca** que registra o "ciclo de vida" do pedido.
    * `Status`: O estado para o qual o pedido mudou.
    * `Data_Hora_Mudanca`: Carimbo de tempo preciso da mudança.
    * `Observacao`: Motivo de cancelamentos ou atrasos.

### 2.2 Gestão de Pessoas
* **Pessoa (Generalização)**: Base para Clientes e Funcionários.
    * `CPF`: (PK), 
    * `Nome`: Nome da pessoa,
    * `Endereços`: (Atributo Multivalorado) Representa os múltiplos locais de entrega que uma pessoa pode possuir.
    * `Telefone`: (Atributo Multivalorado) Representa os múltiplos telefones que uma pessoa pode ter.

* **Cliente / Funcionario / Motoboy (Especializações)**:
    * `Cliente`: 
        * `Saldo_Pontos`: Quantidade de pontos que um cliente tem (programa de fidelidade).
    * `Funcionario`: 
        * `Cargo`: Cargo que um cliente ocupa na unidade de negócio. 
        * `Salario`: Salário que um funcionário possui na unidade de negócio. 
        * `Ativo`: Se o funcionário está ativo ou não.
    
    * `Motoboy`: 
        * `Placa_Veiculo`: Placa do veículo. 
        * `Tipo_Vinculo`: Se o motoboy é um funcionário fichado ou freelancer.

### 2.3 Catálogo e Itens
* **Produto (Generalização)**: Base para `Bebida` e `Pizza`.

    * `Bebida`: refere-se a especialização de produtos que diz respeito as bebidas vendidas na pizzaria.
        * `Quantidade`: Quantidade de unidades da bebida em estoque.
        * `Preço`: Preço da unidade da bebida em reais. 
    
    * `Pizza`: Contém a lógica de montagem.

* **Item_Pedido**: Registro histórico da venda.
    * `Quantidade`: Volume de unidades do produto ou pizza adicionadas ao pedido.
    * `Preço_Vendido`: O valor final da unidade registrado no momento da transação, incluindo o preço base e eventuais adicionais de borda ou descontos. 
    * `Observação`: Detalhamento de instruções customizadas pelo cliente para aquele item específico (ex: "sem cebola", "massa bem assada").

* **Sabor**:  Entidade que define o recheio (ex: Calabresa, Marguerita)
    * `ID_Sabor`: (PK), identificador único de sabor.
    * `Descricao`: Contém os ingredientes inclusos no sabor.
    * `Disponível`: Diz se o sabor está ou não disponível para venda.

* **Tamanho:** Define as dimensões de uma Pizza
    * `ID_Tamanho`: (PK) Identificador único de tamanho.
    * `Qtd_Sabor_Max`: Qual é a quantidade máxima de sabores permitidos por tamanho de pizza (ex: Pizza G só pode dois sabores)
    * `Nome_Tamanho`: Nome do tamanho da pizza (ex: Broto, Média, Grande) / Borda**: Componentes de customização da pizza.

* **Precificado (Relacionamento com Atributo)**:Liga Sabor + Tamanho para definir o Preço base da combinação.
    * `Preco`: Preço de uma pizza baseando em seu tamanho e sabor.

* **Borda**: Entidade que representa a borda de uma pizza.
    * `ID_Borda`: (PK) Identificador único de borda.
    * `Tipo`: Borda de chocolate, catupiry, chedddar, etc.
    * `Preco_Adicional`: Preço referente à inclusão da borda em uma pizza.

* **Promoção**: Entidade que refere-se a promoções existentes no cardápio de Produtos.
    * `ID_Promo`: (PK) Identificador único da promoção.
    * `Nome`: Nome da promoção (ex: Sexta-Feira da Pizza Maluca)
    * `Status`: Se a promoção está ativa ou não.
    * `Valor_Desconto`: Valor ao ser descontado caso os produtos escolhidos pelo cliente correspondam à combinação de produtos da promoção.


### 2.4 Pagamento

* **Pagamento**: Entidade que refere-se ao pagamento realizado em um pedido.
    * `ID_Transação`: (PK) Identificador único de uma transação.
    * `Forma_Pagamento`: Método de pagamento realizado por um cliente. (ex: crédito, débito, pix, dinheiro)
    * `Valor_Pago`: Valor pago referente a aquela transação com um uma forma de pagamento em específico.
---

## 3. Relacionamentos

| Relacionamento | Entidades Relacionadas | Cardinalidade | Descrição |
| :--- | :--- | :--- | :--- |
| **Entrega** | Motoboy : Pedido | 1 : N | Um motoboy pode ser responsável por várias entregas. |
| **Realiza** | Cliente : Pedido | 1 : N | Um cliente pode realizar vários pedidos. |
| **Recebe** | Pedido : Pagamento | 1 : N | Um pedido pode ser pago com uma ou mais formas de pagamento. |
| **Registra** | Pedido : Historico_Status | 1 : N | Entidade Fraca: Armazena o "filme" das mudanças de estado do pedido. |
| **Possui** | Pizza : Sabor | N : M | Permite a composição de pizzas fracionadas (1/2, 1/3, etc). |
| **Tem** | Pizza : Borda | N : 1 | Cada pizza possui exatamente um tipo de borda, enquanto um mesmo tipo de borda (ex: Catupiry) pode ser associado a múltiplas pizzas.|
| **Inclui** | Pizza : Tamanho | 1 : N | Cada pizza contém um tamanho, enquanto um mesmo tipo de tamanho pode ser associado a múltiplas pizzas. |
| **Valida_Produto** | Promoção : Produto | N : M | Define quais produtos (ex: Coca-Cola + Pizza) devem estar no carrinho para ativar um combo. |
| **Valida_Sabor** | Promoção : Sabor | N : M | Restringe a promoção a sabores específicos (ex: "Terça da Mussarela" só vale para o sabor Mussarela). |
| **Valida_Tamanho** | Promoção : Tamanho | N : M | Determina quais tamanhos participam da oferta (ex: "Promoção de Inauguração" válida apenas para pizzas Gigantes). |

### 3.1. Atributos de Relacionamentos

* **Entrega**
    * `Taxa_Entrega`: Valor financeiro cobrado pelo deslocamento do motoboy para aquele pedido específico.
    * `Quilometragem`: Distância percorrida para a realização da entrega, utilizada para controle logístico e cálculo de produtividade.

* **Possui**
    * `Fracao`: Define a proporção que o sabor ocupa na composição da pizza (ex: 0.5 para pizzas "meio a meio").

---

## 4. Regras de Negócio

1.  **Imutabilidade Financeira**: O `Preço_Vendido` é persistido no momento da criação do item. Se o preço do cardápio mudar amanhã, o faturamento de hoje permanece correto.
2.  **Auditoria Operacional**: O `Historico_Status` permite calcular gargalos (ex: tempo médio na cozinha vs tempo médio na rua).
3.  **Integridade de Dados (PostgreSQL)**: Uso de `ENUMs` para status e `CHECK CONSTRAINTS` para garantir que valores financeiros e quantidades nunca sejam negativos.
4.  **Precisão Monetária**: Uso obrigatório de tipos `NUMERIC` para evitar erros de arredondamento.
5.  **Histórico de Endereços**: Embora visualmente simplificado como atributo, o sistema suporta múltiplos endereços por pessoa para viabilizar o delivery.

---

