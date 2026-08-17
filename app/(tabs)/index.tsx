import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCurrency, formatDate, formatLongDate, toDateKey, typeLabel } from '../../src/diary';
import { useDiary } from '../../src/DiaryProvider';
import { colors, common } from '../../src/ui';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { records, settings, loading } = useDiary();
  const today = toDateKey();
  const todayRecord = records.find((item) => item.date === today);

  if (loading) return <View style={common.screen} />;

  return (
    <ScrollView style={common.screen} contentContainerStyle={[common.content, { paddingTop: insets.top + 18 }]}>
      <Text style={styles.timezone}>Fuso em uso: Brasil</Text>
      <Text style={common.title} accessibilityRole="header">Minhas Diárias</Text>
      <Text style={styles.today}>{formatLongDate(today)}</Text>
      <Text style={styles.defaultValue}>Valor padrão: {formatCurrency(settings.defaultAmount)}</Text>

      <Pressable
        onPress={() => router.push('/acessibilidade')}
        accessibilityRole="button"
        accessibilityLabel="Abrir modo fácil para marcar diária"
        style={({ pressed }) => [styles.accessibilityCard, pressed && styles.pressed]}
      >
        <Text style={styles.accessibilityTitle}>Modo fácil</Text>
        <Text style={styles.accessibilityText}>Um botão grande para marcar sua diária</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/acessibilidade')}
        accessibilityRole="button"
        accessibilityLabel={todayRecord ? 'Diária de hoje já marcada' : 'Marcar diária de hoje'}
        style={({ pressed }) => [styles.primaryCard, todayRecord && styles.primaryCardMarked, pressed && styles.pressed]}
      >
        <Text style={styles.primaryTitle}>{todayRecord ? 'Diária marcada' : 'Marcar diária de hoje'}</Text>
        <Text style={styles.primaryText}>{todayRecord ? formatCurrency(todayRecord.amount) : 'Toque para registrar'}</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/diaria/nova')}
        accessibilityRole="button"
        accessibilityLabel="Adicionar diária em outra data"
        style={({ pressed }) => [styles.secondaryCard, pressed && styles.pressed]}
      >
        <Text style={styles.secondaryTitle}>Adicionar diária</Text>
        <Text style={styles.secondaryText}>Escolher data e tipo</Text>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={common.sectionLabel}>ÚLTIMOS REGISTROS</Text>
        <Text style={styles.total}>{formatCurrency(records.reduce((sum, item) => sum + item.amount, 0))}</Text>
      </View>

      {records.length === 0 ? (
        <View style={common.card} accessible accessibilityLabel="Nenhuma diária registrada ainda">
          <Text style={styles.emptyTitle}>Nenhuma diária registrada</Text>
          <Text style={common.subtitle}>Use o botão azul para marcar a diária de hoje.</Text>
        </View>
      ) : (
        records.slice(0, 8).map((record) => (
          <View key={record.id} style={styles.record} accessible accessibilityLabel={`${formatDate(record.date)}, ${typeLabel(record.type)}, ${formatCurrency(record.amount)}`}>
            <View>
              <Text style={styles.recordDate}>{formatDate(record.date)}</Text>
              <Text style={styles.recordType}>{typeLabel(record.type)}</Text>
            </View>
            <Text style={styles.recordAmount}>{formatCurrency(record.amount)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  timezone: { color: colors.muted, fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  today: { color: colors.muted, fontSize: 18, textAlign: 'center', marginTop: 10, textTransform: 'capitalize' },
  defaultValue: { color: colors.muted, fontSize: 18, textAlign: 'center', marginTop: 6, marginBottom: 20 },
  accessibilityCard: { backgroundColor: '#FEF3C7', borderColor: '#F59E0B', borderWidth: 2, borderRadius: 22, padding: 18, marginBottom: 14, minHeight: 92, justifyContent: 'center' },
  accessibilityTitle: { color: '#78350F', fontSize: 25, fontWeight: '900' },
  accessibilityText: { color: '#92400E', fontSize: 17, fontWeight: '700', marginTop: 4 },
  primaryCard: { minHeight: 150, borderRadius: 26, backgroundColor: colors.primary, borderColor: colors.primaryDark, borderWidth: 2, justifyContent: 'center', alignItems: 'center', padding: 22, marginBottom: 14 },
  primaryCardMarked: { backgroundColor: colors.success, borderColor: '#166534' },
  primaryTitle: { color: '#FFFFFF', fontSize: 29, fontWeight: '900', textAlign: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 19, fontWeight: '700', marginTop: 8 },
  secondaryCard: { minHeight: 112, borderRadius: 22, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 2, justifyContent: 'center', alignItems: 'center', padding: 18 },
  secondaryTitle: { color: colors.ink, fontSize: 24, fontWeight: '900' },
  secondaryText: { color: colors.muted, fontSize: 17, fontWeight: '600', marginTop: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 },
  total: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  emptyTitle: { color: colors.ink, fontSize: 20, fontWeight: '800', marginBottom: 6 },
  record: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 18, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  recordDate: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  recordType: { color: colors.muted, fontSize: 16, marginTop: 4 },
  recordAmount: { color: colors.success, fontSize: 20, fontWeight: '900' },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
});
