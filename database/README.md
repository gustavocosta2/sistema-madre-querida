# 🗄️ Documentação Técnica: Banco de Dados Pizzaria Madre Querida

Este diretório contém a implementação física do banco de dados baseada no **Modelo Conceitual V2**. O SGBD escolhido foi o **PostgreSQL** devido ao seu suporte robusto a integridade referencial, tipos complexos e performance em consultas relacionais.

## 🏛️ Arquitetura de Tabelas

A modelagem segue as melhores práticas de normalização e atende aos requisitos específicos do negócio:

### 1. Herança de Dados (Pessoas e Produtos)
Utilizamos a estratégia **Table-per-Type (TPT)**. 
- A tabela `pessoas` armazena dados comuns (CPF, Nome). Tabelas como `clientes`, `funcionarios` e `motoboys` possuem uma Chave Estrangeira que também é a Chave Primária, apontando para `pessoas`. Isso garante integridade e evita redundância.
- O mesmo se aplica a `produtos`, que é a base para `bebidas` e `pizzas`.

### 2. Motor de Precificação Dinâmica (Entidade `precificado`)
Conforme o modelo conceitual, o preço da pizza não é fixo no sabor. A tabela `precificado` cruza `id_sabor` e `id_tamanho`.
- **Lógica:** Para calcular o valor base de uma pizza, o sistema busca o registro correspondente ao tamanho escolhido e aos sabores selecionados.
- **Regra de Negócio (Multi-Sabor):** O script está preparado para suportar a regra de cobrar pelo sabor mais caro, consultando os valores nesta tabela.

### 3. Customização de Pizzas (`itens_pedido_pizzas`)
Como uma pizza pode ter vários sabores e uma borda específica, criamos uma estrutura que vincula:
- O item do pedido à tabela `pizzas`.
- A pizza à sua `borda` (com `preco_adicional`).
- A pizza aos seus múltiplos `sabores` através de uma tabela associativa, respeitando a `fracao` (ex: 0.5 para meio a meio).

### 4. Motor de Promoções
As tabelas `promocoes` e suas validações (`promocao_tamanhos`, `promocao_sabores`, `promocao_produtos`) permitem configurar regras como:
- "Desconto de R$ 10,00 para Pizzas Grandes (Tamanho) de Calabresa (Sabor)".
- "Combo com Preço Fixo para Pizza Média + Coca-Cola (Produto)".

## 🚀 Como Executar
1. Instale o **PostgreSQL** (v14 ou superior recomendada).
2. Crie um banco de dados chamado `pizzaria_db`.
3. Execute o script `schema.sql` contido nesta pasta para criar todas as tabelas e relacionamentos.

---
*Nota: Este esquema respeita integralmente o Modelo Conceitual V2 produzido.*
