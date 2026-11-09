import React, { useEffect, useRef, useState } from "react";
import {
  AppState,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, common as s } from "./ui";
import {
  DiaryRecord,
  typeLabel,
  dateFromKey,
  formatDate,
  formatLongDate,
  toDateKey,
  validDate,
} from "./diary";
export function Screen({
  children,
  title,
  subtitle,
  back = false,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  back?: boolean;
}) {
  const inset = useSafeAreaInsets();
  return (
    <ScrollView
      style={s.screen}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        s.content,
        { paddingTop: inset.top + 22, paddingBottom: inset.bottom + 32 },
      ]}
    >
      {back && (
        <Pressable
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/")
          }
          accessibilityRole="button"
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <Text style={s.link}>‹ Voltar</Text>
        </Pressable>
      )}
      <View style={{ gap: 6 }}>
        <Text accessibilityRole="header" style={s.title}>
          {title}
        </Text>
        {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
      </View>
      {children}
    </ScrollView>
  );
}
export function Button({
  label,
  onPress,
  secondary = false,
  danger = false,
  disabled = false,
  large = false,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  large?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: large ? 110 : 56,
        borderRadius: 17,
        padding: 16,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: danger
          ? "#FCE9EC"
          : secondary
            ? colors.primarySoft
            : colors.primary,
        opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
      })}
    >
      <Text
        style={{
          fontSize: large ? 25 : 16,
          fontWeight: "800",
          color: danger
            ? colors.danger
            : secondary
              ? colors.primary
              : "#FFFFFF",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        {...props}
        style={[
          s.input,
          props.multiline && { minHeight: 100, textAlignVertical: "top" },
          props.style,
        ]}
      />
    </View>
  );
}
export function Notice({
  text,
  tone = "error",
}: {
  text: string;
  tone?: "error" | "success" | "warning";
}) {
  if (!text) return null;
  const color =
    tone === "success"
      ? colors.success
      : tone === "warning"
        ? colors.warning
        : colors.danger;
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        borderRadius: 16,
        padding: 16,
        backgroundColor:
          tone === "success"
            ? colors.successSoft
            : tone === "warning"
              ? "#FFF5D9"
              : "#FCE9EC",
      }}
    >
      <Text style={{ color, fontSize: 15, lineHeight: 23, fontWeight: "600" }}>
        {text}
      </Text>
    </View>
  );
}
export function useTask() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const lock = useRef(false);
  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível salvar. Tente novamente.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return { busy, error, run, setError };
}
export function Confirm({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  busy = false,
  error = "",
}: {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
  error?: string;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => !busy && onCancel()}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 24,
          backgroundColor: "#10244999",
        }}
      >
        <View
          accessibilityViewIsModal
          style={[
            s.card,
            { width: "100%", maxWidth: 480, alignSelf: "center", gap: 18 },
          ]}
        >
          <Text style={s.recordTitle}>{title}</Text>
          <Text style={s.subtitle}>{message}</Text>
          <Notice text={error} />
          <Button
            label={busy ? "Aguarde…" : "Confirmar"}
            disabled={busy}
            onPress={onConfirm}
          />
          <Button
            label="Cancelar"
            secondary
            disabled={busy}
            onPress={onCancel}
          />
        </View>
      </View>
    </Modal>
  );
}
export function useToday() {
  const [today, setToday] = useState(toDateKey);
  useEffect(() => {
    const update = () => setToday(toDateKey());
    const timer = setInterval(update, 15000);
    const sub = AppState.addEventListener("change", update);
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);
  return today;
}

export function DateField({
  records = [],
  value,
  onChange,
  disabled = false,
}: {
  records?: DiaryRecord[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false),
    [month, setMonth] = useState(
      () => new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12),
    );
  const today = useToday(),
    first = month.getDay(),
    count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const chosen = value.split("/").reverse().join("-");
  function show() {
    const date = validDate(chosen) ? dateFromKey(chosen) : dateFromKey(today);
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1, 12));
    setOpen(true);
  }
  return (
    <View style={{ gap: 8 }}>
      <Field
        label="Data (dia/mês/ano)"
        value={value}
        onChangeText={onChange}
        keyboardType="numbers-and-punctuation"
        maxLength={10}
        editable={!disabled}
      />
      {validDate(chosen) && (
        <Text style={s.subtitle}>{formatLongDate(chosen)}</Text>
      )}
      {!disabled && (
        <Button label="Escolher no calendário" secondary onPress={show} />
      )}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            padding: 18,
            backgroundColor: "#10244999",
          }}
        >
          <ScrollView
            accessibilityViewIsModal
            style={{
              maxHeight: "92%",
              maxWidth: 440,
              width: "100%",
              alignSelf: "center",
              borderRadius: 24,
            }}
            contentContainerStyle={s.card}
          >
            <View style={s.row}>
              <Button
                secondary
                label="‹"
                accessibilityLabel="Mês anterior"
                disabled={month.getFullYear() <= 1900 && month.getMonth() === 0}
                onPress={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() - 1, 1, 12),
                  )
                }
              />
              <Text style={[s.recordTitle, { flex: 1, textAlign: "center" }]}>
                {month.toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>
              <Button
                secondary
                label="›"
                accessibilityLabel="Próximo mês"
                disabled={toDateKey(month).slice(0, 7) >= today.slice(0, 7)}
                onPress={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() + 1, 1, 12),
                  )
                }
              />
            </View>
            <View style={{ flexDirection: "row" }}>
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                (day, i) => (
                  <Text
                    key={i}
                    style={{
                      width: "14.285%",
                      textAlign: "center",
                      color: colors.muted,
                      paddingVertical: 8,
                    }}
                  >
                    {day}
                  </Text>
                ),
              )}
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {Array.from({ length: first + count }, (_, i) => {
                const day = i - first + 1,
                  key = toDateKey(
                    new Date(month.getFullYear(), month.getMonth(), day, 12),
                  );
                const record = records.find((r) => r.date === key);
                const background =
                  record?.type === "full"
                    ? "#D9F5E5"
                    : record?.type === "half"
                      ? "#FFF0C2"
                      : record?.type === "absence"
                        ? "#FFE0E4"
                        : "transparent";
                const ink =
                  record?.type === "full"
                    ? "#12623B"
                    : record?.type === "half"
                      ? "#805B00"
                      : record?.type === "absence"
                        ? "#A62039"
                        : colors.ink;
                return day < 1 ? (
                  <View key={i} style={{ width: "14.285%", height: 44 }} />
                ) : (
                  <Pressable
                    key={i}
                    accessibilityRole="button"
                    accessibilityLabel={`${formatDate(key)}, ${record ? typeLabel(record.type) : "Sem registro"}${record?.note ? `, ${record.note}` : ""}`}
                    accessibilityState={{
                      selected: key === chosen,
                      disabled: key > today,
                    }}
                    disabled={key > today}
                    onPress={() => {
                      onChange(formatDate(key));
                      setOpen(false);
                    }}
                    style={{
                      width: "14.285%",
                      minHeight: 58,
                      borderWidth: 2,
                      borderColor:
                        key === chosen ? colors.primary : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 12,
                      backgroundColor: background,
                      opacity: key > today ? 0.3 : 1,
                    }}
                  >
                    <Text
                      style={{
                        color: ink,
                        fontWeight: "700",
                        fontSize: 16,
                      }}
                    >
                      {day}
                    </Text>
                    {record && (
                      <Text
                        style={{ fontSize: 10, color: ink, fontWeight: "700" }}
                      >
                        {record.type === "full"
                          ? "✓"
                          : record.type === "half"
                            ? "½"
                            : "F"}
                      </Text>
                    )}
                    {!!record?.note && (
                      <Text style={{ fontSize: 9, color: ink }}>•</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
            {records.length > 0 && (
              <Text style={s.subtitle}>
                Verde ✓ completa · Amarelo ½ meia · Vermelho F falta · • com
                observação. Sem cor: sem registro.
              </Text>
            )}
            <Button
              secondary
              label="Hoje"
              onPress={() => {
                onChange(formatDate(today));
                setOpen(false);
              }}
            />
            <Button
              secondary
              label="Fechar calendário"
              onPress={() => setOpen(false)}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
