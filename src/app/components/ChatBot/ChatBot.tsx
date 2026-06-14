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
      "Olá! Sou o assistente da SI. Posso ajudar a priorizar leads, montar follow-ups e organizar o funil imobiliário.",
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

// Normaliza sugestões vindas da API para o formato usado pelos botões do chat.
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
            title: "Gestão de leads",
            userIntent: "criar, editar, qualificar e planejar follow-ups de leads",
            relevantCrmData: ["crm.recentLeads", "crm.statuses", "crm.upcomingContacts", "crm.imoveis"],
          }
        : pathname.includes("imoveis")
          ? {
              screen: "imoveis",
              title: "Gestão de imóveis",
              userIntent: "consultar carteira de imóveis e relacionar imóveis com oportunidades",
              relevantCrmData: ["crm.imoveis", "crm.recentLeads"],
            }
          : pathname.includes("status")
            ? {
                screen: "status",
                title: "Gestão de status do funil",
                userIntent: "organizar etapas do funil e entender quantidade de leads por status",
                relevantCrmData: ["crm.statuses", "crm.totals"],
              }
            : {
                screen: "crm",
                title: "CRM imobiliário",
                userIntent: "obter apoio comercial geral",
                relevantCrmData: ["crm.totals", "crm.statuses", "crm.recentLeads", "crm.upcomingContacts", "crm.imoveis"],
              };

  return JSON.stringify({
    source: "front-case-web",
    system: {
      name: "SI - Soluções Imobiliárias",
      domain: "CRM imobiliário",
      assistantRole: "assistente comercial para corretores imobiliários",
    },
    conversationMode: "contextual-crm-ai",
    currentRoute: {
      pathname,
      ...routeContext,
    },
    responseGuidelines: [
      "Responda em português do Brasil.",
      "Responda como IA contextual, analisando a pergunta do usuário e os dados reais do CRM enviados pelo backend.",
      "Priorize recomendações práticas para atendimento, follow-up, funil e carteira de imóveis.",
      "Use os dados do objeto crm que o backend injeta no contexto.",
      "Use matchedCrm como recorte prioritario quando existir, pois ele foi montado a partir da conversa atual no backend.",
      "Se o usuário citar um cliente, lead, empresa ou imóvel pelo nome, procure correspondências em crm.recentLeads e crm.imoveis antes de responder.",
      "Se o usuário citar cliente e imóvel na mesma pergunta, cruze contactName, company, imovel.title e imovel.id para encontrar o lead correto antes de concluir que há duplicidade.",
      "Para perguntas como 'qual o próximo passo do cliente X', use todas as informações cadastradas desse lead: status, imóvel, valor, origem, notes, nextFollowUp, createdAt e updatedAt.",
      "Quando o lead tiver imóvel relacionado, trate lead.imovel como a fonte principal do imóvel e use crm.imoveis apenas para complementar pelo id ou título.",
      "Ao priorizar leads, considere os status reais em crm.statuses, a ordem do funil, leadsCount por status, próximos follow-ups, valor, origem e updatedAt.",
      "Quando houver mais de uma correspondência possível para um nome, mencione a ambiguidade e peça uma confirmação curta.",
      "Quando um dado não existir em crm, diga que a informação não está cadastrada.",
      "Não invente leads, status, valores, contatos, datas ou imóveis.",
    ],
    answerStyle: {
      avoid: ["respostas genéricas", "scripts fixos quando há dados do cliente", "status ou clientes inventados"],
      prefer: ["próximo passo acionável", "justificativa baseada nos campos do CRM", "mensagens prontas apenas quando solicitadas"],
    },
    backendContextShape: {
      crm: {
        totals: "contadores de statuses, leads recentes, próximos contatos e imóveis",
        statuses: "etapas do funil ordenadas, com id, nome, cor, ordem e leadsCount",
        recentLeads: "até 50 leads recentes com status, dados de contato, valor, follow-up e imóvel relacionado",
        upcomingContacts: "até 15 leads com próximo follow-up futuro",
        imoveis: "até 30 imóveis recentes da carteira",
        unavailableData: "dados que ainda não existem no CRM",
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
          : "Não consegui falar com o assistente agora.";

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `${message} Confira se o microserviço Python está rodando em http://localhost:8000.`,
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
