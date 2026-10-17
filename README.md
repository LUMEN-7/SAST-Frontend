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

Contas sem registros recebem estados vazios e convite para a primeira análise local. Respostas 404 das coleções de repositórios e do resumo são tratadas como ausência de dados disponíveis; erros de autenticação e falhas de conexão continuam sendo informados.
