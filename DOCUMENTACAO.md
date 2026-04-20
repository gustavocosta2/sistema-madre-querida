# 🍕 Documentação Técnica: Madre Querida (v2.0)

Este documento descreve a arquitetura, as regras de negócio e os procedimentos de manutenção do sistema de gestão da **Pizzaria Madre Querida**.

---

## 🏗️ 1. Arquitetura do Sistema

O sistema utiliza uma arquitetura **Client-Server** moderna, separando a interface do usuário da lógica de processamento de dados.

-   **Backend:** API RESTful construída com **FastAPI** (Python 3.10+).
    -   **ORM:** SQLAlchemy para abstração do banco de dados.
    -   **Seguranca:** Autenticação baseada em Hash de senha e tokens estruturados (Simulado/Base).
-   **Frontend:** Aplicação SPA construída com **React 19** e **TypeScript**.
    -   **Build Tool:** Vite (rápido e otimizado).
    -   **Estilização:** Tailwind CSS 4 (focado em performance e utilitários).
    -   **Ícones:** Lucide React.
-   **Banco de Dados:** **PostgreSQL** (Relacional), garantindo integridade via chaves estrangeiras e constraints.

---

## 🗄️ 2. Modelo de Dados

O banco de dados é normalizado e segue o **Modelo Conceitual V2**.

### **Núcleo de Vendas**
*   `pedidos`: Armazena o cabeçalho da venda (cliente, valor total, status atual).
*   `itens_pedido`: Registro individual de cada produto vendido no pedido.
*   `item_pizza_detalhe`: Tabela de extensão para itens do tipo "Pizza" (guarda `id_tamanho` e `id_borda`).
*   `pizza_sabores`: Relaciona quais sabores compõem uma pizza pedida, utilizando o campo `fracao` (ex: 1.0 para inteira, 0.5 para meio a meio).

### **Núcleo de Produtos**
*   `sabores`: Descrição e disponibilidade das pizzas.
*   `precificados`: Tabela de preços que cruza Sabor vs. Tamanho.
*   `bebidas`: Produtos prontos com volume em ML.

---

## ⚙️ 3. Regras de Negócio (Backend)

### **Cálculo de Preço de Pizza**
O sistema implementa a regra do **Maior Preço**:
1.  Busca-se o preço base de cada sabor escolhido para o tamanho selecionado.
2.  O valor base da pizza será o maior valor entre os sabores escolhidos.
3.  Soma-se o valor adicional da borda (se houver).

### **Gestão de Status**
O fluxo de vida de um pedido é linear e auditado pela tabela `historico_status_pedido`:
`Recebido` ➔ `Em Preparo` ➔ `Aguardando Entrega` ➔ `Em Rota` ➔ `Finalizado`.

---

## 💻 4. Organização do Frontend (React)

O frontend foi refatorado para seguir padrões de **limpeza de código (Clean Code)** e **separação de preocupações**.

### **Estrutura de Arquivos (`src/`)**
-   `api.ts`: Único ponto de contato com o Backend. Facilita mudar a URL do servidor ou adicionar headers globais.
-   `types.ts`: Centraliza todas as interfaces do TypeScript. Garante que o "humano" saiba exatamente qual é o formato de um Pedido ou Cliente.
-   `hooks/useMadreData.ts`: Centraliza a lógica de busca de dados (SWR - Stale While Revalidate). Atualiza pedidos ativos e histórico automaticamente a cada 5 segundos.

### **Componentes Principais**
-   `PDV.tsx`: Complexo sistema de busca de clientes em tempo real e montagem de carrinho.
-   `Cozinha.tsx`: Dashboard de produção que filtra apenas pedidos em fila ou no forno.
-   `Entregas.tsx`: Controle de logística, permitindo vincular um motoboy ao pedido.
-   `Historico.tsx`: Relatório de vendas do dia (desde as 00:00h) com cálculo de faturamento total.
-   `modals/`: Subcomponentes para formulários pesados (Cadastro de Cliente, Configuração de Pizza).

---

## 🚀 5. Manutenção e Instalação

### **Requisitos**
-   Python 3.10+
-   Node.js 18+
-   PostgreSQL 14+

### **Passo a Passo: Backend**
1.  Acesse `backend/`.
2.  Crie o venv: `python -m venv venv`.
3.  Ative: `.\venv\Scripts\activate`.
4.  Configure o `.env` com sua `DATABASE_URL`.
5.  Roda: `python main.py`.

### **Passo a Passo: Frontend**
1.  Acesse `frontend/`.
2.  Instale: `npm install`.
3.  Roda: `npm run dev`.
4.  Build: `npm run build` (Gera a pasta `dist/` pronta para o servidor).

---

## 🧪 6. Guia de Verificação (Testes)

Ao realizar manutenções, o desenvolvedor deve garantir que os seguintes fluxos funcionam:

1.  **Venda Meio a Meio:** Verificar se ao selecionar 2 sabores, o backend salva cada um com `fracao: 0.5`.
2.  **Venda de Bebida:** Garantir que bebidas não tentam salvar dados na tabela `item_pizza_detalhe`.
3.  **Fluxo de Status:** O pedido deve sumir da Cozinha ao ser concluído e aparecer instantaneamente na aba de Entregas.
4.  **Histórico:** Pedidos finalizados devem somar no "Total Vendido" da aba Histórico.

---

## 📈 7. Próximos Passos Sugeridos
-   [ ] **Sistema de Fidelidade:** Implementar o ganho de 1 ponto a cada R$ 10,00 gastos.
-   [ ] **Impressão Térmica:** Gerar layout formatado para impressoras de cupom (80mm).
-   [ ] **Dashboard Admin:** Gráfico de pizzas mais vendidas por sabor.

---
*Documentação atualizada em: 20 de Abril de 2026.*
