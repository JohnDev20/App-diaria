import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { amountForType, DiaryType, formatCurrency, formatLongDate, makeDiaryRecord, toDateKey, typeLabel } from '../../src/diary';
import { useDiary } from '../../src/DiaryProvider';
import { colors, common } from '../../src/ui';

export default function NewDiaryScreen() {
  const { settings, addRecord } = useDiary();
  const [type, setType] = useState<DiaryType>('full');
  const [note, setNote] = useState('');
  const today = toDateKey();
  const amount = useMemo(() => amountForType(settings.defaultAmount, type), [settings.defaultAmount, type]);

  async function save() {
    await addRecord({ ...makeDiaryRecord(today, settings.defaultAmount, type), note: note.trim() || undefined });
    router.back();
  }

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Voltar" style={styles.back}><Text style={styles.backText}>Voltar</Text></Pressable>
        <Text style={styles.headerTitle}>Adicionar Diária</Text>
      </View>
      <Text style={common.sectionLabel}>DATA</Text>
      <View style={common.card} accessible accessibilityLabel={`Data selecionada ${formatLongDate(today)}`}><Text style={styles.date}>{formatLongDate(today)}</Text></View>
      <Text style={common.sectionLabel}>TIPO DO DIA</Text>
      <View style={styles.typeRow}>
        {(['full', 'half', 'absence'] as DiaryType[]).map((item) => (
          <Pressable key={item} onPress={() => setType(item)} accessibilityRole="button" accessibilityState={{ selected: type === item }} style={[styles.typeCard, type === item && styles.typeSelected]}>
            <Text style={[styles.typeLabel, type === item && styles.typeLabelSelected]}>{typeLabel(item)}</Text>
            <Text style={[styles.typeAmount, type === item && styles.typeLabelSelected]}>{formatCurrency(amountForType(settings.defaultAmount, item))}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={common.sectionLabel}>VALOR (R$)</Text>
      <View style={common.card}><Text style={styles.amount}>{formatCurrency(amount)}</Text></View>
      <Text style={common.sectionLabel}>OBSERVAÇÃO (OPCIONAL)</Text>
      <TextInput value={note} onChangeText={setNote} placeholder="Ex: meio período, atraso, serviço diferente..." placeholderTextColor={colors.muted} multiline style={styles.note} accessibilityLabel="Observação opcional" />
      <Pressable onPress={save} accessibilityRole="button" accessibilityLabel="Salvar diária" style={({ pressed }) => [common.button, styles.save, pressed && styles.pressed]}><Text style={[common.buttonText, { color: '#FFFFFF' }]}>Salvar</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', minHeight: 58, gap: 12 },
  back: { minHeight: 52, minWidth: 82, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primarySoft },
  backText: { color: colors.primaryDark, fontSize: 17, fontWeight: '800' },
  headerTitle: { color: colors.ink, fontSize: 25, fontWeight: '900' },
  date: { color: colors.ink, fontSize: 20, fontWeight: '800', textTransform: 'capitalize' },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeCard: { flex: 1, minHeight: 112, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 10, justifyContent: 'center' },
  typeSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  typeLabel: { color: colors.ink, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  typeLabelSelected: { color: colors.primaryDark },
  typeAmount: { color: colors.muted, fontSize: 17, fontWeight: '900', textAlign: 'center', marginTop: 8 },
  amount: { color: colors.ink, fontSize: 30, fontWeight: '900' },
  note: { minHeight: 130, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 16, color: colors.ink, fontSize: 17, textAlignVertical: 'top' },
  save: { backgroundColor: colors.primary, marginTop: 24 },
  pressed: { opacity: 0.8 },
});
