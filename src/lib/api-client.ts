// Leituras das notas pelas rotas GET (src/app/api/notes). As chaves do cache
// incluem o userId da sessão, para dados de uma conta nunca aparecerem em outra.

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** GET com JSON. 404 vira `null`; 401 manda para o login. */
export async function fetchJson<T>(url: string): Promise<T | null> {
  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
  } catch {
    throw new ApiError("Sem conexão com o servidor.", 0);
  }

  if (response.status === 404) return null;
  if (response.status === 401) {
    // Navegação completa de propósito: a sessão acabou, nada do cache deve ficar.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/login");
    throw new ApiError("Sua sessão expirou. Entre novamente.", 401);
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(body?.error ?? "Algo deu errado. Tente novamente.", response.status);
  }
  return (await response.json()) as T;
}

export const noteKeys = {
  list: (userId: string) => ["notes", userId] as const,
  detail: (userId: string, id: string) => ["note", userId, id] as const,
  backlinksAll: (userId: string) => ["backlinks", userId] as const,
  backlinks: (userId: string, id: string) => ["backlinks", userId, id] as const,
  search: (userId: string, query: string) => ["search", userId, query] as const,
};
