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

- Entrada de visitante (sem autenticação fictícia)
- Upload de ZIP; acompanhamento automático de status; detalhes de findings, severidade, explicação/patch da IA, security gate e exportação do relatório Markdown
- Dashboard agregado via `GET /api/v1/dashboard/summary`
- Histórico **local a este navegador**, com acesso às execuções por ID

## Limitações conhecidas do backend atual

- GitHub OAuth, organizações/repositórios e integração GitHub Actions dependem de implementação no backend (OAuth seguro, storage de tokens e endpoints de repositórios). O botão de conexão não finge autenticar.
- A API não fornece endpoint de listagem de jobs; o histórico funciona apenas com os IDs armazenados neste navegador.
- Alguns resultados podem vir sem sugestões/patch da IA; a interface sinaliza a ausência.
- Sem CORS configurado no backend ou proxy em produção, o navegador bloqueará as chamadas de API.

## Rotas

`/` entrada • `/dashboard` visão geral • `/analysis/:id` resultado detalhado.

## Fluxo sem upload de código
A integração pretendida usa GitHub Actions para rodar SAST e entregar resultados à API. O backend atual não possui endpoint de análise por URL nem importação de resultados CI, então a interface não inicia execuções por URL e não faz upload de ZIP. Consultar análises existentes por ID permanece disponível.

## Dados de demonstração

O frontend utiliza `VITE_DATA_MODE=mock` por padrão. As páginas Visão geral, Repositórios, Análises, Alertas e detalhes de execuções `demo-*` usam fixtures locais em `src/mocks/sastData.js`, identificadas como **DADOS DE DEMONSTRAÇÃO**. Não são análises reais e não são enviadas à API. O exemplo de relatório também é fictício.

Para habilitar chamadas reais do dashboard e das análises por UUID:

```env
VITE_DATA_MODE=api
VITE_API_BASE_URL=https://seu-backend
```

A interface consome `src/services/sastService.js`; altere **somente o serviço** quando o backend oferecer `GET /api/v1/repositories`, `GET /api/v1/analyses` e `GET /api/v1/alerts`. Esses endpoints ainda são contratos planejados, não rotas existentes. Não há upload automático do código-fonte.
