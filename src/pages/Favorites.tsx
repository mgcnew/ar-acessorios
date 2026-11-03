import { useNavigate } from 'react-router-dom';
import { HeartIcon } from '../components/Icons';
import { ProductGrid } from '../components/ProductCard';
import { EmptyState, PageHead } from '../components/ui';
import { productById } from '../data/catalog';
import { useStore } from '../store';

export function Favorites() {
  const navigate = useNavigate();
  const { favs, setFilters } = useStore();
  const items = favs.map((id) => productById[id]).filter(Boolean);
  const label =
    items.length === 0 ? 'Você ainda não marcou nenhuma peça' : items.length === 1 ? '1 peça salva' : `${items.length} peças salvas`;

  return (
    <div className="wrap fade" style={{ paddingBottom: 60 }}>
      <PageHead eyebrow="Sua seleção" title="Favoritos">
        <p role="status">{label}</p>
      </PageHead>
      {items.length > 0 ? (
        <ProductGrid products={items} />
      ) : (
        <EmptyState
          icon={<HeartIcon size={40} strokeWidth={1.3} style={{ color: 'var(--acc)' }} />}
          title="Nenhum favorito ainda"
          text="Toque no coração de uma peça para guardá-la aqui e encontrá-la depois."
          action={
            <button
              className="btn btn-p"
              onClick={() => {
                setFilters({ cat: 'all' });
                navigate('/loja');
              }}
            >
              Explorar a loja
            </button>
          }
        />
      )}
    </div>
  );
}
