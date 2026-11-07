# Minhas Diárias

Aplicativo local de controle de diárias, pagamentos e adiantamentos. React Native + Expo SDK 54, TypeScript e Expo Router. Versão 1.1.0.

## Recursos

- Registro de hoje com um toque, ou seleção de data pelo calendário.
- Diária completa, meia diária e falta; valor individual e observação.
- Edição e exclusão com confirmação; substituição explícita de registro duplicado.
- Recebimentos e adiantamentos, saldo geral e resumo por período.
- Interface azul, navegação acessível, modo fácil opcional na abertura.
- Backup JSON por arquivo, restauração validada e cópia local de recuperação.
- Compartilhamento textual do resumo.

Não exige conta nem servidor. Não há sincronização entre aparelhos: use exportação/importação para transferir os dados.

## Desenvolvimento e validação

Node 22 e Java 17 para Android.

```sh
npm ci
npm run typecheck
npm test -- --runInBand
npm run format:check
npx expo export --platform android --platform web
npm start
```

Para testar a interface web após a exportação: `npx playwright install chromium` e `npm run test:e2e`.

O workflow GitHub valida TypeScript, regras, persistência e exportação. `codemagic.yaml` contém builds separados de teste e produção.

## Valores e períodos

Valores são inteiros em centavos. Meia diária arredonda metade para o centavo superior quando necessário (R$ 120,01 → R$ 60,01). A seleção do tipo sugere o valor; o valor do registro pode ser ajustado. Falta sempre vale zero.

Saldo geral = trabalho registrado − pagamentos − adiantamentos. Valores negativos representam recebimentos superiores ao trabalho registrado. Filtros por período mostram o resultado das movimentações nas datas selecionadas, não uma conciliação por competência. O saldo geral continua disponível. Datas usam o fuso local do aparelho e são atualizadas ao voltar ao app ou virar o dia.

## Persistência e migração

O snapshot v2 guarda registros, recebimentos e ajustes em `@minhas-diarias/v2`. Alterações são serializadas e só aparecem como salvas depois da persistência. A cópia anterior fica em `@minhas-diarias/recovery`; falhas de leitura bloqueiam alterações e permitem importar backup ou recuperar essa cópia. Dados ilegíveis recuperados são preservados em uma chave de quarentena.

As chaves `@minhas-diarias/records` e `@minhas-diarias/settings` da reconstrução anterior são convertidas automaticamente e permanecem intactas. Essa migração **não comprova compatibilidade com o APK original da Manus**, cujo formato de dados e chave de assinatura não foram recuperados. O relatório antigo em `RELATORIO.md` é evidência histórica, não o estado atual da aplicação.

Backup exportado inclui dados pessoais e não é criptografado. Restauração substitui o conjunto atual após confirmação. A cópia local anterior não substitui um backup externo em caso de perda do aparelho ou desinstalação.

## Android e assinatura

Identificador de produção preservado: `space.manus.minhas.diarias.app.t20260210200658`. Versão 1.1.0, versionCode 10001 (superior ao 10000 do APK documentado).

- `./gradlew assemblePreview`: APK com JavaScript embutido e identificador `.preview`; instala separado e usa assinatura de teste.
- `./gradlew assembleRelease bundleRelease`: exige chave de produção; não usa assinatura debug como fallback.

No Codemagic, execute `android-preview` para testes. Para `android-release`, configure o grupo seguro `diarias_signing` com `DIARIAS_KEYSTORE_BASE64`, `DIARIAS_STORE_PASSWORD`, `DIARIAS_KEY_ALIAS`, `DIARIAS_KEY_PASSWORD`. A chave é decodificada temporariamente e seu caminho é passado por `DIARIAS_KEYSTORE_PATH`.

Para atualizar uma instalação existente, é necessário o mesmo certificado de assinatura. Não desinstale o app anterior para contornar erro de assinatura sem antes garantir backup. Não há chave de produção versionada neste repositório.

## Validação em aparelho

Antes da distribuição, testar instalação/atualização, TalkBack, fonte ampliada, teclado, mudança de dia, backup/restauração pelo seletor nativo e compartilhamento. A exportação do bundle não equivale a compilar ou testar um APK. iOS exige ambiente macOS e assinatura própria, ainda não configurados.

Resultados e capturas: [validação 1.1.0](docs/VALIDACAO_1_1.md).
