import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { DiaryProvider } from '../src/DiaryProvider';

export default function RootLayout() {
  return (
    <DiaryProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F8FAFC' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="acessibilidade" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="diaria/nova" />
      </Stack>
    </DiaryProvider>
  );
}
