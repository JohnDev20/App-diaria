import React from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useDiary } from "../../src/DiaryProvider";
import {
  formatCurrency,
  formatDate,
  formatLongDate,
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
import { colors, common as s } from "../../src/ui";
export default function Home() {
  const d = useDiary(),
    task = useTask(),
    today = useToday();
  const record = d.records.find((r) => r.date === today),
    t = totals(d.records, d.payments);
  return (
    <Screen
      title={
        d.settings.name
          ? `Olá, ${d.settings.name.split(" ")[0]}`
          : "Minhas Diárias"
      }
      subtitle="Seu trabalho vale. Cada dia conta."
    >
      <View style={s.hero}>
        <Text style={s.heroLabel}>
          {t.balance < 0 ? "ADIANTAMENTO DISPONÍVEL" : "SALDO A RECEBER"}
        </Text>
        <Text adjustsFontSizeToFit numberOfLines={1} style={s.heroValue}>
          {formatCurrency(Math.abs(t.balance))}
        </Text>
        <View style={{ height: 1, backgroundColor: "#FFFFFF30" }} />
        <View style={s.row}>
          <View>
            <Text style={s.heroLabel}>Registrado</Text>
            <Text style={s.heroSmall}>{formatCurrency(t.earned)}</Text>
          </View>
          <View>
            <Text style={s.heroLabel}>Recebido</Text>
            <Text style={s.heroSmall}>{formatCurrency(t.received)}</Text>
          </View>
        </View>
        <Text style={{ color: "#DBE7FF", fontSize: 12 }}>
          Todo o histórico • pagamentos e adiantamentos incluídos
        </Text>
      </View>
      <View style={s.card}>
        <Text style={s.badge}>SEU DIA</Text>
        <Text style={s.recordTitle}>{formatLongDate(today)}</Text>
        <Text style={s.subtitle}>
          {record
            ? `${typeLabel(record.type)} · ${formatCurrency(record.amountCents)}`
            : `Diária padrão de ${formatCurrency(d.settings.defaultAmountCents)}`}
        </Text>
        {record ? (
          <Button
            secondary
            label="Revisar registro de hoje"
            onPress={() =>
              router.push({ pathname: "/diaria/nova", params: { date: today } })
            }
          />
        ) : (
          <Button
            label={task.busy ? "Salvando…" : "✓  Marcar diária de hoje"}
            disabled={task.busy}
            onPress={() => task.run(() => d.markToday())}
          />
        )}
        <Notice text={task.error} />
        {record && (
          <Notice tone="success" text="Registro salvo neste aparelho." />
        )}
      </View>
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Button
            secondary
            label="+ Outra diária"
            onPress={() => router.push("/diaria/nova")}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            secondary
            label="Recebimento"
            onPress={() => router.push("/pagamento")}
          />
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/acessibilidade")}
        style={[s.card, s.row]}
      >
        <View style={{ flex: 1 }}>
          <Text style={s.recordTitle}>Modo fácil</Text>
          <Text style={s.subtitle}>Um botão grande, sem complicação</Text>
        </View>
        <Text style={{ color: colors.primary, fontSize: 26 }}>›</Text>
      </Pressable>
      <View style={s.row}>
        <Text style={s.sectionLabel}>ÚLTIMOS REGISTROS</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/summary")}
          style={{ paddingVertical: 14 }}
        >
          <Text style={s.link}>Ver todos</Text>
        </Pressable>
      </View>
      {d.records.length === 0 ? (
        <View style={s.card}>
          <Text style={s.recordTitle}>Vamos começar?</Text>
          <Text style={s.subtitle}>
            Marque o trabalho de hoje ou adicione uma data anterior. Seus
            registros aparecerão aqui.
          </Text>
        </View>
      ) : (
        d.records.slice(0, 5).map((r) => (
          <Pressable
            key={r.id}
            accessibilityRole="button"
            accessibilityLabel={`Editar ${formatDate(r.date)}, ${typeLabel(r.type)}`}
            onPress={() =>
              router.push({
                pathname: "/diaria/nova",
                params: { date: r.date },
              })
            }
            style={[s.card, s.row]}
          >
            <View style={{ flex: 1 }}>
              <Text style={s.recordTitle}>{formatDate(r.date)}</Text>
              <Text style={s.subtitle}>{typeLabel(r.type)}</Text>
              {!!r.note && <Text style={s.subtitle}>{r.note}</Text>}
            </View>
            <Text style={s.amount}>{formatCurrency(r.amountCents)}</Text>
          </Pressable>
        ))
      )}
    </Screen>
  );
}
