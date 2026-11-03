'use server';

import { refresh } from 'next/cache';
import { ehUuid, validarMovimento, type Movimento, type Resultado, type TipoMovimento } from '../../admin/estoque';
import { mensagemDoErro } from '../../admin/estoqueServidor';
import { supabaseServidor } from '../../lib/supabase/servidor';

// Ações do painel. Qualquer um pode chamá-las por POST direto, então cada uma confere a sessão aqui
// e o banco confere de novo se é admin (as funções registrar_* e a RLS do histórico).

const SEM_SESSAO = { ok: false as const, erro: 'Sua sessão expirou. Entre de novo.', semSessao: true };

/** Registra entrada, ajuste ou contagem. O banco trava o saldo e grava o histórico na mesma transação. */
export async function movimentarEstoque(entrada: {
  variantId: unknown;
  tipo: unknown;
  quantidade: unknown;
  motivo: unknown;
}): Promise<Resultado<{ saldo: number }>> {
  if (!ehUuid(entrada.variantId)) return { ok: false, erro: 'Variação inválida.' };
  const invalido = validarMovimento(entrada.tipo, entrada.quantidade, entrada.motivo);
  if (invalido) return { ok: false, erro: invalido };

  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return SEM_SESSAO;

  const variante = entrada.variantId;
  const qtd = entrada.quantidade as number;
  const motivo = (entrada.motivo as string).trim();
  const tipo = entrada.tipo as TipoMovimento;

  const { data, error } =
    tipo === 'entrada'
      ? await supabase.rpc('registrar_entrada', { p_variant_id: variante, p_quantidade: qtd, p_motivo: motivo })
      : tipo === 'ajuste'
        ? await supabase.rpc('registrar_ajuste', { p_variant_id: variante, p_diferenca: qtd, p_motivo: motivo })
        : await supabase.rpc('registrar_contagem', { p_variant_id: variante, p_contado: qtd, p_motivo: motivo });

  if (error) return { ok: false, ...mensagemDoErro(error) };

  // Recarrega a tela com o estoque novo.
  refresh();
  return { ok: true, dados: { saldo: data.on_hand } };
}

/** Últimas 50 movimentações de uma variação (só leitura; a RLS libera só para admin). */
export async function historicoEstoque(variantId: unknown): Promise<Resultado<Movimento[]>> {
  if (!ehUuid(variantId)) return { ok: false, erro: 'Variação inválida.' };

  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return SEM_SESSAO;

  const { data, error } = await supabase
    .from('inventory_movements')
    .select('id, created_at, type, on_hand_delta, on_hand_after, reason, actor_id')
    .eq('variant_id', variantId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(50);
  if (error) return { ok: false, ...mensagemDoErro(error) };

  return {
    ok: true,
    dados: data.map((m) => ({
      id: m.id,
      data: m.created_at,
      tipo: m.type,
      delta: m.on_hand_delta,
      saldoDepois: m.on_hand_after,
      motivo: m.reason,
      quem: m.actor_id === null ? 'sistema' : m.actor_id === user.id ? 'voce' : 'outro',
    })),
  };
}
