# `@concordialang-healer/client-web`

Esta _lib_ é usada para se comunicar com o servidor do [`concordialang-healer`](https://github.com/concordialang/healer#readme).

A utilização é feita por _plugins_ de geraçao de testes para `Concordia` com opção de autocura.

# Uso

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
| data      | `any`    | Informações do elemento como propriedades e posição na IU |
| feature   | `string` | Nome da funcionalidade em que o elemento está contido     |
| locator   | `string` | Seletor usado para encontrar o elemento na IU             |

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

| Paramêtro | tipo     | Descrição                                   |
| --------- | -------- | ------------------------------------------- |
| body      | `string` | Conteúdo da IU atual. Ex.: _html_ do _body_ |
| feature   | `string` | Nome da funcionalidade                      |
| locator   | `string` | Seletor que está defasado                   |
| testPath  | `string` | O caminho para o arquivo de teste           |

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
