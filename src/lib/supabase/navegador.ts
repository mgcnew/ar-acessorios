import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../database.types';
import { supabaseEnv } from './env';

/** Cliente do navegador, usado no login e no logout do painel. A sessão fica em cookies, que o servidor também lê. */
export function supabaseNavegador() {
  const { url, key } = supabaseEnv();
  return createBrowserClient<Database>(url, key);
}
