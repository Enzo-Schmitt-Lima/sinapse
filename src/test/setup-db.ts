import "dotenv/config";

// Os testes que usam o banco rodam SÓ no branch "dev" do Neon, nunca em
// produção. Antes de qualquer conexão, TEST_DATABASE_URL vira DATABASE_URL
// (lida por src/lib/prisma.ts) e é comparada com as URLs de produção.

/** Endpoint do Neon: o 1º trecho do host ("ep-..."), sem o sufixo "-pooler". */
export function neonEndpoint(url: string): string | null {
  try {
    const host = new URL(url).hostname;
    return host.split(".")[0].replace(/-pooler$/, "") || null;
  } catch {
    return null;
  }
}

const testUrl = process.env.TEST_DATABASE_URL?.trim();
const productionUrls = [process.env.DATABASE_URL, process.env.DIRECT_URL]
  .map((url) => url?.trim())
  .filter((url): url is string => !!url);

const HINT = 'Crie o branch "dev" no Neon e coloque a connection string dele em TEST_DATABASE_URL no .env.';

if (!testUrl || testUrl.includes("COLE_AQUI")) {
  throw new Error(`TEST_DATABASE_URL não está definida. ${HINT}`);
}
if (productionUrls.includes(testUrl)) {
  throw new Error(`TEST_DATABASE_URL é igual a uma URL de produção. Testes abortados. ${HINT}`);
}
const testEndpoint = neonEndpoint(testUrl);
if (!testEndpoint) {
  throw new Error(`TEST_DATABASE_URL não é uma URL válida. ${HINT}`);
}
if (productionUrls.some((url) => neonEndpoint(url) === testEndpoint)) {
  throw new Error(`TEST_DATABASE_URL aponta para o mesmo endpoint do Neon que produção. Testes abortados. ${HINT}`);
}

process.env.DATABASE_URL = testUrl;
