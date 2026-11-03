import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Art } from '../components/Art';
import { HeartIcon } from '../components/Icons';
import { ProductGrid } from '../components/ProductCard';
import { SectionHead, Stepper } from '../components/ui';
import { artOf, categoryLabel, fmt, productById, PRODUCTS, type Product } from '../data/catalog';
import { MAX_QTY, useStore } from '../store';

const GALLERY = [
  { bg: 0, rot: 0 },
  { bg: 1, rot: -9 },
  { bg: 2, rot: 8 },
  { bg: 3, rot: 0 },
];

const KIND_TEXT: Record<Product['kind'], string> = {
  simple: 'Peça avulsa',
  kit_stocked: 'Kit com estoque próprio (representação visual)',
  kit_composed: 'Kit composto por SKUs (representação visual)',
};

function relatedTo(p: Product): Product[] {
  const sameCat = PRODUCTS.filter((x) => x.id !== p.id && !x.isKit && x.catIds.some((c) => p.catIds.includes(c))).slice(0, 4);
  if (sameCat.length >= 4) return sameCat;
  const rest = PRODUCTS.filter((x) => x.id !== p.id && !x.isKit && !sameCat.includes(x)).slice(0, 4 - sameCat.length);
  return [...sameCat, ...rest];
}

export function ProductRoute() {
  const { id = '' } = useParams();
  const p = productById[id];
  if (!p) return <Navigate to="/loja" replace />;
  return <ProductPage key={p.id} product={p} />;
}

function ProductPage({ product: p }: { product: Product }) {
  const navigate = useNavigate();
  const { favs, toggleFav, addToCart, showToast, setFilters } = useStore();
  const [sel, setSel] = useState<string[]>(() => (p.variants.find((v) => v.avail) ?? p.variants[0]).vals);
  const [qty, setQty] = useState(1);
  const [gal, setGal] = useState(0);

  const cur = p.variants.find((v) => v.key === sel.join('|')) ?? p.variants[0];
  const isFav = favs.includes(p.id);
  const unitWord = p.unit;
  const derivedTxt = p.derived !== null ? `${p.derived} ${p.derived === 1 ? 'conjunto' : 'conjuntos'}` : '';
  const art = artOf(p, cur);

  const details = [
    { k: 'Material', v: p.material },
    { k: 'Tipo', v: KIND_TEXT[p.kind] },
    { k: 'Unidade', v: `Vendido por ${unitWord}` },
    { k: 'SKU', v: cur.sku },
  ];

  const add = () => {
    if (!cur.avail) return;
    addToCart(p.id, cur.key, qty);
    showToast('Adicionado à sacola');
  };

  return (
    <div className="wrap fade">
      <nav className="crumbs" aria-label="Você está em">
        <button onClick={() => navigate('/')}>Início</button>
        <span aria-hidden="true">/</span>
        <button
          onClick={() => {
            setFilters({ cat: 'all' });
            navigate('/loja');
          }}
        >
          Loja
        </button>
        <span aria-hidden="true">/</span>
        <span>{p.name}</span>
      </nav>

      <div className="pdp">
        <div>
          <div className="gal-main">
            <Art {...art} bg={GALLERY[gal].bg} rot={GALLERY[gal].rot} ratio="1 / 1.05" />
          </div>
          <div className="gal-t">
            {GALLERY.map((g, i) => (
              <button
                key={i}
                className={gal === i ? 'on' : ''}
                onClick={() => setGal(i)}
                aria-label={`Ver imagem ${i + 1} de 4`}
                aria-pressed={gal === i}
              >
                <Art {...art} bg={g.bg} rot={g.rot} />
              </button>
            ))}
          </div>
        </div>

        <div className="pdp-info">
          <span className="eyebrow">{categoryLabel(p)}</span>
          <h1>{p.name}</h1>
          <div className="price">
            <strong>{fmt(cur.price)}</strong>
            {cur.compare && cur.avail && <s>{fmt(cur.compare)}</s>}
          </div>
          <p className="note">Preço por {unitWord} · Valores ilustrativos</p>
          {cur.compare && cur.avail && (
            <p className="note" style={{ marginTop: 4 }}>
              Promoção ilustrativa · período fictício: 01/11 a 15/11/2026.
            </p>
          )}
          <p style={{ marginTop: 18, color: 'var(--ink2)', fontSize: 17 }}>{p.desc}</p>

          {p.groups.map((g, gi) => (
            <div key={g.name} className="vg" role="group" aria-label={g.name}>
              <span className="vg-l">
                {g.name}: <b>{sel[gi]}</b>
              </span>
              <div className="pills">
                {g.values.map((v) => {
                  const combo = sel.slice();
                  combo[gi] = v;
                  const vr = p.variants.find((x) => x.key === combo.join('|'));
                  const ok = !!vr?.avail;
                  const on = sel[gi] === v;
                  return (
                    <button
                      key={v}
                      className={`pill${on ? ' on' : ''}${ok ? '' : ' off'}`}
                      aria-pressed={on}
                      aria-label={ok ? `${g.name} ${v}` : `${g.name} ${v} — esgotado nesta combinação`}
                      onClick={() => {
                        setSel(combo);
                        setQty(1);
                      }}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <p className={`stat${cur.avail ? '' : ' bad'}`} role="status">
            <i />
            {cur.avail ? 'Disponível (demonstração)' : 'Esgotado nesta combinação'}
          </p>

          <div className="pdp-actions">
            <Stepper
              label="Quantidade"
              value={qty}
              live
              onDec={() => setQty((q) => Math.max(1, q - 1))}
              onInc={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
              decDisabled={qty <= 1}
              incDisabled={qty >= MAX_QTY}
            />
            <button className="btn btn-p" onClick={add} disabled={!cur.avail}>
              {cur.avail ? 'Adicionar à sacola' : 'Indisponível'}
            </button>
          </div>

          <button className="favb" onClick={() => toggleFav(p.id)} aria-pressed={isFav}>
            <HeartIcon filled={isFav} />
            {isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          </button>

          {p.isKit && (
            <div className="comp">
              <h3>{p.kind === 'kit_stocked' ? 'Kit com estoque próprio' : 'Kit composto'}</h3>
              <p className="note" style={{ marginBottom: 8 }}>
                {p.kind === 'kit_stocked'
                  ? `Kit com estoque próprio: ${p.kitStock} conjuntos em estoque (representação visual da demonstração).`
                  : `Disponibilidade derivada do componente limitante: ${derivedTxt} (demonstração).`}
              </p>
              {p.comps && (
                <ul>
                  {p.comps.map((c) => {
                    const ref = productById[c.ref];
                    return (
                      <li key={c.ref}>
                        <span>
                          {ref.name} · {c.qty} {ref.unit === 'par' ? 'par' : 'un.'}
                        </span>
                        <span>{c.stock} em estoque (demo)</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          <dl className="dl">
            {details.map((d) => (
              <div key={d.k} className="dl-row">
                <dt>{d.k}</dt>
                <dd>{d.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section className="sec" style={{ paddingTop: 20 }} aria-labelledby="h-rel">
        <SectionHead eyebrow="Combina com" title="Você também pode gostar" id="h-rel" />
        <ProductGrid products={relatedTo(p)} />
      </section>
    </div>
  );
}
