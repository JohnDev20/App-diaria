import React, { useState } from "react";
import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useDiary } from "../../src/DiaryProvider";
import {
  amountForType,
  DiaryType,
  formatCurrency,
  formatDate,
  makeDiaryRecord,
  moneyInput,
  parseDate,
  parseMoney,
  toDateKey,
  typeLabel,
} from "../../src/diary";
import {
  Button,
  Confirm,
  DateField,
  Field,
  Notice,
  Screen,
  useTask,
} from "../../src/components";
import { common as s } from "../../src/ui";
export default function Editor() {
  const d = useDiary(),
    params = useLocalSearchParams<{ date?: string }>(),
    existing = d.records.find((r) => r.date === params.date),
    task = useTask();
  const [date, setDate] = useState(formatDate(existing?.date ?? toDateKey())),
    [type, setType] = useState<DiaryType>(existing?.type ?? "full"),
    [amount, setAmount] = useState(
      moneyInput(existing?.amountCents ?? d.settings.defaultAmountCents),
    ),
    [note, setNote] = useState(existing?.note ?? ""),
    [confirm, setConfirm] = useState<"replace" | "delete" | null>(null);
  function select(next: DiaryType) {
    setType(next);
    setAmount(moneyInput(amountForType(d.settings.defaultAmountCents, next)));
  }
  async function save(replace = false) {
    const key = parseDate(date),
      value = type === "absence" ? 0 : parseMoney(amount);
    if (
      !replace &&
      key !== existing?.date &&
      d.records.some((r) => r.date === key)
    ) {
      setConfirm("replace");
      return;
    }
    await d.addRecord(
      {
        ...makeDiaryRecord(key, value, type),
        amountCents: value,
        note: note.trim() || undefined,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      },
      replace || key === existing?.date,
      existing?.date,
    );
    router.back();
  }
  return (
    <Screen
      back
      title={existing ? "Editar diária" : "Nova diária"}
      subtitle="Um registro por dia. Você pode corrigir depois."
    >
      <DateField value={date} onChange={setDate} records={d.records} />
      <Text style={s.sectionLabel}>TIPO DO DIA</Text>
      <View style={{ gap: 8 }}>
        {(["full", "half", "absence"] as DiaryType[]).map((t) => (
          <Button
            key={t}
            label={`${type === t ? "✓  " : ""}${typeLabel(t)}`}
            secondary={type !== t}
            onPress={() => select(t)}
          />
        ))}
      </View>
      <Field
        label="Valor deste registro (R$)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        editable={type !== "absence"}
        maxLength={14}
      />
      <Text style={s.subtitle}>
        Ao escolher um tipo, sugerimos o valor padrão. Ajuste o valor deste dia
        se necessário.
      </Text>
      <Field
        label="Observação (opcional)"
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={1000}
        placeholder="Obra, cliente ou detalhe do serviço"
      />
      <Notice text={task.error} />
      <Button
        label={task.busy ? "Salvando…" : "Salvar diária"}
        disabled={task.busy}
        onPress={() => task.run(() => save())}
      />
      {existing && (
        <Button
          danger
          label="Excluir registro"
          disabled={task.busy}
          onPress={() => setConfirm("delete")}
        />
      )}
      <Confirm
        error={task.error}
        visible={confirm !== null}
        title={
          confirm === "delete" ? "Excluir esta diária?" : "Substituir registro?"
        }
        message={
          confirm === "delete"
            ? "O valor será removido do total registrado. Os recebimentos serão mantidos."
            : "Já existe uma diária nesta data. O tipo, valor e observação anteriores serão substituídos."
        }
        busy={task.busy}
        onCancel={() => setConfirm(null)}
        onConfirm={() =>
          task.run(async () => {
            if (confirm === "delete") {
              await d.deleteRecord(existing!.date);
              router.back();
            } else await save(true);
            setConfirm(null);
          })
        }
      />
    </Screen>
  );
}
