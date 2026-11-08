import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Stack, router, useRootNavigationState } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DiaryData } from "../src/diary";
import { pickBackup } from "../src/backup";
import { DiaryProvider, useDiary } from "../src/DiaryProvider";
import { Button, Confirm, Notice, Screen, useTask } from "../src/components";
function Recovery() {
  const d = useDiary(),
    task = useTask();
  const [pending, setPending] = useState<DiaryData | null>(null),
    [previous, setPrevious] = useState(false);
  return (
    <Screen
      title="Vamos proteger seus dados"
      subtitle="Nenhum registro foi apagado."
    >
      <Notice text={d.error} />
      <Notice text={task.error} />
      <Button label="Tentar novamente" onPress={d.retry} />
      <Button
        secondary
        label="Recuperar cópia anterior"
        onPress={() => setPrevious(true)}
      />
      <Button
        secondary
        label="Importar um backup"
        onPress={() => task.run(async () => setPending(await pickBackup()))}
      />
      <Text>
        A cópia anterior contém o estado antes da última gravação. Se não houver
        cópia, importe um backup exportado pelo aplicativo.
      </Text>
      <Confirm
        error={task.error}
        visible={!!pending || previous}
        title="Recuperar os dados?"
        message="O conteúdo selecionado substituirá o estado atual. Os dados ilegíveis serão preservados separadamente para análise."
        busy={task.busy}
        onCancel={() => {
          setPending(null);
          setPrevious(false);
        }}
        onConfirm={() =>
          task.run(async () => {
            await d.recover(pending ?? undefined);
            setPending(null);
            setPrevious(false);
          })
        }
      />
    </Screen>
  );
}
function Navigation() {
  const d = useDiary(),
    navigation = useRootNavigationState(),
    opened = useRef(false);
  useEffect(() => {
    if (navigation?.key && !d.loading && !d.error && !opened.current) {
      opened.current = true;
      if (d.settings.accessibilityMode) router.replace("/acessibilidade");
    }
  }, [navigation?.key, d.loading, d.error, d.settings.accessibilityMode]);
  if (d.loading)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F3F6FC",
          gap: 18,
        }}
      >
        <ActivityIndicator size="large" color="#235CE5" />
        <Text style={{ color: "#152747", fontSize: 20, fontWeight: "700" }}>
          Minhas Diárias
        </Text>
      </View>
    );
  if (d.error) return <Recovery />;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F3F6FC" },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="acessibilidade" />
      <Stack.Screen name="diaria/nova" />
      <Stack.Screen name="pagamento" />
    </Stack>
  );
}
export default function Root() {
  return (
    <SafeAreaProvider>
      <DiaryProvider>
        <StatusBar style="dark" />
        <Navigation />
      </DiaryProvider>
    </SafeAreaProvider>
  );
}
