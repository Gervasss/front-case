"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { IconMessageCircle, IconSend, IconSparkles, IconX } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { ApiError, api, ChatMessage, ChatResponse } from "../../services/api";
import styles from "./ChatBot.module.css";

type UiMessage = ChatMessage & {
  id: string;
};

type QuickSuggestion = {
  label: string;
  prompt: string;
};

const starterMessages: UiMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Ola! Sou o assistente da SI. Posso ajudar a priorizar leads, montar follow-ups e organizar o funil imobiliario.",
  },
];

const defaultSuggestions: QuickSuggestion[] = [
  {
    label: "Quais leads devo priorizar hoje?",
    prompt: "Quais leads devo priorizar hoje?",
  },
  {
    label: "Crie uma mensagem de follow-up.",
    prompt: "Crie uma mensagem de follow-up.",
  },
  {
    label: "Como melhorar meu funil?",
    prompt: "Como melhorar meu funil?",
  },
];

const hiddenRoutes = new Set(["/", "/LoginPage"]);

// Normaliza sugestoes vindas da API para o formato usado pelos botoes do chat.
function toQuickSuggestion(suggestion: string): QuickSuggestion {
  return {
    label: suggestion,
    prompt: suggestion,
  };
}

// Descreve a tela atual e orienta o backend/IA sobre como usar o CRM.
function buildContext(pathname: string) {
  const routeContext =
    pathname.includes("dashboard")
      ? {
          screen: "dashboard",
          title: "Dashboard Kanban de leads",
          userIntent: "acompanhar funil, priorizar leads e mover oportunidades entre status",
          relevantCrmData: ["crm.statuses", "crm.recentLeads", "crm.upcomingContacts", "crm.totals"],
        }
      : pathname.includes("leads")
        ? {
            screen: "leads",
            title: "Gestao de leads",
            userIntent: "criar, editar, qualificar e planejar follow-ups de leads",
            relevantCrmData: ["crm.recentLeads", "crm.statuses", "crm.upcomingContacts", "crm.imoveis"],
          }
        : pathname.includes("imoveis")
          ? {
              screen: "imoveis",
              title: "Gestao de imoveis",
              userIntent: "consultar carteira de imoveis e relacionar imoveis com oportunidades",
              relevantCrmData: ["crm.imoveis", "crm.recentLeads"],
            }
          : pathname.includes("status")
            ? {
                screen: "status",
                title: "Gestao de status do funil",
                userIntent: "organizar etapas do funil e entender quantidade de leads por status",
                relevantCrmData: ["crm.statuses", "crm.totals"],
              }
            : {
                screen: "crm",
                title: "CRM imobiliario",
                userIntent: "obter apoio comercial geral",
                relevantCrmData: ["crm.totals", "crm.statuses", "crm.recentLeads", "crm.upcomingContacts", "crm.imoveis"],
              };

  return JSON.stringify({
    source: "front-case-web",
    system: {
      name: "SI - Solucoes Imobiliarias",
      domain: "CRM imobiliario",
      assistantRole: "assistente comercial para corretores imobiliarios",
    },
    conversationMode: "contextual-crm-ai",
    currentRoute: {
      pathname,
      ...routeContext,
    },
    responseGuidelines: [
      "Responda em portugues do Brasil.",
      "Responda como IA contextual, analisando a pergunta do usuario e os dados reais do CRM enviados pelo backend.",
      "Priorize recomendacoes praticas para atendimento, follow-up, funil e carteira de imoveis.",
      "Use os dados do objeto crm que o backend injeta no contexto.",
      "Use matchedCrm como recorte prioritario quando existir, pois ele foi montado a partir da conversa atual no backend.",
      "Se o usuario citar um cliente, lead, empresa ou imovel pelo nome, procure correspondencias em crm.recentLeads e crm.imoveis antes de responder.",
      "Se o usuario citar cliente e imovel na mesma pergunta, cruze contactName, company, imovel.title e imovel.id para encontrar o lead correto antes de concluir que ha duplicidade.",
      "Para perguntas como 'qual o proximo passo do cliente X', use todas as informacoes cadastradas desse lead: status, imovel, valor, origem, notes, nextFollowUp, createdAt e updatedAt.",
      "Quando o lead tiver imovel relacionado, trate lead.imovel como a fonte principal do imovel e use crm.imoveis apenas para complementar pelo id ou titulo.",
      "Ao priorizar leads, considere os status reais em crm.statuses, a ordem do funil, leadsCount por status, proximos follow-ups, valor, origem e updatedAt.",
      "Quando houver mais de uma correspondencia possivel para um nome, mencione a ambiguidade e peca uma confirmacao curta.",
      "Quando um dado nao existir em crm, diga que a informacao nao esta cadastrada.",
      "Nao invente leads, status, valores, contatos, datas ou imoveis.",
    ],
    answerStyle: {
      avoid: ["respostas genericas", "scripts fixos quando ha dados do cliente", "status ou clientes inventados"],
      prefer: ["proximo passo acionavel", "justificativa baseada nos campos do CRM", "mensagens prontas apenas quando solicitadas"],
    },
    backendContextShape: {
      crm: {
        totals: "contadores de statuses, leads recentes, proximos contatos e imoveis",
        statuses: "etapas do funil ordenadas, com id, nome, cor, ordem e leadsCount",
        recentLeads: "ate 50 leads recentes com status, dados de contato, valor, follow-up e imovel relacionado",
        upcomingContacts: "ate 15 leads com proximo follow-up futuro",
        imoveis: "ate 30 imoveis recentes da carteira",
        unavailableData: "dados que ainda nao existem no CRM",
      },
    },
  });
}

export function ChatBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>(starterMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [suggestions, setSuggestions] = useState<QuickSuggestion[]>(defaultSuggestions);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const shouldRender = !hiddenRoutes.has(pathname);
  const context = useMemo(() => buildContext(pathname), [pathname]);

  useEffect(() => {
    if (isOpen) {
      messagesRef.current?.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [isOpen, messages, isSending]);

  async function sendMessage(content: string, visibleContent = content) {
    const trimmed = content.trim();
    const visibleTrimmed = visibleContent.trim();

    if (!trimmed || isSending) {
      return;
    }

    const userMessage: UiMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: visibleTrimmed || trimmed,
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const response = await api.ai.chat<ChatResponse>({
        messages: [
          ...messages
          .filter((message) => message.role !== "system")
          .slice(-8)
          .map(({ role, content }) => ({ role, content })),
          { role: "user", content: trimmed },
        ],
        context,
      });

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.reply,
        },
      ]);

      if (response.suggestions?.length) {
        setSuggestions(response.suggestions.map(toQuickSuggestion));
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Nao consegui falar com o assistente agora.";

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `${message} Confira se o microservico Python esta rodando em http://localhost:8000.`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={styles.chatRoot}>
      {isOpen ? (
        <section className={styles.panel} aria-label="Chatbot SI">
          <header className={styles.header}>
            <div>
              <span>
                <IconSparkles size={16} stroke={1.8} />
              </span>
              <div>
                <strong>Assistente SI</strong>
                <small>Leads e atendimento</small>
              </div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Fechar chatbot">
              <IconX size={18} stroke={1.8} />
            </button>
          </header>

          <div className={styles.messages} ref={messagesRef}>
            {messages.map((message) => (
              <article className={styles.message} data-role={message.role} key={message.id}>
                {message.content}
              </article>
            ))}
            {isSending ? (
              <article
                className={`${styles.message} ${styles.typingMessage}`}
                data-role="assistant"
                aria-label="Assistente digitando"
              >
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
              </article>
            ) : null}
          </div>

          <div className={styles.suggestions}>
            {suggestions.slice(0, 3).map((suggestion) => (
              <button
                type="button"
                key={suggestion.label}
                onClick={() => void sendMessage(suggestion.prompt, suggestion.label)}
                disabled={isSending}
              >
                {suggestion.label}
              </button>
            ))}
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Pergunte sobre leads..."
              aria-label="Mensagem para o assistente"
            />
            <button type="submit" disabled={isSending || !input.trim()} aria-label="Enviar mensagem">
              <IconSend size={18} stroke={1.8} />
            </button>
          </form>
        </section>
      ) : null}

      <button
        className={styles.fab}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Abrir chatbot SI"
      >
        <IconMessageCircle size={24} stroke={1.8} />
      </button>
    </div>
  );
}
