# Project Manager API

API REST para gerenciamento de projetos, desenvolvida para o desafio técnico.  
A solução cobre criação, listagem, busca, edição, remoção e ordenação de projetos, com persistência em PostgreSQL e arquitetura organizada para facilitar manutenção, testes e evolução.

## 1. Visão geral

A aplicação foi construída com foco em separar responsabilidade de requests HTTP, regras de negócio e persistência.  
Na prática, isso significa que o `controller` recebe e valida a requisição, o `service` coordena o caso de uso e a entidade de domínio concentra as regras de negócio.

Essa organização foi escolhida para reduzir acoplamento e tornar o código mais fácil de testar e evoluir. A estrutura prioriza legibilidade e delimitação explícita entre camadas.

## 2. Stack

- **Node.js + TypeScript**
- **NestJS**
- **TypeORM**
- **PostgreSQL**
- **Jest + Supertest**
- **Docker Compose**

A escolha do NestJS foi motivada pela organização, injeção de dependência e camadas bem definidas. O TypeORM foi usado pelo type-safety e gerenciamento fácil de migrations.

## 3. Decisões técnicas

A solução foi estruturada em três camadas principais: `application`, `domain` e `infrastructure`. Essa divisão foi adotada para manter as regras de negócio independentes de detalhes de framework e banco de dados.

- A camada `application` concentra as requests HTTP. Ela contém controllers, DTOs e mappers. A decisão de usar DTOs explícitos e mappers foi importante para não expor a entidade de domínio diretamente na resposta da API.

- A camada `domain` contém a entidade `Project`, o `service` e o contrato abstrato de repositório. A entidade foi mantida com comportamento próprio, como favoritar, desfavoritar, aplicar atualizações e validar as datas. Essa escolha evita espalhar regras em vários pontos da aplicação e garante consistência dos dados em qualquer fluxo que chame a entidade de domínio.

- O `repository` foi implementado em duas camadas. No domínio, existe o contrato abstrato `ProjectRepository` que define quais operações estão disponíveis. Na infraestrutura, a classe `ProjectTypeormRepository` implementa esse contrato e orquestra a conversão entre a entidade de domínio (`Project`) e a entidade de persistência (`ProjectEntity`). Essa separação garante que o serviço de aplicação e a entidade de negócio nunca dependem dos detalhes técnicos de TypeORM, respeitando o princípio de inversão de dependência. Se no futuro precisar trocar o ORM ou o banco, apenas a implementação do repositório muda, sem impacto no domínio.

A API foi protegida com um `ApiKeyGuard` simples, validando o header `x-api-key`. Para o escopo do desafio, essa opção foi suficiente e mais objetiva do que implementar uma autenticação completa, que adicionaria complexidade sem trazer ganho proporcional ao problema proposto.

Nos testes, houve uma separação entre unitários e integração.

- Os testes unitários validam o `ProjectService` e as regras de domínio com mocks do repositório.

- Já os testes de integração tem o fluxo real entre `controller`, `guard`, `service`, `repository` e banco. A decisão de não mockar `service` ou `repository` nesses testes foi proposital, já que nos testes de integração, o objetivo é validar o comportamento entre componentes reais, e não apenas o comportamento isolado de uma classe.

Para evitar impacto no ambiente de desenvolvimento, os testes de integração rodam com um PostgreSQL separado, levantado por um `docker-compose` específico para teste. O ambiente é inicializado por `setup.ts` e encerrado por `teardown.ts`, isolando e dando mais previsibilidade nos ambientes locais ou no CI.

## 4. Estrutura do projeto

```text
project-manager-api/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── application/
│   │   └── projects/
│   │       ├── project.module.ts
│   │       ├── controllers/
│   │       │   ├── project.controller.ts
│   │       │   └── test/
│   │       │       └── project.controller.int-spec.ts
│   │       ├── dtos/
│   │       │   ├── create-project.dto.ts
│   │       │   ├── update-project.dto.ts
│   │       │   ├── list-project.dto.ts
│   │       │   ├── project-response.dto.ts
│   │       │   └── list-project-response.dto.ts
│   │       └── mappers/
│   │           └── project.mapper.ts
│   ├── domain/
│   │   └── projects/
│   │       ├── entities/
│   │       │   └── project.entity.ts
│   │       ├── repositories/
│   │       │   └── project.repository.ts
│   │       └── services/
│   │           ├── project.service.ts
│   │           └── test/
│   │               └── project.service.spec.ts
│   └── infrastructure/
│       ├── infrastructure.module.ts
│       ├── configuration/
│       │   └── configuration.module.ts
│       ├── database/
│       │   ├── data-source.ts
│       │   ├── database.module.ts
│       │   └── typeorm/
│       │       ├── entities/
│       │       │   └── project.entity.ts
│       │       ├── migrations/
│       │       │   └── 1775874354343-create-projects.ts
│       │       └── repositories/
│       │           └── project.repository.ts
│       ├── guards/
│       │   └── api-key.guard.ts
│       ├── health/
│       │   ├── health.controller.ts
│       │   └── health.module.ts
│       └── logging/
│           ├── logging.interceptor.ts
│           └── logging.module.ts
├── test/
│   ├── app.e2e-spec.ts
│   ├── env.setup.ts
│   ├── jest-e2e.json
│   ├── jest-int.json
│   ├── setup.ts
│   └── teardown.ts
├── docker-compose.yaml
├── docker-compose.test.yaml
├── .env
├── .env.test
└── package.json
```

Essa estrutura foi pensada para deixar explícita a separação entre domínio, aplicação e infraestrutura, além de manter os testes próximos das implementações.

## 5. API

Os principais endpoints expostos pela aplicação são:

- `POST /projects`
- `GET /projects`
- `GET /projects/:id`
- `PATCH /projects/:id`
- `DELETE /projects/:id`

A listagem suporta filtros e ordenação por query params. Entre os parâmetros aceitos estão `search`, `favoritesOnly` e `sort`, além de paginação quando aplicável.

## 6. Execução local

Faça a remoção do sufixo `.example` do arquivo `.env.example` e configure as variáveis de ambiente conforme necessário. Depois execute os seguintes comandos para rodar a aplicação localmente:

```bash
npm install
docker compose up -d
npm run migration:run
npm run start:dev
```

---

## 7. Testes

Os testes foram divididos em duas categorias:

### Unitários

Focados no serviço de domínio e nas regras de negócio.

```bash
npm test
npm run test
```

### Integração

Executam a API com banco rodando num Docker Compose isolado.

```bash
npm run test:int
```

Essa separação evita que testes de integração dependam de mocks e garante validação do fluxo completo da aplicação.

---

## 8. Cobertura do escopo da API

A API cobre os itens centrais esperados no desafio:

- Listagem inicial
- Total de projetos
- Filtro por favoritos
- Ordenação por critérios definidos
- Criação
- Edição
- Remoção
- Favoritar e desfavoritar
- Busca com mínimo de 3 caracteres

## 8. Observabilidade

A aplicação tem uma estratégia simples e útil de observabilidade, sem ampliar desnecessariamente o escopo do desafio. A decisão foi implementar logs em JSON, identificação por `requestId` e registro de informações como: tempo de resposta, método, rota e status.

A escolha por uma solução leve foi para manter a simplicidade. Para o contexto deste projeto, o objetivo principal é permitir rastreabilidade e depuração eficiente em ambiente local e em CI, sem introduzir complexidade adicional com ferramentas de tracing ou métricas.

O `requestId` permite correlacionar logs da mesma requisição ao longo do fluxo da aplicação. O interceptor de logging registra o início e o término das requisições, além de capturar erros com contexto suficiente para um entendimento rápido.
