# SI Solucoes Imobiliarias - Frontend

Frontend em Next.js do CRM imobiliario SI - Solucoes Imobiliarias. A aplicacao
inclui autenticacao, dashboard Kanban, gestao de leads, gestao de imoveis,
gestao de status do funil e chatbot integrado ao backend NestJS e ao
microservico de IA.

## Sumario

- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Variaveis de ambiente](#variaveis-de-ambiente)
- [Rodar localmente](#rodar-localmente)
- [Scripts](#scripts)
- [Rotas da aplicacao](#rotas-da-aplicacao)
- [Fluxo de dados](#fluxo-de-dados)
- [Chatbot e IA](#chatbot-e-ia)
- [Autenticacao](#autenticacao)
- [Estilos e UI](#estilos-e-ui)
- [Validacao](#validacao)
- [Projetos relacionados](#projetos-relacionados)

## Tecnologias

- Next.js 16.2.9
- React 19.2.4
- TypeScript
- CSS Modules
- Mantine Core
- Tabler Icons
- Axios
- Tailwind/PostCSS configurado como dependencia de estilo

## Funcionalidades

- Login e cadastro de usuarios.
- Dashboard Kanban de leads.
- Movimentacao de leads entre status.
- Cadastro, edicao e exclusao de leads.
- Cadastro, edicao e exclusao de imoveis.
- Relacionamento de um imovel com varios leads.
- Cadastro e organizacao dos status usados no funil.
- Modal de detalhes do lead com dados de cliente, status e imovel.
- Chatbot flutuante com contexto da tela atual.
- Tema claro/escuro via `ThemeContext`.

## Estrutura de pastas

```txt
front-case/
|-- public/
|   |-- assets/
|   |   `-- logo.png
|   |-- file.svg
|   |-- globe.svg
|   |-- next.svg
|   |-- vercel.svg
|   `-- window.svg
|-- src/
|   `-- app/
|       |-- app.tsx                       # Providers globais: Mantine, tema e ChatBot
|       |-- layout.tsx                    # Layout raiz do App Router
|       |-- page.tsx                      # Rota inicial
|       |-- globals.css                   # Variaveis globais e estilos base
|       |-- favicon.ico
|       |-- components/
|       |   |-- Alert/
|       |   |   |-- Alert.tsx
|       |   |   `-- styles.module.css
|       |   |-- ChatBot/
|       |   |   |-- ChatBot.tsx
|       |   |   `-- ChatBot.module.css
|       |   |-- ModalLead/
|       |   |   |-- ModalLead.tsx
|       |   |   `-- ModalLead.module.css
|       |   |-- Navbar/
|       |   |   |-- NavbamarMinimal.tsx
|       |   |   `-- NavbarMinimal.module.css
|       |   |-- ThemeContext/
|       |   |   `-- ThemeContext.tsx
|       |   `-- ToggleSwitch/
|       |       |-- ToggleSwitch.tsx
|       |       `-- ToggleSwitch.module.css
|       |-- dashboard/
|       |   |-- page.tsx
|       |   |-- Dashboardpage.tsx
|       |   `-- Dashboard.module.css
|       |-- leads/
|       |   |-- page.tsx
|       |   |-- Leadspage.tsx
|       |   `-- Leads.module.css
|       |-- imoveis/
|       |   |-- page.tsx
|       |   |-- Imoveispage.tsx
|       |   `-- Imoveis.module.css
|       |-- status/
|       |   |-- page.tsx
|       |   |-- Statuspage.tsx
|       |   `-- Status.module.css
|       |-- LoginPage/
|       |   |-- page.tsx
|       |   |-- Loginpage.tsx
|       |   `-- LoginPage.module.css
|       |-- services/
|       |   `-- api.ts                    # Cliente Axios e endpoints da API
|       `-- types/
|           `-- types.ts                  # Tipos compartilhados do frontend
|-- package.json
|-- next.config.ts
|-- tsconfig.json
|-- eslint.config.mjs
|-- postcss.config.mjs
`-- README.md
```

## Variaveis de ambiente

Crie ou atualize o arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Essa variavel define a URL base usada em `src/app/services/api.ts`.

Se ela nao existir, o frontend usa:

```txt
http://localhost:3001/api
```

## Rodar localmente

Instale as dependencias:

```powershell
npm install
```

Inicie o servidor de desenvolvimento:

```powershell
npm run dev
```

A aplicacao fica disponivel em:

```txt
http://localhost:3000
```

Para o frontend funcionar completamente, tambem mantenha o backend rodando:

```txt
http://localhost:3001/api
```

E, para o chatbot com IA, o microservico:

```txt
http://localhost:8000
```

## Scripts

```powershell
npm run dev
```

Inicia o servidor Next.js em desenvolvimento.

```powershell
npm run build
```

Gera a build de producao.

```powershell
npm run start
```

Inicia a aplicacao em modo producao depois do build.

```powershell
npm run lint
```

Executa o ESLint.

## Rotas da aplicacao

| Rota | Arquivo | Descricao |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | Entrada inicial da aplicacao. |
| `/LoginPage` | `src/app/LoginPage/page.tsx` | Login e cadastro. |
| `/dashboard` | `src/app/dashboard/page.tsx` | Kanban de leads e indicadores. |
| `/leads` | `src/app/leads/page.tsx` | Criacao e gerenciamento de leads. |
| `/imoveis` | `src/app/imoveis/page.tsx` | Criacao e gerenciamento de imoveis. |
| `/status` | `src/app/status/page.tsx` | Criacao e gerenciamento dos status do funil. |

## Fluxo de dados

O frontend usa `api.ts` como ponto central para chamadas HTTP:

```txt
Componentes e paginas
  -> src/app/services/api.ts
  -> Backend NestJS em NEXT_PUBLIC_API_URL
```

Principais grupos de endpoints no cliente:

- `api.auth`: registro, login, usuario atual e logout.
- `api.statuses`: CRUD dos status do funil.
- `api.leads`: CRUD de leads, Kanban e movimentacao entre status.
- `api.imoveis`: CRUD de imoveis.
- `api.ai`: envio de mensagens para o chatbot.

O token JWT e salvo em `localStorage` com a chave:

```txt
front-case:auth-token
```

O interceptor Axios injeta automaticamente:

```http
Authorization: Bearer <token>
```

quando existe token salvo.

## Chatbot e IA

O ChatBot fica em:

```txt
src/app/components/ChatBot/ChatBot.tsx
```

Ele aparece nas telas autenticadas e fica oculto em:

```txt
/
/LoginPage
```

### O que o frontend envia

Ao enviar uma mensagem, o frontend chama:

```txt
POST /api/ai/chat
```

Payload:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "quero saber quais passos tomar com cliente gervasio"
    }
  ],
  "context": "{...contexto da tela atual...}"
}
```

O `context` do frontend descreve a tela atual, por exemplo:

- dashboard;
- leads;
- imoveis;
- status;
- intencao esperada da tela;
- regras para a IA nao inventar dados.

O frontend nao busca leads ou imoveis para montar a resposta da IA. Essa
responsabilidade fica no backend.

### Fluxo completo

```txt
ChatBot.tsx
  -> envia messages + context da tela atual
Backend NestJS
  -> identifica o usuario autenticado
  -> busca status, leads, proximos contatos e imoveis no banco
  -> monta crm e matchedCrm
  -> envia tudo para o ai-service
ai-service
  -> usa OpenAI quando OPENAI_API_KEY existe
  -> usa fallback local quando nao existe chave
Frontend
  -> renderiza a resposta no chat
```

### matchedCrm

`matchedCrm` e montado pelo backend com base nas ultimas mensagens do usuario.
Ele serve para perguntas como:

```txt
quero saber quais passos tomar com cliente gervasio
imovel apartamento candeias
```

O backend cruza esses termos com:

- nome do lead;
- empresa/interesse do lead;
- status;
- `imovelId`;
- titulo e dados do imovel relacionado.

Assim, a IA recebe o lead correto ja priorizado e consegue responder com uma
proxima acao baseada nos dados do CRM.

## Autenticacao

O fluxo de autenticacao fica em:

```txt
src/app/LoginPage/Loginpage.tsx
src/app/services/api.ts
```

Ao fazer login ou cadastro, o backend retorna:

```json
{
  "accessToken": "jwt",
  "user": {
    "id": "user-id",
    "name": "Usuario",
    "email": "usuario@email.com"
  }
}
```

O frontend salva `accessToken` no `localStorage` e usa o token nas chamadas
seguintes.

## Leads e imoveis

Na tela de leads, o usuario pode selecionar um imovel existente. O frontend
envia `imovelId` junto do lead:

```json
{
  "contactName": "Gervasio",
  "company": "Apartamento Candeias",
  "statusId": "status-id",
  "imovelId": "imovel-id"
}
```

O backend permite que um mesmo imovel esteja relacionado a varios leads.

No dashboard, ao abrir os detalhes de um lead, o frontend tenta exibir:

- dados do cliente;
- status atual;
- origem;
- valor;
- proximo contato;
- observacoes;
- imovel relacionado.

## Status do funil

A rota `/status` permite criar e gerenciar os status usados pelo dashboard e
pela tela de leads.

Campos principais:

- `name`: nome do status.
- `color`: cor usada no Kanban.
- `order`: ordem da coluna no funil.

Os status criados nessa tela alimentam:

- legenda do dashboard;
- colunas do Kanban;
- select de status na criacao/edicao de leads;
- contexto enviado para IA pelo backend.

## Estilos e UI

O projeto usa CSS Modules por pagina/componente:

```txt
Dashboard.module.css
Leads.module.css
Imoveis.module.css
Status.module.css
ChatBot.module.css
```

Tambem existe `globals.css`, onde ficam variaveis globais de tema, cores e
estilos base.

Componentes compartilhados:

- `NavbarMinimal`: navegacao lateral/superior responsiva.
- `Alert`: mensagens de erro/sucesso.
- `ModalLead`: detalhes do lead.
- `ToggleSwitch`: alternancia de tema.
- `ChatBot`: assistente flutuante.

Icones principais sao de `@tabler/icons-react`.

## Validacao

Antes de abrir PR ou entregar alteracoes:

```powershell
npm run lint
npm run build
```

Esses comandos validam regras de lint, TypeScript e build do Next.js.

## Projetos relacionados

Este frontend depende dos projetos:

```txt
C:\Projetos\backend-case
C:\Projetos\ai-service
```

Backend esperado:

```txt
http://localhost:3001/api
```

Microservico de IA esperado:

```txt
http://localhost:8000
```

Ordem recomendada para rodar o ambiente completo:

```txt
1. PostgreSQL / Docker do backend
2. backend-case
3. ai-service
4. front-case
```

## Observacoes

- Nao versionar `.env.local`.
- O frontend nao deve conter chave da OpenAI.
- Dados reais do CRM para IA devem ser montados no backend.
- O ChatBot deve enviar mensagens naturais do usuario e contexto da tela, nao
  montar regras de dominio no React.
