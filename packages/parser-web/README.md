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
    "from": "@concordialang-healer/parser-web",
    "options": {
      "locator": { ... }
    }
  }
}
```

Você pode passar opções para gerar o seletor:

| Opção                | Tipo                                                              | _Default_                                        | Descrição                                                                                                            |
| -------------------- | ----------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `selectorTypes`      | _array_ de "ID" \| "Class" \| "Tag" \| "NthChild" \| "Attributes" | ["ID", "Attributes", "Class", "Tag", "NthChild"] | Tipos de seletores que serão usados para gerar o seletor exclusivo. **Obs.:** A preferência segue a ordem no _array_ |
| `attributesToIgnore` | _array_ de string                                                 | [ "length", "min", "max" ]                       | Atributos que serão ignorados quando o tipo "Attributes" for passado                                                 |
| `exclude`            | _array_ de regex                                                  | none                                             | Classes a serem ignoradas                                                                                            |

Exemplo:

```json
{
  "parser": {
    "from": "@concordialang-healer/parser-web",
    "options": {
      "locator": {
        "selectorTypes": ["ID", "Class", "Attributes"], // Usa id, class e demais atributos para gerar o seletor, nessa ordem
        "attributesToIgnore": ["type"], // Ignora o atributo type
        "exclude": ["btn*"] // Ignora classes contendo btn. Ex.: .btn e .btn-primary
      }
    }
  }
}
```

## Parser

- Utiliza o pacote [jsdom](https://github.com/jsdom/jsdom) para transformar _html_ em DOM para que as heurísticas possam fazer as buscas
- Utiliza o pacote [unique-selector](https://github.com/ericclemmons/unique-selector) para gerar um seletor para um elemento HTML
