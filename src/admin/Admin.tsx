'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { CheckIcon, CrossIcon, SearchIcon } from '../components/Icons';
import { LogoMark } from '../components/ui';
import { fmt, norm } from '../data/catalog';
import { useTheme } from '../store';
import { BotaoSair } from './BotaoSair';
import { Estoque } from './Estoque';
import type { LinhaEstoque } from './estoque';
import {
  ASK_LIST,
  CAN_LIST,
  CANT_LIST,
  EDITABLE_STATUSES,
  ORDER_STATUSES,
  SEED_ORDERS,
  SEED_PRODUCTS,
  type AdminOrder,
  type AdminProduct,
  type OrderStatus,
} from './seed';

type View = 'overview' | 'stock' | 'products' | 'orders' | 'perms';

const MENU: { label: string; view: View }[] = [
  { label: 'Visão geral', view: 'overview' },
  { label: 'Estoque', view: 'stock' },
  { label: 'Produtos', view: 'products' },
  { label: 'Pedidos', view: 'orders' },
  { label: 'Permissões', view: 'perms' },
];

const TAG: Record<OrderStatus, string> = {
  'Aguardando pagamento': 't-warn',
  Pago: 't-info',
  'Em separação': 't-info',
  Enviado: 't-info',
  Entregue: 't-ok',
  Cancelado: 't-bad',
};

const PAID: OrderStatus[] = ['Pago', 'Em separação', 'Enviado', 'Entregue'];
const isEditable = (s: OrderStatus) => s === 'Pago' || s === 'Em separação' || s === 'Enviado';

export function Admin({ email, estoque }: { email: string; estoque: LinhaEstoque[] }) {
  const { dark, toggleDark } = useTheme();
  const [view, setView] = useState<View>('overview');
  const [prods, setProds] = useState<AdminProduct[]>(SEED_PRODUCTS);
  const [orders, setOrders] = useState<AdminOrder[]>(SEED_ORDERS);

  const setP = (id: number, patch: Partial<AdminProduct>) =>
    setProds((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const setOrderStatus = (id: number, status: OrderStatus) =>
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o)));

  return (
    <div className={`adm${dark ? ' dark' : ''}`}>
      <aside className="side">
        <div className="brand">
          <LogoMark />
          <small>Painel</small>
        </div>
        <nav className="menu" aria-label="Seções do painel">
          {MENU.map((m) => (
            <button
              key={m.view}
              className={`mi${view === m.view ? ' on' : ''}`}
              aria-current={view === m.view ? 'page' : undefined}
              onClick={() => setView(m.view)}
            >
              {m.label}
            </button>
          ))}
        </nav>
        <div className="side-f">
          <Link className="sl" href="/">
            Ver a loja
          </Link>
          <button className="sl" onClick={toggleDark} aria-pressed={dark}>
            {dark ? 'Modo claro' : 'Modo noturno'}
          </button>
          <p className="note" title={email}>
            Conectado como {email}
          </p>
          <BotaoSair className="sl" />
        </div>
      </aside>
      <main className="main">
        <span className="demo" role="note">
          {view === 'stock'
            ? 'Estoque real do banco de desenvolvimento · as movimentações ficam salvas'
            : view === 'overview'
              ? 'Pedidos fictícios · o aviso de estoque usa o estoque real'
              : 'Demonstração do painel · dados fictícios, nada é salvo de verdade'}
        </span>
        {view === 'overview' && (
          <Overview estoque={estoque} orders={orders} goOrders={() => setView('orders')} goStock={() => setView('stock')} />
        )}
        {view === 'stock' && <Estoque linhas={estoque} />}
        {view === 'products' && <Products prods={prods} setP={setP} />}
        {view === 'orders' && <Orders orders={orders} setStatus={setOrderStatus} />}
        {view === 'perms' && <Permissions />}
      </main>
    </div>
  );
}

function Overview({
  estoque,
  orders,
  goOrders,
  goStock,
}: {
  estoque: LinhaEstoque[];
  orders: AdminOrder[];
  goOrders: () => void;
  goStock: () => void;
}) {
  // Estoque real: variações com disponível no mínimo ou abaixo (CAT-DEC-021).
  const low = estoque.filter((l) => l.abaixoDoMinimo).sort((a, b) => a.disponivel - b.disponivel);
  const revenue = orders.filter((o) => PAID.includes(o.status)).reduce((s, o) => s + o.total, 0);
  const kpis = [
    { label: 'Aguardando pagamento', value: orders.filter((o) => o.status === 'Aguardando pagamento').length, note: 'pedidos' },
    { label: 'Para separar', value: orders.filter((o) => o.status === 'Pago' || o.status === 'Em separação').length, note: 'pedidos pagos' },
    { label: 'Vendas pagas', value: fmt(revenue), note: 'soma ilustrativa' },
    { label: 'Estoque baixo', value: low.length, note: 'variações no mínimo ou abaixo' },
  ];

  return (
    <>
      <div className="top">
        <h1 className="h1">Olá! Veja como está a loja</h1>
        <p className="sub">Resumo dos pedidos (ilustrativos) e do estoque (real).</p>
      </div>
      <div className="kpis">
        {kpis.map((k) => (
          <div key={k.label} className="kpi">
            <span>{k.label}</span>
            <strong>{k.value}</strong>
            <small>{k.note}</small>
          </div>
        ))}
      </div>
      <div className="grid2">
        <section className="card">
          <h2>Pedidos recentes</h2>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.customer}</td>
                    <td>{fmt(o.total)}</td>
                    <td>
                      <span className={`tag ${TAG[o.status]}`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={goOrders}>
              Ver todos os pedidos
            </button>
          </div>
        </section>
        <section className="card">
          <h2>Atenção ao estoque</h2>
          {low.length > 0 ? (
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Estoque</th>
                  </tr>
                </thead>
                <tbody>
                  {low.slice(0, 8).map((l) => (
                    <tr key={l.variantId}>
                      <td>
                        {l.productName}
                        <div className="sku">
                          {l.sku}
                          {l.atributos && ` · ${l.atributos}`}
                        </div>
                      </td>
                      <td>
                        <span className={`tag ${l.disponivel <= 0 ? 't-bad' : 't-warn'}`}>
                          {l.disponivel <= 0 ? 'Esgotado' : `${l.disponivel} disponíve${l.disponivel === 1 ? 'l' : 'is'}`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="sub">Nenhuma variação com estoque baixo.</p>
          )}
          {low.length > 8 && <p className="note" style={{ marginTop: 8 }}>E mais {low.length - 8} na aba Estoque.</p>}
          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={goStock}>
              Ver o estoque
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

function Products({ prods, setP }: { prods: AdminProduct[]; setP: (id: number, patch: Partial<AdminProduct>) => void }) {
  const [pq, setPq] = useState('');
  const nq = norm(pq.trim());
  const rows = prods.filter((p) => !nq || norm(`${p.name} ${p.sku} ${p.cat}`).includes(nq));

  return (
    <>
      <div className="top">
        <h1 className="h1">Produtos</h1>
        <p className="sub">Ajuste preço, estoque e visibilidade. As alterações valem só nesta demonstração.</p>
      </div>
      <div className="bar">
        <label className="fld">
          <SearchIcon />
          <input type="search" placeholder="Buscar produto ou SKU" aria-label="Buscar produto ou SKU" value={pq} onChange={(e) => setPq(e.target.value)} />
        </label>
      </div>
      <section className="card">
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Preço (R$)</th>
                <th>Estoque</th>
                <th>Visível na loja</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong style={{ fontWeight: 500 }}>{p.name}</strong>
                    <div className="sku">
                      {p.sku} · {p.kindText}
                    </div>
                  </td>
                  <td>{p.cat}</td>
                  <td>
                    <input
                      className="inp"
                      inputMode="decimal"
                      aria-label={`Preço de ${p.name}`}
                      value={p.price}
                      onChange={(e) => setP(p.id, { price: e.target.value })}
                    />
                  </td>
                  <td>
                    <div className="st" role="group" aria-label={`Estoque de ${p.name}`}>
                      <button onClick={() => !p.derived && setP(p.id, { stock: Math.max(0, p.stock - 1) })} aria-label="Diminuir estoque">
                        −
                      </button>
                      <span>{p.derived ? `${p.stock} (derivado)` : p.stock}</span>
                      <button onClick={() => !p.derived && setP(p.id, { stock: p.stock + 1 })} aria-label="Aumentar estoque">
                        +
                      </button>
                    </div>
                  </td>
                  <td>
                    <label className="sw">
                      <input type="checkbox" checked={p.active} onChange={() => setP(p.id, { active: !p.active })} />
                      <span>{p.active ? 'Visível' : 'Oculto'}</span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note" style={{ marginTop: 12 }}>
          Kits compostos têm disponibilidade derivada dos componentes e não possuem estoque próprio editável. Ajustes manuais de estoque
          pedem um motivo na versão final.
        </p>
      </section>
    </>
  );
}

function Orders({ orders, setStatus }: { orders: AdminOrder[]; setStatus: (id: number, s: OrderStatus) => void }) {
  const [filter, setFilter] = useState<OrderStatus | 'Todos'>('Todos');
  const rows = orders.filter((o) => filter === 'Todos' || o.status === filter);

  return (
    <>
      <div className="top">
        <h1 className="h1">Pedidos</h1>
        <p className="sub">Acompanhe e atualize a separação e o envio. O pagamento não pode ser alterado manualmente.</p>
      </div>
      <div className="bar" role="group" aria-label="Filtrar por status">
        {(['Todos', ...ORDER_STATUSES] as const).map((f) => (
          <button key={f} className={`pill${filter === f ? ' on' : ''}`} aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>
      <section className="card">
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.date}</td>
                  <td>{o.customer}</td>
                  <td>{o.items}</td>
                  <td>{fmt(o.total)}</td>
                  <td>
                    {isEditable(o.status) ? (
                      <label>
                        <span className="sr-only">Status do pedido {o.id}</span>
                        <select className="sel" value={o.status} onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}>
                          {EDITABLE_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <span className={`tag ${TAG[o.status]}`}>{o.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <p className="sub" style={{ padding: '14px 0' }}>
            Nenhum pedido neste status.
          </p>
        )}
        <p className="note" style={{ marginTop: 12 }}>
          Pedidos aguardando pagamento, pagos e finalizados não têm o status alterado à mão: seguem o fluxo de pagamento (versão final).
        </p>
      </section>
    </>
  );
}

function PermList({ items, icon, cls }: { items: { t: string; d: string }[]; icon: ReactNode; cls: string }) {
  return (
    <ul>
      {items.map((i) => (
        <li key={i.t}>
          <span className={`ic ${cls}`} aria-hidden="true">
            {icon}
          </span>
          <span>
            {i.t}
            <small>{i.d}</small>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Permissions() {
  return (
    <>
      <div className="top">
        <h1 className="h1">O que a dona pode e não pode</h1>
        <p className="sub">Proposta de permissões do painel, para validar com a cliente. Não altera as regras dos módulos 01 e 02.</p>
      </div>
      <div className="perm">
        <section className="card">
          <h2>Pode fazer</h2>
          <PermList items={CAN_LIST} icon={<CheckIcon />} cls="y" />
        </section>
        <section className="card">
          <h2>Não pode fazer</h2>
          <PermList items={CANT_LIST} icon={<CrossIcon />} cls="n" />
        </section>
        <section className="card" style={{ gridColumn: '1 / -1' }}>
          <h2>A decidir com a cliente</h2>
          <PermList items={ASK_LIST} icon="?" cls="q" />
        </section>
      </div>
    </>
  );
}
