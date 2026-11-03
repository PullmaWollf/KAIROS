# Segurança e responsabilidade

**Regra nº 1:** nenhuma cópia do KAIRÓS compartilha credenciais ou dados com o AGAPE ou outra célula.

- Chaves `SUPABASE_SERVICE_ROLE_KEY` e `SESSION_SECRET` são **segredos de servidor**, nunca código público.
- O banco do starter ativa RLS e revoga privilégios diretos de `anon` e `authenticated` nas tabelas internas. Toda autorização deve ocorrer na API.
- Cadastrar contas apenas pela rota do admin. A célula deve usar senhas únicas e revogar sessões quando trocar papéis ou credenciais.
- A rota pública expõe apenas marca, posts, encontros e materiais intencionalmente públicos; não expõe usuários nem telefones.
- Bucket público é destinado a arquivos visíveis; não enviar documentos confidenciais.
- Cookies HttpOnly não substituem rate limiting, monitoramento e prevenção de brute force; implementar antes do lançamento amplo.
- Para processamento de dados pessoais, documentar finalidade, base legal, retenção, direitos dos titulares, logs, exclusão e operador/controlador sob LGPD.
- Backup, restauração de dados e monitoramento são responsabilidade da instalação.
- Dependências exatas com `package-lock.json`, CI e revisões periódicas.
- Sem teste de penetração, esta base **não é homologada para produção sensível**.

## Checklist para publicação
- [ ] Supabase novo, não o AGAPE
- [ ] Chaves privadas ausentes do Git
- [ ] RLS e grants inspecionados
- [ ] Primeiro ADM criado e senha testada
- [ ] Rate limit e proteção anti-brute-force implantados
- [ ] Backup e restauração testados
- [ ] Domínio HTTPS e PWA revisados
- [ ] Políticas de privacidade e termos definidos

Referência: https://supabase.com/docs/guides/api/securing-your-api
