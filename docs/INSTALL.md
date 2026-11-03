# Implantação de uma célula — do zero

**Objetivo:** uma célula, um GitHub, uma Vercel, um Supabase. Não há dependência do AGAPE original.

## 1. GitHub
1. Crie o repositório de sua célula a partir do template oficial (quando publicado como template) ou importe os arquivos.
2. Configure acesso apenas aos responsáveis.
3. Proteja a branch `main` e execute a pipeline de testes antes de atualizações.

## 2. Supabase (pertence ao administrador da célula)
1. Crie um projeto **novo** em https://supabase.com/dashboard/projects, escolha região e mantenha a senha do banco no gerenciador de senhas.
2. Em SQL Editor, aplique o arquivo `supabase/migrations/20261103000000_kairos_initial.sql` **uma vez**, em banco novo.
3. Confirme criação de tabelas `app_users`, `app_settings`, `posts`, `meetings`, `attendance`, `schedule_items`, `study_material` e bucket `kairos-public`.
4. Em **Project Settings → API Keys**, identifique Project URL e chave secreta `service_role` (ou a equivalente secreta documentada na versão de seu SDK).
5. NÃO coloque a chave secreta no JavaScript, em GitHub Secrets públicos, nos screenshots ou no README.
6. Para evolução com CLI e migrações versionadas, use `supabase login`, `supabase link --project-ref <REF>` e `supabase db push` seguindo a documentação oficial; não reaplique migrações SQL já executadas manualmente.

## 3. Primeiro administrador
1. Tenha Node 24 e execute `npm ci` no computador confiável.
2. Defina `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_LOGIN`, `ADMIN_NAME` e `ADMIN_PASSWORD` no ambiente do processo (não no repositório).
3. Rode `npm run create-admin`. O script se recusa a sobrescrever uma conta admin existente.
4. Exclua do histórico de shell credenciais digitadas de maneira insegura; prefira gerenciador de segredos. Não reutilize senhas.

## 4. Vercel
1. Entre em https://vercel.com/new e **Import Git Repository** da célula.
2. Framework preset: Other. Root directory: raiz do repositório.
3. Adicione **Production** Environment Variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`.
4. Gere `SESSION_SECRET` aleatório, ao menos 48 caracteres. Em Node: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Guarde somente no gerenciador de segredos.
5. Faça deploy e confira estado **READY**; não habilite domínio público antes de validar autenticação e autorização.
6. Em **Settings → Domains**, associe domínio da célula se desejar. Teste HTTPS.

## 5. Validação
- Login com ADM e logout; sessão persiste apenas enquanto válida.
- Usuário não-admin não consegue cadastrar outros usuários nem alterar identidade.
- Editor de marca altera nome, cores, hero e manifesto nas novas instalações.
- Mural, encontros, escalas, chamada e frequência sem erros.
- PWA instalável no Android/desktop, sob HTTPS; para iPhone, usar Compartilhar → Adicionar à Tela de Início (dependendo da versão do iOS).
- Nenhuma chave privada exposta no frontend.
- Confirme as políticas do banco com o advisor de segurança.

## 6. Operação contínua
- Backups e política de retenção são responsabilidade da célula.
- Use ambientes separados para testar migrações.
- Verifique alterações de esquema com backup antes de publicar.
- Rodar a pipeline de testes e monitorar logs do Vercel.

Mais informações: [Segurança](SECURITY.md) · [Arquitetura](ARCHITECTURE.md) · [Automação](AUTOMATION.md).
