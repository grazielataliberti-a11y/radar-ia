import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type CasoIa = {
  id: string;
  aluno: string;
  area: string;
  problema: string;
  solucao_ia: string;
  created_at: string;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

function mensagemEnv(): string | null {
  const faltando = [
    url ? null : "NEXT_PUBLIC_SUPABASE_URL",
    anonKey ? null : "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ].filter((nome): nome is string => nome !== null);

  if (faltando.length === 0) return null;

  return `Falta configurar ${faltando.join(" e ")} no arquivo .env.local (pasta radar-ia). Salve o arquivo e reinicie o servidor.`;
}

function iniciarCliente(): { client: SupabaseClient | null; erro: string | null } {
  const erroEnv = mensagemEnv();
  if (erroEnv) return { client: null, erro: erroEnv };

  try {
    return { client: createClient(url, anonKey), erro: null };
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Não foi possível iniciar o Supabase.";
    return { client: null, erro: mensagem };
  }
}

const iniciado = iniciarCliente();

export const supabase = iniciado.client;
export const supabaseEnvError = iniciado.erro;
