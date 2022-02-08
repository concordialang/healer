# `@concordialang-healer/example`

Este projeto fornece um exemplo de uso da ferramenta [`concordialang-healer`](https://github.com/concordialang/healer#readme).

O projeto contém uma aplicação com um login em _html_ e uma _feature_ login com os testes gerados pelo `Concordia`.

A ferramenta `concordialang-healer` foi configurada da seguinte forma:

| Opção                                     | Definição                                              |
| ----------------------------------------- | ------------------------------------------------------ |
| minimumScore                              | 0.5                                                    |
| _plugin_ - gerador de testes com autocura | pacote `@concordialang-healer/heuristics-web`          |
| heuristics                                | todas do pacote `@concordialang-healer/heuristics-web` |
| parser                                    | pacote `@concordialang-healer/heuristics-web`          |
| database                                  | sqlite                                                 |
| server                                    | porta 5000                                             |

Veja o arquivo `.healerrc.json` para mais detalhes.

Vamos iniciar os passos para verificar a ferramenta em ação:

### 1. Instale as dependências

```bash
npm install
```

### 2. Inicie a aplicação

```bash
npm run serve
```

Irá iniciar a aplicação em http://localhost:1234/login.html.

Para fazer login você pode usar as credenciais fornecidas em `./src/accounts.json`.

### 3. Execute o servidor do `concordialang-healer`

```bash
concordia-healer server
```

Irá iniciar servidor na porta `5000`.

Se estiver ocupada, basta trocar a porta no arquivo de configuração.

### 4. Execute os testes com o Concordia

```bash
npx concordia --seed="example" --no-test-case --no-script

ou

npm run concordia:run
```

Os testes devem ser executados com sucesso.

Nesse momento todos os elementos envolvidos nos testes serão salvos no banco de dados.

### 5. Injetar modificação

Agora vamos injetar uma moficação na página de login.

Na feature `login.feature` o seletor para o campo de entrada do nome de usuário é `username`.

```feature
- locator is "username"
```

Isso quer dizer que, nos testes, esse campo será selecionado através da propriedade `name` igual a `username`.

Vamos trocar essa propriedade para `user` no _html_.

Abra o arquivo `./src/login.html` e altere a linha **29** para:

`<input type="text" class="form-control" id="username" name="user" placeholder="Enter username" required>`

Veremos como os testes se comportam a partir de agora.

### 6. Execute os testes novamente

Repita o [passo 4](#execute-os-testes-com-o-concordia).

Você verá que os testes irão executar normalmente.

É o processo de autocura em ação! 😉

### 7. Aceite a adaptação

No final da execução dos testes você será questionado se a _feature_ pode ser adaptada com o novo seletor para o campo de entrada do nome do usuário.

Aceite e veja que o seletor será alterado em `login.feature`:

```feature
- locator is "#username"
```

Caso não aceite, a feature não será adaptada mas seus testes continuarão rodando normalmente, pois o processo de cura se dá em tempo de execução dos testes.

## Isso é tudo pessoal!

Parabéns! você concluiu os passos para ver a ferramenta `concordialang-healer` em ação. 👏

Agora você pode injetar novas mudanças na aplicação e analisar se os testes serão capazes de se recuperar.

Lembrando que você pode [criar suas próprias heurísticas](#criando-heurísticas) no caso das heurísticas fornecidas por padrão não te atenderem.

Caso encontre algum erro durante a execução ou tenha alguma sugestão, publique uma
issue em https://github.com/concordialang/healer/issues.

Obrigado e até mais! 👋
