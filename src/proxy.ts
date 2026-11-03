import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './lib/database.types';
import { supabaseEnv } from './lib/supabase/env';

const LOGIN = '/admin/entrar';

/**
 * Painel: renova a sessão do Supabase e faz a checagem otimista de login.
 * Quem não tem sessão vai para o login; quem já tem e abre o login volta ao painel.
 * A decisão de verdade (ser admin) é da página /admin, que consulta is_admin() no banco.
 */
export async function proxy(request: NextRequest) {
  const { url, key } = supabaseEnv();
  let response = NextResponse.next({ request });
  let cacheHeaders: Record<string, string> = {};

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(lista, headers) {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        // Respostas que gravam cookies de sessão não podem ficar em cache.
        cacheHeaders = { ...cacheHeaders, ...headers };
        Object.entries(cacheHeaders).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  // getUser() confere o login no servidor do Supabase; não confie só no cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const naTelaDeLogin = request.nextUrl.pathname === LOGIN;
  const destino = !user && !naTelaDeLogin ? LOGIN : user && naTelaDeLogin ? '/admin' : null;
  if (!destino) return response;

  const redirect = NextResponse.redirect(new URL(destino, request.url));
  // Mantém os cookies e cabeçalhos que a renovação da sessão possa ter definido.
  response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
  Object.entries(cacheHeaders).forEach(([k, v]) => redirect.headers.set(k, v));
  return redirect;
}

export const config = { matcher: ['/admin', '/admin/:path*'] };
