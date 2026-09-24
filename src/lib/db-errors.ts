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

function errorNames(error: unknown): string[] {
  const names: string[] = [];
  let current: unknown = error;
  // Dexie embrulha o erro original em `inner`.
  while (current && typeof current === "object" && names.length < 5) {
    const { name, inner } = current as { name?: unknown; inner?: unknown };
    if (typeof name === "string") names.push(name);
    current = inner;
  }
  return names;
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
