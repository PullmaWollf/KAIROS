<div align="center">

# ✨ KAIRÓS
### A plataforma da sua comunidade, com a identidade da sua célula.

**PWA White Label · Independência por instalação · Código aberto para auditoria**

[Começar](#-instalação) · [Arquitetura](docs/ARCHITECTURE.md) · [Segurança](docs/SECURITY.md) · [Automação](docs/AUTOMATION.md) · [Roadmap](docs/ROADMAP.md)

</div>

---

## 🌿 O que é o KAIRÓS?

O **KAIRÓS** é uma base independente para que cada célula configure seu próprio aplicativo web instalável, com **nome, identidade visual, usuários e dados próprios**. O código é compartilhado; a infraestrutura e os registros pertencem a cada instalação.

> **KAIRÓS não utiliza o Supabase nem a Vercel da Célula Ágape.** Este repositório não contém dados, senhas nem chaves de produção do projeto original.

### ✦ Recursos do starter

| Área | Função | Situação |
| --- | --- | --- |
| Identidade | Nome, cores, texto inicial e personalização básica | Starter |
| Acesso | Login por cookie seguro; cadastro inicial de ADM | Starter |
| Equipe | Cadastro de membros e papéis | Starter |
| Comunidade | Mural de texto e encontros | Starter |
| Escala | Funções e responsáveis | Starter |
| Presença | Chamada e histórico | Starter |
| Publicação | Palavra da Célula (PDF) | Em evolução |
| PWA | Instalação, ícones e atualização de shell | Starter |
| Mídias, push e automações | Funcionalidades avançadas | Roadmap |

**Starter** significa que a funcionalidade possui estrutura inicial e exige homologação numa instalação real antes do uso em produção com dados pessoais.

## 🏗 Como funciona

```text
Célula A: repositório A → Vercel A → Supabase A → PWA A
Célula B: repositório B → Vercel B → Supabase B → PWA B
                   ↑
          Base comum KAIRÓS
```

- **Isolamento por implantação**: nenhum banco de dados é compartilhado entre células.
- **Frontend**: JavaScript, CSS e HTML, sem framework obrigatório.
- **Backend**: Node.js na Vercel; credenciais privilegiadas ficam SOMENTE no servidor.
- **Dados**: PostgreSQL e Storage Supabase com bloqueio de acesso direto às tabelas do app.
- **Instalação**: navegador compatível com PWA; modo offline limitado ao aviso de conexão.

## 🚀 Instalação

**Antes de começar:** conta GitHub, conta Supabase, conta Vercel, Node.js 24 para desenvolvimento local.

1. Clique em **Use this template** (depois de habilitado como template) ou faça um fork/repositório próprio. Cada célula deve possuir uma cópia de seu código.
2. Crie um **projeto Supabase novo e vazio**, na conta da própria célula.
3. Execute `supabase/migrations/20261103000000_kairos_initial.sql` no SQL Editor do projeto novo **uma única vez**, ou use o fluxo versionado de migrações do [guia detalhado](docs/INSTALL.md). Jamais execute no AGAPE original.
4. Copie `.env.example` para `.env.local` apenas no computador do ADM técnico; defina `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `SESSION_SECRET`. Não faça commit.
5. Em ambiente local confiável, instale as dependências (`npm ci` quando o lockfile estiver disponível ou `npm install`) e crie o primeiro ADM com `npm run create-admin`.
6. Importe o repositório na **Vercel** da célula, adicionando as mesmas três variáveis como **secretas**. Deploy via Git ao publicar em `main`.
7. Abra o PWA e entre com o ADM. Configure a identidade da sua célula.

📖 **Tutorial completo:** [docs/INSTALL.md](docs/INSTALL.md).  
⚙️ **Automação segura:** [docs/AUTOMATION.md](docs/AUTOMATION.md).

### Implantação orientada na Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FPullmaWollf%2FKAIROS&env=SUPABASE_URL%2CSUPABASE_SERVICE_ROLE_KEY%2CSESSION_SECRET)

O botão **clona/implanta o código e pede variáveis**; ele **não** cria o projeto Supabase, não executa migrações, nem gera o primeiro ADM automaticamente. Nunca coloque valores secretos numa URL.

## 🧪 Desenvolvimento

```bash
npm install
npm test
npm run check
npm run dev
```

`npm run dev` usa a Vercel CLI e requer variáveis locais válidas. Os testes de integração de banco e login devem ocorrer num **projeto de homologação**, jamais no AGAPE.

## 🗂 Organização

```text
api/                 Funções serverless e autenticação
src/                 Interface e estilos
public/              Favicon, PWA, ícones e offline
supabase/migrations/  Esquema base versionado
scripts/             Cadastro inicial e checagens
tests/               Testes automatizados
.github/workflows/   Qualidade a cada push e pull request
docs/                Guias para operador e desenvolvedor
```

## 🔐 Privacidade e segurança

Credenciais privadas não ficam no frontend. O modelo é **single-tenant por instalação**, não SaaS multi-tenant centralizado. Controle de papéis é feito nas rotas do backend. Mantenha backups, atualize dependências e reveja permissões antes de divulgar o app. Leia [Segurança](docs/SECURITY.md).

## 📦 Distribuição, licença e atualização

Esta base está em evolução. **Nenhuma licença de redistribuição foi concedida automaticamente**; decisão de licença documentada em [LICENSE-DECISION.md](LICENSE-DECISION.md). Futuramente, após homologação, o proprietário poderá ativar **Template repository** no GitHub.

Cada célula é responsável por sua conta Vercel, Supabase, domínio, custos, cópias de segurança e tratamento de dados pessoais. Novas versões do KAIRÓS **não atualizam automaticamente** repositórios derivados; veja [estratégia de atualização](docs/ARCHITECTURE.md).

---

<div align="center">

**KAIRÓS** · Tempo de crescer, conectar e cuidar.

*Projeto independente inspirado nos aprendizados técnicos do AGAPE, sem dependências da sua produção.*

</div>
