[![npm version][npm-image]][npm-url]

# `@concordialang-healer/heuristics-web`

> 🔌 Heurísticas e _parser_ para `concordialang-healer`

Fornece _plugins_ de heurísticas e parser para utilizar em conjunto com [`concordialang-healer`](https://github.com/concordialang/healer#readme).

Os _plugins_ são para interface HTML.

## Instalação

Instale pelo `npm`:

```bash
npm install @concordialang-healer/heuristics-web --save-dev
```

👉 Obs.: Você também pode instalar pelo `yarn`.

## Configuração

Adicione as entradas no arquivo de configuração do `concordialang-healer` (geralmente `.healerrc.json`):

```json
{
  "heuristics": [
    {
      "name": "by-id",
      "from": "@concordialang-healer/heuristics-web/heuristics"
    },
    {
      "name": "by-classes",
      "from": "@concordialang-healer/heuristics-web/heuristics"
    },
    {
      "name": "by-attributes",
      "from": "@concordialang-healer/heuristics-web/heuristics"
    },
    {
      "name": "by-tag",
      "from": "@concordialang-healer/heuristics-web/heuristics"
    },
    {
      "name": "by-xpath",
      "from": "@concordialang-healer/heuristics-web/heuristics"
    },
    {
      "name": "by-text",
      "from": "@concordialang-healer/heuristics-web/heuristics"
    }
  ],
  "parser": {
    "from": "@concordialang-healer/heuristics-web/parser"
  }
}
```

## Heurísticas

| Nome            | Descrição                                               |
| --------------- | ------------------------------------------------------- |
| `by-id`         | Busca pela propriedade `id`                             |
| `by-classes`    | Busca por cada uma das propriedades `class` do elemento |
| `by-attributes` | Busca pelos demais atributos além de `id` e `class`     |
| `by-tag`        | Busca pela `tag`                                        |
| `by-xpath`      | Busca pelo `xpath` (localização)                        |
| `by-text`       | Busca conteúdo textual (`innerText`)                    |

Os pesos distrbuidos pelas heurísticas aos elementos são calculados com a base na quantidade de elementos encontrados:

```math
1 / quantidade_de_elementos_encontrados
```

### Exemplo

Supondo que estamos procurando o elemento `username` na interface abaixo

```html
<body>
  <h1>Exemplo</h1>
  <form>
    <input name="username" id="username" />
    <input name="password" id="password" />
    <button>ok</button>
  </form>
</body>
```

#### Heurística `by-tag`

- Procura pelos elementos com a tag `input` na interface

```js
querySelectorAll('input');
```

- Dois elementos serão encontrados
- Atribui peso `0.5` para cada um deles

## Parser

- Utiliza o pacote [jsdom](https://github.com/jsdom/jsdom) para transformar _html_ em DOM para que as heurísticas possam fazer as buscas.
- Utiliza o pacote [unique-selector](https://github.com/ericclemmons/unique-selector) para gerar um seletor para um elemento HTML.
