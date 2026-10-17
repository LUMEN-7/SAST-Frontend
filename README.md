# Ares — Lumen Security

Frontend da ferramenta de análise estática de código da Lumen Security. Reúne resultados de scans, repositórios, alertas e triagem de vulnerabilidades em uma interface em português do Brasil, com temas escuro e claro e layouts para desktop, tablet e celular.

Este repositório contém a aplicação React. O backend é um serviço separado, acessado por HTTP.

## Índice

- [Início rápido](#início-rápido)
- [Tecnologias](#tecnologias)
- [Configuração do ambiente](#configuração-do-ambiente)
- [Autenticação e conta](#autenticação-e-conta)
- [Funcionalidades e rotas](#funcionalidades-e-rotas)
- [Scan local](#scan-local)
- [API e integração com GitHub](#api-e-integração-com-github)
- [Persistência e privacidade](#persistência-e-privacidade)
- [Sistema visual e responsividade](#sistema-visual-e-responsividade)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Comandos e testes](#comandos-e-testes)
- [Build e publicação](#build-e-publicação)
- [Solução de problemas](#solução-de-problemas)
- [Limites atuais](#limites-atuais)

## Início rápido

Requisitos: Node.js compatível com Vite 6, npm e um navegador moderno. Como referência para o ambiente de desenvolvimento, use Node.js 22. Para os fluxos autenticados, configure um projeto Firebase; para os dados remotos, disponibilize o backend.

Execute os comandos na raiz deste repositório:

~~~bash
npm ci
~~~

Crie o arquivo de configuração:

~~~powershell
Copy-Item .env.example .env.local
~~~

Em macOS ou Linux:

~~~bash
cp .env.example .env.local
~~~

Preencha as variáveis do Firebase e inicie:

~~~bash
npm run dev
~~~

A aplicação usa a porta 5173 por padrão:

- Aplicação: [localhost:5173](http://localhost:5173).
- Login: [localhost:5173/login](http://localhost:5173/login).
- Revisão visual pública: [localhost:5173/design](http://localhost:5173/design).

O Vite pode escolher outra porta se 5173 estiver ocupada; confira o endereço exibido no terminal.

A rota de revisão permite inspecionar o resultado de um scan com exemplos identificados, sem autenticação. As demais telas de trabalho exigem sessão Firebase.

## Tecnologias

| Tecnologia | Uso |
| --- | --- |
| React 18 | Interface e estado dos componentes |
| Vite 6 | Desenvolvimento, proxy e build |
| React Router 7 | Rotas e navegação |
| Firebase Authentication 13 | Sessão, provedores e gerenciamento de conta |
| Recharts 2 | Gráficos do dashboard |
| Lucide React | Ícones de interface |
| Web Workers | Processamento do scan local |
| CSS | Tokens, componentes, temas e layouts responsivos |
| Node.js Test Runner | Testes dos serviços e fluxos de autenticação |

As versões exatas instaladas ficam em package-lock.json. Use npm ci para reproduzir esse conjunto de dependências.

## Configuração do ambiente

Use .env.example como referência. Não versione .env.local.

| Variável | Finalidade |
| --- | --- |
| VITE_API_BASE_URL | Origem da API; vazia usa caminhos relativos |
| VITE_FIREBASE_API_KEY | API key do aplicativo Web Firebase |
| VITE_FIREBASE_AUTH_DOMAIN | Domínio de autenticação Firebase |
| VITE_FIREBASE_PROJECT_ID | Identificador do projeto Firebase |
| VITE_FIREBASE_APP_ID | Identificador do aplicativo Web Firebase |
| SAST_API_PROXY | Destino do proxy de desenvolvimento; variável do processo Vite |

Exemplo de .env.local:

~~~dotenv
VITE_API_BASE_URL=
VITE_FIREBASE_API_KEY=preencha_com_a_configuracao_web
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_APP_ID=preencha_com_o_app_id
~~~

Variáveis com prefixo VITE_ são incorporadas ao frontend e ficam visíveis no navegador. Não coloque client secrets, chaves privadas ou credenciais administrativas nelas. A configuração Web do Firebase não substitui autorização no backend.

### Proxy de desenvolvimento

Com VITE_API_BASE_URL vazia, o Vite encaminha /api e /health para http://localhost:8000.

Para usar outro destino no PowerShell:

~~~powershell
$env:SAST_API_PROXY = "https://api.exemplo.com"
npm run dev
~~~

Em macOS ou Linux:

~~~bash
SAST_API_PROXY=https://api.exemplo.com npm run dev
~~~

SAST_API_PROXY é lida de process.env em vite.config.js. Defina-a no shell que inicia o Vite.

### API em produção

Configure a origem pública, sem /api/v1 ao final:

~~~dotenv
VITE_API_BASE_URL=https://api.exemplo.com
~~~

O cliente acrescenta o caminho dos endpoints. O backend deve permitir a origem do frontend via CORS, incluindo o cabeçalho Authorization e os demais cabeçalhos enviados pelo cliente. Outra opção é publicar frontend e API na mesma origem com reverse proxy.

O proxy de desenvolvimento do Vite não faz parte do build de produção. Após alterar variáveis VITE_, reinicie o servidor de desenvolvimento ou gere e publique um novo build.

## Autenticação e conta

O aplicativo usa Firebase Authentication com:

- E-mail e senha.
- Google.
- GitHub.
- Recuperação/configuração de senha por e-mail.
- Verificação de e-mail.
- Vinculação de provedores à mesma identidade.

### Configurar o Firebase

1. Crie um projeto no Firebase Console e registre um aplicativo Web.
2. Preencha as quatro variáveis VITE_FIREBASE_* com a configuração desse aplicativo.
3. Ative os provedores E-mail/senha, Google e GitHub em Authentication.
4. Configure o e-mail de suporte exigido pelo provedor Google.
5. Para GitHub, registre um OAuth App e use a URL de callback exibida pelo Firebase. Informe Client ID e Client Secret no console Firebase; o secret não pertence a este repositório.
6. Autorize localhost e o domínio de produção nas configurações de Authentication.
7. Configure a política de senha e os modelos de e-mail conforme o ambiente.

Sem a configuração completa, a autenticação fica indisponível e a interface informa o problema. Não é necessário Firestore para os fluxos de autenticação implementados.

### Vinculação de provedores

Configure o projeto Firebase para uma conta por endereço de e-mail.

Quando um provedor retorna auth/account-exists-with-different-credential, a interface solicita a confirmação pelo método existente e vincula a credencial ao mesmo UID. A credencial pendente fica somente em memória; cancelar ou recarregar descarta a tentativa.

O fluxo não depende de enumerar os métodos de acesso de um e-mail. Contas já existentes com UIDs diferentes não são mescladas automaticamente; a migração exige tratamento dos dados no backend.

### Perfil

Em /account, o usuário pode:

- Alterar o nome de exibição.
- Consultar o e-mail e sua verificação.
- Vincular Google ou GitHub.
- Solicitar um link para configurar ou alterar uma senha.
- Encerrar a sessão.

“Senha não definida” descreve o método de autenticação disponível. O endereço de e-mail continua fazendo parte da identidade de quem entrou por um provedor social.

O acesso a Minha conta fica no perfil da sidebar. No celular, abra o menu de navegação.

### Autorização da API

O cliente aguarda a inicialização da sessão e obtém o ID token Firebase para enviar:

~~~http
Authorization: Bearer <firebase-id-token>
~~~

O backend deve validar o token e autorizar cada recurso pelo UID. A proteção de rotas do React controla a navegação, mas não protege os dados do servidor por si só.

## Funcionalidades e rotas

| Rota | Acesso | Conteúdo |
| --- | --- | --- |
| / | Autenticado | Dashboard agregado e análises recentes |
| /dashboard | Autenticado | Redirecionamento para / |
| /local-analyses | Autenticado | Scan local no navegador |
| /repositories | Autenticado | Repositórios e acesso à integração GitHub |
| /repositories/:id | Autenticado | Resumo, achados e histórico do repositório |
| /analyses | Autenticado | Histórico baseado nos registros deste navegador |
| /analysis/:id | Autenticado | Status, resultados, security gate e relatório |
| /alerts | Autenticado | Achados altos e críticos dos repositórios |
| /rules | Autenticado | Catálogo de referência e preferências locais |
| /onboarding | Autenticado | Nome de exibição e configuração opcional de grupo no primeiro acesso |
| /groups | Autenticado | Grupos, repositórios, membros e painel do gerente; seção Equipe |
| /account | Autenticado | Perfil e métodos de acesso |
| /login | Público | Entrada |
| /register | Público | Cadastro |
| /forgot-password | Público | Recuperação de senha |
| /design | Público | Revisão visual com exemplos identificados |
| Demais caminhos | Público | Página 404 |

O nome visível é Scan local; a URL /local-analyses foi mantida.

### Resultado e triagem

A tela de resultado consulta o processamento a cada 3,5 segundos enquanto acompanha o scan. Apresenta severidades, filtros por texto/status/severidade, ordenação, seleção de achados e detalhe com risco, CWE, código fornecido pela API e orientação de correção.

A triagem permite marcar um achado como aberto, corrigido, falso positivo ou risco aceito, inclusive em lote. Essas alterações são persistidas no navegador e não sincronizadas com o backend.

Atalhos disponíveis fora de campos de edição:

| Tecla | Ação |
| --- | --- |
| J / K | Navegar pelos achados filtrados |
| F | Marcar como falso positivo |
| R | Marcar como corrigido |
| A | Aceitar risco |

O relatório Markdown é obtido da API. A ausência de um trecho de código ou de campos opcionais do resultado não é substituída por dados fictícios.

### Página de revisão

/design reúne resultados interativos, projetos de exemplo e estados de processamento, erro, carregamento e listas vazias. A página está disponível também no build de produção; não contém dados reais do usuário nos exemplos.

As rotas operacionais usam a API ou o histórico local. A página de revisão é a exceção explícita para demonstração visual.

## Scan local

O scan local processa arquivos em um Web Worker, sem executar o código selecionado.

| Limite | Valor |
| --- | --- |
| Arquivos por execução | 50 |
| Tamanho por arquivo | 2 MiB |
| Tamanho total | 10 MiB |
| Achados por arquivo | 500, com indicação de truncamento |
| Arquivos compactados | Não suportados |
| Exportação | JSON por ação do usuário |

A implementação usa múltiplos de 1024 bytes; a interface apresenta esses limites como MB.

Extensões aceitas: js, jsx, ts, tsx, mjs, cjs, py, php, java, go, rb, cs, sql, html, htm, json, yaml, yml, toml, ini, env, txt e sh, além do arquivo .env.

As seis categorias verificadas são:

- Execução dinâmica de código.
- Inserção de HTML potencialmente insegura.
- Execução de comandos do sistema.
- Possíveis chaves privadas.
- Possíveis segredos definidos no código.
- Validação TLS desativada.

Os padrões podem gerar falsos positivos e deixar vulnerabilidades passar. O scanner local não usa IA, não faz análise semântica completa e não substitui um mecanismo SAST completo.

Os resultados não incluem os valores dos segredos nem trechos do código. Arquivos, nomes e resultados não são enviados pelo fluxo local à API ou ao Firebase e não entram no dashboard ou histórico. A sessão do aplicativo continua usando Firebase.

## API e integração com GitHub

O contrato consumido pelo frontend está centralizado em src/api.js.

| Método | Endpoint | Uso no cliente |
| --- | --- | --- |
| GET | /api/v1/dashboard/summary | Resumo; aceita days e repository_id |
| GET | /api/v1/repos | Lista de repositórios |
| GET | /api/v1/repos/:id/findings | Achados de um repositório |
| GET | /api/v1/analysis/:id/status | Estado de processamento |
| GET | /api/v1/analysis/:id/result | Resultado do scan |
| GET | /api/v1/analysis/:id/gate | Security gate; parâmetro threshold |
| GET | /api/v1/analysis/:id/report | Relatório textual/Markdown |
| GET | /api/v1/auth/me | Identidade da integração backend |
| GET | /api/v1/auth/github | Entrada na autorização GitHub do backend |

O cliente também mantém POST /api/v1/analysis para envio de ZIP, POST /api/v1/auth/anonymous e PATCH /api/v1/analysis/:id/resolvido. São recursos de suporte existentes no código; não representam novos fluxos expostos pela navegação atual.

O componente ZipUpload e o método api.submit existem, mas não estão montados nas telas atuais. O scan local não usa esse endpoint.

### GitHub: identidade e repositórios

Entrar com GitHub no Firebase e conceder acesso a repositórios no backend são integrações distintas. Vincular o provedor social não configura workflows, não importa resultados de CI e não concede automaticamente acesso aos repositórios.

O botão Entrar com GitHub da área de repositórios aponta para /api/v1/auth/github. O componente de conexão ainda consulta um token legado para decidir quando buscar /auth/me; a harmonização com a sessão Firebase depende de alinhamento com o contrato do backend.

A API deve fornecer os dados e as permissões necessários à integração. Este repositório não configura GitHub Actions nem inicia scans por URL.

### Estados vazios e falhas

As telas de trabalho não usam dados fictícios como fallback. Respostas 404 nas coleções de repositórios e no resumo são tratadas pelos serviços como ausência de dados. Falhas de autenticação, conexão e demais erros continuam sendo exibidos.

## Persistência e privacidade

| Dado | Armazenamento/comportamento |
| --- | --- |
| Sessão Firebase | Gerenciada pelo SDK |
| Histórico recente | localStorage, até 24 registros |
| Triagem dos achados | localStorage, por ID de análise |
| Preferências de regras | localStorage |
| Tema | localStorage |
| Credencial de vinculação pendente | Memória |
| Arquivos e resultados do scan local | Memória da página |
| Relatórios baixados | Arquivo criado por solicitação do usuário |

O histórico de /analyses não é uma listagem completa de jobs do backend e pode divergir entre navegadores. Seus registros preservam os dados salvos localmente; o detalhe por ID consulta a API.

Ao sair, o aplicativo encerra a sessão Firebase, limpa localStorage, sessionStorage e Cache Storage da origem e abre /login em um novo documento. Isso também remove tema, preferências e triagem locais.

A saída não desvincula provedores e não encerra as sessões nos sites Google ou GitHub. Não apaga o cache HTTP global do navegador.

## Sistema visual e responsividade

A identidade usa wordmark tipográfico, fontes Inter e JetBrains Mono, bordas sutis e raio pequeno.

| Token escuro | Valor |
| --- | --- |
| Fundo | #0E1013 |
| Superfície | #15181C |
| Superfície elevada | #1C2026 |
| Borda | #2A2F36 |
| Texto | #ECEDEF |
| Texto secundário | #9AA1AB |
| Destaque | #B23A48 |
| Hover do destaque | #C64A58 |
| Destaque pressionado | #962F3B |
| Fundo sutil do destaque | rgba(178, 58, 72, 0.14) |
| Texto sobre o destaque | #FFFFFF |
| Link/destaque textual | #E8707D |

Severidades: crítico #FF5A4F, alto #F0734A, médio #E2C14B e baixo #6E8BB5. Status de execução usam cores semânticas próprias, compartilhadas com a legenda.

O tema escuro é o padrão inicial. O switch de sol/lua altera e persiste a preferência. O tema claro tem valores próprios de fundo e texto para contraste.

Os ajustes responsivos incluem:

- Menu recolhível e perfil acessível em telas menores.
- Painéis e formulários empilhados.
- Controles maiores para toque.
- Achados apresentados como registros rotulados no celular.
- Rolagem horizontal contida em tabelas densas e blocos de código.
- Modais limitados à altura disponível.
- Foco de teclado visível e animações que respeitam prefers-reduced-motion.

O destaque da navegação desliza entre os itens selecionados. Escape fecha o menu móvel.

As fontes são carregadas pelo Google Fonts via CSS; fontes do sistema funcionam como fallback.

## Estrutura do projeto

~~~text
.
├── public/
│   └── favicon.svg
├── src/
│   ├── auth/                 # Contexto, sessão, erros e vinculação de conta
│   ├── components/
│   │   ├── analysis/         # Tabela, legenda, detalhe e agrupamentos
│   │   ├── dashboard/        # Métricas, gráficos e modal
│   │   ├── layout/           # Shell, navegação, marca e tema
│   │   ├── repositories/     # Conexão GitHub
│   │   ├── ui/               # Estados, severidade e ícones compartilhados
│   │   └── upload/           # Componente ZIP de suporte
│   ├── pages/                # Telas e revisão visual
│   ├── services/             # API de domínio, scanner e testes
│   ├── utils/                # Datas, severidades e status
│   ├── api.js                # Cliente HTTP e histórico recente
│   ├── firebase.js           # Inicialização Firebase
│   ├── App.jsx               # Rotas
│   ├── main.jsx              # Entrada e importação de estilos
│   ├── ares-palette.css       # Tokens da paleta
│   ├── finish.css             # Acabamento, temas e navegação
│   └── responsive.css         # Ajustes responsivos finais
├── .env.example
├── index.html
├── package.json
├── package-lock.json
├── vercel.json
└── vite.config.js
~~~

O projeto ainda importa folhas de estilo anteriores a ares-palette.css, finish.css e responsive.css. Ao modificar componentes, confira a ordem em src/main.jsx e a especificidade das regras para evitar conflitos entre as camadas.

## Comandos e testes

| Comando | Finalidade |
| --- | --- |
| npm ci | Instalar exatamente as dependências do lockfile |
| npm run dev | Servidor de desenvolvimento |
| npm run build | Build de produção em dist/ |
| npm run preview | Servir o build para conferência local |

Os testes usam o runner nativo do Node:

~~~bash
node --test src/api.test.js src/services/*.test.js src/auth/*.test.js src/pages/Auth/*.test.js
~~~

A suíte atual tem 32 testes e cobre tratamento de erros da API, uso de dados reais, estados vazios, scanner local, limpeza de sessão e vinculação de provedores.

Não há script de lint nem suíte de navegador configurados em package.json. Build e testes de unidade não substituem a verificação visual.

### Conferência manual sugerida

- Abrir /design nos dois temas e em larguras como 360, 390, 768 e 1280 px.
- Conferir abertura do menu móvel, acesso ao perfil, mudança de tema e navegação por teclado.
- Validar login/cadastro, recuperação, vinculação e saída com Firebase configurado.
- Validar carregamento, erro, lista vazia e resultado real com o backend.
- Testar os filtros, a triagem individual/em lote e a exportação.
- Selecionar arquivos de exemplo no scan local, analisar, baixar JSON e limpar os resultados.
- Conferir tabelas, código, campos longos e modais em telas pequenas.

Não use credenciais reais para montar arquivos de exemplo do scanner.

## Build e publicação

~~~bash
npm ci
npm run build
npm run preview
~~~

Publique o conteúdo de dist/ em uma hospedagem estática com suporte a fallback de SPA. Não publique .env.local ou node_modules.

### Vercel

O repositório inclui vercel.json com rewrite das rotas do frontend para index.html, preservando caminhos iniciados por /api/.

Configuração esperada:

| Campo | Valor |
| --- | --- |
| Framework | Vite |
| Comando de build | npm run build |
| Diretório de saída | dist |
| Variáveis | VITE_API_BASE_URL e VITE_FIREBASE_* |

O rewrite não cria um proxy de backend. Com uma API externa, defina VITE_API_BASE_URL e configure CORS no servidor. Com API na mesma origem, configure o roteamento dessa API separadamente.

Autorize o domínio publicado no Firebase e confirme as URLs de callback dos provedores.

## Solução de problemas

| Sintoma | Verificação |
| --- | --- |
| Autenticação indisponível | Preencha as quatro variáveis Firebase e reinicie o Vite |
| auth/unauthorized-domain | Adicione o domínio atual aos autorizados no Firebase |
| Pop-up bloqueado | Permita pop-ups e reinicie a tentativa pelo botão |
| Conta existente em outro provedor | Confirme o método existente para concluir a vinculação |
| HTTP 401/403 | Confira sessão, validação do token Firebase e autorização no backend |
| HTTP 500 | Confira o corpo da resposta e os logs do backend |
| Falha de conexão no desenvolvimento | Confira o backend em localhost:8000 ou SAST_API_PROXY |
| Erro de CORS em produção | Configure a origem e os cabeçalhos permitidos na API |
| URL com /api/v1 duplicado | Use somente a origem em VITE_API_BASE_URL |
| Repositórios vazios após login GitHub | Verifique a integração backend; login social não concede acesso aos repositórios |
| Histórico diferente em outro navegador | A listagem usa os registros locais, sem sincronização completa |
| Preferências somem após logout | A limpeza de armazenamento local é parte do fluxo de saída |
| Trecho de código ausente | O resultado da API não forneceu esse campo |
| ZIP rejeitado no scan local | Selecione arquivos de código/texto individuais |
| Rota direta retorna 404 na hospedagem | Configure fallback para index.html |
| Build avisa sobre chunks grandes | O bundle contém dependências compartilhadas; divisão por rotas ainda não está implementada |

## Limites atuais

- O backend e seus scanners não fazem parte deste repositório.
- A listagem de análises usa histórico local, sem endpoint de listagem global integrado.
- A triagem por achado e as preferências de regras não são sincronizadas com a API.
- O catálogo de regras é de referência; seus controles não reconfiguram o scanner.
- O scan local usa padrões textuais e não oferece a cobertura do scanner remoto.
- O envio de ZIP existe como componente de suporte, mas não está acessível nas telas atuais.
- A revisão visual /design é pública e permanece no build de produção.
- Há camadas de CSS legadas; a consolidação dos estilos ainda está pendente.
- A suíte automatizada não cobre layout ou interação em navegador.

## Administração de grupos

Acesse /groups pela seção Equipe, separada de Workspace na navegação. A página exige uma sessão autenticada.

- GET /api/v1/groups lista os grupos com id, name e role.
- POST /api/v1/groups recebe { "name": "LUMEN" }; o criador é administrador.
- POST /api/v1/groups/:id/repos/:repository_id associa um repositório obtido de GET /api/v1/repos.
- POST /api/v1/groups/:id/members recebe email e role (member ou admin). A pessoa precisa ter acessado o aplicativo anteriormente.
- GET /api/v1/dashboard/summary?group_id=:id fornece o painel do gerente.

As chamadas usam o cliente HTTP compartilhado e enviam Authorization: Bearer com o token Firebase. Somente grupos com role admin exibem os formulários administrativos e solicitam o resumo. Respostas 403 são apresentadas como falta de permissão; a autorização efetiva pertence ao backend.

O contrato fornecido não inclui listagem de membros ou de repositórios já associados. A tela confirma as inclusões, sem inventar essas listagens. As métricas exibidas usam total_jobs, total_findings e severity_distribution, os mesmos campos do resumo existente.

### Primeiro acesso e entrada em grupos

No primeiro login de uma conta nova, /onboarding pergunta o nome de exibição e oferece criar um grupo, consultar os grupos da conta ou pular a etapa. O nome é salvo no perfil Firebase; a criação usa POST /api/v1/groups.

A identificação do primeiro login usa os horários de criação e de último acesso fornecidos pelo Firebase. A conclusão ou o pulo é registrado por UID no armazenamento deste navegador, com estado em memória para a sessão. Não existe um campo de onboarding no backend; esse registro não é sincronizado entre dispositivos e é removido pela limpeza de logout. Logins posteriores são distinguidos pelos metadados Firebase.

A entrada em um grupo continua exclusivamente por inclusão pelo administrador usando o e-mail. A interface exibe o e-mail da conta e orienta a solicitar acesso; não há código de convite nem endpoint novo.
