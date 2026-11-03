// Tipos e regras de validação do painel de estoque, usados no navegador e no servidor.
// A regra que vale é a do banco (registrar_*): aqui só evitamos enviar o que ele recusaria.

export type TipoMovimento = 'entrada' | 'ajuste' | 'contagem';

export interface LinhaEstoque {
  variantId: string;
  productName: string;
  /** Kit composto não tem saldo próprio (CAT-DEC-019). */
  kitComposto: boolean;
  sku: string;
  atributos: string;
  /** null para kit composto. */
  saldo: number | null;
  reservado: number | null;
  disponivel: number;
  minimo: number;
  abaixoDoMinimo: boolean;
}

export interface Movimento {
  id: number;
  data: string;
  tipo: string;
  delta: number;
  saldoDepois: number;
  motivo: string;
  /** 'voce', 'outro' ou 'sistema' (sem operador, ex.: carga inicial). */
  quem: 'voce' | 'outro' | 'sistema';
}

export type Resultado<T = undefined> = { ok: true; dados: T } | { ok: false; erro: string; semSessao?: boolean };

export const TIPOS: { id: TipoMovimento; rotulo: string; concluido: string; campo: string; ajuda: string }[] = [
  { id: 'entrada', rotulo: 'Entrada', concluido: 'Entrada registrada', campo: 'Quantidade que chegou', ajuda: 'Mercadoria recebida. Soma ao saldo.' },
  { id: 'ajuste', rotulo: 'Ajuste', concluido: 'Ajuste registrado', campo: 'Diferença', ajuda: 'Avaria ou correção. Use número negativo para retirar (ex.: −2).' },
  { id: 'contagem', rotulo: 'Contagem', concluido: 'Contagem registrada', campo: 'Quantidade contada', ajuda: 'Contagem física. O saldo passa a ser o número contado.' },
];

export const MOTIVO_MAX = 300;
const QTD_MAX = 100000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const ehUuid = (s: unknown): s is string => typeof s === 'string' && UUID.test(s);

/** Aceita "−2" (sinal de menos tipográfico) além de "-2". Devolve null se não for inteiro. */
export function lerInteiro(texto: string): number | null {
  const t = texto.trim().replace(/[−–]/g, '-');
  return /^-?\d+$/.test(t) ? Number(t) : null;
}

/** Confere tipo, número e motivo. Devolve a mensagem de erro, ou null se estiver tudo certo. */
export function validarMovimento(tipo: unknown, quantidade: unknown, motivo: unknown): string | null {
  if (tipo !== 'entrada' && tipo !== 'ajuste' && tipo !== 'contagem') return 'Escolha entrada, ajuste ou contagem.';
  if (typeof quantidade !== 'number' || !Number.isInteger(quantidade)) return 'Informe um número inteiro.';
  if (Math.abs(quantidade) > QTD_MAX) return `O número não pode passar de ${QTD_MAX.toLocaleString('pt-BR')}.`;
  if (tipo === 'entrada' && quantidade <= 0) return 'A entrada precisa ser maior que zero.';
  if (tipo === 'ajuste' && quantidade === 0) return 'O ajuste precisa somar ou retirar ao menos uma unidade.';
  if (tipo === 'contagem' && quantidade < 0) return 'A quantidade contada não pode ser negativa.';
  if (typeof motivo !== 'string' || motivo.trim() === '') return 'Informe o motivo (CAT-DEC-012).';
  if (motivo.trim().length > MOTIVO_MAX) return `O motivo pode ter até ${MOTIVO_MAX} caracteres.`;
  return null;
}

/** Saldo previsto depois da movimentação, só para mostrar antes de confirmar. */
export function saldoPrevisto(tipo: TipoMovimento, saldo: number, quantidade: number): number {
  return tipo === 'contagem' ? quantidade : saldo + quantidade;
}

/** Atributos da variação em texto ("Ouro 18k · P"), na ordem da D-011. */
export function textoAtributos(attrs: unknown): string {
  if (!attrs || typeof attrs !== 'object') return '';
  const a = attrs as Record<string, unknown>;
  return ['banho', 'tamanho', 'material', 'cor', 'modelo']
    .map((k) => a[k])
    .filter((v): v is string => typeof v === 'string' && v !== '')
    .join(' · ');
}
