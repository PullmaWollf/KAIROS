# Contribuindo para o KAIRÓS

A base é compartilhada, mas cada célula tem infraestrutura independente.

1. Abra uma issue com a motivação e o comportamento esperado.
2. Crie uma branch para a correção; mantenha alterações pequenas.
3. Rode `npm install`, `npm run check` e `npm test`.
4. Faça um pull request com descrição, capturas para mudanças visuais e impactos de banco/migrações.
5. Nunca inclua `.env`, chaves de serviço, dados de membros ou arquivos de produção.
6. Toda mudança de esquema precisa de uma migração nova, revisada em banco isolado.
7. Não altere o banco do AGAPE para testar funcionalidades do KAIRÓS.

A escolha da licença de distribuição ainda está pendente em `LICENSE-DECISION.md`. Contribuições não substituem acordos sobre marcas ou licenciamento.
