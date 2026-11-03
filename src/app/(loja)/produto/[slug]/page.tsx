import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS, productBySlug } from '../../../../data/catalog';
import { ProductPage } from '../../../../views/ProductPage';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = productBySlug[(await params).slug];
  return p ? { title: p.name, description: p.desc } : {};
}

export default async function ProdutoPage({ params }: Props) {
  const p = productBySlug[(await params).slug];
  if (!p) notFound();
  // key: trocar de produto zera variação, quantidade e galeria.
  return <ProductPage key={p.id} productId={p.id} />;
}
