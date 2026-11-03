'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition, type FormEvent } from 'react';
import { historicoEstoque, movimentarEstoque } from '../app/admin/actions';
import { SearchIcon } from '../components/Icons';
import { norm } from '../data/catalog';
import { lerInteiro, MOTIVO_MAX, saldoPrevisto, TIPOS, validarMovimento, type LinhaEstoque, type Movimento, type TipoMovimento } from './estoque';

const TIPO_HISTORICO: Record<string, string> = {
  entrada: 'Entrada',
  ajuste: 'Ajuste',
  contagem: 'Contagem',
  reserva: 'Reserva',
  liberacao: 'Liberação',
  baixa: 'Baixa',
  reposicao: 'Reposição',
};
const QUEM: Record<Movimento['quem'], string> = { voce: 'Você', outro: 'Outro operador', sistema: 'Sistema' };

const dataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });
const comSinal = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');

function Situacao({ l }: { l: LinhaEstoque }) {
  if (l.disponivel <= 0) return <span className="tag t-bad">Esgotado</span>;
  if (l.abaixoDoMinimo) return <span className="tag t-warn">Abaixo do mínimo</span>;
  return <span className="tag t-ok">Ok</span>;
}

/** Abre um <dialog> como modal quando `aberto` é verdadeiro (foco preso e Esc fecham pelo navegador). */
function useModal(aberto: boolean, aoFechar: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    d.addEventListener('close', aoFechar);
    return () => d.removeEventListener('close', aoFechar);
  }, [aoFechar]);
  return ref;
}

export function Estoque({ linhas }: { linhas: LinhaEstoque[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [soBaixo, setSoBaixo] = useState(false);
  const [mover, setMover] = useState<LinhaEstoque | null>(null);
  const [historico, setHistorico] = useState<LinhaEstoque | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const nb = norm(busca.trim());
  const visiveis = linhas.filter(
    (l) => (!soBaixo || l.abaixoDoMinimo) && (!nb || norm(`${l.productName} ${l.sku} ${l.atributos}`).includes(nb)),
  );
  const baixos = linhas.filter((l) => l.abaixoDoMinimo).length;
  const esgotados = linhas.filter((l) => l.disponivel <= 0).length;

  const semSessao = useCallback(() => router.replace('/admin/entrar'), [router]);
  const fecharMover = useCallback(() => setMover(null), []);
  const fecharHistorico = useCallback(() => setHistorico(null), []);

  return (
    <>
      <div className="top">
        <h1 className="h1">Estoque</h1>
        <p className="sub">Saldo real de cada variação. Toda movimentação pede motivo e fica no histórico.</p>
      </div>

      <div className="kpis">
        <div className="kpi">
          <span>Variações</span>
          <strong>{linhas.length}</strong>
          <small>cadastradas</small>
        </div>
        <div className="kpi">
          <span>Abaixo do mínimo</span>
          <strong>{baixos}</strong>
          <small>disponível no mínimo ou menos</small>
        </div>
        <div className="kpi">
          <span>Esgotadas</span>
          <strong>{esgotados}</strong>
          <small>não podem ser compradas</small>
        </div>
      </div>

      <p className="ok-msg" role="status" hidden={!aviso}>
        {aviso}
      </p>

      <div className="bar">
        <label className="fld">
          <SearchIcon />
          <input
            type="search"
            placeholder="Buscar produto, SKU ou variação"
            aria-label="Buscar produto, SKU ou variação"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>
        <label className="sw">
          <input type="checkbox" checked={soBaixo} onChange={() => setSoBaixo((v) => !v)} />
          <span>Só abaixo do mínimo</span>
        </label>
      </div>

      <section className="card">
        <div className="tw">
          <table className="estq">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Saldo</th>
                <th>Reservado</th>
                <th>Disponível</th>
                <th>Mínimo</th>
                <th>Situação</th>
                <th>
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((l) => (
                <tr key={l.variantId}>
                  <td>
                    <strong style={{ fontWeight: 500 }}>{l.productName}</strong>
                    <div className="sku">
                      {l.sku}
                      {l.atributos && ` · ${l.atributos}`}
                    </div>
                  </td>
                  <td>{l.saldo ?? '—'}</td>
                  <td>{l.reservado ?? '—'}</td>
                  <td>
                    {l.disponivel}
                    {l.kitComposto && <div className="sku">calculado das peças</div>}
                  </td>
                  <td>{l.minimo}</td>
                  <td>
                    <Situacao l={l} />
                  </td>
                  <td>
                    <div className="acoes">
                      {l.kitComposto ? (
                        <span className="note">Movimente as peças</span>
                      ) : (
                        <button
                          className="btn"
                          onClick={() => {
                            setAviso(null);
                            setMover(l);
                          }}
                        >
                          Movimentar
                          <span className="sr-only"> {l.sku}</span>
                        </button>
                      )}
                      {!l.kitComposto && (
                        <button className="sl" onClick={() => setHistorico(l)}>
                          Histórico
                          <span className="sr-only"> de {l.sku}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visiveis.length === 0 && (
          <p className="sub" style={{ padding: '14px 0' }}>
            {linhas.length === 0 ? 'Nenhuma variação cadastrada.' : 'Nenhuma variação encontrada com esse filtro.'}
          </p>
        )}
        <p className="note" style={{ marginTop: 12 }}>
          Disponível = saldo − reservado. Kit composto não tem saldo próprio: a disponibilidade vem das peças (CAT-DEC-019).
        </p>
      </section>

      <Movimentar
        linha={mover}
        aoFechar={fecharMover}
        aoConcluir={(msg) => {
          setMover(null);
          setAviso(msg);
        }}
        semSessao={semSessao}
      />
      <Historico linha={historico} aoFechar={fecharHistorico} semSessao={semSessao} />
    </>
  );
}

function Movimentar({
  linha,
  aoFechar,
  aoConcluir,
  semSessao,
}: {
  linha: LinhaEstoque | null;
  aoFechar: () => void;
  aoConcluir: (msg: string) => void;
  semSessao: () => void;
}) {
  const ref = useModal(linha !== null, aoFechar);
  const [tipo, setTipo] = useState<TipoMovimento>('entrada');
  const [qtdTexto, setQtdTexto] = useState('');
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  // Cada variação começa com o formulário limpo.
  useEffect(() => {
    if (linha) {
      setTipo('entrada');
      setQtdTexto('');
      setMotivo('');
      setErro(null);
    }
  }, [linha]);

  const atual = TIPOS.find((t) => t.id === tipo)!;
  const qtd = lerInteiro(qtdTexto);
  const saldo = linha?.saldo ?? 0;
  const previsto = qtd === null ? null : saldoPrevisto(tipo, saldo, qtd);
  const abaixoDoReservado = previsto !== null && linha?.reservado != null && previsto < linha.reservado;

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (!linha || enviando) return;
    const invalido = qtd === null ? 'Informe um número inteiro.' : validarMovimento(tipo, qtd, motivo);
    if (invalido) {
      setErro(invalido);
      return;
    }
    setErro(null);
    iniciar(async () => {
      const r = await movimentarEstoque({ variantId: linha.variantId, tipo, quantidade: qtd, motivo });
      if (!r.ok) {
        if (r.semSessao) return semSessao();
        setErro(r.erro);
        return;
      }
      aoConcluir(`${atual.concluido} em ${linha.sku}. Saldo agora: ${r.dados.saldo}.`);
    });
  };

  return (
    <dialog ref={ref} className="dlg" aria-labelledby="mov-titulo">
      {linha && (
        <form onSubmit={enviar} noValidate>
          <h2 id="mov-titulo">Movimentar estoque</h2>
          <p className="note">
            {linha.productName} · {linha.sku}
            {linha.atributos && ` · ${linha.atributos}`}
          </p>
          <p className="note">
            Saldo atual: <b>{saldo}</b> · reservado: {linha.reservado ?? 0}
          </p>

          <fieldset className="tipos">
            <legend>Tipo</legend>
            {TIPOS.map((t) => (
              <label key={t.id} className={`pill${tipo === t.id ? ' on' : ''}`}>
                <input
                  type="radio"
                  name="tipo"
                  value={t.id}
                  checked={tipo === t.id}
                  onChange={() => {
                    setTipo(t.id);
                    setErro(null);
                  }}
                />
                {t.rotulo}
              </label>
            ))}
          </fieldset>
          <p className="note">{atual.ajuda}</p>

          <div className="lf">
            <label htmlFor="mov-qtd">{atual.campo}</label>
            <input
              id="mov-qtd"
              inputMode={tipo === 'ajuste' ? 'text' : 'numeric'}
              autoComplete="off"
              required
              value={qtdTexto}
              onChange={(e) => setQtdTexto(e.target.value)}
              aria-describedby="mov-previsto"
            />
          </div>
          <p id="mov-previsto" className="note" aria-live="polite">
            {previsto === null ? 'Saldo depois: —' : `Saldo depois: ${saldo} → ${previsto}`}
            {previsto !== null && previsto < 0
              ? ' · ficaria negativo, o banco vai recusar'
              : abaixoDoReservado && ' · ficaria abaixo do reservado, o banco vai recusar'}
          </p>

          <div className="lf">
            <label htmlFor="mov-motivo">Motivo</label>
            <input
              id="mov-motivo"
              required
              maxLength={MOTIVO_MAX}
              placeholder={tipo === 'entrada' ? 'Ex.: chegada do fornecedor' : tipo === 'ajuste' ? 'Ex.: peça com defeito' : 'Ex.: contagem mensal'}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>

          <p className="err" role="alert" hidden={!erro}>
            {erro}
          </p>

          <div className="dlg-acoes">
            <button type="button" className="sl" onClick={aoFechar} disabled={enviando}>
              Cancelar
            </button>
            <button type="submit" className="btn lbtn" disabled={enviando}>
              {enviando ? 'Registrando…' : `Registrar ${atual.rotulo.toLowerCase()}`}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}

function Historico({ linha, aoFechar, semSessao }: { linha: LinhaEstoque | null; aoFechar: () => void; semSessao: () => void }) {
  const ref = useModal(linha !== null, aoFechar);
  const [movs, setMovs] = useState<Movimento[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!linha) return;
    let ativo = true;
    setMovs(null);
    setErro(null);
    historicoEstoque(linha.variantId).then((r) => {
      if (!ativo) return;
      if (r.ok) setMovs(r.dados);
      else if (r.semSessao) semSessao();
      else setErro(r.erro);
    });
    return () => {
      ativo = false;
    };
  }, [linha, semSessao]);

  return (
    <dialog ref={ref} className="dlg dlg-l" aria-labelledby="hist-titulo">
      {linha && (
        <>
          <h2 id="hist-titulo">Histórico</h2>
          <p className="note">
            {linha.productName} · {linha.sku}
            {linha.atributos && ` · ${linha.atributos}`} · últimas 50 movimentações
          </p>
          {erro && (
            <p className="err" role="alert">
              {erro}
            </p>
          )}
          {!erro && movs === null && <p className="note" role="status">Carregando…</p>}
          {movs && movs.length === 0 && <p className="note">Nenhuma movimentação registrada.</p>}
          {movs && movs.length > 0 && (
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Mudança</th>
                    <th>Saldo depois</th>
                    <th>Motivo</th>
                    <th>Quem</th>
                  </tr>
                </thead>
                <tbody>
                  {movs.map((m) => (
                    <tr key={m.id}>
                      <td>{dataHora(m.data)}</td>
                      <td>{TIPO_HISTORICO[m.tipo] ?? m.tipo}</td>
                      <td>{comSinal(m.delta)}</td>
                      <td>{m.saldoDepois}</td>
                      <td>{m.motivo}</td>
                      <td>{QUEM[m.quem]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="dlg-acoes">
            <button type="button" className="btn" onClick={aoFechar}>
              Fechar
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
