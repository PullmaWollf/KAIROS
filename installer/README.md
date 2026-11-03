# KAIRÓS Installer — versão 0.1

**Instalador guiado da arquitetura BYO (Bring Your Own): GitHub, Supabase e Vercel próprios por célula.**

## Estado atual
- Wizard estático com seis etapas, instruções, validação de nome, repositório e referência do Supabase.
- Gera comandos de migração **para o projeto da célula** e URLs de importação Vercel.
- Link de instalação pela conta própria; cadastro inicial do ADM ocorre no computador do responsável.
- **Não coleta tokens, senhas, service role, cookies, credenciais de banco ou dados de membros.**
- Não envia dados a backend. Não persiste em cookies ou armazenamento; progresso é da sessão de página e não confirma implantação.
- Não provisiona projetos remotamente e não executa tarefas no navegador em nome da célula.

## Abrir localmente
No diretório raiz do repositório, execute um servidor HTTP estático simples:
```bash
npx --yes http-server . -p 8080
```
Abra `http://localhost:8080/installer/`. Não precisa de Supabase ou Vercel para executar o wizard.

## Hospedagem
Esta pasta pode ser publicada separadamente num serviço estático ou GitHub Pages, depois de configurar as URLs públicas.
É intencionalmente independente da API e do banco de dados do KAIRÓS Core.

## Evolução para automação real
1. Separar em repositório próprio `KAIROS-INSTALLER` (precisa autorizar novo repositório GitHub).
2. Conectar contas via OAuth autorizado dos provedores, com escopos mínimos e expiração; nenhum token em frontend.
3. Provisionamento remoto, migrações idempotentes, segredo injetado server-side, revisão de custos e aceite explícito.
4. Poll do deploy, smoke tests, logs sem dados sensíveis e recuperação de falhas.
5. Publicar onboarding, consentimento, termos e política LGPD.

**Nunca executar o provisionamento nas contas do mantenedor para instalações de terceiros.**
