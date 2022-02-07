[![npm version][npm-image]][npm-url]

# `@concordialang-healer/codeceptjs-playwright`

> 🔌 _Plugin_ Concordia para CodeceptJS com Playwright e autocura para `concordialang-healer`

_Plugin_ [Concordia](https://concordialang.gitbook.io) para execução e geração de testes para [CodeceptJS](https://codecept.io) com [Playwright](https://playwright.dev) e suporte para autocura.

_Plugin_ para utilizar em conjunto com [`concordialang-healer`](https://github.com/concordialang/healer#readme).

## Visão geral

Fornece um _plugin_ para gerar e executar testes em `codeceptjs` com _helper_ para `playwright` através do `Concordia`.

O _helper_ tem suporte para autocura dos testes em conjunto com `concordialang-healer`.

## Instalação

Instale pelo `npm`:

```bash
npm install @concordialang-healer/codeceptjs-playwright --save-dev
```

👉 Obs.: Você também pode instalar pelo `yarn`.

## Configuração

Adicione o _plugin_ no arquivo de configuração do `concordialang-healer` (geralmente `.healerrc.json`):

```json
{
  "plugin": {
    "from": "@concordialang-healer/codeceptjs-playwright"
  }
}
```
