import React, { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useDiary } from "../src/DiaryProvider";
import {
  formatDate,
  moneyInput,
  parseDate,
  parseMoney,
  Payment,
  toDateKey,
} from "../src/diary";
import {
  Button,
  Confirm,
  DateField,
  Field,
  Notice,
  Screen,
  useTask,
} from "../src/components";
export default function PaymentScreen() {
  const d = useDiary(),
    params = useLocalSearchParams<{ id?: string }>(),
    existing = d.payments.find((p) => p.id === params.id),
    task = useTask();
  const [id] = useState(
      existing?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ),
    [date, setDate] = useState(formatDate(existing?.date ?? toDateKey())),
    [amount, setAmount] = useState(
      existing ? moneyInput(existing.amountCents) : "",
    ),
    [kind, setKind] = useState<Payment["kind"]>(existing?.kind ?? "payment"),
    [note, setNote] = useState(existing?.note ?? ""),
    [confirm, setConfirm] = useState(false);
  return (
    <Screen
      back
      title={existing ? "Editar recebimento" : "Novo recebimento"}
      subtitle="Registre o dinheiro recebido para atualizar seu saldo."
    >
      <DateField value={date} onChange={setDate} />
      <Field
        label="Valor recebido (R$)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="0,00"
        maxLength={14}
      />
      <View style={{ gap: 8 }}>
        <Button
          label={kind === "payment" ? "✓  Pagamento" : "Pagamento"}
          secondary={kind !== "payment"}
          onPress={() => setKind("payment")}
        />
        <Button
          label={kind === "advance" ? "✓  Adiantamento" : "Adiantamento"}
          secondary={kind !== "advance"}
          onPress={() => setKind("advance")}
        />
      </View>
      <Field
        label="Observação (opcional)"
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={1000}
        placeholder="Quem pagou, forma de pagamento…"
      />
      <Notice text={task.error} />
      <Button
        label={task.busy ? "Salvando…" : "Salvar recebimento"}
        disabled={task.busy}
        onPress={() =>
          task.run(async () => {
            const amountCents = parseMoney(amount);
            if (amountCents === 0)
              throw new Error("O recebimento deve ser maior que zero.");
            await d.savePayment({
              id,
              date: parseDate(date),
              amountCents,
              kind,
              note: note.trim() || undefined,
            });
            router.back();
          })
        }
      />
      {existing && (
        <Button
          danger
          label="Excluir recebimento"
          disabled={task.busy}
          onPress={() => setConfirm(true)}
        />
      )}
      <Confirm
        error={task.error}
        visible={confirm}
        title="Excluir recebimento?"
        message="O valor será removido dos recebimentos e o saldo será recalculado."
        busy={task.busy}
        onCancel={() => setConfirm(false)}
        onConfirm={() =>
          task.run(async () => {
            await d.deletePayment(id);
            router.back();
          })
        }
      />
    </Screen>
  );
}
