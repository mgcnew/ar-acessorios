# Instruções para agentes (Claude, Codex)

Projeto: loja virtual **própria** da AR Acessórios (semijoias, B2C, estoque próprio, sem vendedores terceiros).

## Antes de qualquer tarefa
1. Leia [`docs/DECISOES.md`](docs/DECISOES.md). É a **única** fonte de decisões.
2. Leia o documento da área afetada:
   - visão, escopo, arquitetura: [`docs/DOCUMENTO_MESTRE.md`](docs/DOCUMENTO_MESTRE.md)
   - catálogo e estoque: [`docs/modulos/01_CATALOGO_ESTOQUE.md`](docs/modulos/01_CATALOGO_ESTOQUE.md)
   - pedidos e pagamentos: [`docs/modulos/02_PEDIDOS_PAGAMENTOS.md`](docs/modulos/02_PEDIDOS_PAGAMENTOS.md)
   - protótipo visual: [`docs/frontend/BRIEF_FRONTEND.md`](docs/frontend/BRIEF_FRONTEND.md)

## Regras
- **Decidido** é regra. **Proposto** e **Em aberto** não são: não implemente como se fossem.
- Achou contradição entre documentos, ou entre documento e código? **Pare e pergunte.** Não escolha um lado.
- Não invente dados reais da cliente (preços, endereços, políticas). Use marcadores como `[A DEFINIR]`.
- Decisão nova ou alterada: edite a linha em `docs/DECISOES.md` e os documentos que a citam **no mesmo commit**. Não crie arquivos com versão no nome (`_v2.md`) nem anexe seções "Atualização" no fim do documento; o histórico é o git.
- Antes de mexer em schema, RLS, estoque ou pagamento: apresente o plano, os arquivos afetados, os riscos e os testes.
- Nunca: migração destrutiva, deploy de produção, segredos no repositório, chave `service_role` no cliente.

## Fase atual
**Fase 1 — Fundação** (autorizada em 03/11/2026). Autorizado: site em Next.js com dados fictícios; projeto Supabase com banco, login do painel e schema de catálogo e estoque (Módulo 01). **Não autorizado:** pagamento real, deploy de produção.

## Estado atual (03/11/2026)
- Banco `ar-acessorios-dev` (Supabase, São Paulo, ref `pmhipriryqsblhonysay`) montado com as migrações de `supabase/migrations/`, a carga de `supabase/seed.sql` e os 32 testes de `supabase/tests/catalogo_estoque.sql` passando.
- Admin do painel: `acess.ar05@gmail.com` (em `admin_members`).
- O site **ainda usa o catálogo fictício de `src/data/catalog.ts`**. Próximo passo: vitrine lendo do banco; depois login e painel de estoque usando `painel_estoque()` e `registrar_entrada/ajuste/contagem()`.
- Ambiente: `cp .env.example .env.local`. A rede da sessão precisa permitir `pmhipriryqsblhonysay.supabase.co`.
- Regras que a interface deve respeitar: o visitante vê só disponível sim/não, nunca quantidade (CAT-DEC-024); kit composto não tem saldo próprio (CAT-DEC-019).

## Estrutura
- `src/app/` — rotas do Next.js. `(loja)/` agrupa as páginas da vitrine; `admin/` é o painel.
- `src/views/` — conteúdo de cada página (não use `src/pages/`: o Next.js reserva esse nome).
- `src/components/` — peças reutilizáveis. `src/data/` — catálogo fictício e filtros. `src/store.tsx` — sacola, favoritos e tema.
- `src/styles/` — CSS da loja (escopo `.ar`) e do painel (escopo `.adm`).

## Comandos
```bash
npm install
npm run dev        # servidor local (http://localhost:3000)
npm run typecheck
npm run build      # build de produção, gera as páginas estáticas
```
