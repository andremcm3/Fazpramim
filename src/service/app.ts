interface apiPost {
    username: string;
    password: string;
}

export async function apiPost(url: string, data: apiPost) {
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