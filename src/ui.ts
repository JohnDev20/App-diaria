import { StyleSheet } from 'react-native';

export const colors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  ink: '#0F172A',
  muted: '#475569',
  border: '#CBD5E1',
  primary: '#1D4ED8',
  primaryDark: '#1E3A8A',
  primarySoft: '#DBEAFE',
  success: '#15803D',
  successSoft: '#DCFCE7',
  warning: '#A16207',
  danger: '#B91C1C',
};

export const common = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36 },
  title: { color: colors.ink, fontSize: 30, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { color: colors.muted, fontSize: 17, lineHeight: 25 },
  sectionLabel: { color: colors.muted, fontSize: 14, fontWeight: '800', letterSpacing: 1, marginTop: 24, marginBottom: 8 },
  card: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 20 },
  button: { minHeight: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  buttonText: { fontSize: 20, fontWeight: '800' },
});
