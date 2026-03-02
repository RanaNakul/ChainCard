import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenContent } from '../../src/components/ScreenContent';
import { Image, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1">
      <View className="px-6 py-4">
        <View className="flex flex-row items-center justify-between">
          <Text className="text-3xl font-bold">ChainCard</Text>
          <View className="flex flex-row items-center">
            <Text className="text-xl font-bold">$ USD</Text>
          </View>
        </View>
        <View className="mt-5 gap-1 rounded-xl border border-neutral-300 p-5">
          <Text className="text-2xl font-bold">Portfolio Pokemon</Text>
          <Text className="text-xl font-bold">SOL 10.35</Text>
          <View className="flex flex-row items-center gap-3">
            <Text className="text-3xl font-bold">$ 1,035.68</Text>
            <Text className="text-lg font-bold">eye</Text>
          </View>
          <View className="flex flex-row items-center gap-3">
            <Text className="text-lg font-bold text-red-500">- $ 20.33</Text>
            <Text className="text-lg font-bold text-red-500">2.00%</Text>
          </View>
        </View>
        <View className="mt-5 flex flex-row items-center justify-between">
          <Text className="text-xl font-bold">Most Valuable </Text>
          <View className="flex flex-row items-center gap-3">
            <Ionicons name="menu" size={24} color="black" />
            <Ionicons name="grid" size={20} color="black" />
          </View>
        </View>
        <ScrollView className=" mb-6 mt-4">
          <Pressable
            onPress={() => router.push('/card')}
            className="mb-5 flex flex-row items-center justify-between rounded-xl border border-neutral-300 p-5">
            <View className="flex flex-row items-center gap-3">
              <View className="h-14 w-10 rounded-full bg-neutral-900">
                <Image
                  source={{
                    uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwpjg4qW1fFDGgt8m2StSBGHeyAJkCGfTZQ&s',
                  }}
                  className="size-full object-cover"
                />
              </View>
              <View>
                <Text className="text-lg font-bold">Pikachu</Text>
                <Text className="text-lg font-bold">Near Mint</Text>
              </View>
            </View>
            <View className="flex items-end">
              <Text className="text-lg font-bold">$ 1,035.68</Text>
              <View className="flex flex-row items-center gap-3">
                <Text className="text-lg font-bold text-green-500">+ $55.45</Text>
                <Text className="text-lg font-bold text-green-500">5.00%</Text>
              </View>
            </View>
          </Pressable>
          <TouchableOpacity
            onPress={() => router.push('/card')}
            className="mb-5 flex flex-row items-center justify-between rounded-xl border border-neutral-300 p-5">
            <View className="flex flex-row items-center gap-3">
              <View className="h-14 w-10 rounded-full bg-neutral-900">
                <Image
                  source={{
                    uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwpjg4qW1fFDGgt8m2StSBGHeyAJkCGfTZQ&s',
                  }}
                  className="size-full object-cover"
                />
              </View>
              <View>
                <Text className="text-lg font-bold">Pikachu</Text>
                <Text className="text-lg font-bold">Near Mint</Text>
              </View>
            </View>
            <View className="flex items-end">
              <Text className="text-lg font-bold">$ 1,035.68</Text>
              <View className="flex flex-row items-center gap-3">
                <Text className="text-lg font-bold text-green-500">+ $55.45</Text>
                <Text className="text-lg font-bold text-green-500">5.00%</Text>
              </View>
            </View>
          </TouchableOpacity>
          <View className="mb-5 flex flex-row items-center justify-between rounded-xl border border-neutral-300 p-5">
            <View className="flex flex-row items-center gap-3">
              <View className="h-14 w-10 rounded-full bg-neutral-900">
                <Image
                  source={{
                    uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwpjg4qW1fFDGgt8m2StSBGHeyAJkCGfTZQ&s',
                  }}
                  className="size-full object-cover"
                />
              </View>
              <View>
                <Text className="text-lg font-bold">Pikachu</Text>
                <Text className="text-lg font-bold">Near Mint</Text>
              </View>
            </View>
            <View className="flex items-end">
              <Text className="text-lg font-bold">$ 1,035.68</Text>
              <View className="flex flex-row items-center gap-3">
                <Text className="text-lg font-bold text-green-500">+ $55.45</Text>
                <Text className="text-lg font-bold text-green-500">5.00%</Text>
              </View>
            </View>
          </View>
          <View className="mb-5 flex flex-row items-center justify-between rounded-xl border border-neutral-300 p-5">
            <View className="flex flex-row items-center gap-3">
              <View className="h-14 w-10 rounded-full bg-neutral-900">
                <Image
                  source={{
                    uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwpjg4qW1fFDGgt8m2StSBGHeyAJkCGfTZQ&s',
                  }}
                  className="size-full object-cover"
                />
              </View>
              <View>
                <Text className="text-lg font-bold">Pikachu</Text>
                <Text className="text-lg font-bold">Near Mint</Text>
              </View>
            </View>
            <View className="flex items-end">
              <Text className="text-lg font-bold">$ 1,035.68</Text>
              <View className="flex flex-row items-center gap-3">
                <Text className="text-lg font-bold text-green-500">+ $55.45</Text>
                <Text className="text-lg font-bold text-green-500">5.00%</Text>
              </View>
            </View>
          </View>
          <View className="mb-5 flex flex-row items-center justify-between rounded-xl border border-neutral-300 p-5">
            <View className="flex flex-row items-center gap-3">
              <View className="h-14 w-10 rounded-full bg-neutral-900">
                <Image
                  source={{
                    uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwpjg4qW1fFDGgt8m2StSBGHeyAJkCGfTZQ&s',
                  }}
                  className="size-full object-cover"
                />
              </View>
              <View>
                <Text className="text-lg font-bold">Pikachu</Text>
                <Text className="text-lg font-bold">Near Mint</Text>
              </View>
            </View>
            <View className="flex items-end">
              <Text className="text-lg font-bold">$ 1,035.68</Text>
              <View className="flex flex-row items-center gap-3">
                <Text className="text-lg font-bold text-green-500">+ $55.45</Text>
                <Text className="text-lg font-bold text-green-500">5.00%</Text>
              </View>
            </View>
          </View>
          <View className="mb-5 flex flex-row items-center justify-between rounded-xl border border-neutral-300 p-5">
            <View className="flex flex-row items-center gap-3">
              <View className="h-14 w-10 rounded-full bg-neutral-900">
                <Image
                  source={{
                    uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwpjg4qW1fFDGgt8m2StSBGHeyAJkCGfTZQ&s',
                  }}
                  className="size-full object-cover"
                />
              </View>
              <View>
                <Text className="text-lg font-bold">Pikachu</Text>
                <Text className="text-lg font-bold">Near Mint</Text>
              </View>
            </View>
            <View className="flex items-end">
              <Text className="text-lg font-bold">$ 1,035.68</Text>
              <View className="flex flex-row items-center gap-3">
                <Text className="text-lg font-bold text-green-500">+ $55.45</Text>
                <Text className="text-lg font-bold text-green-500">5.00%</Text>
              </View>
            </View>
          </View>
          <View className="mb-5 flex flex-row items-center justify-between rounded-xl border border-neutral-300 p-5">
            <View className="flex flex-row items-center gap-3">
              <View className="h-14 w-10 rounded-full bg-neutral-900">
                <Image
                  source={{
                    uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwpjg4qW1fFDGgt8m2StSBGHeyAJkCGfTZQ&s',
                  }}
                  className="size-full object-cover"
                />
              </View>
              <View>
                <Text className="text-lg font-bold">Pikachu</Text>
                <Text className="text-lg font-bold">Near Mint</Text>
              </View>
            </View>
            <View className="flex items-end">
              <Text className="text-lg font-bold">$ 1,035.68</Text>
              <View className="flex flex-row items-center gap-3">
                <Text className="text-lg font-bold text-green-500">+ $55.45</Text>
                <Text className="text-lg font-bold text-green-500">5.00%</Text>
              </View>
            </View>
          </View>
          <View className="mb-6 flex-row flex-wrap items-center justify-center gap-4">
            <TouchableOpacity
              onPress={() => router.push('/card')}
              className="relative h-[213px] w-[45%] overflow-hidden rounded-xl">
              <Image
                source={{
                  uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwpjg4qW1fFDGgt8m2StSBGHeyAJkCGfTZQ&s',
                }}
                className="h-full w-full"
              />
              <LinearGradient
                colors={['transparent', 'rgba(15, 23, 42, 0.35)', 'rgba(15, 23, 42, 0.85)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                className="absolute bottom-0 left-0 right-0 rounded-b-xl px-3 pb-3 pt-10">
                <View className="flex flex-row items-center justify-between">
                  <Text className="text-white">$ 503.23</Text>
                  <Text className="text-green-500">+ 3.23%</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
            <View className="relative h-[213px] w-[45%] overflow-hidden rounded-xl">
              <Image
                source={{
                  uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwpjg4qW1fFDGgt8m2StSBGHeyAJkCGfTZQ&s',
                }}
                className="h-full w-full"
              />
              <LinearGradient
                colors={['transparent', 'rgba(15, 23, 42, 0.35)', 'rgba(15, 23, 42, 0.85)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                className="absolute bottom-0 left-0 right-0 rounded-b-xl px-3 pb-3 pt-10">
                <View className="flex flex-row items-center justify-between">
                  <Text className="text-white">$ 503.23</Text>
                  <Text className="text-green-500">+ 3.23%</Text>
                </View>
              </LinearGradient>
            </View>
            <View className="relative h-[213px] w-[45%] overflow-hidden rounded-xl">
              <Image
                source={{
                  uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwpjg4qW1fFDGgt8m2StSBGHeyAJkCGfTZQ&s',
                }}
                className="h-full w-full"
              />
              <LinearGradient
                colors={['transparent', 'rgba(15, 23, 42, 0.35)', 'rgba(15, 23, 42, 0.85)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                className="absolute bottom-0 left-0 right-0 rounded-b-xl px-3 pb-3 pt-10">
                <View className="flex flex-row items-center justify-between">
                  <Text className="text-white">$ 503.23</Text>
                  <Text className="text-green-500">+ 3.23%</Text>
                </View>
              </LinearGradient>
            </View>
            <View className="relative h-[213px] w-[45%] overflow-hidden rounded-xl">
              <Image
                source={{
                  uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwpjg4qW1fFDGgt8m2StSBGHeyAJkCGfTZQ&s',
                }}
                className="h-full w-full"
              />
              <LinearGradient
                colors={['transparent', 'rgba(15, 23, 42, 0.35)', 'rgba(15, 23, 42, 0.85)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                className="absolute bottom-0 left-0 right-0 rounded-b-xl px-3 pb-3 pt-10">
                <View className="flex flex-row items-center justify-between">
                  <Text className="text-white">$ 503.23</Text>
                  <Text className="text-green-500">+ 3.23%</Text>
                </View>
              </LinearGradient>
            </View>
          </View>
          <View style={{ height: 200 }} />
        </ScrollView>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
