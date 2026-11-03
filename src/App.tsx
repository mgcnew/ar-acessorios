import { Navigate, Route, Routes } from 'react-router-dom';
import { Admin } from './admin/Admin';
import { StoreLayout } from './components/StoreLayout';
import { About } from './pages/About';
import { Cart, Checkout } from './pages/Cart';
import { Catalog } from './pages/Catalog';
import { Favorites } from './pages/Favorites';
import { Home } from './pages/Home';
import { ProductRoute } from './pages/ProductPage';
import { StoreProvider } from './store';

export function App() {
  return (
    <Routes>
      <Route path="/admin" element={<Admin />} />
      <Route
        element={
          <StoreProvider>
            <StoreLayout />
          </StoreProvider>
        }
      >
        <Route index element={<Home />} />
        <Route path="loja" element={<Catalog />} />
        <Route path="produto/:id" element={<ProductRoute />} />
        <Route path="favoritos" element={<Favorites />} />
        <Route path="sacola" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="sobre" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
