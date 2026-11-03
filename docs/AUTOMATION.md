# Instalação automatizada — estudo de viabilidade

## Resumo da decisão
**Adotar automação assistida em duas etapas.** Não prometer "um clique cria tudo" sem OAuth autorizado e sem infraestrutura de provisionamento adicional.

### Etapa 1: Automação viável agora
- **GitHub Template Repository:** cria cópia do código para a célula.
- **Supabase:** ADM cria projeto próprio; executa migração versionada via Dashboard ou CLI.
- **Vercel Deploy Button / Import Git:** clona código, coleta variáveis no painel e publica; depois cada push faz deploy automático.
- **Script `create-admin`:** inicializa primeira conta num ambiente controlado.

Isso elimina edições manuais de arquivos, mas não elimina login em provedores nem a configuração de segredos.

### Etapa 2: Automação plena futura (avaliar)
Uma aplicação de onboarding com OAuth do GitHub e conexões autorizadas à Vercel e Supabase poderia:
1. criar repositório por template com consentimento;
2. provisionar Supabase via APIs autorizadas (planos e custos podem variar);
3. aplicar migrações, configurar buckets e secrets;
4. criar Vercel project conectado e importar variáveis usando autenticação segura;
5. implantar e rodar smoke tests;
6. exibir resultado e registrar operação auditável.

**Exigências:** consentimento explícito, isolamento por cliente, armazenamento seguro dos tokens, rotação de credenciais, tratamento de cobranças/limites, reversão parcial, idempotência, rate limit, logs e suporte. Nunca aceitar service-role por URL; jamais solicitar token em texto puro pelo chat.

## Não fazer
- Não colocar segredos em URLs do botão Vercel, arquivos `.env` versionados ou `NEXT_PUBLIC_*`.
- Não executar scripts arbitrários enviados pelos clientes com credenciais de outras células.
- Não usar o mesmo projeto Supabase entre clientes.
- Não rodar migração no Supabase do AGAPE.

## Fontes oficiais
- https://vercel.com/docs/deploy-button/environment-variables
- https://vercel.com/docs/git
- https://supabase.com/docs/guides/deployment
- https://supabase.com/docs/guides/deployment/database-migrations

**Decisão técnica:** automatização orientada agora, provisionamento completo após protótipo de onboarding com testes de segurança e custos.
