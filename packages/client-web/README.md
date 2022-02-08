[![npm (tag)](https://img.shields.io/npm/v/@concordialang-healer/client-web?color=blue&style=flat-square)](https://www.npmjs.com/package/@concordialang-healer/client-web)

# `@concordialang-healer/client-web`

> Pacote para comunicação com o servidor do [`concordialang-healer`](https://github.com/concordialang/healer#readme).

A utilização é feita por _plugins_ de geraçao de testes para `Concordia` com opção de autocura.

## Instalação

> Instale se você estiver criando um _plugin_

Instale pelo `npm`:

```bash
npm install @concordialang-healer/client-web
```

👉 Obs.: Você também pode instalar pelo `yarn`

## Uso

```ts
import clientWeb from '@concordialang-healer/client-web';
```

A _lib_ fornece dois métodos:

1. [saveElement](#salvar-elemento)
2. [healElement](#solicitar-cura)

## Salvar elemento

Método responsável por enviar um elemento de IU para o servidor `concordialang-healer` salvar.

Recebe um objeto com os seguintes paramêtros:

| Paramêtro | tipo     | Descrição                                                 |
| --------- | -------- | --------------------------------------------------------- |
| _data_    | `any`    | Informações do elemento como propriedades e posição na IU |
| _feature_ | `string` | Nome da funcionalidade em que o elemento está contido     |
| _locator_ | `string` | Seletor usado para encontrar o elemento na IU             |

```ts
clientWeb.saveElement(
  {
    data: {
      ...
    },
    feature: "<feature>",
    locator: "<locator>",
  },
);
```

## Solicitar cura

Método responsável por solicitar a cura de um seletor defasado ao servidor `concordialang-healer`.

Recebe um objeto com os seguintes paramêtros:

| Paramêtro  | tipo     | Descrição                                   |
| ---------- | -------- | ------------------------------------------- |
| _body_     | `string` | Conteúdo da IU atual. Ex.: _html_ do _body_ |
| _feature_  | `string` | Nome da funcionalidade                      |
| _locator_  | `string` | Seletor que está defasado                   |
| _testPath_ | `string` | O caminho para o arquivo de teste           |

```ts
clientWeb.healElement(
  {
    body: "<body>"
    feature: "<feature>",
    locator: "<locator>",
    testPath: "<testPath>",
  },
);
```
