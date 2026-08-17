import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatCurrency, formatDate } from '../../src/diary';
import { useDiary } from '../../src/DiaryProvider';
import { colors, common } from '../../src/ui';

type Period = '7' | '15' | 'month';

function startOfPeriod(period: Period, reference: Date) {
  const start = new Date(reference);
  if (period === 'month') return new Date(start.getFullYear(), start.getMonth(), 1);
  start.setDate(start.getDate() - (period === '7' ? 6 : 14));
  return start;
}

export default function SummaryScreen() {
  const { records } = useDiary();
  const [period, setPeriod] = useState<Period>('month');
  const reference = new Date();
  const start = startOfPeriod(period, reference);
  const startKey = `${start.getFullYear()}-${`${start.getMonth() + 1}`.padStart(2, '0')}-${`${start.getDate()}`.padStart(2, '0')}`;
  const endKey = `${reference.getFullYear()}-${`${reference.getMonth() + 1}`.padStart(2, '0')}-${`${reference.getDate()}`.padStart(2, '0')}`;
  const visible = useMemo(() => records.filter((record) => record.date >= startKey && record.date <= endKey), [records, startKey, endKey]);
  const total = visible.reduce((sum, item) => sum + item.amount, 0);

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content}>
      <Text style={common.title} accessibilityRole="header">Resumo</Text>
      <Text style={[common.subtitle, { marginTop: 8 }]}>Veja suas diárias registradas.</Text>

      <Text style={common.sectionLabel}>PERÍODO</Text>
      <View style={styles.periodRow}>
        {(['7', '15', 'month'] as Period[]).map((item) => (
          <Text
            key={item}
            onPress={() => setPeriod(item)}
            accessibilityRole="button"
            accessibilityState={{ selected: period === item }}
            style={[styles.periodButton, period === item && styles.periodButtonSelected]}
          >
            {item === 'month' ? 'Mês atual' : `${item} dias`}
          </Text>
        ))}
      </View>

      <View style={styles.metric} accessible accessibilityLabel={`Total a receber ${formatCurrency(total)}, ${visible.length} diárias lançadas`}>
        <Text style={styles.metricLabel}>Total a receber</Text>
        <Text style={styles.metricValue}>{formatCurrency(total)}</Text>
        <Text style={styles.metricMeta}>{visible.length} {visible.length === 1 ? 'diária lançada' : 'diárias lançadas'}</Text>
        <Text style={styles.metricMeta}>{formatDate(startKey)} a {formatDate(endKey)}</Text>
      </View>

      <Text style={common.sectionLabel}>DETALHES</Text>
      {visible.length === 0 ? (
        <View style={common.card} accessible accessibilityLabel="Nenhuma diária encontrada neste período">
          <Text style={styles.empty}>Nenhuma diária encontrada neste período.</Text>
        </View>
      ) : (
        visible.sort((a, b) => b.date.localeCompare(a.date)).map((record) => (
          <View key={record.id} style={styles.record} accessible accessibilityLabel={`${formatDate(record.date)}, ${formatCurrency(record.amount)}`}>
            <Text style={styles.date}>{formatDate(record.date)}</Text>
            <Text style={styles.amount}>{formatCurrency(record.amount)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  periodRow: { flexDirection: 'row', gap: 8 },
  periodButton: { flex: 1, minHeight: 58, paddingHorizontal: 8, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, textAlign: 'center', textAlignVertical: 'center', color: colors.ink, fontSize: 15, fontWeight: '800' },
  periodButtonSelected: { backgroundColor: colors.primarySoft, borderColor: colors.primary, color: colors.primaryDark },
  metric: { marginTop: 18, backgroundColor: colors.surface, borderRadius: 24, padding: 22, borderWidth: 1, borderColor: colors.border },
  metricLabel: { color: colors.muted, fontSize: 18, fontWeight: '800' },
  metricValue: { color: colors.ink, fontSize: 40, fontWeight: '900', marginTop: 4 },
  metricMeta: { color: colors.muted, fontSize: 16, marginTop: 5 },
  empty: { color: colors.muted, fontSize: 18, lineHeight: 26, fontWeight: '600' },
  record: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 18, marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  date: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  amount: { color: colors.success, fontSize: 19, fontWeight: '900' },
});
