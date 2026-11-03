import type { ReactElement } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CATEGORIES, productById } from '../data/catalog';
import { DEFAULT_FILTERS, useStore } from '../store';
import { BagIcon, GemIcon, HeartIcon, HomeIcon, InfoIcon, MoonIcon, SearchIcon, SunIcon } from './Icons';
import { LogoMark } from './ui';


type NavKey = 'home' | 'catalog' | 'favs' | 'about';

const NAV: { label: string; key: NavKey; to: string; icon: () => ReactElement }[] = [
  { label: 'Início', key: 'home', to: '/', icon: () => <HomeIcon /> },
  { label: 'Loja', key: 'catalog', to: '/loja', icon: () => <GemIcon /> },
  { label: 'Favoritos', key: 'favs', to: '/favoritos', icon: () => <HeartIcon size={24} /> },
  { label: 'Sobre', key: 'about', to: '/sobre', icon: () => <InfoIcon /> },
];

function activeNav(pathname: string): NavKey | null {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/loja') || pathname.startsWith('/produto')) return 'catalog';
  if (pathname.startsWith('/favoritos')) return 'favs';
  if (pathname.startsWith('/sobre')) return 'about';
  return null;
}

export function StoreLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { dark, toggleDark, favs, cart, filters, setFilters, toast, clearDemo } = useStore();
  const active = activeNav(pathname);
  const cartCount = cart.reduce((s, l) => s + l.qty, 0);
  const isProduct = pathname.startsWith('/produto/') && !!productById[pathname.split('/')[2]];

  const goNav = (key: NavKey, to: string) => {
    if (key === 'catalog') setFilters({ cat: 'all' });
    navigate(to);
  };
  const goCatalog = () => {
    setFilters({ cat: 'all' });
    navigate('/loja');
  };

  return (
    <div className={`ar${isProduct ? ' r-product' : ''}${dark ? ' dark' : ''}`}>
      <a className="skip" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className="demo-banner" role="note">
        Protótipo de demonstração · produtos, preços e dados fictícios — nenhuma compra é realizada
      </div>
      <header className="hdr">
        <div className="hdr-in">
          <Link className="logo-btn" to="/" aria-label="AR Acessórios — ir para o início">
            <LogoMark />
          </Link>
          <nav className="nav-d" aria-label="Principal">
            {NAV.map((n) => (
              <button
                key={n.key}
                className={`nav-link${active === n.key ? ' on' : ''}`}
                aria-current={active === n.key ? 'page' : undefined}
                onClick={() => goNav(n.key, n.to)}
              >
                {n.label}
              </button>
            ))}
          </nav>
          <div className="hdr-act">
            <label className="srch">
              <SearchIcon />
              <input
                type="search"
                placeholder="Buscar joias"
                aria-label="Buscar joias"
                value={filters.q}
                onChange={(e) => {
                  setFilters({ q: e.target.value, cat: 'all' });
                  if (!pathname.startsWith('/loja')) navigate('/loja');
                }}
              />
            </label>
            <button className="ib ib-m" onClick={goCatalog} aria-label="Buscar na loja">
              <SearchIcon size={22} />
            </button>
            <button className="ib" onClick={toggleDark} aria-pressed={dark} aria-label={dark ? 'Ativar modo claro' : 'Ativar modo noturno'}>
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
            <button className="ib" onClick={() => navigate('/favoritos')} aria-label={`Favoritos (${favs.length})`}>
              <HeartIcon />
              {favs.length > 0 && <span className="cnt">{favs.length}</span>}
            </button>
            <button className="ib" onClick={() => navigate('/sacola')} aria-label={`Sacola (${cartCount} itens)`}>
              <BagIcon />
              {cartCount > 0 && <span className="cnt">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <main id="conteudo">
        <Outlet />
      </main>

      <footer className="foot">
        <div className="wrap">
          <div className="foot-g">
            <div>
              <Link className="logo-btn" to="/" aria-label="AR Acessórios — início" style={{ marginBottom: 14 }}>
                <LogoMark />
              </Link>
              <p>Semijoias delicadas para o dia a dia e para presentear.</p>
            </div>
            <div>
              <h4>Loja</h4>
              <ul>
                {CATEGORIES.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => {
                        setFilters({ ...DEFAULT_FILTERS, sort: filters.sort, cat: c.id });
                        navigate('/loja');
                      }}
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Institucional</h4>
              <ul>
                <li>
                  <button onClick={() => navigate('/sobre')}>Sobre a AR</button>
                </li>
                <li>
                  <button onClick={() => navigate('/favoritos')}>Favoritos</button>
                </li>
                <li>
                  <button onClick={() => navigate('/sacola')}>Sacola</button>
                </li>
              </ul>
            </div>
            <div>
              <h4>Aviso de demonstração</h4>
              <p>
                Produtos, preços, kits e endereços exibidos são fictícios e servem apenas para apresentação do protótipo. Nenhuma
                compra ou pagamento é realizado.
              </p>
              <button className="lnk" onClick={clearDemo}>
                Limpar sacola e favoritos de demonstração
              </button>
            </div>
          </div>
          <div className="foot-b">
            <span>© AR Acessórios — protótipo visual</span>
            <span>Valores em R$ · dados demonstrativos</span>
          </div>
        </div>
      </footer>

      <nav className="bnav" aria-label="Navegação inferior">
        {NAV.map((n) => (
          <button
            key={n.key}
            className={`bn${active === n.key ? ' on' : ''}`}
            aria-current={active === n.key ? 'page' : undefined}
            onClick={() => goNav(n.key, n.to)}
          >
            {n.icon()}
            <span>{n.label}</span>
          </button>
        ))}
      </nav>

      {toast && (
        <div className="toast" role="status">
          <span>{toast}</span>
          <button onClick={() => navigate('/sacola')}>Ver sacola</button>
        </div>
      )}
    </div>
  );
}
