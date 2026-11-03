import type { Metadata } from 'next';
import { FormEntrar } from '../../../admin/FormEntrar';

export const metadata: Metadata = { title: 'Entrar no painel' };

export default function EntrarPage() {
  return <FormEntrar />;
}
