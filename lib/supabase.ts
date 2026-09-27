import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigError =
  !url || !anonKey
    ? "Faltam NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY. Confira o arquivo .env.local e reinicie o servidor."
    : null;

export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        db: { schema: "radar" },
      })
    : null;
