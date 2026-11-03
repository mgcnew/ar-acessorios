# AR Acessórios — loja demonstrativa

Protótipo navegável da loja de semijoias AR Acessórios (React + TypeScript + Vite), feito a partir do design "AR Acessórios — Protótipo". Produtos, preços, pedidos e endereços são fictícios: nenhuma compra é realizada.

```bash
npm install
npm run dev
```

## Rotas

| Rota | Tela |
| --- | --- |
| `/` | Início (hero, categorias, lançamentos, mais vendidos, kits) |
| `/loja` | Catálogo com busca, filtros e ordenação |
| `/produto/:id` | Página do produto com variantes, estoque e kits |
| `/favoritos`, `/sacola`, `/checkout` | Favoritos, sacola e prévia do checkout |
| `/sobre` | Página institucional |
| `/admin` | Painel administrativo (demonstração) |

A sacola, os favoritos e o tema noturno ficam salvos no `localStorage` do navegador.

## Estrutura

- `src/data/catalog.ts`: catálogo, variantes, SKUs e disponibilidade dos kits
- `src/store.tsx`: estado da loja (sacola, favoritos, filtros, aviso, tema)
- `src/components/`: `Art` (ilustrações no lugar das fotos), `ProductCard`, layout e peças de UI
- `src/pages/`: telas da loja
- `src/admin/`: painel e dados fictícios dele
- `src/styles/`: estilos da loja (`.ar`) e do painel (`.adm`)

Logo: defina `VITE_LOGO_URL` para usar o logo real. Sem ele, aparece o marcador "Logo original".
