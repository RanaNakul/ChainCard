import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const RECENT_CARD_IMAGE =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwpjg4qW1fFDGgt8m2StSBGHeyAJkCGfTZQ&s';

const recentCards = Array.from({ length: 4 }).map((_, index) => ({
  id: `recent-card-${index}`,
  image: RECENT_CARD_IMAGE,
}));

const recentSearches = ['Pikachu', 'Charizard', 'Luffy'];

const quickFilters = [
  'Pokemon TCG',
  'One Piece Card Game',
  'Dragon Ballz Card Game',
  'Racing',
  'MMA',
  'Basketball',
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');

  const filteredRecentSearches = useMemo(() => {
    if (!query.trim()) return recentSearches;
    return recentSearches.filter((item) => item.toLowerCase().includes(query.toLowerCase().trim()));
  }, [query]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-5 pb-8 pt-3">
          <View className="mb-5 flex-row items-center rounded-full border border-neutral-300 bg-neutral-100 px-4 py-3">
            <Ionicons name="search-outline" size={20} color="#525252" />
            <TextInput
              placeholder="Search For Card"
              placeholderTextColor="#737373"
              value={query}
              onChangeText={setQuery}
              className="ml-2 flex-1 text-base text-neutral-900"
            />
            {query.length > 0 ? (
              <Pressable
                onPress={() => setQuery('')}
                className="h-6 w-6 items-center justify-center rounded-full bg-neutral-300">
                <Ionicons name="close" size={16} color="#262626" />
              </Pressable>
            ) : null}
          </View>

          <Text className="mb-3 text-lg font-semibold text-neutral-900">Recent</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
            <View className="flex-row gap-3">
              {recentCards.map((card) => (
                <View
                  key={card.id}
                  className="h-28 w-20 overflow-hidden rounded-lg border border-neutral-300 bg-neutral-200">
                  <Image source={{ uri: card.image }} className="h-full w-full" />
                </View>
              ))}
            </View>
          </ScrollView>

          <View className="mt-4 rounded-xl border border-neutral-200 bg-white px-4 py-3">
            {filteredRecentSearches.length === 0 ? (
              <Text className="py-2 text-neutral-500">No recent results</Text>
            ) : (
              filteredRecentSearches.map((item, index) => (
                <View
                  key={item}
                  className={`flex-row items-center justify-between py-3 ${
                    index < filteredRecentSearches.length - 1 ? 'border-b border-neutral-200' : ''
                  }`}>
                  <View className="flex-row items-center">
                    <Text className="mr-2 text-neutral-500">{index + 1}.</Text>
                    <Text className="text-lg font-medium text-neutral-900">{item}</Text>
                  </View>
                  <Ionicons name="arrow-up-outline" size={18} color="#6B7280" />
                </View>
              ))
            )}
          </View>

          <Text className="mb-3 mt-6 text-xl font-semibold text-neutral-900">Quick Filters</Text>
          <View className="flex-row flex-wrap justify-between">
            {quickFilters.map((filter) => (
              <Pressable
                key={filter}
                className="mb-3 h-24 w-[48%] items-center justify-center rounded-lg border border-neutral-300 bg-white px-3">
                <Text className="text-center text-base font-semibold text-neutral-900">
                  {filter}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
