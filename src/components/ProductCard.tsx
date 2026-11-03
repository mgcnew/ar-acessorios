import { useNavigate } from 'react-router-dom';
import { artOf, categoryLabel, cheapestVariant, fmt, isAvailable, type Product } from '../data/catalog';
import { useStore } from '../store';
import { Art } from './Art';
import { HeartIcon } from './Icons';

export function productBadge(p: Product): string {
  if (!isAvailable(p)) return '';
  if (cheapestVariant(p).compare) return 'Promoção ilustrativa';
  if (p.isNew) return 'Novo';
  if (p.isKit) return 'Kit';
  return '';
}

export function ProductCard({ product: p }: { product: Product }) {
  const navigate = useNavigate();
  const { favs, toggleFav } = useStore();
  const cheapest = cheapestVariant(p);
  const anyAvail = isAvailable(p);
  const from = new Set(p.variants.map((v) => v.price)).size > 1;
  const isFav = favs.includes(p.id);
  const badge = productBadge(p);
  const art = artOf(p);
  const open = () => navigate(`/produto/${p.id}`);

  return (
    <article className="pc">
      <div className="pc-media">
        <button className="pc-img" onClick={open} aria-label={`Ver ${p.name}`}>
          <div className="pc-zoom">
            <Art {...art} ratio="4 / 5" />
          </div>
        </button>
        {badge && <span className="pc-badge">{badge}</span>}
        {!anyAvail && (
          <div className="pc-sold">
            <span>Esgotado</span>
          </div>
        )}
        <button
          className="pc-fav"
          onClick={() => toggleFav(p.id)}
          aria-pressed={isFav}
          aria-label={isFav ? `Remover ${p.name} dos favoritos` : `Adicionar ${p.name} aos favoritos`}
        >
          <HeartIcon filled={isFav} />
        </button>
      </div>
      <button className="pc-body" onClick={open}>
        <span className="pc-cat">{categoryLabel(p)}</span>
        <span className="pc-name">{p.name}</span>
        <span className="pc-price">
          {from && <span className="pc-from">a partir de</span>}
          <span>{fmt(cheapest.price)}</span>
          {cheapest.compare && anyAvail && <span className="pc-old">{fmt(cheapest.compare)}</span>}
        </span>
      </button>
    </article>
  );
}

export function ProductGrid({ products, three = false }: { products: Product[]; three?: boolean }) {
  return (
    <div className={`pgrid${three ? ' three' : ''}`}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
