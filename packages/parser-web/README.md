[![npm (tag)](https://img.shields.io/npm/v/@concordialang-healer/parser-web?color=blue&style=flat-square)](https://www.npmjs.com/package/@concordialang-healer/parser-web)

# `@concordialang-healer/parser-web`

> 🔌 _Parser_ para `concordialang-healer`

Fornece _plugin parser_ para utilizar em conjunto com [`concordialang-healer`](https://github.com/concordialang/healer#readme).

## Instalação

Instale pelo `npm`:

```bash
npm install @concordialang-healer/parser-web --save-dev
```

👉 Obs.: Você também pode instalar pelo `yarn`.

## Configuração

Adicione a entrada na configuração do `concordialang-healer` (geralmente `.healerrc.json`):

```json
{
  "parser": {
    "from": "@concordialang-healer/parser-web"
  }
}
```

## Parser

- Utiliza o pacote [jsdom](https://github.com/jsdom/jsdom) para transformar _html_ em DOM para que as heurísticas possam fazer as buscas
- Utiliza o pacote [unique-selector](https://github.com/ericclemmons/unique-selector) para gerar um seletor para um elemento HTML
