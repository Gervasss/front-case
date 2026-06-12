
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";


import {
  ApiError,
  AuthResponse,
  ChatPayload,
  CreateImovelPayload,
  CreateLeadPayload,
  CreateStatusPayload,
  Imovel,
  KanbanColumn,
  Lead,
  ListLeadsParams,
  LoginPayload,
  MoveLeadPayload,
  RegisterPayload,
  RequestOptions,
  Status,
  UpdateLeadPayload,
  UpdateImovelPayload,
  UpdateStatusPayload,
  User,
} from "../types/types";

export type {
  AuthResponse,
  ChatMessage,
  ChatPayload,
  ChatRole,
  CreateImovelPayload,
  CreateLeadPayload,
  CreateStatusPayload,
  Imovel,
  KanbanColumn,
  Lead,
  ListLeadsParams,
  LoginPayload,
  MoveLeadPayload,
  RegisterPayload,
  RequestOptions,
  Status,
  UpdateLeadPayload,
  UpdateImovelPayload,
  UpdateStatusPayload,
  User,
} from "../types/types";

// Reexporta o erro customizado usado pelas chamadas da API.
export { ApiError } from "../types/types";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
const AUTH_TOKEN_KEY = "front-case:auth-token";
const isBrowser = () => typeof window !== "undefined";

// Instancia principal do Axios usada por todos os endpoints.
const http = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor executado antes de cada request.
http.interceptors.request.use((config) => {
  // Header interno usado quando uma chamada precisa ignorar autenticacao.
  const skipAuth = config.headers.get("x-skip-auth");

  // Token explicito da chamada ou token salvo no navegador.
  const token = config.headers.get("x-auth-token") ?? getAuthToken();

  // Remove headers internos antes de enviar a request real.
  config.headers.delete("x-skip-auth");
  config.headers.delete("x-auth-token");

  // Injeta o Bearer token quando a chamada deve ser autenticada.
  if (!skipAuth && token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});


export function getAuthToken() {
  if (!isBrowser()) {
    return null;
  }
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (isBrowser()) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}


export function clearAuthToken() {
  if (isBrowser()) {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

// Wrapper generico para padronizar requests, responses e erros.
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  // Separa body/token do restante da configuracao aceita pelo Axios.
  const { body, headers, token, ...requestOptions } = options;

  // Monta a configuracao final que sera enviada para a instancia http.
  const config: AxiosRequestConfig = {
    url: path,
    data: body,
    headers: {
      // Header interno para chamadas explicitamente sem auth.
      ...(token === null ? { "x-skip-auth": "true" } : {}),

      // Header interno para sobrescrever o token salvo no localStorage.
      ...(token ? { "x-auth-token": token } : {}),

      // Headers extras enviados por quem chamou o request.
      ...headers,
    },
    ...requestOptions,
  };

  try {
    // Executa a request tipada e devolve apenas o corpo da resposta.
    const response: AxiosResponse<T> = await http.request<T>(config);
    return response.data;
  } catch (error) {
    // Normaliza erros vindos do Axios para o ApiError da aplicacao.
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status ?? 500;
      const data = axiosError.response?.data ?? null;

      // Usa a mensagem da API quando ela existir.
      const message =
        typeof data === "object" && data !== null && "message" in data
          ? String((data as { message: unknown }).message)
          : axiosError.request && !axiosError.response
            ? `Nao foi possivel conectar com a API em ${API_URL}. Confira se o backend esta rodando e se NEXT_PUBLIC_API_URL esta correto.`
            : "Erro ao comunicar com a API.";

      // Lanca um erro consistente para a UI tratar.
      throw new ApiError(status, message, data);
    }

    // Preserva erros inesperados que nao vieram do Axios.
    throw error;
  }
}

// Monta query string a partir de filtros opcionais.
function buildQuery(params?: Record<string, string | undefined>) {
  // URLSearchParams evita concatenacao manual de parametros.
  const query = new URLSearchParams();

  // Adiciona apenas parametros com valor.
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  // Retorna a query pronta ou string vazia quando nao houver filtros.
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

function toImovelApiPayload(payload: CreateImovelPayload | UpdateImovelPayload) {
  return {
    title: payload.title,
    propertyType: payload.type,
    address: payload.address,
    city: payload.city,
    state: payload.state,
    price: payload.value,
    bedrooms: payload.bedrooms,
    bathrooms: payload.bathrooms,
    areaM2: payload.areaM2,
    notes: payload.notes,
  };
}

// Objeto que agrupa todos os endpoints da aplicacao.
export const api = {
  // Auth
  auth: {
    // Register user
    async register(payload: RegisterPayload) {
      const response = await request<AuthResponse>("/auth/register", {
        method: "POST",
        body: payload,
        token: null,
      });
      setAuthToken(response.accessToken);
      return response;
    },

    // Login user
    async login(payload: LoginPayload) {
      const response = await request<AuthResponse>("/auth/login", {
        method: "POST",
        body: payload,
        token: null,
      });
      setAuthToken(response.accessToken);
      return response;
    },

    // Get logged user
    me(token?: string) {
      return request<User>("/auth/me", { token });
    },

    // Logout user
    logout() {
      clearAuthToken();
    },
  },

  // Statuses
  statuses: {
    // List statuses
    list(token?: string) {
      return request<Status[]>("/statuses", { token });
    },

    // Create status
    create(payload: CreateStatusPayload, token?: string) {
      return request<Status>("/statuses", {
        method: "POST",
        body: payload,
        token,
      });
    },

    // Update status
    update(id: string, payload: UpdateStatusPayload, token?: string) {
      return request<Status>(`/statuses/${id}`, {
        method: "PATCH",
        body: payload,
        token,
      });
    },

    // Remove status
    remove(id: string, token?: string) {
      return request<Status>(`/statuses/${id}`, {
        method: "DELETE",
        token,
      });
    },
  },

  // Imoveis
  imoveis: {
    // List imoveis
    list(token?: string) {
      return request<Imovel[]>("/imoveis", { token });
    },

    // Imovel by id
    get(id: string, token?: string) {
      return request<Imovel>(`/imoveis/${id}`, { token });
    },

    // Create imovel
    create(payload: CreateImovelPayload, token?: string) {
      return request<Imovel>("/imoveis", {
        method: "POST",
        body: toImovelApiPayload(payload),
        token,
      });
    },

    // Update imovel
    update(id: string, payload: UpdateImovelPayload, token?: string) {
      return request<Imovel>(`/imoveis/${id}`, {
        method: "PATCH",
        body: toImovelApiPayload(payload),
        token,
      });
    },

    // Remove imovel
    remove(id: string, token?: string) {
      return request<Imovel>(`/imoveis/${id}`, {
        method: "DELETE",
        token,
      });
    },
  },

  // Leads
  leads: {
    // List leads
    list(params?: ListLeadsParams, token?: string) {
      return request<Lead[]>(`/leads${buildQuery(params)}`, { token });
    },

    // Kanban leads
    kanban(token?: string) {
      return request<KanbanColumn[]>("/leads/kanban", { token });
    },

    // Lead by id
    get(id: string, token?: string) {
      return request<Lead>(`/leads/${id}`, { token });
    },

    // Create lead
    create(payload: CreateLeadPayload, token?: string) {
      return request<Lead>("/leads", {
        method: "POST",
        body: payload,
        token,
      });
    },

    // Update lead
    update(id: string, payload: UpdateLeadPayload, token?: string) {
      return request<Lead>(`/leads/${id}`, {
        method: "PATCH",
        body: payload,
        token,
      });
    },

    // Move lead
    move(id: string, payload: MoveLeadPayload, token?: string) {
      return request<Lead>(`/leads/${id}/move`, {
        method: "PATCH",
        body: payload,
        token,
      });
    },

    // Remove lead
    remove(id: string, token?: string) {
      return request<Lead>(`/leads/${id}`, {
        method: "DELETE",
        token,
      });
    },
  },

  // AI
  ai: {
    // Chat completion
    chat<TResponse = unknown>(payload: ChatPayload, token?: string) {
      return request<TResponse>("/ai/chat", {
        method: "POST",
        body: payload,
        token,
      });
    },
  },
};

export { http };

export default api;
