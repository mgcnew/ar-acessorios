import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CATEGORIES, catName, isCategoryId } from '../../../../data/catalog';
import { Catalog } from '../../../../views/Catalog';

type Props = { params: Promise<{ categoria: string }> };

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ categoria: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  if (!isCategoryId(categoria)) return {};
  return { title: catName[categoria], description: `${catName[categoria]} em semijoias da AR Acessórios.` };
}

export default async function CategoriaPage({ params }: Props) {
  const { categoria } = await params;
  if (!isCategoryId(categoria)) notFound();
  return (
    <Suspense>
      <Catalog cat={categoria} />
    </Suspense>
  );
}
