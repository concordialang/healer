[![npm (tag)](https://img.shields.io/npm/v/concordialang-healer?color=blue&style=flat-square)](https://www.npmjs.com/package/concordialang-healer)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-blueviolet?style=flat-square)](https://lerna.js.org/)

# concordialang-healer

> ✓ Autocura de especificações escritas em [Concordia](https://github.com/thiagodp/concordialang)

## Conteúdo

1. [Visão Geral](#visão-geral)
2. [Plugins](#plugins)
3. [Instalação](#instalação)
4. [Configuração](#configuração)
5. [Executando](#executando)
6. [Banco de dados suportados](#banco-de-dados-suportados)
7. [Plugins padrão](#plugins-padrão)
8. [Criando heurísticas](#criando-heurísticas)
9. [Criando _parser_](#criando-_plugin-parser)

## Visão Geral

Ao usar `concordialang-healer` seus testes em `Concordia` serão capazes de se recuperar ao se deparar com o erros decorridos por seletores defasados.

A ferramenta fornece:

1. um servidor _websocket_ responsável por:

   - se comunicar com o banco de dados e guardar informações dos elementos de IU;

   - receber solitações de cura e fornecer um novo seletor para o elemento defasado atráves de heurísticas pré-definidas.

2. um _plugin_ `Concordia` responsável por:

   - executar _plugin_ `Concordia` para gerar e executar testes com autocura;

   - solicitar permissão ao usuário para adaptação;

   - curar as especificações descritas em `Concordia` (arquivos `.feature`).

O processo de cura acontece através de dois momentos:

1. Quando o elemento é encontrado suas informações são guardadas para posterior consulta

2. Quando o elemento não é encontrado as informações guardadas são utilizadas para curar o elemento

### Elemento encontrado

1. Os dados do elemento são capturados e armazenados para posterior consulta - nome da _feature_, seletor e informações atuais do elemento (como propriedades e posição na IU)

### 2. Elemento não encontrado

1. O erro é capturado e a cura é solicitada através da _feature_, seletor, conteúdo atual da IU (em _string_) e caminho para o teste em execução

2. As informações anteriores do elemento são consultadas

3. O _parser_ é utilizado para transformar a IU de _string_ para um documento que possa ser consulta pelas heurísticas

4. As heurísticas são executadas

5. É calculado o elemento com melhor pontuação, respeitando o [minimumScore](#minimumscore)

6. O _parser_ é utilizado para obter um seletor para o elemento escolhido

7. O novo seletor e injetado no teste e a execução continua - sem precisar parar o teste

8. Após a execução, será solitado a permissão para adaptar a especificação com o novo seletor

## Plugins

Para funcionar, a ferramenta necessidade de 3 tipos de _plugins_:

1. [Gerador de testes com autocura](#gerador-de-testes-com-autocura)
2. [Heurística](#heurística)
3. [Parser](#parser)

### Gerador de testes com autocura

Esse _plugin_ é usado para geração e execução dos testes através do `Concordia` com a opção de autocura. O _plugin_ deve ser capaz de:

- enviar as informações dos elementos de IU durante os testes;

- solicitar cura ao se deparar com um seletor não encontrado (erro de "ElementNotFound");

- injetar o novo seletor fornecido pelo servidor em tempo de execução dos testes.

### Heurística

Esse _plugin_ é responsável por procurar elementos na IU atual que mais se aproximam do elemento anterior - que está com o seletor defasado.

Ex.: Procurar elementos que possuam o `id` _username_ no DOM.

### Parser

Esse _plugin_ é responsável por:

- transformar a IU atual de _string_ para um documento que possa ser consultado pelas heurísticas;\
  Ex.: Transformar HTML _string_ em DOM.
- gerar um seletor para um determinado elemento.\
  Ex.: `#username` para o elemento `<input type="text" name="username" id="username"/>`

## Instalação

> Você precisa ter instalado o [Concordia](https://concordialang.gitbook.io) no seu projeto

Instalando o pacote através do npm:

`npm install concordialang-healer --save-dev`

Além disso, você precisará instalar:

- o _driver_ do banco de dados - [banco de dados suportados](#banco-de-dados-suportados)

- as heurísticas que for utilizar - [instalando heurísticas](#instalando-heurísticas)

- o _parser_ - [instalando _parser_](#instalando-parser)

- o _plugin_ para geração e execução de testes com autocura - [instalando gerador de testes com autocura](#instalando-gerador-de-testes-com-autocura)

👉 Nota.: Você também pode instalar pelo `yarn`

## Configuração

Adicione o `concordialang-healer` como _plugin_ nas configurações do `Concordia` (geralmente `.concordiarc`).

```json
{
  "plugin": "concordialang-healer"
}
```

Inicialize o arquivo de configuração do `concordialang-healer`:

`npx concordia-healer --init`

O arquivo `.healerrc.json` será gerado com as configurações padrões.

### minimumScore

Um limiar minímo para que o elemento seja considerado no processo de cura.

O elemento será rejeitado se obtiver _score_ menor.

**obrigatório**

```json
{
  "minimumScore": 0.5
}
```

### server

As opção para o serviço _websocket_:

- `port`: a porta onde o serviço irá rodar - **obrigatório**
- `host`: _localhost_ por padrão

```json
{
  "server": {
    "port": 3000
  }
}
```

### database

As opções para o serviço de banco de dados:

- `type`: o tipo de banco de dados a ser utilizado - [ver opções](#banco-de-dados-suportados) - **obrigatório**
- `dbName`: o nome do banco de dados - precisa ser criado no seu banco - **obrigatório**
- `host`: _localhost_ por padrão
- `port`: a porta onde está rodando o serviço do banco de dados
- `user`: o usuário do banco de dados
- `password`: a senha para o usuário fornecido

```json
{
  "database": {
    "type": "postgresql",
    "dbName": "concordia_healer",
    "host": "localhost",
    "port": 5432,
    "user": "<user>",
    "password": "<password>"
  }
}
```

### plugin

O _plugin_ para geração de testes através do concordia com opção de cura.

- `from`: a localização do _plugin_ - **obrigatório**
- `options`: paramêtros a serem passados para o _plugin_ - somente se ele tiver essa opção

```json
{
  "plugin": {
    "from": "@concordialang-healer/codeceptjs-playwright/dist",
    "options": {}
  }
}
```

### heuristics

A opção `heuristics` deve ser um _array_ contendo as heurísticas a serem usadas para curar o elemento.

As heurísticas serão executadas na ordem em que aparecem no _array_.

Cada entrada de heurísticas possui:

- `name`: o identificador da heurística - **obrigatório**
- `from`: a localização da heurística - **obrigatório**
- `options`: paramêtros a serem passadas para a heurística - somente se a heurística possuir opções

```json
{
  "heuristics": [
    {
      "name": "by-id",
      "from": "@concordialang-healer/heuristics-web/dist/heuristics",
      "options": {}
    }
  ]
}
```

### parser

Esse opção deve fornecer um _plugin_ que será usado para:

- transformar a IU atual em documento que pode ser analisado pelas heurísticas;
- gerar um seletor para o elemento melhor pontuado pelas heurísticas.

As opções a serem fornecidas são:

- `from`: a localização do _plugin_ - **obrigatório**
- `options`: paramêtros a serem passados para o _plugin_ - somente se ele tiver essa opção

```json
{
  "healer": {
    "from": "@concordialang-healer/heuristics-web/dist/healer",
    "options": {}
  }
}
```

## Executando

Você precisa iniciar o servidor antes de rodar os testes com o `Concordia`.

```bash
npx concordia-healer server
```

O servidor será executado na porta determinada pela sua configuração.

Agora você pode executar os testes com `Concordia` e aproveitar a opção de autocura! 😉

## Exemplo

Que tal testar a ferramenta?

Basta analisar o [projeto de exemplo](https://github.com/concordialang/healer/tree/main/packages/example) para ver a ferramenta em funcionamento. 👍

## Banco de dados suportados

Atualmente a ferrementa suporta os seguintes banco de dados:

- **sqlite**

  `npm install @mikro-orm/sqlite --save-dev`

- **postgresql**

  `npm install @mikro-orm/postgresql --save-dev`

- **mariadb**

  `npm install @mikro-orm/mariadb --save-dev`

- **mysql**

  `npm install @mikro-orm/mysql --save-dev`

## Plugins Padrão

A ferramenta fornece _plugins_ para todos os tipos.

### Instalando gerador de testes com autocura

Ver o pacote [`@concordialang-healer/codeceptjs-playwright`](https://github.com/concordialang/healer/tree/main/packages/codeceptjs-playwright).

```bash
npm install @concordialang-healer/codeceptjs-playwright --save-dev
```

### Instalando heurísticas

Ver o pacote [`@concordialang-healer/heuristics-web`](https://github.com/concordialang/healer/tree/main/packages/heuristics-web).

```bash
npm install `concordialang-healer/heuristics-web --save-dev
```

### Instalando _parser_

Mesmo pacote `@concordialang-healer/heuristics-web` anterior.

## Criando heurísticas

As heurísticas podem ser criada em Javascript ou Typescript (recomendado).

### 1. Crie um pacote

As heurísticas podem ser exportados unicamente ou em conjunto (_array_), o `concordialang-healer` utiliza o nome da heurística para encontrá-la.

### 2. Crie uma função

Deve ser uma função com um parâmetro opcional, podendo receber opções para configuração.

Deve retornar um objeto com as seguintes propriedades:

- `name`: Nome da heurística, será utilizado para identificar a heurística

- `run`: Método responsável por executar a heurística

> Se estiver usando Typescript é recomendado implementar o tipo [Heuristic](https://github.com/concordialang/healer/blob/main/packages/common/src/heuristic.ts).

### 2. Método `run`

Recebe um objeto:

- `element`: o elemento defasado - [UIElement](https://github.com/concordialang/healer/blob/main/packages/common/src/ui-element.ts)

- `source`: o conteúdo atual da IU - já transformado pelo [parser](#parser)

Retorna um objeto ([HeuristicResult](https://github.com/concordialang/healer/blob/main/packages/common/src/heuristic-result.ts)):

- `elements`: os elementos que se enquadram na heurísticas com score - [ScoredElement](https://github.com/concordialang/healer/blob/main/packages/common/src/heuristic-result.ts)
- `weight`: o peso da heurística - `number`

👉 **Nota:** Você também pode retornar um _array_ de `HealingResult`, caso seja necessário definir pesos diferentes

### Exemplo:

Heurística para encontrar elementos pela _tag_ em interfaces HTML.

```ts
import { Heuristic } from '@concordialang-healer/common';

const byTag: Heuristic = () => ({
  name: 'by-tag',
  run: ({ element, source }) => {
    const locator = element.content.tag;
    const foundElements = Array.from(source.querySelectorAll(locator));

    if (!foundElements?.length) {
      return [];
    }

    return {
      weight: 1 / foundElements.length,
      elements: foundElements.map((node) => ({
        node,
        locator,
        score: 1,
      })),
    };
  },
});

export default byTag;
```

## Criando _plugin parser_

O _parser_ pode ser criado em Javascript ou Typescript (recomendado).

### 1. Crie um pacote

O pacote deve exportar a função _parser_.

### 2. Crie uma função

Deve ser uma função com um parâmetro opcional, podendo receber opções para configuração.

Deve retornar um objeto com as seguintes propriedades:

- `transform`: Transforma a interface IU atual de _string_ para um documento que possa ser consultado pelas heurísticas. Ex.: _html_ para DOM

- `toLocator`: Gera seletor para um determinado elemento

> Se estiver usando Typescript é recomendado implementar o tipo [Parser](https://github.com/concordialang/healer/blob/main/packages/common/src/parser.ts).

### Exemplo:

```ts
import { Parser } from '@concordialang-healer/common';
import { JSDOM } from 'jsdom';
import uniqueSelector from 'unique-selector';

const parser: Parser = () => ({
  transform: ({ source }) => ({
    source: new JSDOM(source.trim()).window.document,
  }),
  toLocator: ({ healing }) =>
    uniqueSelector(healing.node, {
      selectorTypes: ['ID', 'Class', 'Attributes', 'Tag', 'NthChild'],
    }),
});

export default parser;
```

## Isso é tudo pessoal!

Caso encontre algum erro durante ou tenha alguma sugestão, publique uma
issue em https://github.com/concordialang/healer/issues.

Obrigado e até mais! 👋
