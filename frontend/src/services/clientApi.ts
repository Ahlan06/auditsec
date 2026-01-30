import axios, { type InternalAxiosRequestConfig } from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Client namespace API (SQLite-backed minimal backend)
// NOTE: Auth + Projects are kept on the same DB to keep user IDs consistent.
const apiClient = axios.create({ baseURL: `${BASE}/client`, timeout: 20000 });

const attachToken = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('client_token');
  if (token) {
    config.headers = config.headers ?? ({} as any);
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
};

apiClient.interceptors.request.use(attachToken);

export type ClientAuthResponse = {
  token: string;
  user?: unknown;
};

export type ClientProject = Record<string, unknown>;

export const clientAuth = {
  async register(email: string, password: string): Promise<ClientAuthResponse> {
    const { data } = await apiClient.post<ClientAuthResponse>('/auth/register', { email, password });
    localStorage.setItem('client_token', data.token);
    return data;
  },
  async login(email: string, password: string): Promise<ClientAuthResponse> {
    const { data } = await apiClient.post<ClientAuthResponse>('/auth/login', { email, password });
    localStorage.setItem('client_token', data.token);
    return data;
  },
  async forgotPassword(email: string): Promise<unknown> {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data;
  },
  async resetPassword(token: string, newPassword: string): Promise<unknown> {
    const { data } = await apiClient.post('/auth/reset-password', { token, newPassword });
    return data;
  },
  logout(): void {
    localStorage.removeItem('client_token');
  },
};

export const clientProjects = {
  async list(): Promise<ClientProject[]> {
    const { data } = await apiClient.get<{ projects: ClientProject[] }>('/projects');
    return data.projects;
  },
  async create(payload: ClientProject): Promise<ClientProject> {
    const { data } = await apiClient.post<{ project: ClientProject }>('/projects', payload);
    return data.project;
  },
  async update(id: string | number, payload: ClientProject): Promise<ClientProject> {
    const { data } = await apiClient.put<{ project: ClientProject }>(`/projects/${id}`, payload);
    return data.project;
  },
  async remove(id: string | number): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },
  async run(id: string | number): Promise<ClientProject> {
    const { data } = await apiClient.post<{ project: ClientProject }>(`/projects/${id}/run`);
    return data.project;
  },
};

export type ClientAudit = Record<string, unknown>;

export type ClientAuditRunEnqueueResponse = {
  ok: true;
  jobId: string;
  queue: string;
  auditId: number;
};

export type ClientAuditStatusResponse = {
  auditId: number;
  status: string;
  mode: string;
  target: string;
  createdAt?: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  summary?: unknown;
  errorsCount?: number;
  errorText?: string | null;
  aiRiskSummary?: {
    overallPriority: 'P0' | 'P1' | 'P2' | 'P3';
    countsByPriority: Record<string, number>;
  } | null;
};

export const clientAudits = {
  async list(): Promise<ClientAudit[]> {
    const { data } = await apiClient.get<{ audits: ClientAudit[] }>('/audits');
    return data.audits;
  },
  async get(id: string | number): Promise<ClientAudit> {
    const { data } = await apiClient.get<{ audit: ClientAudit }>(`/audits/${id}`);
    return data.audit;
  },
  async status(id: string | number): Promise<ClientAuditStatusResponse> {
    const { data } = await apiClient.get<ClientAuditStatusResponse>(`/audits/${id}/status`);
    return data;
  },
  async create(target: string, mode?: 'passive' | 'active'): Promise<ClientAudit> {
    const { data } = await apiClient.post<{ audit: ClientAudit }>('/audits', { target, mode });
    return data.audit;
  },
  async run(id: string | number): Promise<unknown> {
    const { data } = await apiClient.post<ClientAuditRunEnqueueResponse>(`/audits/${id}/run`);
    return data;
  },
};

export type AiConversation = {
  id: number;
  title?: string;
  created_at?: string;
  pinned?: number;
  pinned_at?: string | null;
};
export type AiMessage = { role: 'user' | 'assistant' | 'system' | 'tool'; content: string; created_at?: string };

export type AgentApproval = {
  id: number;
  status: string;
  action_type: string;
  action_payload?: unknown;
  created_at?: string;
  expires_at?: string;
};

export type AiAttachment = {
  id: number;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  created_at?: string;
};

export const clientAi = {
  async listConversations(): Promise<AiConversation[]> {
    const { data } = await apiClient.get<{ conversations: AiConversation[] }>('/ai/conversations');
    return data.conversations;
  },
  async createConversation(title?: string): Promise<AiConversation> {
    const { data } = await apiClient.post<{ conversation: AiConversation }>('/ai/conversations', { title });
    return data.conversation;
  },
  async renameConversation(conversationId: number, title: string): Promise<AiConversation> {
    const { data } = await apiClient.put<{ conversation: AiConversation }>(`/ai/conversations/${conversationId}`, { title });
    return data.conversation;
  },
  async setConversationPinned(conversationId: number, pinned: boolean): Promise<AiConversation> {
    const { data } = await apiClient.put<{ conversation: AiConversation }>(`/ai/conversations/${conversationId}/pin`, { pinned });
    return data.conversation;
  },
  async deleteConversation(conversationId: number): Promise<void> {
    await apiClient.delete(`/ai/conversations/${conversationId}`);
  },
  async listMessages(conversationId: number): Promise<AiMessage[]> {
    const { data } = await apiClient.get<{ messages: AiMessage[] }>(`/ai/conversations/${conversationId}/messages`);
    return data.messages;
  },
  async uploadAttachments(conversationId: number, files: File[]): Promise<AiAttachment[]> {
    const form = new FormData();
    for (const f of files) form.append('files', f);
    const { data } = await apiClient.post<{ attachments: AiAttachment[] }>(
      `/ai/conversations/${conversationId}/attachments`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data.attachments;
  },
  async sendMessage(conversationId: number, message: string): Promise<{ reply: string; pendingApprovals?: AgentApproval[] }> {
    const { data } = await apiClient.post(`/ai/conversations/${conversationId}/messages`, { message });
    return data;
  },
  async sendMessageWithAttachments(
    conversationId: number,
    message: string,
    attachmentIds: number[]
  ): Promise<{ reply: string; pendingApprovals?: AgentApproval[] }> {
    const { data } = await apiClient.post(`/ai/conversations/${conversationId}/messages`, { message, attachmentIds });
    return data;
  },
  async listApprovals(status: string = 'pending'): Promise<AgentApproval[]> {
    const { data } = await apiClient.get<{ approvals: AgentApproval[] }>(`/ai/approvals?status=${encodeURIComponent(status)}`);
    return data.approvals;
  },
  async decideApproval(id: number, allow: boolean): Promise<{ ok: boolean; status: string }> {
    const { data } = await apiClient.post(`/ai/approvals/${id}/decide`, { allow });
    return data;
  },
  async executeApproval(id: number): Promise<{ ok: boolean; runId: number; result: unknown }> {
    const { data } = await apiClient.post(`/ai/approvals/${id}/execute`);
    return data;
  },
};
