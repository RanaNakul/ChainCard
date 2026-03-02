import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type ViewMode = 'grid' | 'list';
type SortMode = 'Most Valuable' | 'Newest';

type CardItem = {
  id: string;
  name: string;
  condition: string;
  qty: number;
  price: number;
  change: number;
  changePct: number;
  image: string;
  favorite?: boolean;
  rare?: boolean;
};

const portfolioCards: CardItem[] = [
  {
    id: 'charizard-1',
    name: 'Charizard',
    condition: 'Near Mint',
    qty: 1,
    price: 587.55,
    change: 15.06,
    changePct: 2.98,
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwpjg4qW1fFDGgt8m2StSBGHeyAJkCGfTZQ&s',
    favorite: true,
  },
  {
    id: 'mew-ex-1',
    name: 'Mew EX',
    condition: 'Near Mint',
    qty: 1,
    price: 564.95,
    change: 37.45,
    changePct: 7.71,
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwpjg4qW1fFDGgt8m2StSBGHeyAJkCGfTZQ&s',
    rare: true,
  },
  {
    id: 'charizard-2',
    name: 'Charizard',
    condition: 'Near Mint',
    qty: 1,
    price: 520.06,
    change: 37.45,
    changePct: 7.77,
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwpjg4qW1fFDGgt8m2StSBGHeyAJkCGfTZQ&s',
    favorite: true,
  },
];

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

export default function PortfolioScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('Most Valuable');

  const totalCards = useMemo(() => portfolioCards.reduce((total, card) => total + card.qty, 0), []);
  const totalValue = useMemo(
    () => portfolioCards.reduce((total, card) => total + card.price * card.qty, 0),
    []
  );
  const averagePrice = useMemo(
    () => (totalCards > 0 ? totalValue / totalCards : 0),
    [totalCards, totalValue]
  );
  const favoritesCount = useMemo(() => portfolioCards.filter((card) => card.favorite).length, []);
  const rarestCount = useMemo(() => portfolioCards.filter((card) => card.rare).length, []);

  const sortedCards = useMemo(() => {
    if (sortMode === 'Most Valuable') {
      return [...portfolioCards].sort((a, b) => b.price - a.price);
    }
    return [...portfolioCards].sort((a, b) => b.changePct - a.changePct);
  }, [sortMode]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-5 pt-3">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-neutral-900">Portfolio Screen</Text>
          <Pressable className="h-9 w-9 items-center justify-center rounded-full border border-neutral-300">
            <Ionicons name="ellipsis-vertical" size={18} color="#262626" />
          </Pressable>
        </View>

        <View className="mb-4 flex-row items-center justify-between">
          <Pressable className="flex-row items-center rounded-full border border-neutral-300 bg-white px-3 py-2">
            <Text className="mr-1 text-sm font-medium text-neutral-800">All</Text>
            <Ionicons name="chevron-down" size={14} color="#525252" />
          </Pressable>

          <Pressable className="rounded-lg border border-neutral-300 px-3 py-2">
            <Text className="text-xs font-medium text-neutral-700">Clear All Collection</Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="mb-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <View className="border-b border-neutral-200 px-4 py-4">
              <Text className="text-xl font-semibold text-neutral-900">Portfolio: Pokemon</Text>
            </View>

            <View className="flex-row border-b border-neutral-200 px-2 py-4">
              <View className="w-1/3 items-center px-2">
                <Ionicons name="albums-outline" size={18} color="#404040" />
                <Text className="mt-1 text-lg font-semibold text-neutral-900">{totalCards}</Text>
                <Text className="text-xs text-neutral-500">Total Cards</Text>
              </View>

              <View className="w-1/3 items-center px-2">
                <Ionicons name="cash-outline" size={18} color="#404040" />
                <Text className="mt-1 text-lg font-semibold text-neutral-900">
                  {formatCurrency(totalValue)}
                </Text>
                <Text className="text-xs text-neutral-500">Total Value</Text>
              </View>

              <View className="w-1/3 items-center px-2">
                <Ionicons name="stats-chart-outline" size={18} color="#404040" />
                <Text className="mt-1 text-lg font-semibold text-neutral-900">
                  {formatCurrency(averagePrice)}
                </Text>
                <Text className="text-xs text-neutral-500">Avg. Price</Text>
              </View>
            </View>

            <View className="flex-row">
              <View className="w-1/2 px-4 py-4">
                <View className="flex-row items-center">
                  <Text className="mr-2 text-base font-semibold text-neutral-900">Favourite</Text>
                  <Ionicons name="heart-outline" size={18} color="#404040" />
                  <Text className="ml-2 text-base font-semibold text-neutral-900">
                    {favoritesCount}
                  </Text>
                </View>
              </View>

              <View className="w-px bg-neutral-200" />

              <View className="flex-1 px-4 py-4">
                <View className="flex-row items-center">
                  <Text className="mr-2 text-base font-semibold text-neutral-900">Rarest</Text>
                  <Ionicons name="star-outline" size={18} color="#404040" />
                  <Text className="ml-2 text-base font-semibold text-neutral-900">
                    {rarestCount}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="mb-3 flex-row items-center justify-between">
            <Pressable
              onPress={() =>
                setSortMode((prev) => (prev === 'Most Valuable' ? 'Newest' : 'Most Valuable'))
              }
              className="flex-row items-center">
              <Text className="mr-1 text-lg font-semibold text-neutral-900">{sortMode}</Text>
              <Ionicons name="chevron-down" size={16} color="#525252" />
            </Pressable>

            <View className="flex-row rounded-full border border-neutral-300 bg-white p-1">
              <Pressable
                onPress={() => setViewMode('list')}
                className={`mr-1 rounded-full px-3 py-1 ${
                  viewMode === 'list' ? 'bg-neutral-900' : 'bg-transparent'
                }`}>
                <Ionicons
                  name="list"
                  size={16}
                  color={viewMode === 'list' ? '#ffffff' : '#525252'}
                />
              </Pressable>

              <Pressable
                onPress={() => setViewMode('grid')}
                className={`rounded-full px-3 py-1 ${
                  viewMode === 'grid' ? 'bg-neutral-900' : 'bg-transparent'
                }`}>
                <Ionicons
                  name="grid"
                  size={16}
                  color={viewMode === 'grid' ? '#ffffff' : '#525252'}
                />
              </Pressable>
            </View>
          </View>

          {viewMode === 'grid' ? (
            <View className="mb-4 flex-row flex-wrap justify-between">
              {sortedCards.slice(0, 2).map((card) => (
                <View
                  key={card.id}
                  className="mb-4 w-[48%] overflow-hidden rounded-xl border border-neutral-200 bg-white p-3">
                  <View className="mb-3 aspect-[3/4] w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                    <Image
                      source={{ uri: card.image }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  </View>

                  <Text className="text-lg font-semibold text-neutral-900">{card.name}</Text>
                  <Text className="text-sm text-neutral-500">{card.condition}</Text>

                  <View className="mt-2 flex-row items-center justify-between">
                    <Text className="text-sm text-neutral-500">Qty: {card.qty}</Text>
                    <Text className="text-base font-semibold text-neutral-900">
                      {formatCurrency(card.price)}
                    </Text>
                  </View>

                  <Text
                    className={`mt-1 text-sm font-medium ${
                      card.change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                    {card.change >= 0 ? '+' : '-'}
                    {formatCurrency(Math.abs(card.change))} ({card.changePct.toFixed(2)}%)
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {viewMode === 'list' ? (
            <View className="mb-24 overflow-hidden rounded-xl border border-neutral-200 bg-white p-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="mr-3 aspect-[3/4] w-12 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
                    <Image
                      source={{ uri: sortedCards[2]?.image || sortedCards[0].image }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  </View>

                  <View>
                    <Text className="text-lg font-semibold text-neutral-900">
                      {sortedCards[2]?.name || sortedCards[0].name}
                    </Text>
                    <Text className="text-sm text-neutral-500">
                      {sortedCards[2]?.condition || sortedCards[0].condition}
                    </Text>
                  </View>
                </View>

                <View className="items-end">
                  <Text className="text-lg font-semibold text-neutral-900">
                    {formatCurrency(sortedCards[2]?.price || sortedCards[0].price)}
                  </Text>
                  <Text className="text-sm font-medium text-emerald-600">
                    +{formatCurrency(sortedCards[2]?.change || sortedCards[0].change)} (
                    {(sortedCards[2]?.changePct || sortedCards[0].changePct).toFixed(2)}%)
                  </Text>
                </View>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
