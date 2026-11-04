# Continuar aqui

**Última atualização:** 04/11/2026. Atualize este arquivo no fim de cada sessão: risque o que terminou e escreva onde parou.

## Onde paramos

| Parte | Situação |
|---|---|
| Documentação e decisões | Consolidadas em `docs/DECISOES.md` (fonte única) |
| Banco `ar-acessorios-dev` (Supabase, São Paulo, ref `pmhipriryqsblhonysay`) | Pronto: 3 migrações, carga de demonstração (19 produtos, 73 variações, 3 kits) e **32 testes passando** |
| Admin do painel | `acess.ar05@gmail.com` criado e liberado em `admin_members` |
| Vitrine (Next.js) | Lê do banco e **está no ar na Vercel** (prévia). **Testada no navegador contra o banco real em 04/11** (Passo 2 abaixo, tudo conferido) |
| Login do painel | **Escrito, ainda não testado com o login real**: `/admin/entrar`, proteção no servidor (`src/proxy.ts` + `is_admin()` em `/admin`), "Acesso não autorizado" e botão Sair |
| Painel `/admin` | Aba **Estoque** real (entrada, ajuste, contagem, histórico) e aviso de estoque baixo real na visão geral. Produtos, pedidos e permissões continuam demonstração (`src/admin/seed.ts`). **Testado com banco simulado; falta testar com o banco real** |
| Pagamento, frete, pedidos | Fora da fase atual |

## Passo 1 — Preparar a sessão (5 min)

```bash
npm install
```

```bash
cp .env.example .env.local
```

Confira se a rede chega ao banco. Tem que responder `200`; `000` ou erro 403 significa que a rede do ambiente ainda bloqueia `pmhipriryqsblhonysay.supabase.co` (liberar em Network access → Allowed domains):

```bash
curl -s -o /dev/null -w "%{http_code}\n" "https://pmhipriryqsblhonysay.supabase.co/rest/v1/categories?select=slug" -H "apikey: $(grep PUBLISHABLE .env.local | cut -d= -f2)"
```

**Armadilha nas sessões na nuvem:** o `curl` usa o proxy do ambiente sozinho, mas o Node não. Se o `curl` der 200 e o site der erro 500 com `fetch failed`, suba o servidor assim:

```bash
NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt npm run start
```

## ~~Passo 2 — Testar a vitrine contra o banco~~ (feito em 04/11/2026)

```bash
npm run build && npm run start
```

Conferir em http://localhost:3000, no computador e no celular (390 px):

- [x] Início mostra categorias, Lançamentos, Mais vendidos e os 3 kits
- [x] `/loja` lista 19 peças; `/loja/brincos` filtra; busca e ordenação funcionam
- [x] Brinco Argola Lunar mostra preço promocional só até 15/11/2026 (depois disso, preço normal)
- [x] Variação esgotada aparece riscada e não vai para a sacola (ex.: Argola Lunar Ródio G)
- [x] Conjunto Noite Estrelada aparece **esgotado** (a pulseira da composição está zerada)
- [x] Página de kit composto mostra "O que vem no conjunto" **sem nenhuma quantidade** (CAT-DEC-024)
- [x] Sacola e favoritos continuam funcionando e persistem ao recarregar
- [x] Nenhum erro no console do navegador

Resultado em 04/11: 6 categorias, 4 lançamentos, 4 mais vendidos e 3 kits na home; 19 peças em `/loja` e 6 em `/loja/brincos`; busca "perola" acha 4; Argola Lunar a R$ 69,90 (de R$ 89,90); Argola Lunar Ródio G e Noite Estrelada esgotados e com compra bloqueada; Conjunto Aurora lista "1 par" e "1 un." sem estoque; sacola persiste ao recarregar; 390 px sem rolagem lateral; zero erros no console. Falta só o olhar do responsável sobre o visual.

Se algo falhar, a leitura está em `src/data/loja.ts`.

## ~~Passo 3 — Login do painel~~ (escrito; falta testar com a senha real)

Feito: `@supabase/ssr` com cliente do navegador (`src/lib/supabase/navegador.ts`) e do servidor (`servidor.ts`); `src/proxy.ts` renova a sessão e manda quem não está logado para `/admin/entrar`; `/admin` confirma `is_admin()` no banco e mostra "Acesso não autorizado" para quem não é admin; botão Sair.

Já conferido: sem sessão, `/admin` redireciona para o login (307) e o login abre; `is_admin()` dá verdadeiro para o admin cadastrado e falso para outro usuário.

Falta conferir no navegador, com a rede liberada para o Supabase (só o responsável tem a senha):
- [ ] Entrar com `acess.ar05@gmail.com` abre o painel e mostra "Conectado como …"
- [ ] Senha errada mostra "E-mail ou senha incorretos."
- [ ] Sair volta ao login, e `/admin` deixa de abrir sem entrar de novo
- [ ] Conta que existe no Supabase mas não está em `admin_members` vê "Acesso não autorizado"
- [ ] **Cadastro público desligado** no Supabase (Authentication → Sign In / Providers → "Allow new users to sign up" desligado). Não consegui conferir daqui. Mesmo ligado, quem se cadastra não é admin e o banco recusa tudo, mas o certo é desligar.

## ~~Passo 4 — Painel de estoque de verdade~~ (escrito; falta testar com o banco real)

Feito: aba **Estoque** em `/admin` (`src/admin/Estoque.tsx`), com dados de `painel_estoque()` e ações no servidor em `src/app/admin/actions.ts`, que chamam `registrar_entrada/ajuste/contagem()` e leem `inventory_movements`. Cada ação confere a sessão; o banco confere se é admin. Motivo obrigatório; a mensagem de recusa do banco aparece na tela; kit composto mostra a disponibilidade calculada, sem botão. A visão geral usa o estoque real para o aviso de estoque baixo.

Já conferido com banco simulado num navegador local: entrada, ajuste, contagem, recusa por estoque insuficiente, histórico, Esc fecha, celular a 390 px sem rolagem lateral, sem erros no console; conta logada que não é admin vê "Acesso não autorizado" e, chamando a ação direto, o banco recusa. No banco real: a recusa por estoque insuficiente funciona (transação desfeita).

Falta conferir na prévia da Vercel, com a senha real:
- [ ] Aba Estoque lista as 73 variações; kits compostos sem botão
- [ ] Entrada em um SKU muda o saldo na tela e aparece no histórico como "Você"
- [ ] Ajuste que deixaria negativo mostra "Estoque insuficiente…" e não muda nada
- [ ] Depois de uma entrada, a vitrine mostra a variação como disponível (ex.: Argola Lunar Ródio G, hoje esgotada)

**Atenção:** as movimentações de teste ficam no histórico para sempre (CAT-DEC-012). Use motivos como "Teste do painel" e um SKU de demonstração.

Depois disso, em outra etapa: cadastro e edição de produtos, variações, kits e fotos (bucket `produtos` já criado).

## Pendências que não são de código

| Item | Onde |
|---|---|
| Questionário para a cliente (frete, trocas, nota fiscal, painel, cores, domínio) | [documento](https://claude.ai/artifact/CZT1SUykPSyvr9Q34EC2Cf); trocar o marcador do link da prévia |
| Prévia publicada do protótipo (versão antiga, igual no visual) | [prévia](https://claude.ai/artifact/KdvjU6JFDRNuDA94YqAcPQ) |
| Propostas PR-001 e PR-002 (reserva × Pix; pagamento indefinido) | `docs/DECISOES.md` §6, decidir antes da Fase 3 |
| Ajustar as cores do modo noturno | pedido do responsável, sem urgência |
| Teste de dois ajustes simultâneos no mesmo SKU | **Não foi feito de verdade**: a ferramenta de SQL desta sessão roda uma consulta por vez. Fazer no SQL Editor do Supabase com duas abas: na 1ª, `begin;` + `registrar_ajuste` + `select pg_sleep(10);` + `rollback;`; na 2ª, o mesmo ajuste logo em seguida, que deve esperar a 1ª terminar |
| Projeto Supabase antigo em Oregon (vazio, sem uso) | o responsável pode apagar |

## Como pedir na próxima sessão

> Leia o AGENTS.md e o docs/CONTINUAR_AQUI.md e continue do Passo 1.
