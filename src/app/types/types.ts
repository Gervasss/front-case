import type { AxiosRequestConfig } from "axios";

export type User = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  accessToken: string;
  user: User;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type Status = {
  id: string;
  name: string;
  color: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    leads: number;
  };
};

export type CreateStatusPayload = {
  name: string;
  color?: string;
  order?: number;
};

export type UpdateStatusPayload = Partial<CreateStatusPayload>;

export type Lead = {
  id: string;
  company: string;
  contactName: string;
  email?: string | null;
  phone?: string | null;
  value?: number | null;
  source?: string | null;
  notes?: string | null;
  nextFollowUp?: string | null;
  createdAt: string;
  updatedAt: string;
  ownerId?: string;
  statusId: string;
  imovelId?: string | null;
  status?: Status;
  imovel?: Imovel | null;
};

export type CreateLeadPayload = {
  company: string;
  contactName: string;
  email?: string;
  phone?: string;
  value?: number;
  source?: string;
  notes?: string;
  nextFollowUp?: string;
  statusId: string;
  imovelId?: string;
};

export type UpdateLeadPayload = Partial<CreateLeadPayload>;

export type ListLeadsParams = {
  search?: string;
  statusId?: string;
};

export type MoveLeadPayload = {
  statusId: string;
};

export type KanbanColumn = Pick<Status, "id" | "name" | "color" | "order"> & {
  leads: Lead[];
};

export type Imovel = {
  id: string;
  title?: string;
  type?: string;
  propertyType?: string;
  address?: string;
  city?: string;
  state?: string;
  value?: number;
  price?: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaM2?: number | null;
  notes?: string | null;
  titulo?: string;
  tipo?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  valor?: number;
  quartos?: number | null;
  banheiros?: number | null;
  observacoes?: string | null;
  ownerId?: string;
  leadId?: string | null;
  lead?: Lead | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateImovelPayload = {
  title: string;
  type: string;
  address: string;
  city: string;
  state: string;
  value: number;
  bedrooms?: number;
  bathrooms?: number;
  areaM2?: number;
  notes?: string;
};

export type UpdateImovelPayload = Partial<CreateImovelPayload>;

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatPayload = {
  messages: ChatMessage[];
  context?: string;
};

export type ChatResponse = {
  reply: string;
  suggestions?: string[];
  provider?: string;
};

export type RequestOptions = Omit<AxiosRequestConfig, "baseURL" | "data" | "url"> & {
  body?: unknown;
  token?: string | null;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}
