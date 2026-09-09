# finance-api

Backend financeiro em NestJS, TypeScript, PostgreSQL, Prisma e JWT.

## Arquitetura

O projeto segue uma estrutura baseada em DDD e Clean Architecture com separação em:

- domain: entidades, value objects, regras de negócio e contratos de repositórios
- application: casos de uso e portas
- infrastructure: implementações de banco, criptografia e integrações externas
- presentation: controllers, guards, schemas e presenters

## Requisitos

- Node.js 20+
- Docker e Docker Compose
- PostgreSQL

## Variáveis de ambiente

Copie o arquivo .env.example para .env e ajuste os valores.

```bash
cp .env.example .env
```

## Instalação

```bash
npm install
npx prisma generate
```

## Executar com Docker

```bash
docker compose up --build
```

## Executar migrations

```bash
npx prisma migrate dev
```

## Executar seed

```bash
npx prisma db seed
```

## Executar em modo desenvolvimento

```bash
npm run start:dev
```

## Testes

```bash
npm run test
npm run test:e2e
```

## Swagger

A documentação Swagger fica disponível em:

```text
http://localhost:3000/docs
```

## Exemplos de requisições

### Criar usuário

```bash
curl -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Gustavo Lima","email":"gustavo@email.com","password":"senha123"}'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"gustavo@email.com","password":"senha123"}'
```

### Importar registros de um CSV

O arquivo deve possuir as colunas `title` e `amount`. Títulos iguais são agrupados e seus
valores são somados antes da inserção. A rota aceita CSV separado por vírgula ou ponto e
vírgula, com limite de 5 MB.

```bash
curl -X POST http://localhost:3000/financial-entries/upload \
  -H 'Authorization: Bearer SEU_ACCESS_TOKEN' \
  -F 'file=@fatura.csv;type=text/csv' \
  -F 'mesReferencia=2026-07'
```

Exemplo de arquivo:

```csv
title,amount
Pty*Rlx Drogarias,9.99
Pty*Rlx Drogarias,19.98
9 de Julho,21.70
```

### Inserir um registro manualmente

```bash
curl -X POST http://localhost:3000/financial-entries \
  -H 'Authorization: Bearer SEU_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"lugar":"Salário","valor":3500,"tipo":"ENTRADA","mesReferencia":"2026-07"}'
```

O servidor define `origem` como `FILE` no upload e como `MANUAL` na inserção direta. O
campo `inseridoEm` é preenchido automaticamente com a data e hora da criação. O campo
`mesReferencia` representa o mês da conta e não muda conforme a data de importação. No
upload ele pode ser omitido quando o nome do arquivo contém uma data, como
`Nubank_2026-07-28.csv`. O campo `tipo` aceita `ENTRADA` ou `SAIDA`; quando omitido, usa
`SAIDA`. Registros importados por CSV são sempre do tipo `SAIDA`.

### Listar registros financeiros

```bash
curl 'http://localhost:3000/financial-entries?mesReferencia=2026-07&tipo=SAIDA&origem=FILE&pagina=1&limite=20' \
  -H 'Authorization: Bearer SEU_ACCESS_TOKEN'
```

Os filtros `mesReferencia`, `tipo` e `origem` são opcionais. `tipo` aceita `ENTRADA` ou
`SAIDA`, e `origem` aceita `FILE` ou `MANUAL`. A paginação começa em 1, usa 20 registros
por padrão e permite no máximo 100.

### Consultar, editar e excluir um registro

```bash
curl http://localhost:3000/financial-entries/ID_DO_REGISTRO \
  -H 'Authorization: Bearer SEU_ACCESS_TOKEN'

curl -X PATCH http://localhost:3000/financial-entries/ID_DO_REGISTRO \
  -H 'Authorization: Bearer SEU_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"valor":3600,"tipo":"ENTRADA"}'

curl -X DELETE http://localhost:3000/financial-entries/ID_DO_REGISTRO \
  -H 'Authorization: Bearer SEU_ACCESS_TOKEN'
```

A edição aceita `lugar`, `valor`, `tipo` e `mesReferencia`. A origem e o nome do arquivo
são preservados para auditoria. Cada usuário só pode acessar seus próprios registros.

### Resumo financeiro mensal

```bash
curl 'http://localhost:3000/financial-entries/summary?mesReferencia=2026-07' \
  -H 'Authorization: Bearer SEU_ACCESS_TOKEN'
```

A resposta contém `totalEntradas`, `totalSaidas`, `saldo`, `quantidadeEntradas` e
`quantidadeSaidas` para o mês solicitado.
# financas-back
