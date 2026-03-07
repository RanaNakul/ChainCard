import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Pressable, Text } from 'react-native';

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#d4d4d4',
          flexDirection: 'row',
          height: 85,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#14F195',
        tabBarInactiveTintColor: '#6B7280',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: '',
          tabBarIcon: () => null,
          tabBarButton: () => (
            <Pressable
              onPress={() => router.push('/scanScreen')}
              className="-top-[5px] flex-1 items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="Scan card">
              <View className="elevation-8 h-[68px] w-[68px] mt-1 items-center justify-center rounded-full bg-[#9945FF] shadow-lg shadow-[#9945FF]">
                <Ionicons name="scan-outline" size={24} color="#fff" />
                <Text className="text-sm text-white">Scan</Text>
              </View>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="card-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="card" options={{ href: null }} />
    </Tabs>
  );
}
