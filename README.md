# SI Soluções Imobiliárias - Frontend

Frontend em Next.js do CRM imobiliário SI - Soluções Imobiliárias. A aplicação
inclui autenticação, dashboard Kanban, gestão de leads, gestão de imóveis,
gestão de status do funil e chatbot integrado ao backend NestJS e ao
microserviço de IA.

## Sumário

- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Rodar localmente](#rodar-localmente)
- [Scripts](#scripts)
- [Rotas da aplicação](#rotas-da-aplicação)
- [Fluxo de dados](#fluxo-de-dados)
- [Chatbot e IA](#chatbot-e-ia)
- [Autenticação](#autenticação)
- [Testes](#testes)
- [Estilos e UI](#estilos-e-ui)
- [Validação](#validação)
- [Projetos relacionados](#projetos-relacionados)

## Tecnologias

- Next.js 16.2.9
- React 19.2.4
- TypeScript
- CSS Modules
- Mantine Core
- Tabler Icons
- Axios
- Tailwind/PostCSS configurado como dependência de estilo
- Vitest
- React Testing Library

## Funcionalidades

- Login e cadastro de usuários.
- Dashboard Kanban de leads.
- Movimentação de leads entre status.
- Cadastro, edição e exclusão de leads.
- Cadastro, edição e exclusão de imóveis.
- Relacionamento de um imóvel com vários leads.
- Cadastro e organização dos status usados no funil.
- Modal de detalhes do lead com dados de cliente, status e imóvel.
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
|       |-- globals.css                   # Variáveis globais e estilos base
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
|       |-- types/
|       |   `-- types.ts                  # Tipos compartilhados do frontend
|       `-- __tests__/                    # Testes de componentes e abas
|-- src/test/
|   `-- setup.ts                          # Setup global do Vitest
|-- package.json
|-- next.config.ts
|-- tsconfig.json
|-- vitest.config.mts
|-- eslint.config.mjs
|-- postcss.config.mjs
`-- README.md
```

## Variáveis de ambiente

Crie ou atualize o arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Essa variável define a URL base usada em `src/app/services/api.ts`.

Se ela não existir, o frontend usa:

```txt
http://localhost:3001/api
```

## Rodar localmente

Instale as dependências:

```powershell
npm install
```

Inicie o servidor de desenvolvimento:

```powershell
npm run dev
```

A aplicação fica disponível em:

```txt
http://localhost:3000
```

Para o frontend funcionar completamente, também mantenha o backend rodando:

```txt
http://localhost:3001/api
```

E, para o chatbot com IA, o microserviço:

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

Gera a build de produção.

```powershell
npm run start
```

Inicia a aplicação em modo produção depois do build.

```powershell
npm run lint
```

Executa o ESLint.

```powershell
npm run test
```

Executa a suíte de testes com Vitest.

## Rotas da aplicação

| Rota | Arquivo | Descrição |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | Entrada inicial da aplicação. |
| `/LoginPage` | `src/app/LoginPage/page.tsx` | Login e cadastro. |
| `/dashboard` | `src/app/dashboard/page.tsx` | Kanban de leads e indicadores. |
| `/leads` | `src/app/leads/page.tsx` | Criação e gerenciamento de leads. |
| `/imoveis` | `src/app/imoveis/page.tsx` | Criação e gerenciamento de imóveis. |
| `/status` | `src/app/status/page.tsx` | Criação e gerenciamento dos status do funil. |

## Fluxo de dados

O frontend usa `api.ts` como ponto central para chamadas HTTP:

```txt
Componentes e páginas
  -> src/app/services/api.ts
  -> Backend NestJS em NEXT_PUBLIC_API_URL
```

Principais grupos de endpoints no cliente:

- `api.auth`: registro, login, usuário atual e logout.
- `api.statuses`: CRUD dos status do funil.
- `api.leads`: CRUD de leads, Kanban e movimentação entre status.
- `api.imoveis`: CRUD de imóveis.
- `api.ai`: envio de mensagens para o chatbot.

O token JWT é salvo em `localStorage` com a chave:

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
- select de status na criação/edição de leads;
- contexto enviado para IA pelo backend.

## Testes

O projeto usa Vitest com React Testing Library para testar componentes e abas
principais da aplicação.

Configuração:

```txt
vitest.config.mts
src/test/setup.ts
```

O setup global inclui:

- `@testing-library/jest-dom/vitest`;
- mocks de `next/navigation`, `next/link` e `next/image`;
- mocks de APIs do navegador usadas por Mantine e pelo chat, como `matchMedia`
  e `scrollTo`.

Arquivos de teste:

```txt
src/app/__tests__/Alert.test.tsx
src/app/__tests__/ChatBot.test.tsx
src/app/__tests__/Dashboardpage.test.tsx
src/app/__tests__/Imoveispage.test.tsx
src/app/__tests__/Leadspage.test.tsx
src/app/__tests__/ModalLead.test.tsx
src/app/__tests__/NavbarMinimal.test.tsx
src/app/__tests__/Statuspage.test.tsx
src/app/__tests__/ToggleSwitch.test.tsx
```

O que a suíte cobre:

- renderização e fechamento automático do `Alert`;
- alternância do `ToggleSwitch`;
- exibição e fechamento do `ModalLead`;
- rota ativa na `NavbarMinimal`;
- abertura, ocultação e envio de mensagem pelo `ChatBot`;
- carregamento e movimentação de leads no dashboard;
- criação/edição de leads;
- criação/edição/exclusão de imóveis;
- criação/edição/exclusão de status.

Para rodar:

```powershell
npm run test
```

## Estilos e UI

O projeto usa CSS Modules por página/componente:

```txt
Dashboard.module.css
Leads.module.css
Imoveis.module.css
Status.module.css
ChatBot.module.css
```

Também existe `globals.css`, onde ficam variáveis globais de tema, cores e
estilos base.

Componentes compartilhados:

- `NavbarMinimal`: navegação lateral/superior responsiva.
- `Alert`: mensagens de erro/sucesso.
- `ModalLead`: detalhes do lead.
- `ToggleSwitch`: alternância de tema.
- `ChatBot`: assistente flutuante.

Ícones principais são de `@tabler/icons-react`.

## Validação

Antes de abrir PR ou entregar alterações:

```powershell
npm run test
npm run lint
npm run build
```

Esses comandos validam testes, regras de lint, TypeScript e build do Next.js.

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
