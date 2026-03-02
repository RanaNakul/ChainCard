import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

type ThemeOption = 'System' | 'Light' | 'Dark';
type LanguageOption = 'English' | 'Hindi' | 'Spanish';

type SelectorRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress: () => void;
};

type ActionRowProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
};

function SelectorRow({ icon, label, value, onPress }: SelectorRowProps) {
  return (
    <View className="flex-row items-center justify-between py-4">
      <View className="flex-row items-center gap-3">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
          {icon}
        </View>
        <Text className="text-base font-medium text-neutral-900">{label}</Text>
      </View>

      <Pressable
        onPress={onPress}
        className="flex-row items-center rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2">
        <Text className="mr-2 text-sm font-medium text-neutral-700">{value}</Text>
        <Ionicons name="chevron-down" size={16} color="#525252" />
      </Pressable>
    </View>
  );
}

function ActionRow({ icon, label, onPress }: ActionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-4 active:opacity-70">
      <View className="flex-row items-center gap-3">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
          {icon}
        </View>
        <Text className="text-base font-medium text-neutral-900">{label}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#737373" />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>('System');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>('English');

  const themeOrder: ThemeOption[] = useMemo(() => ['System', 'Light', 'Dark'], []);
  const languageOrder: LanguageOption[] = useMemo(() => ['English', 'Hindi', 'Spanish'], []);

  const cycleTheme = () => {
    const currentIndex = themeOrder.indexOf(selectedTheme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setSelectedTheme(themeOrder[nextIndex]);
  };

  const cycleLanguage = () => {
    const currentIndex = languageOrder.indexOf(selectedLanguage);
    const nextIndex = (currentIndex + 1) % languageOrder.length;
    setSelectedLanguage(languageOrder[nextIndex]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-5 pt-3">
        <Text className="mb-4 text-center text-2xl font-bold text-neutral-900">Settings</Text>

        <View className="flex flex-1 justify-between px-4 pb-8">
          <View className="flex gap-4">
            <SelectorRow
              icon={<Ionicons name="sunny-outline" size={18} color="#404040" />}
              label="Theme"
              value={selectedTheme}
              onPress={cycleTheme}
            />

            <View className="h-px bg-neutral-200" />

            <SelectorRow
              icon={<Ionicons name="language-outline" size={18} color="#404040" />}
              label="Language"
              value={selectedLanguage}
              onPress={cycleLanguage}
            />

            <View className="h-px bg-neutral-200" />

            <ActionRow
              icon={<MaterialIcons name="feedback" size={18} color="#404040" />}
              label="Feedback"
              onPress={() => {}}
            />

            <View className="h-px bg-neutral-200" />

            <ActionRow
              icon={<Ionicons name="star-outline" size={18} color="#404040" />}
              label="Rate Us"
              onPress={() => {}}
            />

            <View className="h-px bg-neutral-200" />

            <ActionRow
              icon={<Ionicons name="share-social-outline" size={18} color="#404040" />}
              label="Share App"
              onPress={() => {}}
            />

            <View className="h-px bg-neutral-200" />

            <ActionRow
              icon={<Ionicons name="shield-checkmark-outline" size={18} color="#404040" />}
              label="Privacy"
              onPress={() => {}}
            />

            <View className="h-px bg-neutral-200" />

            <ActionRow
              icon={
                <MaterialCommunityIcons name="file-document-outline" size={18} color="#404040" />
              }
              label="Terms & Conditions"
              onPress={() => {}}
            />
          </View>

          <Text className="mt-6 text-center align-bottom text-sm text-neutral-500">
            © 2026 Chain Card
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
