import React, { useCallback, useRef, useState } from 'react';
import { Alert, Image, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useCardStorage } from '../src/stores/cardStorage';
import { recognizeCard } from '../src/services/cardRecognitionService';

type CameraFacing = 'front' | 'back';
type LayoutRect = { x: number; y: number; width: number; height: number };

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<CameraFacing>('back');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewLayout, setPreviewLayout] = useState<LayoutRect | null>(null);
  const [scanAreaLayout, setScanAreaLayout] = useState<LayoutRect | null>(null);
  const [frameLayout, setFrameLayout] = useState<LayoutRect | null>(null);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const saveCardScan = useCardStorage((s) => s.saveCardScan);

  const processScannedImage = useCallback(
    async (imageUri: string) => {
      let card;
      try {
        const recognized = await recognizeCard(imageUri);
        card = recognized?.card;
        // console.log('[scanScreen] Recognized card:', card);
      } catch (recognitionError) {
        console.error('[scanScreen] Recognition failed:', recognitionError);
        Alert.alert('Saved', 'Image was saved, but recognition failed.');
      }

      await saveCardScan(imageUri, card);
      setPreviewImageUri(card?.image);
    },
    [saveCardScan]
  );

  const handleCapture = useCallback(async () => {
    if (isCapturing) return;

    if (!cameraRef.current || !previewLayout || !scanAreaLayout || !frameLayout) {
      Alert.alert('Camera not ready', 'Please wait a moment and try again.');
      return;
    }

    try {
      setIsCapturing(true);

      const picture = await cameraRef.current.takePictureAsync({
        quality: 1,
      });

      if (!picture?.uri || !picture.width || !picture.height) {
        throw new Error('Failed to capture photo.');
      }

      const frameXInPreview = scanAreaLayout.x + frameLayout.x;
      const frameYInPreview = scanAreaLayout.y + frameLayout.y;

      const scale = Math.max(
        previewLayout.width / picture.width,
        previewLayout.height / picture.height
      );

      const renderedWidth = picture.width * scale;
      const renderedHeight = picture.height * scale;
      const offsetX = (renderedWidth - previewLayout.width) / 2;
      const offsetY = (renderedHeight - previewLayout.height) / 2;

      const cropOriginX = Math.max(
        0,
        Math.min((frameXInPreview + offsetX) / scale, picture.width - 1)
      );
      const cropOriginY = Math.max(
        0,
        Math.min((frameYInPreview + offsetY) / scale, picture.height - 1)
      );
      const cropWidth = Math.max(
        1,
        Math.min(frameLayout.width / scale, picture.width - cropOriginX)
      );
      const cropHeight = Math.max(
        1,
        Math.min(frameLayout.height / scale, picture.height - cropOriginY)
      );

      const cropped = await manipulateAsync(
        picture.uri,
        [
          {
            crop: {
              originX: Math.round(cropOriginX),
              originY: Math.round(cropOriginY),
              width: Math.round(cropWidth),
              height: Math.round(cropHeight),
            },
          },
        ],
        {
          compress: 1,
          format: SaveFormat.JPEG,
        }
      );

      await processScannedImage(cropped.uri);
    } catch (error) {
      console.error('[scanScreen] Capture failed:', error);
      Alert.alert('Capture failed', 'Could not capture card image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  }, [frameLayout, isCapturing, previewLayout, processScannedImage, scanAreaLayout]);

  const handlePickFromGallery = useCallback(async () => {
    if (isCapturing) return;

    try {
      setIsCapturing(true);

      const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!mediaPermission.granted) {
        Alert.alert('Permission required', 'Allow photo library access to select a card image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 1,
      });

      if (result.canceled) {
        return;
      }

      const imageUri = result.assets?.[0]?.uri;
      if (!imageUri) {
        Alert.alert('Selection failed', 'No image was selected. Please try again.');
        return;
      }

      await processScannedImage(imageUri);
    } catch (error) {
      console.error('[scanScreen] Gallery pick failed:', error);
      Alert.alert('Selection failed', 'Could not open gallery. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, processScannedImage]);

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

      <View className="flex-1" >
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={facing}
          enableTorch={facing === 'back' && torchEnabled}
          onLayout={(event) => setPreviewLayout(event.nativeEvent.layout)}></CameraView>

        <View pointerEvents="box-none" className="flex-1 absolute inset-0 z-10 bg-black/25 px-5 pb-7 pt-4">
          <View className="mb-6 flex-row items-center justify-between">
            <Pressable className="h-12 flex-1 flex-row items-center justify-between rounded-xl border border-white/35 bg-black/40 px-4">
              <Text className="text-lg font-semibold text-white">Pokemon</Text>
              <Ionicons name="chevron-down" size={20} color="#FFFFFF" />
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              className="ml-3 h-12 w-12 items-center justify-center rounded-full border border-white/35 bg-black/40">
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>
          </View>

          <View
            className="flex-1 items-center"
            onLayout={(event) => setScanAreaLayout(event.nativeEvent.layout)}>
            <Text className="mb-4 text-3xl font-semibold tracking-widest text-white">
              FRONT OF CARD
            </Text>
            <View
              onLayout={(event) => setFrameLayout(event.nativeEvent.layout)}
              className="aspect-[3/4] w-[78%] rounded-2xl border-2 border-white/90 bg-transparent"
            />
          </View>

          <View className="flex-row items-center justify-evenly">
            <Pressable
              onPress={handlePickFromGallery}
              disabled={isCapturing}
              className="h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-black/45 active:opacity-80">
              <Ionicons name="images-outline" size={24} color="#FFFFFF" />
            </Pressable>

            <Pressable
              onPress={handleCapture}
              disabled={isCapturing}
              className="h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-black/30 active:opacity-80">
              <View
                className="h-12 w-12 rounded-full bg-white"
                style={isCapturing ? { backgroundColor: '#D4D4D4' } : undefined}
              />
            </Pressable>

            <Pressable
              disabled={facing === 'front'}
              onPress={() => setTorchEnabled((prev) => !prev)}
              className="h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-black/45 active:opacity-80">
              <Ionicons
                name={facing === 'back' && torchEnabled ? 'flash' : 'flash-off-outline'}
                size={24}
                color={facing === 'front' ? '#A3A3A3' : '#FFFFFF'}
              />
            </Pressable>
          </View>
        </View>
      </View>

      <Modal
        visible={Boolean(previewImageUri)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImageUri(null)}>
        <View className="flex-1 items-center justify-center bg-black/75 px-6">
          <View className="w-full rounded-2xl bg-neutral-900 p-4">
            <Text className="mb-3 text-center text-lg font-semibold text-white">Captured Card</Text>
            {previewImageUri ? (
              <Image
                source={{ uri: previewImageUri + '/high.jpg' }}
                className="aspect-[3/4] w-full rounded-xl"
                resizeMode="cover"
              />
            ) : null}
            <Pressable
              onPress={() => setPreviewImageUri(null)}
              className="mt-4 rounded-xl bg-white py-3 active:opacity-80">
              <Text className="text-center font-semibold text-neutral-900">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
