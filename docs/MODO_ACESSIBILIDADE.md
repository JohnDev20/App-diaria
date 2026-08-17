# Modo acessibilidade — Minhas Diárias

## Objetivo

O modo acessibilidade foi criado para pessoas idosas ou com pouca familiaridade com aplicativos. Ele reduz a tela a uma ação principal, usa letras grandes, alto contraste, áreas de toque amplas e uma confirmação clara após o registro.

## Como usar

Na tela **Início**, toque em **Modo fácil**. Também é possível ativar o recurso em **Ajustes > Modo fácil**. O aplicativo abre uma tela simples com um único botão grande no centro.

Antes do toque, o botão apresenta **“Marcar diária”** e a orientação **“Toque uma vez”**. Ao tocar, a aplicação registra uma diária completa para a data atual usando o valor padrão configurado. O botão muda para verde e exibe **“Diária marcada”**.

Abaixo do botão aparece uma confirmação com a data, o dia da semana e o valor registrado, por exemplo:

> **Sua diária foi marcada hoje. segunda-feira, 17 de agosto de 2026. Valor registrado: R$ 120,00.**

Se já existir uma diária para a data atual, uma nova diária não é duplicada. O aplicativo informa que a diária já estava marcada e mostra o valor do registro existente.

## Acessibilidade aplicada

A tela usa `accessibilityRole="button"`, rótulos semânticos, dicas de ação, região de confirmação com `accessibilityLiveRegion="polite"` e anúncio por `AccessibilityInfo.announceForAccessibility`. A ação principal tem altura mínima de 210 px, texto grande, contraste alto e mudança de cor entre estado disponível e estado confirmado.

O estado é persistido localmente por AsyncStorage. O modo também pode ser habilitado nas configurações, e o valor padrão da diária pode ser ajustado sem exigir que o usuário navegue por um formulário complexo.

## Estados

| Estado | Botão | Cor | Mensagem |
|---|---|---|---|
| Pronto | `Marcar diária` | Azul | `Toque uma vez` |
| Confirmado nesta abertura | `Diária marcada` | Verde | Data, dia da semana e valor |
| Já havia registro | `Diária marcada` | Verde | `Sua diária já estava marcada` |
| Carregando | Sem ação | Branco | `Aguarde…` |

## Validação realizada

A verificação de TypeScript foi concluída sem erros. O bundle Android Expo foi gerado com sucesso usando `npx expo export --platform android --no-bytecode`. A suíte Jest passou com três testes das regras de diária: diária completa, meia diária e falta, formatação de moeda e criação determinística do registro.

A validação dinâmica em dispositivo Android ainda é recomendada para confirmar tamanho visual, leitura pelo TalkBack, anúncio de voz, rotação, persistência após encerramento e comportamento com o modo de acessibilidade do sistema ativado.
