import React, { useState } from "react";
import { Pressable, Share, Text, View } from "react-native";
import { router } from "expo-router";
import { useDiary } from "../../src/DiaryProvider";
import {
  dateFromKey,
  formatCurrency,
  formatDate,
  toDateKey,
  totals,
  typeLabel,
} from "../../src/diary";
import {
  Button,
  Notice,
  Screen,
  useTask,
  useToday,
} from "../../src/components";
import { common as s } from "../../src/ui";
type Period = "all" | "month" | "7" | "15";
export default function Summary() {
  const d = useDiary(),
    today = useToday(),
    task = useTask();
  const [period, setPeriod] = useState<Period>("all"),
    [page, setPage] = useState(30);
  const start = dateFromKey(today);
  if (period === "month") start.setDate(1);
  else start.setDate(start.getDate() - (period === "7" ? 6 : 14));
  const startKey = period === "all" ? "0000-00-00" : toDateKey(start);
  const records = d.records.filter(
      (r) => r.date >= startKey && r.date <= today,
    ),
    payments = d.payments.filter((p) => p.date >= startKey && p.date <= today),
    t = totals(records, payments),
    all = totals(d.records, d.payments);
  const items = [
    ...records.map((r) => ({ ...r, entry: "record" as const })),
    ...payments.map((p) => ({ ...p, entry: "payment" as const })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  const title =
    period === "all"
      ? "Todo o histórico"
      : `${formatDate(startKey)} a ${formatDate(today)}`;
  return (
    <Screen
      title="Seu histórico"
      subtitle="Diárias, recebimentos e tudo no lugar."
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {(
          [
            ["all", "Tudo"],
            ["month", "Mês"],
            ["7", "7 dias"],
            ["15", "15 dias"],
          ] as const
        ).map(([key, label]) => (
          <View key={key} style={{ flexGrow: 1 }}>
            <Button
              label={label}
              secondary={period !== key}
              onPress={() => {
                setPeriod(key);
                setPage(30);
              }}
            />
          </View>
        ))}
      </View>
      <View style={s.hero}>
        <Text style={s.heroLabel}>
          {period === "all" ? "SALDO GERAL" : "RESULTADO DO PERÍODO"}
        </Text>
        <Text adjustsFontSizeToFit numberOfLines={1} style={s.heroValue}>
          {formatCurrency(t.balance)}
        </Text>
        <Text style={s.heroLabel}>{title}</Text>
        {period !== "all" && (
          <Text style={s.heroSmall}>
            Saldo geral: {formatCurrency(all.balance)}
          </Text>
        )}
      </View>
      <View style={s.card}>
        <View style={s.row}>
          <Text style={s.subtitle}>Trabalho registrado</Text>
          <Text style={s.amount}>{formatCurrency(t.earned)}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.subtitle}>Recebimentos</Text>
          <Text style={s.amount}>{formatCurrency(t.received)}</Text>
        </View>
        <View style={s.divider} />
        <Text style={s.subtitle}>
          {t.full} completas · {t.half} meias · {t.absences} faltas
        </Text>
        {period !== "all" && (
          <Text style={s.subtitle}>
            O resultado compara trabalho e dinheiro recebido nas datas do
            período. O saldo geral considera todo o histórico.
          </Text>
        )}
        {t.balance < 0 && (
          <Notice
            tone="warning"
            text="Os recebimentos superam o trabalho registrado neste recorte."
          />
        )}
      </View>
      <Button
        secondary
        label="Compartilhar resumo"
        onPress={() =>
          task.run(async () => {
            await Share.share({
              message: [
                `Minhas Diárias${d.settings.name ? ` — ${d.settings.name}` : ""}`,
                title,
                `Registrado: ${formatCurrency(t.earned)}`,
                `Recebido: ${formatCurrency(t.received)}`,
                `${period === "all" ? "Saldo geral" : "Resultado do período"}: ${formatCurrency(t.balance)}`,
                `${t.full} completas, ${t.half} meias, ${t.absences} faltas`,
              ].join("\n"),
            });
          })
        }
      />
      <Notice text={task.error} />
      <Text style={s.sectionLabel}>MOVIMENTAÇÕES • TOQUE PARA EDITAR</Text>
      {items.length === 0 && (
        <View style={s.card}>
          <Text style={s.recordTitle}>Sem movimentações</Text>
          <Text style={s.subtitle}>
            Seus registros aparecerão aqui. Tente outro período ou adicione sua
            primeira diária.
          </Text>
        </View>
      )}
      {items.slice(0, page).map((item) => (
        <Pressable
          key={`${item.entry}-${item.id}`}
          accessibilityRole="button"
          onPress={() =>
            item.entry === "record"
              ? router.push({
                  pathname: "/diaria/nova",
                  params: { date: item.date },
                })
              : router.push({ pathname: "/pagamento", params: { id: item.id } })
          }
          style={s.card}
        >
          <View style={s.row}>
            <Text style={s.recordTitle}>{formatDate(item.date)}</Text>
            <Text style={s.amount}>{formatCurrency(item.amountCents)}</Text>
          </View>
          <Text style={s.subtitle}>
            {item.entry === "record"
              ? typeLabel(item.type)
              : item.kind === "advance"
                ? "Adiantamento recebido"
                : "Pagamento recebido"}
          </Text>
          {!!item.note && <Text style={s.subtitle}>{item.note}</Text>}
        </Pressable>
      ))}
      {items.length > page && (
        <Button
          secondary
          label="Carregar mais"
          onPress={() => setPage((n) => n + 30)}
        />
      )}
    </Screen>
  );
}
