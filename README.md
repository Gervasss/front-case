# SI Solucoes Imobiliarias - Frontend

Frontend NextJS do case tecnico, com login/cadastro, dashboard Kanban, gestao de leads,
gestao de imoveis, gestao de status do funil e janela de chatbot integrada ao backend NestJS.

## Rodar localmente

Configure a URL da API em `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Depois inicie o servidor:

```powershell
npm install
npm run dev
```

A aplicacao fica em:

```txt
http://localhost:3000
```

## Chatbot

O chatbot aparece nas telas autenticadas depois do login. O frontend chama:

```txt
POST http://localhost:3001/api/ai/chat
```

O backend NestJS encaminha essa chamada para o microservico FastAPI configurado por
`AI_SERVICE_URL`, normalmente:

```txt
http://localhost:8000
```

Fluxo do chat:

```txt
ChatBot.tsx
  -> envia messages + context da tela atual para POST /api/ai/chat
Backend NestJS
  -> identifica o usuario autenticado
  -> busca status, leads, proximos contatos e imoveis no banco
  -> monta crm e matchedCrm
  -> encaminha tudo para o ai-service
ai-service
  -> usa OpenAI quando OPENAI_API_KEY existe
  -> usa fallback local quando a chave nao existe
```

O frontend nao busca leads/imoveis para montar a resposta da IA. Ele envia apenas:

- historico recente da conversa;
- pergunta atual do usuario;
- contexto da rota atual, como dashboard, leads, imoveis ou status.

O backend e responsavel por relacionar lead + imovel e montar `matchedCrm`, um recorte
priorizado pelas ultimas mensagens do usuario. Exemplo: ao perguntar sobre o cliente
`Gervasio` e depois informar `Apartamento Candeias`, o backend cruza esses termos com
os leads e imoveis do CRM antes de chamar a IA.

Para rodar o microservico:

```powershell
cd C:\Projetos\ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
