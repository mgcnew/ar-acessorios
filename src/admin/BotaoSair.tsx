'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabaseNavegador } from '../lib/supabase/navegador';

export function BotaoSair({ className }: { className?: string }) {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);
  const [erro, setErro] = useState(false);

  const sair = async () => {
    setSaindo(true);
    setErro(false);
    const { error } = await supabaseNavegador().auth.signOut();
    if (error) {
      // Se a saída falhar, a sessão continua valendo: não finja que saiu.
      setErro(true);
      setSaindo(false);
      return;
    }
    router.replace('/admin/entrar');
    router.refresh();
  };

  return (
    <>
      <button className={className} onClick={sair} disabled={saindo}>
        {saindo ? 'Saindo…' : 'Sair'}
      </button>
      {erro && (
        <p className="note" role="alert">
          Não foi possível sair. Tente de novo.
        </p>
      )}
    </>
  );
}
