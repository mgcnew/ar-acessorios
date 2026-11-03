import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '../database.types';
import { supabaseEnv } from './env';

/**
 * Cliente do servidor com a sessão de quem fez a requisição (cookies).
 * Crie um novo a cada requisição. A renovação da sessão acontece no proxy (src/proxy.ts),
 * porque páginas e layouts não conseguem gravar cookies.
 */
export async function supabaseServidor() {
  const { url, key } = supabaseEnv();
  const jar = await cookies();
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll(lista) {
        try {
          lista.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {
          // Chamado a partir de uma página: o proxy já renova a sessão, então pode ignorar.
        }
      },
    },
  });
}
