import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCardStorage } from '../../src/stores/cardStorage';

const SEARCH_API_URL = 'https://api.tcgdex.net/v2/en/cards?name=';

type CardSearchResult = {
  id: string;
  name?: string;
  localId?: string;
  category?: string;
  rarity?: string;
  image?: string | { low?: string; high?: string; url?: string };
  set?: {
    name?: string;
  };
};

function resolveCardImage(image?: CardSearchResult['image']) {
  if (!image) return undefined;

  if (typeof image === 'string') {
    if (/\.(png|jpe?g|webp)(\?.*)?$/i.test(image)) return image;
    if (image.endsWith('/')) return `${image}low.jpg`;
    return `${image}/low.jpg`;
  }

  return image.low ?? image.high ?? image.url;
}

function normalizeCards(payload: any): CardSearchResult[] {
  const rawCards = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.cards)
      ? payload.cards
      : [];

  return rawCards.filter((card: any) => card && typeof card.id === 'string');
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const searchHistory = useCardStorage((state) => state.searchHistory ?? []);
  const addToHistory = useCardStorage((state) => state.addToHistory);
  const [results, setResults] = useState<CardSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const trimmedQuery = query.trim();

  const filteredRecentSearches = useMemo(() => {
    if (!trimmedQuery) return searchHistory;
    return searchHistory.filter((item) => item.toLowerCase().includes(trimmedQuery.toLowerCase()));
  }, [searchHistory, trimmedQuery]);

  useEffect(() => {
    if (!trimmedQuery) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const abortController = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${SEARCH_API_URL}${encodeURIComponent(trimmedQuery)}`, {
          signal: abortController.signal,
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || 'Failed to fetch cards.');
        }

        setResults(normalizeCards(payload));
      } catch (fetchError: any) {
        if (fetchError?.name === 'AbortError') return;
        setResults([]);
        setError(fetchError?.message || 'Unable to fetch cards. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      abortController.abort();
      clearTimeout(timeoutId);
    };
  }, [trimmedQuery, retryCount]);

  const addSearchToHistory = (value: string) => {
    const term = value.trim();
    if (!term) return;
    addToHistory(term);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <ScrollView className="flex-1">
        <Text className="mb-4 mt-3 text-center text-2xl font-bold text-[#9945FF]">Search</Text>
        <View className="px-5 pb-8 pt-3">
          <View className="mb-5 flex-row items-center rounded-full border border-neutral-300 bg-neutral-100 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900">
            <Ionicons name="search-outline" size={20} color="#525252" />
            <TextInput
              placeholder="Search For Card"
              placeholderTextColor="#737373"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => addSearchToHistory(query)}
              className="ml-2 flex-1 text-base text-neutral-900 dark:text-neutral-100"
            />
            {query.length > 0 ? (
              <Pressable
                onPress={() => setQuery('')}
                className="h-6 w-6 items-center justify-center rounded-full bg-neutral-300">
                <Ionicons name="close" size={16} color="#262626" />
              </Pressable>
            ) : null}
          </View>

          {!trimmedQuery ? (
            <>
              <Text className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Recent Searches
              </Text>
              <View className="rounded-xl border border-neutral-200 bg-white px-4 py-2 dark:border-neutral-700 dark:bg-neutral-900">
                {filteredRecentSearches.length === 0 ? (
                  <Text className="py-3 text-neutral-500 dark:text-neutral-400">
                    No recent searches
                  </Text>
                ) : (
                  filteredRecentSearches.map((item, index) => (
                    <Pressable
                      key={item}
                      onPress={() => {
                        setQuery(item);
                        addToHistory(item);
                      }}
                      className={`flex-row items-center justify-between py-3 ${
                        index < filteredRecentSearches.length - 1
                          ? 'border-b border-neutral-200 dark:border-neutral-700'
                          : ''
                      }`}>
                      <View className="flex-row items-center">
                        <Text className="mr-2 text-neutral-500 dark:text-neutral-400">
                          {index + 1}.
                        </Text>
                        <Text className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                          {item}
                        </Text>
                      </View>
                      <Ionicons name="arrow-up-outline" size={18} color="#6B7280" />
                    </Pressable>
                  ))
                )}
              </View>
            </>
          ) : null}

          {trimmedQuery ? (
            <View className="mt-4">
              {isLoading ? (
                <View className="items-center rounded-xl border border-neutral-200 bg-white py-10 dark:border-neutral-700 dark:bg-neutral-900">
                  <ActivityIndicator color="#171717" />
                  <Text className="mt-3 text-neutral-600 dark:text-neutral-400">
                    Searching cards...
                  </Text>
                </View>
              ) : null}

              {!isLoading && error ? (
                <View className="items-center rounded-xl border border-red-200 bg-red-50 px-4 py-6">
                  <Text className="text-center text-sm text-red-700">{error}</Text>
                  <Pressable
                    onPress={() => setRetryCount((count) => count + 1)}
                    className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2">
                    <Text className="font-medium text-red-700">Retry</Text>
                  </Pressable>
                </View>
              ) : null}

              {!isLoading && !error && results.length === 0 ? (
                <View className="rounded-xl border border-neutral-200 bg-white py-8 dark:border-neutral-700 dark:bg-neutral-900">
                  <Text className="text-center text-neutral-500 dark:text-neutral-400">
                    No cards found for {trimmedQuery}
                  </Text>
                </View>
              ) : null}

              {!isLoading && !error && results.length > 0 ? (
                <View className="rounded-xl border border-neutral-200 bg-white px-3 py-3 dark:border-neutral-700 dark:bg-neutral-900">
                  {results.map((card, index) => {
                    const imageUri = resolveCardImage(card.image);
                    return (
                      <View
                        key={card.id}
                        className={`flex-row py-3 ${
                          index < results.length - 1
                            ? 'border-b border-neutral-200 dark:border-neutral-700'
                            : ''
                        }`}>
                        <View className="h-24 w-16 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
                          {imageUri ? (
                            <Image
                              source={{ uri: imageUri }}
                              className="h-full w-full"
                              resizeMode="cover"
                            />
                          ) : (
                            <View className="h-full w-full items-center justify-center">
                              <Ionicons name="image-outline" size={18} color="#737373" />
                            </View>
                          )}
                        </View>
                        <View className="ml-3 flex-1 justify-center">
                          <Text
                            className="text-base font-semibold text-neutral-900 dark:text-neutral-100"
                            numberOfLines={1}>
                            {card.name || 'Unknown card'}
                          </Text>
                          <Text
                            className="mt-1 text-sm text-neutral-600 dark:text-neutral-400"
                            numberOfLines={1}>
                            {card.set?.name || 'Unknown set'}
                          </Text>
                          <Text className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                            {[card.category, card.rarity].filter(Boolean).join(' • ') || card.id}
                          </Text>
                          {card.localId ? (
                            <Text className="mt-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                              #{card.localId}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
