# Validação da versão 1.1.0

## Executado nesta revisão

- Instalação limpa com `npm ci`: passou (lockfile corrigido).
- TypeScript: passou.
- Formatação Prettier: passou.
- Jest: 28 testes aprovados, incluindo dinheiro em centavos, datas, migração, duplicatas, backups, concorrência e falhas de gravação.
- Expo: exportação Android com bytecode Hermes e web concluída.
- Playwright/Chromium: 6 fluxos aprovados em viewport móvel — criar/editar/excluir, pagamentos e persistência; duplicatas e valores inválidos; modo fácil e recuperação; exportar/importar backup e rejeitar arquivo inválido; calendário em 320 px; alteração de data sem duplicar valores.
- Inspeção de capturas em 390 × 844: início e ajustes. Rolagem horizontal verificada em 320 px.

## Limites

O build Gradle local parou ao baixar a distribuição devido à indisponibilidade de rede para o processo Java. Nenhum APK novo foi compilado ou instalado nesta revisão. Os testes de interface executaram a versão web do mesmo código React Native; não validam seletor/compartilhamento nativos, TalkBack, atualização do APK anterior ou comportamento em hardware.

A versão de produção exige a chave de assinatura do responsável. O fluxo preview tem applicationId separado para evitar substituir a instalação original. O Codemagic está configurado, mas não foi executado nesta revisão.

A migração cobre a versão reconstruída presente no Git; não há evidência suficiente para migrar o formato desconhecido do APK original da Manus.

## Interface

Capturas reais da aplicação, sem dados fictícios:

![Tela inicial](images/inicio.png)

![Ajustes](images/ajustes.png)
