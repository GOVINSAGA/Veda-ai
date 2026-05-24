const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  getAssignments: () => request<{ assignments: any[] }>('/assignments'),

  getAssignment: (id: string) => request<{ assignment: any }>(`/assignments/${id}`),

  createAssignment: (formData: FormData) =>
    request<{ assignment: any }>('/assignments', { method: 'POST', body: formData }),

  deleteAssignment: (id: string) =>
    request<{ message: string }>(`/assignments/${id}`, { method: 'DELETE' }),

  regenerateAssignment: (id: string) =>
    request<{ message: string }>(`/assignments/${id}/regenerate`, { method: 'POST' }),

  getJobStatus: (id: string) =>
    request<{ status: string }>(`/assignments/${id}/status`),

  getPdfUrl: (id: string) => `${API_BASE}/assignments/${id}/pdf`,
};
