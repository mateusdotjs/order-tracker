# Decisões arquiteturais

Registro curto do que foi feito neste desafio e por quê — não substitui a documentação do código. Entradas numeradas.

---

## 001 — Testes automatizados

### Contexto

O enunciado não exige suíte de testes. Mesmo assim incluí cobertura na API para regressar regras de negócio e o contrato HTTP (códigos de erro, validação). Em dev a API persiste em H2 em arquivo (`api/data/` — ver **004**); rodar testes contra o mesmo arquivo misturaria dados locais com a suíte e tornaria o resultado imprevisível.

### Decisão

Há testes **unitários** (serviços e helpers de auth com Mockito), testes de **slice web** (`@WebMvcTest`: controllers, JSON de erro, serviços mockados — sem subir JPA nem banco) e um smoke de contexto (`@SpringBootTest` com `contextLoads` apenas). A suíte de testes usa H2 **in-memory** com schema recriado a cada execução, separado do banco de desenvolvimento.

**Não** há testes de integração com persistência real (fluxo HTTP + repositório no disco, `@DataJpaTest`, Testcontainers). Para o escopo do mini rastreador, unitários + WebMvc já cobrem o que importa; integração full-stack seria custo alto para pouco ganho aqui.

Se o produto crescesse ou o enunciado passasse a exigir, eu adicionaria integração com Testcontainers (PostgreSQL) ou `@SpringBootTest` apontando para um banco dedicado de teste.

### Consequências

`./mvnw test` e `./mvnw spring-boot:run` não competem pelo mesmo arquivo H2. CI e máquina local podem rodar testes sem apagar pedidos de dev.

---

## 002 — Concorrência

### Contexto

Dois clientes podem, em tese, atualizar o mesmo pedido ao mesmo tempo. O enunciado não fala em race conditions, versionamento otimista ou múltiplos operadores disputando status.

### Decisão

Não implementei controle de concorrência: sem `@Version`, locks pessimistas ou filas. Cada pedido pertence a um usuário; o fluxo é CRUD simples com PATCH de status livre entre valores do enum (regras de transição — ver **006**).

Isso reflete o escopo do exercício, não uma aposta de que concorrência nunca importa em produção.

### Como faria depois

Com requisitos reais (transições de status, vários operadores), usaria locking otimista na entidade `Order` e responderia conflito com 409, ou regras explícitas de transição no serviço. Em carga maior, serialização por pedido ou processamento assíncrono.

### Consequências

Implementação mais simples e alinhada ao enunciado; última escrita vence se houver requisições simultâneas no mesmo registro.

---

## 003 — JWT em cookie HttpOnly

### Contexto

A API é stateless com JWT (Spring `oauth2-resource-server`, HS256). O front é um SPA que precisa enviar credencial em toda requisição autenticada. Alternativas comuns: guardar o token em `localStorage`/`sessionStorage` e mandar no header `Authorization`, ou devolver o token no JSON do login e gerenciar no JavaScript.

### Decisão

No login a API define o cookie `access_token` **HttpOnly**, **SameSite=Strict**, `Path=/`, e `Secure` configurável (`COOKIE_SECURE`). O corpo do login/registro/logout traz só o usuário `{ id, name, email }`, sem token. O resource server lê o JWT **do cookie** (`CookieBearerTokenResolver`); o header `Authorization` não é usado. O front usa `fetch` com `credentials: "include"`.

### Por quê

Com HttpOnly o JavaScript não lê nem grava o token, o que reduz o impacto de XSS roubar sessão (ainda não elimina XSS para ações na UI, mas evita exfiltração trivial do JWT). O front fica mais simples: não há `localStorage`, refresh manual de header nem risco de vazar token em logs do app. SameSite Strict + API só JSON + CORS com origem fixa (`http://localhost:5173`) cobrem o básico sem refresh token nem CSRF clássico de form HTML — escopo alinhado ao enunciado.

### Consequências

Logout limpa o cookie (204). Em HTTPS de produção convém `COOKIE_SECURE=true`. Não há refresh token: expiração curta (15 min no dev) e novo login. Integração com outro domínio exigiria revisar CORS, cookie e possivelmente outro modelo (BFF ou token em header com storage consciente do risco).

---

## 004 — H2 em arquivo para desenvolvimento

### Contexto

O desafio pede persistência de usuários e pedidos, mas não exige PostgreSQL, Docker ou ambiente externo. Precisava de algo que subisse com `./mvnw spring-boot:run` e mantivesse dados entre reinícios na máquina de quem avalia o projeto.

### Decisão

Usei **H2** já incluído no stack Spring (driver + JPA), em modo **arquivo** (`jdbc:h2:file:./data/orders`), com `ddl-auto=update` e console em `/h2-console` para inspecionar dados no dev. A pasta `api/data/` é local e ignorada pelo Git.

### Por quê

Zero dependência extra para rodar o repo: não precisa instalar banco nem subir container só para ver o fluxo. Arquivo em disco persiste pedidos e usuários entre restarts, o que ajuda a testar manualmente; in-memory puro perderia tudo a cada parada. Para um exercício de porte pequeno, H2 + JPA é suficiente e familiar no ecossistema Spring.

### Consequências

Não é escolha de produção (concorrência real, backup, migrações formais). Em prod usaria PostgreSQL (ou similar) com Flyway/Liquibase e perfis separados. Os testes automatizados **não** usam esse arquivo — ver **001**.

---

## 005 — Validação de formulário no front

### Contexto

Os formulários (login, cadastro, novo pedido) precisam avisar campo inválido. O HTML tem validação nativa (`required`, `type`, `min`, `pattern`): o navegador barra o submit e mostra o balão próprio, em geral no primeiro campo inválido. Outra opção seria um schema no cliente (Zod) espelhando Bean Validation antes do request.

### Decisão

A regra fica na API (Bean Validation nos DTOs). O front envia o formulário com `noValidate` e **não** usa atributos que disparam o balão nativo. A resposta 400 traz códigos por campo (`FieldErrorCode`); a UI traduz e mostra a mensagem embaixo do campo correspondente. Ao editar um campo, só o erro daquele campo some.

`maxLength` nos inputs só limita a digitação ao tamanho do `@Size` da API. Não é a mensagem de erro.

### Por quê

O balão do navegador quebra o visual da tela e para no primeiro problema, então o usuário não vê todos os campos de uma vez. Mensagem própria, no estilo do restante da UI, lista cada campo inválido no mesmo submit.

Zod no front daria feedback antes da rede, mas repetiria as mesmas regras já nos DTOs e nos códigos de erro. Para este exercício, uma fonte só — a API — basta e evita duas validações para manter alinhadas.

### Consequências

Campo vazio ou e-mail inválido só aparece depois da resposta da API. Se o produto pedisse feedback instantâneo, um schema no cliente alinhado aos DTOs faria sentido; hoje isso ficaria de fora de propósito.

---

## 006 — Transição de status do pedido

### Contexto

O rastreador expõe `OrderStatus` (RECEBIDO, EM_PREPARO, SAIU_PARA_ENTREGA, ENTREGUE, CANCELADO) e permite alterar o status via PATCH. Em um fluxo real de delivery, nem toda mudança faz sentido (por exemplo, reabrir pedido já entregue ou cancelado).

### Decisão

Não há máquina de estados nem validação de transição: qualquer valor do enum aceito no PATCH substitui o status atual, desde que o pedido exista e pertença ao usuário autenticado.

### Por quê

O enunciado não exige regras de negócio sobre o ciclo do pedido. Manter o PATCH “livre” reduz código na API, testes e UI (sem matriz de transições, sem desabilitar opções no select por estado atual) e deixa o foco do exercício em auth, persistência e contrato HTTP.

### Como faria depois

No mínimo, tratar **CANCELADO** e **ENTREGUE** como estados terminais: recusar novo PATCH com 409 (ou 422) e um `ErrorCode` dedicado. Opcionalmente, grafo explícito de transições permitidas (ex.: RECEBIDO → EM_PREPARO ou CANCELADO, nunca ENTREGUE direto de RECEBIDO). O front espelharia isso desabilitando ou ocultando opções inválidas no detalhe do pedido.

### Consequências

É possível, hoje, “desfazer” cancelamento ou entrega só trocando o status na interface — comportamento irrealista, mas aceitável no escopo do mini rastreador. Evolução natural combina esta decisão com locking otimista (**002**) se vários operadores passarem a disputar o mesmo pedido.
