import { Stack } from 'expo-router';
import '../global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';

const MyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#fff',
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={MyTheme}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'ios_from_right',
          }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
