export interface FriendlyError {
  title: string;
  description: string;
}

// Nomes de erro do IndexedDB/Dexie que indicam armazenamento indisponível
// (navegador sem suporte, modo privado antigo, cookies/dados bloqueados).
const UNAVAILABLE_ERRORS = new Set([
  "MissingAPIError",
  "OpenFailedError",
  "DatabaseClosedError",
  "InvalidStateError",
  "SecurityError",
  "UnknownError",
]);

interface ErrorLink {
  name: string;
  message: string;
}

/** Percorre o erro e os que ele embrulha (Dexie guarda o original em `inner`). */
function errorChain(error: unknown): ErrorLink[] {
  const chain: ErrorLink[] = [];
  let current: unknown = error;
  while (current && typeof current === "object" && chain.length < 5) {
    const { name, message, inner } = current as { name?: unknown; message?: unknown; inner?: unknown };
    chain.push({
      name: typeof name === "string" ? name : "Error",
      message: typeof message === "string" ? message : "",
    });
    current = inner;
  }
  if (chain.length === 0 && error !== undefined) chain.push({ name: typeof error, message: String(error) });
  return chain;
}

function errorNames(error: unknown): string[] {
  return errorChain(error).map((link) => link.name);
}

/**
 * Texto técnico para diagnóstico (mostrado recolhido na tela de erro),
 * para o usuário poder mandar um print quando algo falhar.
 */
export function formatErrorDetails(error: unknown): string {
  const lines = errorChain(error).map(({ name, message }) => (message ? `${name}: ${message}` : name));

  const { digest, stack } = (error ?? {}) as { digest?: unknown; stack?: unknown };
  if (typeof digest === "string") lines.push(`digest: ${digest}`);
  if (typeof stack === "string") {
    const frames = stack
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !lines.some((existing) => existing.endsWith(line)))
      .slice(0, 6);
    if (frames.length > 0) lines.push("", ...frames);
  }
  if (typeof navigator !== "undefined") lines.push("", navigator.userAgent);

  return lines.join("\n");
}

export function describeDatabaseError(error: unknown): FriendlyError {
  const names = errorNames(error);

  if (names.includes("QuotaExceededError")) {
    return {
      title: "Sem espaço para salvar",
      description:
        "O navegador não tem mais espaço disponível para o Sinapse. Libere espaço no dispositivo ou exporte e apague notas antigas.",
    };
  }

  if (names.some((name) => UNAVAILABLE_ERRORS.has(name))) {
    return {
      title: "Não foi possível acessar o armazenamento",
      description:
        "O Sinapse guarda suas notas no próprio navegador, mas ele bloqueou esse acesso. Isso costuma acontecer em janelas anônimas/privadas ou quando os dados de sites estão bloqueados. Abra o Sinapse em uma janela normal ou permita o armazenamento para este site.",
    };
  }

  return {
    title: "Algo deu errado",
    description: "Ocorreu um erro inesperado. Tente novamente; se continuar, recarregue a página.",
  };
}
