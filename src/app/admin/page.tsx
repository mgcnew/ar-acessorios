import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Admin } from '../../admin/Admin';
import { BotaoSair } from '../../admin/BotaoSair';
import { supabaseServidor } from '../../lib/supabase/servidor';

export const metadata: Metadata = { title: 'Painel' };

export default async function AdminPage() {
  const supabase = await supabaseServidor();

  // Checagem de verdade, no servidor: o proxy só faz um filtro rápido.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/entrar');

  // Estar logado não basta: só quem está em admin_members é admin (is_admin() no banco).
  const { data: ehAdmin, error } = await supabase.rpc('is_admin');
  if (error) throw new Error(`Não foi possível confirmar o acesso ao painel: ${error.message}`);

  if (!ehAdmin) {
    return (
      <div className="adm adm-login">
        <main className="login card">
          <h1>Acesso não autorizado</h1>
          <p className="note">
            A conta {user.email} não tem permissão para usar o painel. Entre com outra conta ou fale com quem administra a loja.
          </p>
          <BotaoSair className="btn lbtn" />
        </main>
      </div>
    );
  }

  return <Admin email={user.email ?? ''} />;
}
