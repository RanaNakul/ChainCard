import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCardStorage } from '../../src/stores/cardStorage';

type RangeKey = '1M' | '3M' | '6M' | '12M';

const RANGE_OPTIONS: RangeKey[] = ['1M', '3M', '6M', '12M'];

function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return '$0.00';
  return `$${value.toFixed(2)}`;
}

function buildSeries(range: RangeKey, currentPrice: number, avg30: number, trend: number) {
  const current = currentPrice > 0 ? currentPrice : 1;
  const baseline = avg30 > 0 ? avg30 : current * 0.9;
  const trendValue = trend > 0 ? trend : current * 0.95;

  if (range === '1M') {
    return [
      baseline * 0.94,
      baseline * 0.98,
      trendValue * 0.96,
      trendValue,
      current * 0.99,
      current,
    ];
  }

  if (range === '3M') {
    return [
      baseline * 0.86,
      baseline * 0.9,
      baseline * 0.95,
      trendValue * 1.02,
      trendValue * 0.96,
      current * 0.99,
      current,
    ];
  }

  if (range === '6M') {
    return [
      baseline * 0.8,
      baseline * 0.88,
      baseline * 0.94,
      baseline * 0.91,
      trendValue * 1.03,
      trendValue * 0.92,
      current * 0.97,
      current,
    ];
  }

  return [
    baseline * 0.7,
    baseline * 0.8,
    baseline * 0.75,
    baseline * 0.9,
    trendValue * 1.04,
    trendValue * 0.86,
    current * 0.92,
    current,
  ];
}

function getRangeLabels(range: RangeKey) {
  const now = new Date();

  if (range === '1M') {
    return ['Week 1', 'Week 2', 'Week 4'];
  }

  const monthSpan = range === '3M' ? 3 : range === '6M' ? 6 : 12;
  const first = new Date(now);
  const middle = new Date(now);
  first.setMonth(now.getMonth() - (monthSpan - 1));
  middle.setMonth(now.getMonth() - Math.floor((monthSpan - 1) / 2));

  return [
    first.toLocaleString('en-US', { month: 'short' }),
    middle.toLocaleString('en-US', { month: 'short' }),
    now.toLocaleString('en-US', { month: 'short' }),
  ];
}

export default function CardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const cards = useCardStorage((state) => state.cards);
  const favoriteCards = useCardStorage((state) => state.favoriteCards ?? []);
  const removeScan = useCardStorage((state) => state.removeScan);
  const toggleFavorite = useCardStorage((state) => state.toggleFavorite);

  const [range, setRange] = useState<RangeKey>('3M');
  const [ungradedQty, setUngradedQty] = useState(1);

  const cardId = Array.isArray(id) ? id[0] : id;
  const selectedCard = useMemo(() => {
    if (!cards.length) return undefined;
    if (cardId) {
      return cards.find((card) => card.id === cardId) ?? cards[cards.length - 1];
    }
    return cards[cards.length - 1];
  }, [cardId, cards]);

  if (!selectedCard) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F6F4EF] px-6 dark:bg-neutral-950">
        <Text className="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">No card selected</Text>
        <Text className="mb-6 text-center text-neutral-600 dark:text-neutral-400">
          Open this screen from your card list to view details.
        </Text>
        <Pressable onPress={() => router.back()} className="rounded-xl bg-neutral-900 px-5 py-3">
          <Text className="font-semibold text-white">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isFavorite = favoriteCards.some((card) => card.id === selectedCard.id);

  const cardData = selectedCard.cardData ?? {};
  const imageUri = cardData?.image ? `${cardData.image}/high.jpg` : selectedCard.image;
  const name = cardData?.name ?? 'Unknown card';
  const category = cardData?.category ?? '';
  const setName = cardData?.set?.name ?? '';
  const rarity = cardData?.rarity ?? 'Unknown rarity';
  const localId = cardData?.localId ? `#${cardData.localId}` : '';
  const variant =
    cardData?.variants?.holo === true
      ? 'Holofoil'
      : cardData?.variants?.reverse === true
        ? 'Reverse'
        : cardData?.variants?.normal === true
          ? 'Normal'
          : 'Standard';

  const marketPrice = Number(
    cardData?.pricing?.tcgplayer?.holofoil?.marketPrice ??
      cardData?.pricing?.tcgplayer?.normal?.marketPrice ??
      cardData?.pricing?.cardmarket?.avg1 ??
      cardData?.pricing?.cardmarket?.avg ??
      0
  );
  const previousPrice = Number(
    cardData?.pricing?.tcgplayer?.holofoil?.midPrice ??
      cardData?.pricing?.tcgplayer?.normal?.midPrice ??
      cardData?.pricing?.cardmarket?.avg7 ??
      cardData?.pricing?.cardmarket?.trend ??
      marketPrice
  );
  const avg30 = Number(cardData?.pricing?.cardmarket?.avg30 ?? marketPrice);
  const trend = Number(cardData?.pricing?.cardmarket?.trend ?? previousPrice);

  const priceChange = marketPrice - previousPrice;
  const priceChangePct = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  const rangeSeries = buildSeries(range, marketPrice, avg30, trend);
  const yMax = Math.max(...rangeSeries);
  const yMin = Math.min(...rangeSeries);
  const yDiff = Math.max(yMax - yMin, 1);
  const [labelStart, labelMid, labelEnd] = getRangeLabels(range);
  const ungradedSubtotal = ungradedQty * marketPrice;
  const total = ungradedSubtotal;

  const handleRemove = () => {
    Alert.alert('Remove card?', 'This will remove the scanned card from your collection.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await removeScan(selectedCard.id);
          router.back();
        },
      },
    ]);
  };

  const RowCounter = ({
    label,
    subtitle,
    unitPrice,
    qty,
    onMinus,
    onPlus,
  }: {
    label: string;
    subtitle: string;
    unitPrice: number;
    qty: number;
    onMinus: () => void;
    onPlus: () => void;
  }) => {
    const rowTotal = qty * unitPrice;

    return (
      <View className="flex-row items-center justify-between rounded-xl border border-neutral-200 px-3 py-3 dark:border-neutral-700">
        <View className="w-[34%]">
          <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{label}</Text>
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">{subtitle}</Text>
        </View>

        <View className="w-[28%] flex-row items-center justify-center gap-2">
          <Pressable
            onPress={onMinus}
            className="h-7 w-7 items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-700">
            <Ionicons name="remove" size={14} color="#171717" />
          </Pressable>
          <Text className="min-w-[18px] text-center text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {qty}
          </Text>
          <Pressable
            onPress={onPlus}
            className="h-7 w-7 items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-700">
            <Ionicons name="add" size={14} color="#171717" />
          </Pressable>
        </View>

        <View className="w-[34%] items-end">
          <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {formatCurrency(rowTotal)}
          </Text>
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">{formatCurrency(unitPrice)} each</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F6F4EF] dark:bg-neutral-950">
      <View className="px-4 pb-2 pt-1">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900">
            <Ionicons name="arrow-back" size={20} color="#171717" />
          </Pressable>

          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={handleRemove}
              className="flex-row items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900">
              <Ionicons name="trash-outline" size={16} color="#991B1B" />
              <Text className="text-sm font-semibold text-red-800">Remove</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic">
        <View className="items-center pt-2">
          <View className="aspect-[3/4] w-[48%] overflow-hidden rounded-2xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900">
            <Image source={{ uri: imageUri }} className="h-full w-full" resizeMode="cover" />
          </View>
        </View>

        <View className="mt-5">
          <View className="flex-row items-center gap-3">
            <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{name}</Text>
            <Pressable
              onPress={() => toggleFavorite(selectedCard.id)}
              className="h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900"
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? '#DC2626' : '#171717'}
              />
            </Pressable>
          </View>
          <Text className="mt-1 text-lg text-neutral-700 dark:text-neutral-300">
            {[category, setName].filter(Boolean).join(' ') || 'Pokemon Card'}
          </Text>
          <Text className="mt-1 text-lg text-neutral-700 dark:text-neutral-300">
            {[rarity, localId].filter(Boolean).join(' • ')}
          </Text>
        </View>

        <View className="mt-5 flex-row items-end justify-between">
          <View>
            <Text className="text-sm font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Current value
            </Text>
            <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(marketPrice)}
            </Text>
          </View>

          <View className="items-end">
            <Text
              className={`text-lg font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isPositive ? '+' : '-'}
              {formatCurrency(Math.abs(priceChange))} ({Math.abs(priceChangePct).toFixed(2)}%)
            </Text>
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">vs previous</Text>
          </View>
        </View>

        <View className="mt-4 border-t border-dashed border-neutral-300 dark:border-neutral-700" />

        <View className="mt-5 rounded-2xl border border-neutral-300 bg-white px-4 pb-4 pt-3 dark:border-neutral-700 dark:bg-neutral-900">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Trend range</Text>
            <Text className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{variant}</Text>
          </View>

          <View className="relative h-36">
            <View className="absolute inset-x-0 top-6 border-t border-dashed border-neutral-200 dark:border-neutral-700" />
            <View className="absolute inset-x-0 top-[70px] border-t border-dashed border-neutral-200 dark:border-neutral-700" />
            <View className="absolute inset-x-0 top-[116px] border-t border-dashed border-neutral-200 dark:border-neutral-700" />

            <View className="h-full flex-row items-end gap-1">
              {rangeSeries.map((point, index) => {
                const height = 16 + ((point - yMin) / yDiff) * 95;
                const isLast = index === rangeSeries.length - 1;

                return (
                  <View key={`${point}-${index}`} className="flex-1 items-center justify-end">
                    <View
                      className={`w-full rounded-t-full ${
                        isLast ? 'bg-neutral-900' : 'bg-neutral-300'
                      }`}
                      style={{ height }}
                    />
                  </View>
                );
              })}
            </View>
          </View>

          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">{labelStart}</Text>
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">{labelMid}</Text>
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">{labelEnd}</Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-center justify-center gap-2">
          {RANGE_OPTIONS.map((option) => (
            <Pressable
              key={option}
              onPress={() => setRange(option)}
              className={`rounded-full border px-4 py-2 ${
                range === option
                  ? 'border-neutral-900 bg-neutral-900'
                  : 'border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900'
              }`}>
              <Text
                className={`text-sm font-semibold ${
                  range === option ? 'text-white' : 'text-neutral-700 dark:text-neutral-300'
                }`}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-5 rounded-2xl border border-neutral-300 bg-white px-4 pb-6 pt-3 dark:border-neutral-700 dark:bg-neutral-900">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Adding to: {name}</Text>
            <Text className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Total: {formatCurrency(total)}
            </Text>
          </View>

          <View className="gap-2">
            <RowCounter
              label="Ungraded"
              subtitle={variant}
              unitPrice={marketPrice}
              qty={ungradedQty}
              onMinus={() => setUngradedQty((value) => Math.max(0, value - 1))}
              onPlus={() => setUngradedQty((value) => value + 1)}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
