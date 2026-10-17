# Lumen SAST — Frontend

Interface React/Vite para a API FastAPI do SAST-Platform. O backend continua na raiz do repositório.

## Executar

```bash
cd frontend
npm install
npm run dev
```

O Vite faz proxy de `/api` para `https://overbuilt-reshuffle-saloon.ngrok-free.dev` durante o desenvolvimento. É possível substituir o endereço com `SAST_API_PROXY` no ambiente do processo Vite.

## Produção

Configure `VITE_API_BASE_URL` com a origem HTTP(S) da API, **sem** `/api/v1` ao final. O backend precisará autorizar a origem do frontend no CORS ou ser publicado na mesma origem via reverse proxy. URLs ngrok gratuitas podem mudar/expirar.

## Funcionalidades disponíveis

- Login e cadastro com Firebase Authentication (e-mail/senha, Google e GitHub)
- Upload de ZIP; acompanhamento automático de status; detalhes de findings, severidade, explicação/patch da IA, security gate e exportação do relatório Markdown
- Dashboard agregado via `GET /api/v1/dashboard/summary`
- Histórico **local a este navegador**, com acesso às execuções por ID

## Limitações conhecidas do backend atual

- Login com GitHub usa Firebase. Acesso a repositórios e GitHub Actions exige integração própria no backend; vincular uma identidade não concede acesso automático aos repositórios.
- A API não fornece endpoint de listagem de jobs; o histórico funciona apenas com os IDs armazenados neste navegador.
- Alguns resultados podem vir sem sugestões/patch da IA; a interface sinaliza a ausência.
- Sem CORS configurado no backend ou proxy em produção, o navegador bloqueará as chamadas de API.

## Rotas

`/` entrada • `/dashboard` visão geral • `/analysis/:id` resultado detalhado.

## Fluxo sem upload de código
A integração pretendida usa GitHub Actions para rodar SAST e entregar resultados à API. O backend atual não possui endpoint de análise por URL nem importação de resultados CI, então a interface não inicia execuções por URL e não faz upload de ZIP. Consultar análises existentes por ID permanece disponível.

## Dados reais

Todas as telas usam a API. Não há modo de demonstração nem fallback para dados fictícios. Configure `VITE_API_BASE_URL` em produção; no desenvolvimento, o proxy usa `http://localhost:8000` ou `SAST_API_PROXY`. O backend precisa validar os tokens Firebase.

O histórico continua limitado às execuções reais armazenadas neste navegador, pois ainda não existe endpoint de listagem de jobs. Sem dados, as telas ficam vazias; falhas de conexão são exibidas como erros. Relatórios são baixados exclusivamente da API.

## Autenticação com Firebase

O acesso ao aplicativo exige uma sessão Firebase. Rotas: `/login`, `/register`, `/forgot-password` e `/account`. A página Minha conta permite vincular Google/GitHub ao usuário autenticado, mantendo o mesmo UID; não mescla automaticamente usuários diferentes.

1. Crie um projeto no Firebase Console e registre um aplicativo Web.
2. Copie `.env.example` para `.env.local` e preencha `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` e `VITE_FIREBASE_APP_ID` com os dados do aplicativo Web. Reinicie o Vite.
3. Em Authentication > Sign-in method, ative E-mail/senha, Google e GitHub. Configure o e-mail de suporte do Google.
4. No GitHub, crie um OAuth App. Copie exatamente a URL de callback exibida pelo Firebase (normalmente `https://SEU_PROJETO.firebaseapp.com/__/auth/handler`) para Authorization callback URL. Informe Client ID e Client Secret somente no console Firebase; nunca coloque o secret no frontend.
5. Em Authentication > Settings > Authorized domains, adicione `localhost` e o domínio de produção. Configure também a política de senha e os modelos de e-mail conforme necessário.
6. Valide cadastro, saída, login por senha, recuperação e login com cada provedor. Em Minha conta, vincule o segundo provedor e confirme que os acessos continuam usando o mesmo UID. Pop-ups precisam estar permitidos. Se um e-mail já usar outro método, entre por ele e então faça a vinculação.

As chamadas da API enviam o ID token Firebase atualizado em `Authorization: Bearer <token>`. O backend precisa validar esse token com Firebase Admin SDK e autorizar cada recurso pelo UID. A proteção das rotas no navegador não substitui autorização no servidor. Tokens antigos do backend não são compatíveis com Firebase. Não é necessário Firestore para autenticação.

Sem configuração, as telas exibem uma orientação e bloqueiam o envio; não criam sessões fictícias. O dashboard depende dos dados reais retornados pela API.

Referências: https://firebase.google.com/docs/auth/web/google-signin, https://firebase.google.com/docs/auth/web/github-auth, https://firebase.google.com/docs/auth/web/account-linking, https://firebase.google.com/docs/auth/admin/verify-id-tokens.


### Uma conta por e-mail

Em Firebase Console > Authentication > Settings > User account linking, selecione a opção de vincular contas que usam o mesmo e-mail (uma conta por endereço de e-mail). Essa configuração é obrigatória para evitar UIDs diferentes por provedor.

Ao receber `auth/account-exists-with-different-credential`, a tela guarda a credencial OAuth somente em memória e solicita o login pelo método existente. Depois de confirmar o mesmo e-mail, vincula a credencial ao UID existente e só então libera o acesso. Não depende de listar métodos por e-mail, o que é incompatível com a proteção contra enumeração de e-mails. Cancelar ou recarregar descarta a tentativa; repetir o acesso pelo novo provedor reinicia o fluxo.

Contas duplicadas que já possuem UIDs diferentes não são mescladas pelo frontend. Esses casos exigem migração dos dados no backend antes de remover uma identidade duplicada. Google/GitHub com e-mails diferentes continuam sendo contas distintas, a menos que sejam vinculados explicitamente em Minha conta.

Validação manual: crie uma conta Google, saia e entre com GitHub de mesmo e-mail; quando solicitado, confirme com Google e confira em Authentication > Users que há um único UID com os dois provedores. Repita com conta de senha existente. Tente confirmar com outro e-mail, feche o pop-up e cancele a vinculação para conferir os estados de erro. Se houver falha de rede após confirmar o login, use Tentar concluir vinculação antes de continuar.

### Logout e troca de provedor

Depois de vincular Google e GitHub, ambos permitem login no mesmo UID; sair não remove os vínculos registrados no Firebase. A saída encerra a sessão Firebase, limpa localStorage (incluindo histórico local e token legado), sessionStorage e Cache Storage da origem do aplicativo, e abre /login em um documento novo para descartar dados em memória. O seletor de contas Google aparece em cada novo acesso. A saída do aplicativo não desconecta as contas nos sites Google/GitHub nem apaga o cache HTTP global do navegador.

## Perfil e análises locais

`/account` permite editar o nome, conferir métodos de acesso, vincular Google/GitHub, solicitar verificação do e-mail e recuperação de senha, além de sair com limpeza dos dados locais.

`/local-analyses` processa arquivos de código/texto inteiramente em um Web Worker do navegador. Não há upload, envio de nomes/resultados à API/Firebase, armazenamento persistente nem inclusão no dashboard/histórico. O relatório JSON é baixado apenas por ação do usuário. Sair da página descarta a seleção e os resultados. Firebase continua responsável pela sessão de acesso ao aplicativo.

O scanner procura seis categorias de padrões: execução dinâmica, inserção de HTML, comandos de shell, chaves privadas, possíveis segredos e TLS desativado. Não executa código, não usa IA nem substitui SAST completo; tem falsos positivos e negativos. Aceita até 50 arquivos, 2 MB por arquivo e 10 MB no total; arquivos compactados não são suportados. Limite de 500 achados por arquivo, com aviso de truncamento. Resultados não incluem trechos do código nem os valores dos segredos.

<<<<<<< HEAD
Contas sem registros recebem estados vazios e convite para a primeira análise local. Respostas 404 das coleções de repositórios e do resumo são tratadas como ausência de dados disponíveis; erros de autenticação e falhas de conexão continuam sendo informados.
=======
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
>>>>>>> 9ed7f34 (feat: add onboarding process for new users and group management features)
