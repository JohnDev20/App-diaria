import { Tabs } from 'expo-router';
import React from 'react';
import { colors } from '../../src/ui';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 13, fontWeight: '700' },
        tabBarStyle: { height: 74, paddingBottom: 12, paddingTop: 8, backgroundColor: '#FFFFFF', borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarAccessibilityLabel: 'Início' }} />
      <Tabs.Screen name="summary" options={{ title: 'Resumo', tabBarAccessibilityLabel: 'Resumo' }} />
      <Tabs.Screen name="settings" options={{ title: 'Ajustes', tabBarAccessibilityLabel: 'Ajustes' }} />
    </Tabs>
  );
}
