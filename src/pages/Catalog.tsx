import { useMemo, useState } from 'react';
import { ProductGrid } from '../components/ProductCard';
import { FilterIcon, SearchIcon } from '../components/Icons';
import { EmptyState, PageHead } from '../components/ui';
import { CATEGORIES, catName, isAvailable, minPrice, norm, PRODUCTS, type CategoryId } from '../data/catalog';
import { DEFAULT_FILTERS, useStore, type SortKey } from '../store';

const CAT_OPTIONS: { id: CategoryId | 'all'; name: string }[] = [{ id: 'all', name: 'Todas' }, ...CATEGORIES];

export function Catalog() {
  const { filters, setFilters } = useStore();
  const [filterOpen, setFilterOpen] = useState(false);
  const { cat, q, sort, onlyAvail } = filters;

  const results = useMemo(() => {
    let list = PRODUCTS.filter((p) => cat === 'all' || p.catIds.includes(cat));
    const nq = norm(q.trim());
    if (nq) {
      list = list.filter((p) =>
        norm(`${p.name} ${p.desc} ${p.catIds.map((c) => catName[c]).join(' ')}${p.isKit ? ' kit' : ''}`).includes(nq),
      );
    }
    if (onlyAvail) list = list.filter(isAvailable);
    const sorted = list.slice();
    if (sort === 'asc') sorted.sort((a, b) => minPrice(a) - minPrice(b));
    else if (sort === 'desc') sorted.sort((a, b) => minPrice(b) - minPrice(a));
    else if (sort === 'az') sorted.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    else if (sort === 'new') sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    return sorted;
  }, [cat, q, sort, onlyAvail]);

  const countFor = (id: CategoryId | 'all') => PRODUCTS.filter((p) => id === 'all' || p.catIds.includes(id)).length;
  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setFilterOpen(false);
  };

  return (
    <div className="wrap fade">
      <PageHead eyebrow="Loja" title="Todas as peças">
        <p role="status">{results.length === 1 ? '1 peça' : `${results.length} peças`}</p>
      </PageHead>

      <div className="chips" role="group" aria-label="Categorias">
        {CAT_OPTIONS.map((c) => (
          <button key={c.id} className={`pill${cat === c.id ? ' on' : ''}`} aria-pressed={cat === c.id} onClick={() => setFilters({ cat: c.id })}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="cat-layout">
        <aside>
          {filterOpen && <button className="scrim" onClick={() => setFilterOpen(false)} aria-label="Fechar filtros" />}
          <div className={`filters${filterOpen ? ' open' : ''}`} role="group" aria-label="Filtros">
            <div className="fgroup">
              <h3>Categorias</h3>
              {CAT_OPTIONS.map((c) => (
                <label key={c.id} className="opt">
                  <input type="radio" name="fcat" checked={cat === c.id} onChange={() => setFilters({ cat: c.id })} />
                  <span>{c.name}</span>
                  <small>{countFor(c.id)}</small>
                </label>
              ))}
            </div>
            <div className="fgroup">
              <h3>Disponibilidade</h3>
              <label className="opt">
                <input type="checkbox" checked={onlyAvail} onChange={() => setFilters({ onlyAvail: !onlyAvail })} />
                <span>Somente disponíveis</span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="lnk" onClick={clearFilters}>
                Limpar filtros
              </button>
              <button className="btn btn-p sheet-only" onClick={() => setFilterOpen(false)} style={{ flex: 1 }}>
                Ver {results.length} peças
              </button>
            </div>
          </div>
        </aside>

        <div>
          <div className="toolbar">
            <label className="fld">
              <SearchIcon />
              <input
                type="search"
                placeholder="Buscar por nome ou categoria"
                aria-label="Buscar produtos"
                value={q}
                onChange={(e) => setFilters({ q: e.target.value })}
              />
            </label>
            <button className="fbtn" onClick={() => setFilterOpen(true)}>
              <FilterIcon />
              Filtros
            </button>
            <label style={{ display: 'contents' }}>
              <span className="sr-only">Ordenar por</span>
              <select className="sel" value={sort} onChange={(e) => setFilters({ sort: e.target.value as SortKey })}>
                <option value="rel">Relevância</option>
                <option value="new">Lançamentos</option>
                <option value="asc">Menor preço</option>
                <option value="desc">Maior preço</option>
                <option value="az">Nome (A–Z)</option>
              </select>
            </label>
          </div>

          {results.length > 0 ? (
            <ProductGrid products={results} three />
          ) : (
            <EmptyState
              title="Nenhuma peça encontrada"
              text="Não encontramos resultados para essa combinação. Tente outro termo ou limpe os filtros."
              action={
                <button className="btn btn-p" onClick={clearFilters}>
                  Limpar filtros
                </button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
