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