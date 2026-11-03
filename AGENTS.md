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
**Fase 0 — Base.** Autorizado: protótipo visual com dados fictícios (Vite + React em `src/`). Backend, Supabase, Mercado Pago e deploy de produção **não** estão autorizados.

## Comandos
```bash
npm install
npm run dev        # servidor local
npm run typecheck
npm run build
```
