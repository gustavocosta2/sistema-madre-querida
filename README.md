# Documentação Técnica: Madre Querida

Este documento descreve a arquitetura, as regras de negócio e os procedimentos de manutenção do sistema de gestão da Pizzaria Madre Querida.

---

## 1. Arquitetura do Sistema

O sistema utiliza uma arquitetura Client-Server moderna, separando a interface do usuário da lógica de processamento de dados.

-   **Backend:** API RESTful construída com FastAPI (Python 3.10+).
    -   **ORM:** SQLAlchemy para abstração do banco de dados.
    -   **Segurança:** Autenticação baseada em Hash de senha (BCrypt) e tokens estruturados.
-   **Frontend:** Aplicação SPA construída com React 19 e TypeScript.
    -   **Build Tool:** Vite 8.
    -   **Estilização:** Tailwind CSS 4.
-   **Banco de Dados:** PostgreSQL (Relacional).

---

## 2. Modelo de Dados (Expandido)

O banco de dados é dividido em módulos lógicos para facilitar a manutenção.

### Fidelidade e CRM
-   **Pessoas:** Tabela centralizadora de dados (CPF, Nome) para clientes e funcionários.
-   **Endereços e Telefones:** Suporte a múltiplos contatos e endereços por pessoa, com sinalização de endereço principal.
-   **Clientes:** Saldo acumulado (R$ 1,00 gasto = 1 ponto ganho). Itens possuem `preco_pontos` para resgate.

### Logística e Operacional
-   **Funcionários e Motoboys:** Gestão de equipe e entregadores (Placa, Vínculo).
-   **Pedidos:** Controle de status (`Recebido`, `Em Preparo`, `Pronto`, `Despachado`, `Entregue`, `Cancelado`).
-   **Itens de Pedido:** Estrutura complexa para pizzas, permitindo múltiplos sabores (frações), tamanhos e bordas.

### Precificação e Promoções
-   `precificado`: Matriz de preços cruzando `id_sabor` x `id_tamanho`.
-   `promocoes`: Sistema de descontos aplicáveis a produtos, sabores ou tamanhos específicos.

---

## 3. Regras de Negócio Avançadas

### Fluxo de Pedido e Entrega
1.  **Origem:** Pedidos podem ser `Balcão` ou `Delivery`.
2.  **Logística:** Pedidos de Delivery exigem um `id_motoboy` para serem despachados. O sistema registra a taxa de entrega e quilometragem.
3.  **Status:** A transição de status é registrada em `historico_status_pedido` para fins de auditoria e tempos de preparo.

### Sistema de Fidelidade (Ganho e Resgate)
1.  **Ganho de Pontos:** A cada R$ 1,00 efetivamente pago no pedido, o cliente recebe 1 ponto em seu saldo.
2.  **Resgate de Produtos:** Itens resgatados entram no pedido com `preco = 0.00` e o custo em pontos é debitado do saldo do cliente.

### Precificação por Tamanho
Ao montar uma pizza de múltiplos sabores, o sistema aplica o **Maior Preço** entre os sabores selecionados, somando o adicional da borda escolhida.

---

## 4. Interface e Módulos Operacionais

O frontend é dividido em visões especializadas:

-   **PDV (Ponto de Venda):** Registro rápido de pedidos, busca de clientes por CPF/Nome e gestão de carrinho.
-   **Cozinha:** Dashboard para visualização de pedidos pendentes e atualização de status para preparo.
-   **Entregas:** Gestão de despacho para motoboys e controle de pedidos em rota.
-   **Gestão (Admin):**
    -   **Dashboard:** Métricas de vendas e performance.
    -   **Cardápio:** Controle total sobre sabores, bebidas, preços e visibilidade.
    -   **Promoções:** Criação e ativação de regras de desconto.

---

## 5. Manutenção e Instalação

### Configuração de Ambiente
-   **Backend:** Instalar dependências via `pip install -r requirements.txt`. Configurar `.env` com a URL do PostgreSQL.
-   **Frontend:** Executar `npm install` e `npm run dev`.

### Scripts de Banco de Dados
A pasta `database/` contém scripts essenciais:
-   `schema.sql`: Estrutura completa.
-   `seed.sql`: Dados iniciais de tamanhos e bordas.
-   `fix_precos.sql`: Ajustes finos na matriz de precificação.

---

## 6. Guia de Verificação (Testes)

1.  **Fluxo de Delivery:** Crie um pedido para um cliente existente, selecione um endereço e despache-o selecionando um motoboy disponível.
2.  **Venda com Resgate:** Adicione uma pizza paga e uma bebida via resgate. Verifique se o total reflete apenas a pizza.
3.  **Cozinha:** Verifique se o pedido aparece instantaneamente na tela da cozinha após ser finalizado no PDV.

---
*Documentação atualizada em: 29 de Abril de 2026*
