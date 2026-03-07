import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

type ThemeOption = 'System' | 'Light' | 'Dark';
type LanguageOption = 'English' | 'Hindi' | 'Spanish';

type SelectorRowProps<T extends string> = {
  icon: React.ReactNode;
  label: string;
  value: T;
  options: readonly T[];
  isDropdownOpen: boolean;
  onToggleDropdown: () => void;
  onSelectOption: (option: T) => void;
};

type ActionRowProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
};

function SelectorRow<T extends string>({
  icon,
  label,
  value,
  options,
  isDropdownOpen,
  onToggleDropdown,
  onSelectOption,
}: SelectorRowProps<T>) {
  return (
    <View className="flex-row items-center justify-between py-4">
      <View className="flex-row items-center gap-3">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
          {icon}
        </View>
        <Text className="text-base font-medium text-neutral-900">{label}</Text>
      </View>
      <View className={`relative ${isDropdownOpen ? 'z-50' : 'z-10'}`}>

        <Pressable
          onPress={onToggleDropdown}
          className="flex-row items-center rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2">
          <Text className="mr-2 text-sm font-medium text-neutral-700">{value}</Text>
          <Ionicons
            name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#525252"
          />
        </Pressable>

        {isDropdownOpen ? (
          <View className="absolute right-0 top-10 z-50 min-w-[150px] rounded-xl border border-neutral-200 bg-white p-1">
            {options.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  onSelectOption(option);
                }}
                className={`rounded-lg px-3 py-2 ${
                  value === option ? 'bg-neutral-100' : 'bg-white'
                }`}>
                <Text
                  className={`text-base ${
                    value === option ? 'font-semibold text-neutral-900' : 'text-neutral-700'
                  }`}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
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
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const themeOptions: readonly ThemeOption[] = ['System', 'Light', 'Dark'];
  const languageOptions: readonly LanguageOption[] = ['English', 'Hindi', 'Spanish'];

  const closeDropdowns = () => {
    setIsThemeDropdownOpen(false);
    setIsLanguageDropdownOpen(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-5 pt-3">
        {isThemeDropdownOpen || isLanguageDropdownOpen ? (
          <Pressable onPress={closeDropdowns} className="absolute inset-0 z-40" />
        ) : null}
        <Text className="mb-4 text-center text-2xl font-bold text-neutral-900">Settings</Text>

        <View className="flex flex-1 justify-between px-4 pb-1">
          <View className="flex gap-4">
            <SelectorRow
              icon={<Ionicons name="sunny-outline" size={18} color="#404040" />}
              label="Theme"
              value={selectedTheme}
              options={themeOptions}
              isDropdownOpen={isThemeDropdownOpen}
              onToggleDropdown={() => {
                setIsThemeDropdownOpen((prev) => !prev);
                setIsLanguageDropdownOpen(false);
              }}
              onSelectOption={(option) => {
                setSelectedTheme(option);
                setIsThemeDropdownOpen(false);
              }}
            />

            {/* <View className="h-px bg-neutral-200" />

            <SelectorRow
              icon={<Ionicons name="language-outline" size={18} color="#404040" />}
              label="Language"
              value={selectedLanguage}
              options={languageOptions}
              isDropdownOpen={isLanguageDropdownOpen}
              onToggleDropdown={() => {
                setIsLanguageDropdownOpen((prev) => !prev);
                setIsThemeDropdownOpen(false);
              }}
              onSelectOption={(option) => {
                setSelectedLanguage(option);
                setIsLanguageDropdownOpen(false);
              }}
            /> */}

            {/* <View className="h-px bg-neutral-200" /> */}

            {/* <ActionRow
              icon={<MaterialIcons name="feedback" size={18} color="#404040" />}
              label="Feedback"
              onPress={() => {}}
            /> */}

            {/* <View className="h-px bg-neutral-200" /> */}

            {/* <ActionRow
              icon={<Ionicons name="star-outline" size={18} color="#404040" />}
              label="Rate Us"
              onPress={() => {}}
            /> */}

            {/* <View className="h-px bg-neutral-200" />

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
            /> */}
          </View>

          <Text className="mt-6 text-center align-bottom text-sm text-neutral-500">
            © 2026 Chain Card
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
