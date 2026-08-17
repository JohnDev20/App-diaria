import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCurrency, formatLongDate, toDateKey } from '../src/diary';
import { useDiary } from '../src/DiaryProvider';
import { colors } from '../src/ui';

export default function AccessibilityModeScreen() {
  const insets = useSafeAreaInsets();
  const { loading, settings, getRecordForDate, markToday } = useDiary();
  const today = toDateKey();
  const currentRecord = getRecordForDate(today);
  const [marked, setMarked] = useState(Boolean(currentRecord));
  const [message, setMessage] = useState('');

  useEffect(() => {
    setMarked(Boolean(currentRecord));
  }, [currentRecord]);

  const dateText = useMemo(() => formatLongDate(today), [today]);
  const amountText = formatCurrency(currentRecord?.amount ?? settings.defaultAmount);

  async function handleMark() {
    const result = await markToday();
    setMarked(true);
    const nextMessage = result.alreadyMarked
      ? `Sua diária já estava marcada. ${dateText}. Valor registrado: ${formatCurrency(result.record.amount)}.`
      : `Sua diária foi marcada hoje. ${dateText}. Valor registrado: ${formatCurrency(result.record.amount)}.`;
    setMessage(nextMessage);
    AccessibilityInfo.announceForAccessibility(nextMessage);
  }

  if (loading) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top }]} accessibilityLabel="Carregando modo acessibilidade">
        <Text style={styles.loadingText}>Aguarde…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.topRow}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar para a tela inicial"
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>
        <Text style={styles.modeLabel} accessibilityRole="header">Modo fácil</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.center}>
        <Text style={styles.instruction} accessibilityRole="header">
          {marked ? 'Sua diária está marcada' : 'Toque no botão para marcar sua diária'}
        </Text>
        <Text style={styles.date}>{dateText}</Text>

        <Pressable
          onPress={handleMark}
          accessibilityRole="button"
          accessibilityLabel={marked ? 'Diária marcada' : 'Marcar diária de hoje'}
          accessibilityHint={marked ? 'Sua diária de hoje já está registrada' : 'Toque uma vez para registrar a diária de hoje'}
          style={({ pressed }) => [styles.bigButton, marked ? styles.bigButtonMarked : styles.bigButtonReady, pressed && styles.bigButtonPressed]}
        >
          <Text style={styles.bigButtonText}>{marked ? 'Diária marcada' : 'Marcar diária'}</Text>
          <Text style={styles.bigButtonSubtext}>{marked ? 'Toque novamente para confirmar' : 'Toque uma vez'}</Text>
        </Pressable>

        <View
          style={[styles.confirmation, !message && styles.confirmationEmpty]}
          accessible
          accessibilityLiveRegion="polite"
          accessibilityLabel={message || 'A confirmação aparecerá aqui depois que você tocar no botão'}
        >
          {message ? (
            <>
              <Text style={styles.confirmationTitle}>Pronto!</Text>
              <Text style={styles.confirmationText}>{message}</Text>
              <Text style={styles.amount}>{amountText}</Text>
            </>
          ) : (
            <Text style={styles.emptyText}>A confirmação aparecerá aqui.</Text>
          )}
        </View>
      </View>

      <Text style={styles.footer} accessibilityLabel="Modo fácil: letras grandes e botão simples">
        Letras grandes • botão simples • confirmação clara
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 20 },
  loading: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 26, fontWeight: '700', color: colors.ink },
  topRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { minWidth: 92, minHeight: 52, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  backText: { color: colors.primaryDark, fontSize: 18, fontWeight: '800' },
  modeLabel: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  placeholder: { width: 92 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 18 },
  instruction: { color: colors.ink, fontSize: 26, fontWeight: '800', textAlign: 'center', lineHeight: 34, maxWidth: 360 },
  date: { color: colors.muted, fontSize: 19, fontWeight: '600', textAlign: 'center', marginTop: 14, textTransform: 'capitalize' },
  bigButton: { width: '100%', minHeight: 210, borderRadius: 34, alignItems: 'center', justifyContent: 'center', marginTop: 30, padding: 22, borderWidth: 4 },
  bigButtonReady: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  bigButtonMarked: { backgroundColor: colors.success, borderColor: '#166534' },
  bigButtonPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  bigButtonText: { color: '#FFFFFF', fontSize: 34, fontWeight: '900', textAlign: 'center' },
  bigButtonSubtext: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginTop: 10 },
  confirmation: { width: '100%', minHeight: 166, borderRadius: 24, backgroundColor: colors.successSoft, borderWidth: 2, borderColor: '#86EFAC', padding: 20, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  confirmationEmpty: { backgroundColor: '#F8FAFC', borderColor: colors.border },
  confirmationTitle: { color: colors.success, fontSize: 25, fontWeight: '900' },
  confirmationText: { color: colors.ink, fontSize: 19, lineHeight: 28, fontWeight: '600', textAlign: 'center', marginTop: 6 },
  amount: { color: colors.success, fontSize: 26, fontWeight: '900', marginTop: 8 },
  emptyText: { color: colors.muted, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  footer: { color: colors.muted, fontSize: 15, fontWeight: '600', textAlign: 'center', paddingVertical: 8 },
  pressed: { opacity: 0.75 },
});
