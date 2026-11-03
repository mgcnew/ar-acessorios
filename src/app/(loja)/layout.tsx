import type { ReactNode } from 'react';
import { StoreLayout } from '../../components/StoreLayout';
import { StoreProvider } from '../../store';

export default function LojaLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <StoreLayout>{children}</StoreLayout>
    </StoreProvider>
  );
}
