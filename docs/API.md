# Contratos da API — Starter KAIRÓS

Rotas atendidas por `api/index.js`, no domínio da célula.

## Públicas
- `GET /api/public`: marca, posts, reuniões e material atual.
- `GET /manifest.webmanifest`: manifesto de identidade dinâmica.
- `GET /api/icon-192` e `GET /api/icon-512`: ícones PNG padrão.
- `POST /api/login`: `{login,password}`; define cookie HttpOnly.
- `POST /api/logout`: remove cookie.

## Autenticadas
- `GET /api/me` (perfil atual)
- `POST /api/profile-save` (telefone próprio)
- `GET /api/schedule-read` (escala interna)
- `GET /api/users` (admin/liderança)
- `GET /api/attendance-read?id=UUID` (admin/liderança)
- `GET /api/attendance-report` (admin/liderança)

## Administração
- `POST /api/user-save` (admin)
- `POST /api/branding-save` (admin)
- `POST /api/material-save` (admin)
- `POST /api/meeting-delete` (admin)

## Administração e liderança
- `POST /api/post-save`, `/api/post-delete`
- `POST /api/meeting-save`
- `POST /api/attendance-save`
- `POST /api/schedule-save`, `/api/schedule-delete`

## Upload
`POST /api/upload` exige admin, `{kind:"logo"|"hero"|"pdf",data:"data:...;base64,..."}`. O bucket público serve somente conteúdo destinado à publicação.

**Segurança:** respostas com `Cache-Control: no-store`; validação no servidor; service role nunca disponível no browser. Falta rate limiting distribuído para login — pendência antes de comercializar.
