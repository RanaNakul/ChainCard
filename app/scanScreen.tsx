import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

type CameraFacing = 'front' | 'back';
type FlashMode = 'off' | 'on';

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraFacing>('back');
  const [flash, setFlash] = useState<FlashMode>('off');

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black">
        <StatusBar style="light" />
        <Text className="mb-3 text-base text-white">Preparing camera...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black px-8">
        <StatusBar style="light" />
        <Text className="mb-3 text-center text-lg font-semibold text-white">
          Camera permission required
        </Text>
        <Text className="mb-6 text-center text-sm text-neutral-300">
          Allow camera access to scan your cards.
        </Text>
        <Pressable
          onPress={requestPermission}
          className="rounded-xl bg-white px-5 py-3 active:opacity-80">
          <Text className="font-semibold text-neutral-900">Allow Camera</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />

      <CameraView style={{ flex: 1 }} facing={facing} flash={flash}>
        <View className="flex-1 bg-black/25 px-5 pb-7 pt-4">
          <View className="mb-6 flex-row items-center justify-between">
            <Pressable className="h-12 flex-1 flex-row items-center justify-between rounded-xl border border-white/35 bg-black/40 px-4">
              <Text className="text-lg font-semibold text-white">Pokemon</Text>
              <Ionicons name="chevron-down" size={20} color="#FFFFFF" />
            </Pressable>

            <Pressable
              onPress={() => router.push('/')}
              className="ml-3 h-12 w-12 items-center justify-center rounded-full border border-white/35 bg-black/40">
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>
          </View>

          <View className="flex-1 items-center">
            <Text className="mb-4 text-3xl font-semibold tracking-widest text-white">
              FRONT OF CARD
            </Text>
            <View className="aspect-[3/4] w-[78%] rounded-2xl border-2 border-white/90 bg-transparent" />
          </View>

          <View className="flex-row items-center justify-evenly">
            <Pressable className="h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-black/45 active:opacity-80">
              <Ionicons name="images-outline" size={24} color="#FFFFFF" />
            </Pressable>

            <Pressable
              onPress={() => setFacing((prev) => (prev === 'back' ? 'front' : 'back'))}
              className="h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-black/30 active:opacity-80">
              <Ionicons name="refresh" size={28} color="#FFFFFF" />
            </Pressable>

            <Pressable
              onPress={() => setFlash((prev) => (prev === 'off' ? 'on' : 'off'))}
              className="h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-black/45 active:opacity-80">
              <Ionicons
                name={flash === 'on' ? 'flash' : 'flash-off-outline'}
                size={24}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}
