import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/ui";
export default function Layout() {
  const inset = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 66 + inset.bottom,
          paddingBottom: Math.max(inset.bottom, 8),
          paddingTop: 8,
          borderTopColor: colors.border,
          backgroundColor: "#FFFFFF",
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" color={color} size={23} />
          ),
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: "Histórico",
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar-outline" color={color} size={23} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" color={color} size={23} />
          ),
        }}
      />
    </Tabs>
  );
}
