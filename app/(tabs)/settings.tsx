import React, { useEffect, useState } from "react";
import { Switch, Text, View } from "react-native";
import { useDiary } from "../../src/DiaryProvider";
import { DiaryData, moneyInput, parseMoney } from "../../src/diary";
import { exportBackup, pickBackup } from "../../src/backup";
import {
  Button,
  Confirm,
  Field,
  Notice,
  Screen,
  useTask,
} from "../../src/components";
import { colors, common as s } from "../../src/ui";
export default function Settings() {
  const d = useDiary(),
    task = useTask();
  const [amount, setAmount] = useState(
      moneyInput(d.settings.defaultAmountCents),
    ),
    [name, setName] = useState(d.settings.name),
    [easy, setEasy] = useState(d.settings.accessibilityMode),
    [message, setMessage] = useState(""),
    [pending, setPending] = useState<DiaryData | null>(null);
  useEffect(() => {
    setAmount(moneyInput(d.settings.defaultAmountCents));
    setName(d.settings.name);
    setEasy(d.settings.accessibilityMode);
  }, [d.settings]);
  const snapshot: DiaryData = {
    version: 2,
    settings: d.settings,
    records: d.records,
    payments: d.payments,
  };
  return (
    <Screen title="Do seu jeito" subtitle="Ajustes simples para a sua rotina.">
      <View style={s.card}>
        <Text style={s.badge}>PREFERÊNCIAS</Text>
        <Field
          label="Seu nome (opcional)"
          value={name}
          onChangeText={setName}
          maxLength={100}
          placeholder="Como podemos chamar você?"
        />
        <Field
          label="Valor padrão da diária (R$)"
          value={amount}
          onChangeText={setAmount}
          maxLength={14}
          keyboardType="decimal-pad"
        />
        <Text style={s.subtitle}>
          Vale para novos registros. O histórico permanece com os valores que
          você salvou.
        </Text>
        <View style={s.divider} />
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.recordTitle}>Abrir no modo fácil</Text>
            <Text style={s.subtitle}>
              Um botão grande ao iniciar o aplicativo.
            </Text>
          </View>
          <Switch
            accessibilityLabel="Abrir no modo fácil"
            value={easy}
            onValueChange={setEasy}
            trackColor={{ false: colors.border, true: "#AAC2FF" }}
            thumbColor={easy ? colors.primary : "#FFFFFF"}
          />
        </View>
        <Button
          label={task.busy ? "Aguarde…" : "Salvar ajustes"}
          disabled={task.busy}
          onPress={() => {
            setMessage("");
            task.run(async () => {
              await d.saveSettings({
                name: name.trim(),
                defaultAmountCents: parseMoney(amount),
                accessibilityMode: easy,
              });
              setMessage("Ajustes salvos.");
            });
          }}
        />
      </View>
      <Notice text={task.error} />
      <Notice text={message} tone="success" />
      <View style={s.card}>
        <Text style={s.badge}>SEUS DADOS</Text>
        <Text style={s.recordTitle}>Um cuidado com seu histórico</Text>
        <Text style={s.subtitle}>
          Os dados ficam neste aparelho. Guarde um backup em outro lugar para
          trocar de celular ou recuperar seus registros.
        </Text>
        <Button
          secondary
          label="Exportar backup"
          disabled={task.busy}
          onPress={() =>
            task.run(async () => {
              setMessage("");
              await exportBackup(snapshot);
            })
          }
        />
        <Button
          secondary
          label="Restaurar backup"
          disabled={task.busy}
          onPress={() =>
            task.run(async () => {
              setMessage("");
              setPending(await pickBackup());
            })
          }
        />
        <Text style={s.subtitle}>
          O backup inclui nome, diárias, recebimentos e observações. Guarde em
          um local de sua confiança.
        </Text>
      </View>
      <Text style={[s.subtitle, { textAlign: "center" }]}>
        Minhas Diárias · versão 1.1.0{"\n"}Feito para valorizar cada dia de
        trabalho.
      </Text>
      <Confirm
        error={task.error}
        visible={!!pending}
        title="Restaurar este backup?"
        message={`O arquivo contém ${pending?.records.length ?? 0} diárias e ${pending?.payments.length ?? 0} recebimentos. Ele substituirá os dados atuais. Exporte seu backup antes de continuar.`}
        busy={task.busy}
        onCancel={() => setPending(null)}
        onConfirm={() =>
          task.run(async () => {
            await d.restore(pending!);
            setPending(null);
            setMessage("Backup restaurado com sucesso.");
          })
        }
      />
    </Screen>
  );
}
