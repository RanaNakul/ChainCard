import { Stack } from 'expo-router';
import '../global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useCardStorage } from '../src/stores/cardStorage';

export default function RootLayout() {
  const themePreference = useCardStorage((state) => state.theme);
  const { colorScheme, setColorScheme } = useColorScheme();
  const appliedThemePreference = useRef<string | null>(null);

  useEffect(() => {
    if (appliedThemePreference.current === themePreference) return;
    appliedThemePreference.current = themePreference;
    setColorScheme(themePreference);
  }, [themePreference, setColorScheme]);

  const isDark = colorScheme === 'dark';

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'ios_from_right',
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="scanScreen" />
        </Stack>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
