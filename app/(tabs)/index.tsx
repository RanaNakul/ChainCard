import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenContent } from '../../src/components/ScreenContent';
import { Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function App() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1">
      <ScreenContent title="Home" path="App.tsx">
        <TouchableOpacity
          onPress={() => router.push('/camera')}
          className="mt-2 rounded-xl bg-neutral-500 px-3 py-2">
          <Text className='text-white'>Camera</Text>
        </TouchableOpacity>
      </ScreenContent>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
