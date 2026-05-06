# Documentação Técnica: Madre Querida (Production-Ready)

Este documento descreve a arquitetura, as regras de negócio e os procedimentos de manutenção do sistema de gestão da Pizzaria Madre Querida. O sistema foi projetado para ser modular, escalável e seguro, atendendo às necessidades de uma operação profissional de gastronomia artesanal.

---

## 1. Arquitetura do Sistema

O sistema utiliza uma arquitetura Client-Server modularizada, otimizada para desenvolvimento e implantação via containers.

-   **Backend:** API RESTful modular construída com **FastAPI (Python 3.11+)**.
    -   **Estrutura:** Decomposição em `APIRouters` especializados (Auth, Pedidos, Financeiro, RH, etc).
    -   **ORM:** SQLAlchemy 2.0 (Estilo Declarativo Moderno).
    -   **Segurança:** Autenticação via **JWT (JSON Web Tokens)** com RBAC (*Role-Based Access Control*) diferenciando Administradores de Funcionários.
-   **Frontend:** Aplicação SPA construída com **React 19** e **TypeScript**.
    -   **Gerenciamento de Estado:** React Context API (MadreContext) para dados globais.
    -   **Modularidade:** Decomposição em subcomponentes atômicos para facilidade de manutenção.
    -   **UI/UX:** Estilização com **Tailwind CSS 4** focada em ergonomia visual, clareza e agilidade operacional.
-   **Infraestrutura:** Totalmente conteinerizado com **Docker** e **Docker Compose**, garantindo paridade entre ambientes de desenvolvimento e produção.

---

## 2. Funcionalidades Principais

### Inteligência de CRM & Fidelidade
-   **Perfil do Cliente:** Histórico de preferências e observações personalizadas (ex: "Massa bem assada", "Sem cebola").
-   **Alerta de Aniversariante:** Identificação visual automática no PDV para clientes que fazem aniversário no mês.
-   **Gamificação:** Sistema de pontos acumulativos (R$ 10,00 = 1 ponto) com catálogo de resgate direto no carrinho.

### Gestão Operacional & Logística
-   **PDV Avançado:** Busca ultra-rápida de clientes, gestão de múltiplos endereços e cálculo automático de troco.
-   **Cozinha Inteligente:** Dashboard de produção com visualização de comandas, ingredientes e alertas de tempo de espera.
-   **Logística de Entregas:** Controle de despacho por motoboy e acompanhamento de pedidos em rota.
-   **Impressão Térmica:** Sistema *Print Ready* que gera cupons de produção e entrega formatados para impressoras de 80mm.

### Controle Financeiro & RH
-   **Gestão de Equipe (RH):** Cadastro completo de colaboradores, cargos, salários e controle de status (Ativo/Inativo).
-   **Fechamento de Caixa:** Controle rigoroso de abertura, movimentações manuais (Sangria/Suprimento) e conferência de valores.
-   **Acerto de Motoboys:** Relatório automático de entregas e taxas devidas por entregador ao final do turno.

---

## 3. Segurança e Acesso

O sistema implementa camadas de proteção padrão de mercado:
-   **Autenticação JWT:** Tokens expiram em 8 horas, exigindo novo login.
-   **Interceptadores de API:** O frontend gerencia automaticamente a injeção de tokens e o redirecionamento em caso de expiração.
-   **RBAC (Níveis de Acesso):**
    -   **Administrador:** Acesso total (Financeiro, RH, Configuração de Preços, BI).
    -   **Funcionário:** Acesso operacional (PDV, Cozinha, Entregas, Histórico).

---

## 4. Instalação e Execução (Simplificada)

A forma recomendada de rodar o sistema é através do **Docker**. 

### Pré-requisitos
-   **Docker** e **Docker Compose** instalados.

### Passo a Passo
1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/sistema-gestao-madre-querida.git
    cd sistema-gestao-madre-querida
    ```

2.  **Suba o sistema:**
    ```bash
    docker-compose up --build
    ```

3.  **Acesse o sistema:**
    -   **Frontend:** [http://localhost:5173](http://localhost:5173)
    -   **Backend (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

4.  **Acessos Padrão (Seed):**
    -   **Admin:** usuário `admin` / senha `admin123`
    -   **Equipe:** usuário `equipe` / senha `equipe123`

---

## 5. Estrutura do Projeto

```text
/
├── backend/            # API FastAPI (Modularizada em /routers)
├── frontend/           # Interface React + TypeScript
├── database/           # Scripts SQL de Schema e Dados Iniciais
├── docker-compose.yml  # Orquestração do ambiente
└── README.md           # Este guia
```

---
*Documentação atualizada em: 05 de Maio de 2026*
