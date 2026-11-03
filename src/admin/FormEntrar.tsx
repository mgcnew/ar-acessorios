'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { LogoMark } from '../components/ui';
import { supabaseNavegador } from '../lib/supabase/navegador';

/** Login do painel: e-mail e senha pelo Supabase Auth. Não há cadastro: os acessos são criados pelo responsável. */
export function FormEntrar() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const entrar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const { error } = await supabaseNavegador().auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error) {
      // Mesma mensagem para e-mail inexistente e senha errada: não revela quais e-mails têm acesso.
      setErro(error.code === 'invalid_credentials' ? 'E-mail ou senha incorretos.' : 'Não foi possível entrar agora. Tente de novo em instantes.');
      setEnviando(false);
      return;
    }
    router.replace('/admin');
    router.refresh();
  };

  return (
    <div className="adm adm-login">
      <main className="login card">
        <div className="brand">
          <LogoMark />
          <small>Painel</small>
        </div>
        <h1>Entrar</h1>
        <p className="note">Acesso restrito a quem administra a loja.</p>
        <form onSubmit={entrar} noValidate={false}>
          <div className="lf">
            <label htmlFor="adm-email">E-mail</label>
            <input
              id="adm-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby={erro ? 'adm-erro' : undefined}
            />
          </div>
          <div className="lf">
            <label htmlFor="adm-senha">Senha</label>
            <input
              id="adm-senha"
              type="password"
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              aria-describedby={erro ? 'adm-erro' : undefined}
            />
          </div>
          <p id="adm-erro" className="err" role="alert" hidden={!erro}>
            {erro}
          </p>
          <button className="btn lbtn" type="submit" disabled={enviando || !email || !senha}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </main>
    </div>
  );
}
