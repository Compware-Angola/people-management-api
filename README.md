# Guia de Migrations e Configuração de Ambiente

## Configuração do ambiente

Antes de executar o projeto ou criar migrations, é necessário criar o arquivo de variáveis de ambiente correspondente ao ambiente de execução.

O sistema carrega automaticamente o arquivo de ambiente de acordo com o valor definido no `NODE_ENV`.

Arquivos suportados:

| Ambiente    | Arquivo        |
| ----------- | -------------- |
| development | `.env.dev`     |
| staging     | `.env.staging` |
| test        | `.env.test`    |
| production  | `.env.prod`    |

Para desenvolvimento local, crie o arquivo:

```bash
.env.dev
```

---

# Criando uma migration

Para criar uma migration manualmente, execute o seguinte comando:

```bash
MIGRATION_NAME=nome-da-migration npm run migration:create
```

### Exemplo:

```bash
MIGRATION_NAME=teste-schema npm run migration:create
```

Este comando irá gerar um arquivo de migration dentro da pasta configurada de migrations.

A migration criada terá a seguinte estrutura:

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class TesteSchema1784199827034 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
```

O método `up` deve conter as alterações que serão aplicadas no banco de dados.

O método `down` deve conter a reversão das alterações realizadas pelo método `up`.

---

# Gerando migrations automaticamente

Também é possível gerar migrations automaticamente utilizando as entidades mapeadas no TypeORM.

O TypeORM irá analisar todas as entidades configuradas e gerar a migration com base nas diferenças encontradas entre as entidades e o banco de dados atual.

Execute:

```bash
MIGRATION_NAME=teste-schema npm run migration:generate
```

Exemplo:

```bash
MIGRATION_NAME=teste-schema npm run migration:generate
```

Esse processo gera automaticamente os comandos necessários para sincronizar a estrutura do banco de dados com as entidades TypeORM.
