import 'server-only';
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';
import { textoAtributos, type LinhaEstoque } from './estoque';

type Db = SupabaseClient<Database>;

/** Estoque de todas as variações para o painel. painel_estoque() recusa quem não é admin. */
export async function carregarEstoque(supabase: Db): Promise<LinhaEstoque[]> {
  const { data, error } = await supabase.rpc('painel_estoque');
  if (error) throw new Error(`Não foi possível carregar o estoque: ${error.message}`);
  return data.map((l) => {
    const kitComposto = l.product_kind === 'kit_composto';
    return {
      variantId: l.variant_id,
      productName: l.product_name,
      kitComposto,
      sku: l.sku,
      atributos: textoAtributos(l.attributes),
      // Kit composto não tem linha de saldo: o banco devolve vazio (CAT-DEC-019).
      saldo: kitComposto ? null : (l.on_hand ?? 0),
      reservado: kitComposto ? null : (l.reserved ?? 0),
      disponivel: l.disponivel ?? 0,
      minimo: l.min_stock,
      abaixoDoMinimo: !!l.abaixo_do_minimo,
    };
  });
}

// Mensagens que as funções do banco levantam de propósito (migração ..._funcoes.sql). Só essas vão para a tela.
const MENSAGENS_DO_BANCO = [
  'Acesso restrito ao painel',
  'Informe o motivo',
  'Kit composto não tem estoque próprio',
  'Variação não encontrada',
  'Estoque insuficiente',
  'A quantidade de entrada',
  'O ajuste precisa',
  'A quantidade contada',
];

/** Traduz o erro do banco para a tela, sem mostrar detalhes internos. */
export function mensagemDoErro(error: PostgrestError): { erro: string; semSessao?: boolean } {
  if (error.code === 'PGRST301' || error.code === 'PGRST303' || /jwt/i.test(error.message)) {
    return { erro: 'Sua sessão expirou. Entre de novo.', semSessao: true };
  }
  if (MENSAGENS_DO_BANCO.some((m) => error.message.startsWith(m))) return { erro: `${error.message}.` };
  console.error('Erro inesperado do banco no painel de estoque', { code: error.code, message: error.message });
  return { erro: 'O banco recusou a operação e nada foi alterado. Tente de novo; se continuar, avise o suporte.' };
}
