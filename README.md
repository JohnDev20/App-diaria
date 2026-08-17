# Minhas Diárias

> **Estado atual:** este repositório recebeu uma reconstrução editável baseada no relatório de inspeção do APK instalado. O código-fonte original não estava disponível, portanto a implementação deve ser validada no dispositivo antes de ser considerada equivalente ao APK anterior.

## Modo acessibilidade

A aplicação agora possui o **Modo fácil**, destinado a pessoas idosas ou com pouca familiaridade com aplicativos. Na tela inicial, toque em **Modo fácil** para abrir uma tela com um botão grande no centro. Antes do toque, o botão mostra **Marcar diária**. Depois do toque, ele muda para **Diária marcada**, grava a diária do dia usando o valor padrão e exibe a data, o dia da semana e o valor registrado. A confirmação também é anunciada para leitores de tela.

O recurso pode ser ativado em **Ajustes > Modo fácil**. Os registros e configurações são armazenados localmente no dispositivo, e uma diária já registrada para o dia não é duplicada.

## Execução

Instale as dependências com `npm install` e execute `npm start`. Para validar o projeto, use `npm test -- --runInBand`, `npx tsc --noEmit` e `npx expo export --platform android --no-bytecode`. A exportação sem bytecode é usada apenas para validação no ambiente de desenvolvimento; builds de distribuição devem gerar o bytecode Hermes normalmente.

## Estrutura principal

- `app/acessibilidade.tsx`: tela de modo fácil com botão grande, confirmação e suporte a acessibilidade.
- `src/DiaryProvider.tsx`: estado local, persistência e prevenção de duplicidade por data.
- `src/diary.ts`: regras de negócio, moeda e datas.
- `app/(tabs)/index.tsx`: tela inicial com atalho para o modo acessibilidade.
- `app/(tabs)/settings.tsx`: valor padrão, identificação e ativação do modo fácil.
- `docs/MODO_ACESSIBILIDADE.md`: fluxo, estados e critérios de aceitação.

## Auditoria e evidências

O relatório técnico completo está em [`RELATORIO.md`](./RELATORIO.md). As evidências textuais extraídas do APK ficam em [`auditoria_apk/`](./auditoria_apk/). A especificação recuperada antes da reconstrução está documentada em [`docs/MODO_ACESSIBILIDADE.md`](./docs/MODO_ACESSIBILIDADE.md).

---


## Reconstrução original

O APK anterior foi inspecionado por ADB e documentado em `RELATORIO.md`. Como o projeto-fonte original havia sido excluído, esta base foi reconstruída com Expo Router e React Native a partir das evidências disponíveis. Os fluxos completos de resumo, ajustes e adição de diária estão representados, mas a equivalência com o APK anterior deve ser confirmada em um dispositivo Android.

## Licença e contato

A licença e os dados de contato do projeto original não foram recuperados de forma verificável. Eles devem ser definidos pelo responsável antes de uma publicação.
