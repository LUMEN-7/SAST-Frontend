# Ares — revisão visual

Abra /design com npm run dev. Esta rota pública usa somente exemplos explícitos; os dados e os fluxos autenticados continuam nas rotas existentes.

## Hierarquia
O resultado do scan começa com repositório, branch, commit e data. A distribuição de severidade antecede filtros e tabela. O detalhe mantém código e orientação lado a lado para reduzir a alternância de contexto. Os atalhos J/K percorrem achados; F/R/A alteram a triagem local.

## Telas e estados
- /design: resultado interativo, projetos de exemplo, processamento, scan sem achados, falha de clone, lista vazia, skeleton, falso positivo e corrigido.
- /analysis/:id: resultados reais da API, no mesmo componente de triagem.
- /repositories: projetos reais.
- /rules: catálogo e filtros existentes.
- /login e /register: formulários existentes com o sistema visual e seletor de tema.
- Rotas desconhecidas: página 404 com retorno aos projetos.

## Acabamento
- Tokens exatos de carmim e severidades; crítico distinto do destaque.
- Inter e JetBrains Mono, títulos com peso 600.
- Tema escuro inicial e tema claro explícito, persistidos neste navegador.
- Wordmark tipográfico e favicon.
- Inputs, selects, opções, busca, checkboxes, foco de teclado de 3 px, disabled e hover.
- Barra de rolagem, seleção de texto e atalhos de teclado.
- Estados e mensagens neutros; severidade representada por ponto ou borda fina.
- Código numerado, indicação da linha vulnerável e confirmação acessível de triagem.
- Avatar por iniciais e página 404.
- Botão destrutivo de referência com contorno, sem ação de exclusão.

## Limites de integração
A triagem e as preferências de regras continuam locais, como na implementação anterior. A interface informa isso. Nenhum endpoint de configuração ou persistência foi inventado. O catálogo de regras é de referência e não altera o scanner.

## Verificação
Build Vite e 26 testes existentes passaram. O navegador de revisão não alcançou o servidor local (timeout), portanto a inspeção visual no navegador ficou pendente.
