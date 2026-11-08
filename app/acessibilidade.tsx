import React from "react";
import { AccessibilityInfo, Text, View } from "react-native";
import { router } from "expo-router";
import { useDiary } from "../src/DiaryProvider";
import { formatCurrency, formatLongDate, typeLabel } from "../src/diary";
import { Button, Notice, Screen, useTask, useToday } from "../src/components";
import { colors, common as s } from "../src/ui";
export default function Easy() {
  const d = useDiary(),
    today = useToday(),
    task = useTask(),
    record = d.records.find((r) => r.date === today);
  return (
    <Screen title="Seu dia, bem simples" subtitle={formatLongDate(today)}>
      <View style={[s.hero, { paddingVertical: 40 }]}>
        <Text style={[s.heroLabel, { fontSize: 20, textAlign: "center" }]}>
          {record ? "Registro salvo" : "Sua diária de hoje"}
        </Text>
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={[s.heroValue, { textAlign: "center" }]}
        >
          {formatCurrency(record?.amountCents ?? d.settings.defaultAmountCents)}
        </Text>
        <Text style={[s.heroSmall, { textAlign: "center" }]}>
          {record ? typeLabel(record.type) : "Toque no botão abaixo"}
        </Text>
      </View>
      <View style={{ paddingVertical: 24 }}>
        <Button
          large
          label={
            task.busy
              ? "Salvando…"
              : record
                ? "✓  Registro salvo"
                : "✓  Marcar diária de hoje"
          }
          disabled={task.busy || !!record}
          onPress={() =>
            task.run(async () => {
              await d.markToday();
              AccessibilityInfo.announceForAccessibility(
                "Diária salva com sucesso.",
              );
            })
          }
        />
      </View>
      {record && (
        <View style={[s.card, { backgroundColor: colors.successSoft }]}>
          <Text
            style={{ fontSize: 24, fontWeight: "800", color: colors.success }}
          >
            Tudo certo!
          </Text>
          <Text style={{ fontSize: 20, lineHeight: 30, color: colors.ink }}>
            {typeLabel(record.type)} registrada. Não precisa tocar novamente.
          </Text>
        </View>
      )}
      <Notice text={task.error} />
      {record && (
        <Button
          secondary
          label="Corrigir este registro"
          onPress={() =>
            router.push({ pathname: "/diaria/nova", params: { date: today } })
          }
        />
      )}
      <Button
        secondary
        label="Abrir aplicativo completo"
        onPress={() => router.replace("/")}
      />
    </Screen>
  );
}
