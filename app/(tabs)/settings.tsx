import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { type AppTheme, useCardStorage } from '../../src/stores/cardStorage';

type ThemeOption = 'System' | 'Light' | 'Dark';
type LanguageOption = 'English' | 'Hindi' | 'Spanish';
type NetworkOption = 'Devnet' | 'Mainnet';

const THEME_LABEL_TO_VALUE: Record<ThemeOption, AppTheme> = {
  System: 'system',
  Light: 'light',
  Dark: 'dark',
};

const THEME_VALUE_TO_LABEL: Record<AppTheme, ThemeOption> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

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
        <View className="h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          {icon}
        </View>
        <Text className="text-base font-medium text-neutral-900 dark:text-neutral-100">{label}</Text>
      </View>
      <View className={`relative ${isDropdownOpen ? 'z-50' : 'z-10'}`}>

        <Pressable
          onPress={onToggleDropdown}
          className="flex-row items-center rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900">
          <Text className="mr-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">{value}</Text>
          <Ionicons
            name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#737373"
          />
        </Pressable>

        {isDropdownOpen ? (
          <View className="absolute right-0 top-10 z-50 min-w-[150px] rounded-xl border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900">
            {options.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  onSelectOption(option);
                }}
                className={`rounded-lg px-3 py-2 ${
                  value === option
                    ? 'bg-neutral-100 dark:bg-neutral-800'
                    : 'bg-white dark:bg-neutral-900'
                }`}>
                <Text
                  className={`text-base ${
                    value === option
                      ? 'font-semibold text-neutral-900 dark:text-neutral-100'
                      : 'text-neutral-700 dark:text-neutral-300'
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
  const selectedThemeValue = useCardStorage((state) => state.theme);
  const setTheme = useCardStorage((state) => state.setTheme);
  const isDevnet = useCardStorage((state) => state.isDevnet);
  const toggleNetwork = useCardStorage((state) => state.toggleNetwork);
  const selectedTheme = THEME_VALUE_TO_LABEL[selectedThemeValue ?? 'system'];
  const selectedNetwork: NetworkOption = isDevnet ? 'Devnet' : 'Mainnet';
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>('English');
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const themeOptions: readonly ThemeOption[] = ['System', 'Light', 'Dark'];
  const networkOptions: readonly NetworkOption[] = ['Devnet', 'Mainnet'];
  const languageOptions: readonly LanguageOption[] = ['English', 'Hindi', 'Spanish'];

  const closeDropdowns = () => {
    setIsThemeDropdownOpen(false);
    setIsNetworkDropdownOpen(false);
    setIsLanguageDropdownOpen(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <View className="flex-1 px-5 pt-3">
        {isThemeDropdownOpen || isNetworkDropdownOpen || isLanguageDropdownOpen ? (
          <Pressable onPress={closeDropdowns} className="absolute inset-0 z-40" />
        ) : null}
        <Text className="mb-4 text-center text-2xl font-bold text-[#9945FF]">
          Settings
        </Text>

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
                setIsNetworkDropdownOpen(false);
                setIsLanguageDropdownOpen(false);
              }}
              onSelectOption={(option) => {
                setTheme(THEME_LABEL_TO_VALUE[option]);
                setIsThemeDropdownOpen(false);
              }}
            />

            <View className="h-px bg-neutral-200" />

            <SelectorRow
              icon={<Ionicons name="git-network-outline" size={18} color="#404040" />}
              label="Network"
              value={selectedNetwork}
              options={networkOptions}
              isDropdownOpen={isNetworkDropdownOpen}
              onToggleDropdown={() => {
                setIsNetworkDropdownOpen((prev) => !prev);
                setIsThemeDropdownOpen(false);
                setIsLanguageDropdownOpen(false);
              }}
              onSelectOption={(option) => {
                if ((option === 'Devnet') !== isDevnet) {
                  toggleNetwork();
                }
                setIsNetworkDropdownOpen(false);
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
                setIsNetworkDropdownOpen(false);
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

          <Text className="mt-6 text-center align-bottom text-sm text-neutral-500 dark:text-neutral-400">
            © 2026 Chain Card
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
