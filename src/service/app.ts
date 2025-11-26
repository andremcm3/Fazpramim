interface LoginPayload {
  username: string;
  password: string;
}

export async function apiPost(url: string, data: LoginPayload) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Erro na requisição");
  }

  return res.json();
}

async function apiPostWithToken(url: string, token: string) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`,
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (json as any)?.message || (json as any)?.detail || "Erro na requisição";
    throw new Error(message);
  }
  return json;
}

export async function acceptServiceRequest(id: number, token: string) {
  return apiPostWithToken(`http://127.0.0.1:8000/api/accounts/requests/${id}/accept/`, token);
}

export async function rejectServiceRequest(id: number, token: string) {
  return apiPostWithToken(`http://127.0.0.1:8000/api/accounts/requests/${id}/reject/`, token);
}

// Chat functions
export async function getChatMessages(requestId: number, token: string) {
  const res = await fetch(`http://127.0.0.1:8000/api/accounts/requests/${requestId}/chat/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`,
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (json as any)?.message || (json as any)?.detail || "Erro ao buscar mensagens";
    throw new Error(message);
  }
  return json;
}

export async function sendChatMessage(requestId: number, content: string, token: string) {
  const res = await fetch(`http://127.0.0.1:8000/api/accounts/requests/${requestId}/chat/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (json as any)?.message || (json as any)?.detail || "Erro ao enviar mensagem";
    throw new Error(message);
  }
  return json;
}

// Complete service function
export async function completeServiceRequest(requestId: number, token: string) {
  return apiPostWithToken(`http://127.0.0.1:8000/api/accounts/requests/${requestId}/complete/`, token);
}

// Review (Avaliação) - supports optional photo via multipart/form-data
export async function submitServiceReview(
  requestId: number,
  token: string,
  payload: { rating: number; comment?: string; photo?: File | null }
) {
  const formData = new FormData();
  formData.append("rating", String(payload.rating));
  if (payload.comment) formData.append("comment", payload.comment);
  if (payload.photo) formData.append("photo", payload.photo);

  const res = await fetch(`http://127.0.0.1:8000/api/accounts/requests/${requestId}/review/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
    },
    body: formData,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (json as any)?.message || (json as any)?.detail || "Erro ao enviar avaliação";
    throw new Error(message);
  }
  return json;
}

// Provider details (for avatar and rating)
export async function getProviderDetails(providerId: number, token: string) {
  const res = await fetch(`http://127.0.0.1:8000/api/accounts/providers/${providerId}/`, {
    method: "GET",
    headers: {
      "Authorization": `Token ${token}`,
      "Content-Type": "application/json",
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (json as any)?.message || (json as any)?.detail || "Erro ao obter dados do prestador";
    throw new Error(message);
  }
  return json;
}