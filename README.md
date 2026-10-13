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
