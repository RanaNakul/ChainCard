import React, { useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCardStorage } from '../../src/stores/cardStorage';
import { useRouter } from 'expo-router';

type ViewMode = 'grid' | 'list';
type SortMode = 'Most Valuable' | 'Newest' | 'Least Valuable' | 'Favorite';
const SORT_OPTIONS: SortMode[] = ['Most Valuable', 'Newest', 'Least Valuable', 'Favorite'];

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

function getMarketPrice(card: any) {
  return Number(
    card?.cardData?.pricing?.tcgplayer?.holofoil?.marketPrice ??
      card?.cardData?.pricing?.tcgplayer?.normal?.marketPrice ??
      card?.cardData?.pricing?.cardmarket?.avg1 ??
      card?.cardData?.pricing?.cardmarket?.avg ??
      0
  );
}

function getMidPrice(card: any) {
  return Number(
    card?.cardData?.pricing?.tcgplayer?.holofoil?.midPrice ??
      card?.cardData?.pricing?.tcgplayer?.normal?.midPrice ??
      card?.cardData?.pricing?.cardmarket?.avg7 ??
      card?.cardData?.pricing?.cardmarket?.trend ??
      0
  );
}

export default function PortfolioScreen() {
  const cards = useCardStorage((state) => state.cards);
  const favoriteCards = useCardStorage((state) => state.favoriteCards ?? []);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('Most Valuable');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const router = useRouter();

  const clearAll = useCardStorage((state) => state.clearAll);

  const totalCards = useMemo(() => cards.length, [cards]);
  const totalValue = useMemo(
    () => cards.reduce((total, card) => total + getMarketPrice(card), 0),
    [cards]
  );
  const averagePrice = useMemo(
    () => (totalCards > 0 ? totalValue / totalCards : 0),
    [totalCards, totalValue]
  );

  const sortedCards = useMemo(() => {
    const next = [...cards];

    if (sortMode === 'Newest') {
      return next.sort((a, b) => b.scannedAt - a.scannedAt);
    }

    if (sortMode === 'Most Valuable') {
      return next.sort((a, b) => getMarketPrice(b) - getMarketPrice(a));
    }

    if (sortMode === 'Least Valuable') {
      return next.sort((a, b) => getMarketPrice(a) - getMarketPrice(b));
    }

    return favoriteCards;
  }, [cards, favoriteCards, sortMode]);

  const hasZeroFavoriteCards = sortMode === 'Favorite' && favoriteCards.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <View className="flex-1 px-5 pt-3">
        {isActionDropdownOpen ? (
          <Pressable
            onPress={() => setIsActionDropdownOpen(false)}
            className="absolute inset-0 z-40"
          />
        ) : null}
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-[#9945FF] ">Portfolio Screen</Text>
          <View className="relative z-50">
            <Pressable
              onPress={() => setIsActionDropdownOpen((prev) => !prev)}
              className="h-9 w-9 items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-700">
              <Ionicons name="ellipsis-vertical" size={18} color="#262626" />
            </Pressable>

            {isActionDropdownOpen ? (
              <View className="absolute right-0 top-11 z-50 min-w-[170px] ">
                <View className="mb-4 flex-row items-center justify-between">
                  <Pressable
                    className="rounded-lg border w-full border-neutral-300 px-3 py-2 bg-white dark:border-neutral-700 dark:bg-neutral-900"
                    onPress={() => {
                      setIsActionDropdownOpen(false);
                      setIsClearConfirmOpen(true);
                    }}>
                    <Text className="text-sm text-center font-medium text-neutral-700 dark:text-neutral-300">
                      Clear All Collection
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {isSortDropdownOpen ? (
          <Pressable
            onPress={() => setIsSortDropdownOpen(false)}
            className="absolute inset-0 z-40"
          />
        ) : null}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => {
            setIsSortDropdownOpen(false);
            setIsActionDropdownOpen(false);
          }}>
          <View className="mb-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
            <View className="border-b border-neutral-200 px-4 py-4 dark:border-neutral-700">
              <Text className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Portfolio Pokemon</Text>
            </View>

            <View className="flex-row px-2 py-4">
              <View className="w-1/3 items-center px-2">
                <Ionicons name="albums-outline" size={18} color="#404040" />
                <Text className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{totalCards}</Text>
                <Text className="text-xs text-neutral-500 dark:text-neutral-400">Total Cards</Text>
              </View>

              <View className="w-1/3 items-center px-2">
                <Ionicons name="cash-outline" size={18} color="#404040" />
                <Text className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(totalValue)}
                </Text>
                <Text className="text-xs text-neutral-500 dark:text-neutral-400">Total Value</Text>
              </View>

              <View className="w-1/3 items-center px-2">
                <Ionicons name="stats-chart-outline" size={18} color="#404040" />
                <Text className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(averagePrice)}
                </Text>
                <Text className="text-xs text-neutral-500 dark:text-neutral-400">Avg. Price</Text>
              </View>
            </View>
          </View>

          <View className="mb-3 flex-row items-center justify-between">
            <Pressable
              onPress={() => setIsSortDropdownOpen((prev) => !prev)}
              className="flex-row items-center">
              <Text className="mr-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{sortMode}</Text>
              <Ionicons
                name={isSortDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#525252"
              />
            </Pressable>
            {isSortDropdownOpen ? (
              <View className="absolute left-0 top-8 z-50 min-w-[170px] rounded-xl border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900">
                {SORT_OPTIONS.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setSortMode(option);
                      setIsSortDropdownOpen(false);
                    }}
                    className={`rounded-lg px-3 py-2 ${
                      sortMode === option
                        ? 'bg-neutral-100 dark:bg-neutral-800'
                        : 'bg-white dark:bg-neutral-900'
                    }`}>
                    <Text
                      className={`text-base ${
                        sortMode === option
                          ? 'font-semibold text-neutral-900 dark:text-neutral-100'
                          : 'text-neutral-700 dark:text-neutral-300'
                      }`}>
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <View className="flex-row rounded-full border border-neutral-300 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900">
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

          {cards.length === 0 ? (
            <View className="mt-24 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
              <Text className="text-center text-lg font-semibold text-neutral-700 dark:text-neutral-300">
                No cards in your portfolio yet.
              </Text>
            </View>
          ) : null}

          {hasZeroFavoriteCards && cards.length > 0 ? (
            <View className="mt-24 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
              <Text className="text-center text-lg font-semibold text-neutral-700 dark:text-neutral-300">
                You have zero favorite Card
              </Text>
            </View>
          ) : null}

          {!hasZeroFavoriteCards && cards.length > 0 && viewMode === 'grid' ? (
            <View className="mb-4 flex-row flex-wrap justify-between">
              {sortedCards.map((card) => {
                const marketPrice = getMarketPrice(card);
                const midPrice = getMidPrice(card);
                const percentDiff = midPrice > 0 ? ((marketPrice - midPrice) / midPrice) * 100 : 0;
                const priceChange = marketPrice - midPrice;
                const isPositive = priceChange >= 0;

                return (
                  <TouchableOpacity
                    key={card.id}
                    onPress={() =>
                      router.push({
                        pathname: '/card',
                        params: { id: card.id },
                      })
                    }
                    className="mb-4 w-[48%] overflow-hidden rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
                    <View className="mb-3 aspect-[3/4] w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
                      <Image
                        source={{
                          uri: card?.cardData?.image
                            ? `${card.cardData.image}/high.jpg`
                            : card.image,
                        }}
                        className="h-full w-full"
                        resizeMode="cover"
                      />
                    </View>

                    <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {card?.cardData?.name ?? 'Unknown Card'}
                    </Text>

                    <Text className="mt-3 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(marketPrice)}
                    </Text>

                    <Text
                      className={`mt-1 text-end text-sm font-medium ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                      {isPositive ? '+' : '-'}
                      {formatCurrency(Math.abs(priceChange))} ({Math.abs(percentDiff).toFixed(2)}%)
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          {!hasZeroFavoriteCards && cards.length > 0 && viewMode === 'list' ? (
            <View className="mb-24 overflow-hidden">
              {sortedCards.map((card) => {
                const marketPrice = getMarketPrice(card);
                const midPrice = getMidPrice(card);
                const percentDiff = midPrice > 0 ? ((marketPrice - midPrice) / midPrice) * 100 : 0;
                const priceChange = marketPrice - midPrice;
                const isPositive = priceChange >= 0;

                return (
                  <View
                    key={card.id}
                    className="mb-4 flex-row items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
                    <View className="flex-row items-center">
                      <View className="mr-3 aspect-[3/4] w-12 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
                        <Image
                          source={{
                            uri: card?.cardData?.image
                              ? `${card.cardData.image}/high.jpg`
                              : card.image,
                          }}
                          className="h-full w-full"
                          resizeMode="cover"
                        />
                      </View>

                      <View>
                        <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                          {card?.cardData?.name ?? 'Unknown Card'}
                        </Text>
                        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                          {card?.cardData?.rarity ?? 'Unknown Rarity'}
                        </Text>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(marketPrice)}
                      </Text>
                      <Text
                        className={`text-sm font-medium ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                        {isPositive ? '+' : '-'}
                        {formatCurrency(Math.abs(priceChange))} ({Math.abs(percentDiff).toFixed(2)}
                        %)
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}

          <View style={{ height: 40 }} />
        </ScrollView>

        <Modal
          transparent
          visible={isClearConfirmOpen}
          animationType="fade"
          onRequestClose={() => setIsClearConfirmOpen(false)}>
          <View className="flex-1 items-center justify-center bg-black/40 px-6">
            <View className="w-full rounded-2xl bg-white p-5 dark:bg-neutral-900">
              <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Clear all cards?</Text>
              <Text className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                This will remove all cards from your collection.
              </Text>

              <View className="mt-5 flex-row justify-end gap-2">
                <Pressable
                  onPress={() => setIsClearConfirmOpen(false)}
                  className="rounded-lg border border-neutral-300 px-4 py-2 dark:border-neutral-700">
                  <Text className="font-medium text-neutral-700 dark:text-neutral-300">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    await clearAll();
                    setIsClearConfirmOpen(false);
                  }}
                  className="rounded-lg bg-rose-600 px-4 py-2">
                  <Text className="font-medium text-white">Clear</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
