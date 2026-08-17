import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useDiary } from '../../src/DiaryProvider';
import { colors, common } from '../../src/ui';

export default function SettingsScreen() {
  const { settings, saveSettings } = useDiary();
  const [amount, setAmount] = useState(String(settings.defaultAmount));
  const [name, setName] = useState(settings.name);

  async function persist() {
    const parsed = Number(amount.replace(',', '.'));
    await saveSettings({ defaultAmount: Number.isFinite(parsed) && parsed >= 0 ? parsed : 120, name: name.trim() });
  }

  async function toggleAccessibility(value: boolean) {
    await saveSettings({ accessibilityMode: value });
    if (value) router.push('/acessibilidade');
  }

  return (
    <View style={common.screen}>
      <View style={common.content}>
        <Text style={common.title} accessibilityRole="header">Ajustes</Text>
        <Text style={[common.subtitle, { marginTop: 8 }]}>Escolha como o aplicativo deve funcionar para você.</Text>

        <Text style={common.sectionLabel}>MODO DE ACESSIBILIDADE</Text>
        <View style={styles.accessibilityCard} accessible accessibilityLabel={`Modo de acessibilidade ${settings.accessibilityMode ? 'ligado' : 'desligado'}`}>
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>Modo fácil</Text>
            <Text style={styles.help}>Mostra um botão grande no centro para marcar a diária com um toque.</Text>
          </View>
          <Switch
            value={settings.accessibilityMode}
            onValueChange={toggleAccessibility}
            accessibilityLabel="Ligar modo fácil"
            trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
            thumbColor={settings.accessibilityMode ? colors.primary : '#FFFFFF'}
          />
        </View>

        <Text style={common.sectionLabel}>VALOR PADRÃO DA DIÁRIA</Text>
        <View style={styles.inputWrap}>
          <Text style={styles.prefix}>R$</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            onBlur={persist}
            keyboardType="decimal-pad"
            style={styles.input}
            accessibilityLabel="Valor padrão da diária"
            accessibilityHint="Digite o valor usado ao marcar uma nova diária"
          />
        </View>
        <Text style={styles.help}>Este valor será usado ao marcar novas diárias.</Text>

        <Text style={common.sectionLabel}>NOME / IDENTIFICAÇÃO</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          onBlur={persist}
          placeholder="Opcional"
          placeholderTextColor={colors.muted}
          style={styles.textInput}
          accessibilityLabel="Nome ou identificação"
        />
        <Text style={styles.help}>Opcional. Pode aparecer no cabeçalho do resumo.</Text>

        <Pressable onPress={persist} accessibilityRole="button" accessibilityLabel="Salvar ajustes" style={({ pressed }) => [common.button, styles.save, pressed && styles.pressed]}>
          <Text style={[common.buttonText, { color: '#FFFFFF' }]}>Salvar</Text>
        </Pressable>

        <Text style={styles.footer}>Minhas Diárias v1.0.0</Text>
        <Text style={styles.footer}>Seus dados ficam armazenados no dispositivo.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  accessibilityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 2, borderColor: colors.primary, padding: 18, gap: 12 },
  flex: { flex: 1 },
  cardTitle: { color: colors.ink, fontSize: 23, fontWeight: '900' },
  help: { color: colors.muted, fontSize: 16, lineHeight: 23, marginTop: 5 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: colors.border, minHeight: 62, paddingHorizontal: 18 },
  prefix: { color: colors.ink, fontSize: 21, fontWeight: '800', marginRight: 10 },
  input: { flex: 1, color: colors.ink, fontSize: 23, fontWeight: '700', minHeight: 60 },
  textInput: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: colors.border, minHeight: 62, paddingHorizontal: 18, color: colors.ink, fontSize: 19 },
  save: { backgroundColor: colors.primary, marginTop: 28 },
  footer: { color: colors.muted, textAlign: 'center', fontSize: 15, marginTop: 22 },
  pressed: { opacity: 0.8 },
});
