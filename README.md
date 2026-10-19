# Mini Rastreador de Pedidos

Monorepo com API REST (`api/`) e interface web (`frontend/`).

## Decisões de arquitetura

O que foi feito e por quê (testes, concorrência, JWT em cookie HttpOnly, H2, etc.) está em **[DECISIONS.md](DECISIONS.md)**.

## Início rápido

Suba a API antes do front.

**API**

```bash
cd api
./mvnw spring-boot:run
```

**Front-end**

```bash
cd frontend
npm install
npm run dev
```

- API: `http://localhost:8080`
- Front: `http://localhost:5173`

## Configuração opcional

**Back-end** — copie `api/.env.example` para `api/.env` se quiser sobrescrever o padrão de dev:

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `JWT_SECRET` | Segredo HS256 (mín. 32 caracteres) | valor de dev em `application.properties` |
| `COOKIE_SECURE` | Cookie `access_token` com flag Secure | `false` |

- Banco H2 em arquivo: pasta `api/data/` (criada automaticamente; ignorada pelo Git)
- Console H2 (dev): `http://localhost:8080/h2-console` — JDBC URL `jdbc:h2:file:./data/orders`, usuário `sa`, senha vazia

**Front-end** — arquivo `frontend/.env` (opcional):

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_API_URL` | Base da API | `http://localhost:8080` |

Autenticação usa cookie HttpOnly (`credentials: "include"` no front). A API aceita CORS apenas de `http://localhost:5173`. Motivação: [DECISIONS.md](DECISIONS.md) (003 e 004).

## Pré-requisitos

| Ferramenta | Versão |
|------------|--------|
| JDK | 25 |
| Node.js | compatível com Vite 8 (LTS recente) |
| npm | incluso com o Node |

## Estrutura do projeto

```
order-tracker/
├── api/                          # Spring Boot 4, Java 25
│   ├── src/main/java/com/example/api/
│   │   ├── ApiApplication.java
│   │   ├── auth/                 # login, registro, JWT, cookie
│   │   ├── users/                # entidade e repositório de usuário
│   │   ├── orders/               # pedidos (CRUD parcial + status)
│   │   │   ├── dto/
│   │   │   └── exceptions/
│   │   ├── config/               # Security, JWT
│   │   └── common/               # códigos de erro, handler global
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── .env.example
│   └── pom.xml
│
└── frontend/                     # Vite + React + TypeScript
    ├── src/
    │   ├── api/                  # client fetch, auth, orders
    │   ├── context/              # AuthContext
    │   ├── hooks/                # TanStack Query (pedidos)
    │   ├── pages/                # rotas (login, lista, detalhe, novo pedido)
    │   ├── components/
    │   │   ├── auth/
    │   │   └── orders/
    │   ├── constants/            # mensagens de erro (pt-BR)
    │   ├── types/
    │   └── lib/
    ├── public/
    └── package.json
```

### Módulos da API (package by feature)

| Pasta | Responsabilidade |
|-------|------------------|
| `auth/` | `POST /auth/register`, `/login`, `/logout`; `GET /auth/me` |
| `orders/` | `POST/GET /orders`, `GET /orders/{id}`, `PATCH /orders/{id}/status` |
| `users/` | Persistência de usuário (uso interno dos serviços) |
| `config/` | CORS, JWT, filtro de segurança |
| `common/` | `ErrorCode`, `FieldErrorCode`, `GlobalExceptionHandler` |

### Front-end por área

| Pasta | Responsabilidade |
|-------|------------------|
| `pages/` | Telas e composição de rotas |
| `components/auth/` | Formulários, rotas protegidas / convidado |
| `components/orders/` | Lista, card, formulário de pedido, status |
| `api/client.ts` | `fetch` com cookies e tratamento de `ApiError` |
| `constants/errorMessages.ts` | Tradução dos códigos retornados pela API |

## Build e testes (opcional)

```bash
cd api && ./mvnw -q package -DskipTests
cd frontend && npm run build
```

Testes da API:

```bash
cd api && ./mvnw test
```

Artefato do front: `frontend/dist/`.
