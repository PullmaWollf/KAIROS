# Arquitetura KAIRÓS

## Modelo de implantação
Single-tenant por instalação: cada célula dispõe de próprio repositório, Vercel, banco PostgreSQL e Storage. Isolamento ocorre fisicamente pelos projetos distintos, não por `tenant_id`.

## Camadas
- `index.html` e `src/`: SPA simples, navegação dinâmica e layout responsivo.
- `public/`: ícones, service worker e página offline.
- `api/index.js`: roteador das operações com autenticação e validação de papéis.
- `api/_core.js`: banco, hash de senhas, cookies e verificação de sessão.
- `supabase/migrations/`: baseline versionada, RLS habilitada e GRANTs de Data API revogados para tabelas internas.
- `scripts/create-admin.mjs`: bootstrap administrativo com credenciais locais.

## Fluxo
Navegador → Vercel HTTPS → API → Supabase service role (somente servidor).
O frontend não carrega credenciais privadas nem executa comandos SQL diretamente.

## Sessões
HMAC-SHA256, cookie HttpOnly, SameSite=Lax, Secure em produção; expiração de 30 dias e invalidação por `session_version`. Sem banco de sessões por dispositivo ainda. Adoção de revogação por dispositivo, rate limit e MFA no roadmap.

## Atualização das células
Cópias do template **não recebem atualizações automaticamente**. Manter changelog, releases semânticas, migrations e instruções de atualização. Após estabilização, oferecer bot ou fluxo explícito de upstream sync por pull request; nunca forçar alterações em instalações sem revisão.

## Limites atuais
Starter ainda requer homologação em Vercel/Supabase; push, mídia avançada, escalas recorrentes e auditoria operacional são roadmap. Não chamar de SaaS multi-tenant nem afirmar paridade com o AGAPE.
