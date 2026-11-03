import { useNavigate } from 'react-router-dom';
import { Art } from '../components/Art';
import { ProductGrid } from '../components/ProductCard';
import { SectionHead } from '../components/ui';
import { CATEGORIES, CATEGORY_TONES, cheapestVariant, fmt, isAvailable, PRODUCTS, type CategoryId } from '../data/catalog';
import { DEFAULT_FILTERS, useStore } from '../store';

export function Home() {
  const navigate = useNavigate();
  const { setFilters } = useStore();
  const toCatalog = (patch: Parameters<typeof setFilters>[0] = {}) => {
    setFilters({ cat: 'all', ...patch });
    navigate('/loja');
  };
  const toCategory = (cat: CategoryId) => toCatalog({ cat, q: '', onlyAvail: false });

  const newest = PRODUCTS.filter((p) => p.isNew).slice(0, 4);
  const best = PRODUCTS.filter((p) => p.best).slice(0, 4);
  const kits = PRODUCTS.filter((p) => p.isKit);

  return (
    <div className="fade">
      <div className="wrap">
        <section className="hero" aria-label="Destaque">
          <div>
            <span className="eyebrow">Nova coleção · demonstração</span>
            <h1>
              Brilho <em>delicado</em> para os seus dias
            </h1>
            <p className="lead">
              Semijoias de acabamento refinado para compor o seu estilo — do básico de todo dia aos presentes que ficam na memória.
            </p>
            <div className="hero-cta">
              <button className="btn btn-p" onClick={() => toCatalog()}>
                Explorar a loja
              </button>
              <button className="btn btn-s" onClick={() => toCatalog({ ...DEFAULT_FILTERS, q: 'kit' })}>
                Conhecer os kits
              </button>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-main">
              <Art cat="pulseiras" tone="gold" gem bg={1} ratio="4 / 5" />
            </div>
            <div className="hero-f hero-f1">
              <Art cat="brincos" tone="rose" gem bg={2} />
            </div>
            <div className="hero-f hero-f2">
              <Art cat="aneis" tone="gold" gem bg={3} />
            </div>
          </div>
        </section>
      </div>

      <section className="wrap sec" aria-labelledby="h-cats">
        <SectionHead eyebrow="Navegue por categoria" title="Escolha o seu estilo" id="h-cats" />
        <div className="ctiles">
          {CATEGORIES.map((c, i) => (
            <button key={c.id} className="ctile" onClick={() => toCategory(c.id)} aria-label={`Ver ${c.name}`}>
              <div className="ctile-i">
                <Art cat={c.id} tone={CATEGORY_TONES[i]} gem bg={i % 4} />
              </div>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="wrap" aria-labelledby="h-new">
        <SectionHead
          eyebrow="Acabou de chegar"
          title="Lançamentos"
          id="h-new"
          action={
            <button className="lnk" onClick={() => toCatalog({ ...DEFAULT_FILTERS, sort: 'new' })}>
              Ver tudo
            </button>
          }
        />
        <ProductGrid products={newest} />
      </section>

      <section className="wrap sec" aria-labelledby="h-best">
        <SectionHead
          eyebrow="As mais desejadas"
          title="Mais vendidos"
          id="h-best"
          action={
            <button className="lnk" onClick={() => toCatalog()}>
              Ver a loja
            </button>
          }
        />
        <ProductGrid products={best} />
      </section>

      <section className="wrap" aria-labelledby="h-kits">
        <SectionHead eyebrow="Para presentear" title="Vitrine de kits" id="h-kits" />
        <div className="kits">
          {kits.map((k) => {
            const open = () => navigate(`/produto/${k.id}`);
            const soldout = !isAvailable(k);
            return (
              <article key={k.id} className="kit">
                <button onClick={open} aria-label={`Ver ${k.name}`} style={{ display: 'block', width: '100%' }}>
                  <Art cat="kit" tone={k.tone} gem bg={k.bg} ratio="5 / 4" />
                </button>
                <div className="kit-b">
                  <span className="eyebrow">{k.kind === 'kit_stocked' ? 'Kit com estoque próprio' : 'Kit composto'}</span>
                  <h3>{k.name}</h3>
                  <p>{k.short}</p>
                  <div className="kit-f">
                    <strong>{fmt(cheapestVariant(k).price)}</strong>
                    <button className="btn btn-s" onClick={open}>
                      {soldout ? 'Ver detalhes' : 'Ver kit'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="wrap sec" aria-labelledby="h-inst">
        <div className="inst split">
          <div>
            <span className="eyebrow">Sobre a AR</span>
            <h2 id="h-inst" className="h-serif" style={{ fontSize: 'clamp(34px,4.8vw,56px)', marginTop: 10 }}>
              Feita para ser presenteada
            </h2>
            <p>
              Cada peça é pensada para acompanhar momentos do dia a dia e também os que merecem ser lembrados — com embalagem
              cuidadosa e acabamento delicado.
            </p>
            <div style={{ marginTop: 26 }}>
              <button className="btn btn-p" onClick={() => navigate('/sobre')}>
                Conheça a marca
              </button>
            </div>
          </div>
          <div className="rounded" aria-label="Espaço para foto das embalagens da marca">
            <Art cat="kit" tone="rose" gem bg={0} ratio="6 / 5" />
          </div>
        </div>
      </section>
    </div>
  );
}
