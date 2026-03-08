import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCardStorage } from '../../src/stores/cardStorage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSolPrice } from '../../src/hooks/useSolPrice';
import { useWallet } from '../../src/hooks/useWallet';
import { ConnectButton } from '../../src/components/ConnectButton';

type ViewMode = 'grid' | 'list';
type SortMode = 'Most Valuable' | 'Newest' | 'Favorite' | 'Least Valuable';
const SORT_OPTIONS: SortMode[] = ['Most Valuable', 'Newest', 'Favorite', 'Least Valuable'];

function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return '$0.00';
  return `$${value.toFixed(2)}`;
}

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

export default function App() {
  const router = useRouter();
  const totalPortfolioValue = useCardStorage((state) => state.totalPortfolioValue);
  const calPortfolioValue = useCardStorage((state) => state.calPortfolioValue);
  const cards = useCardStorage((state) => state.cards);
  const favoriteCards = useCardStorage((state) => state.favoriteCards ?? []);
  const { price, usdToSol } = useSolPrice();
  const isDevnet = useCardStorage((state) => state.isDevnet);

  const [sol, setSol] = useState(0); // Get the current price of 1 USD in SOL

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('Most Valuable');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [showPortfolioValue, setShowPortfolioValue] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const wallet = useWallet();

  useEffect(() => {
    if (price && totalPortfolioValue !== undefined && totalPortfolioValue >= 0) {
      setSol(usdToSol(totalPortfolioValue));
    }
  }, [price, usdToSol, totalPortfolioValue]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await calPortfolioValue();
    } finally {
      setIsRefreshing(false);
    }
  }, [calPortfolioValue]);

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
  }, [cards, sortMode]);

  const hasZeroFavoriteCards = sortMode === 'Favorite' && favoriteCards.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <View className="px-6 py-4">
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-center gap-2">
            <Text className="text-3xl font-bold text-[#9945FF]">ChainCard</Text>
            <View className="h-3 w-3 rounded-full bg-[#F59E0B]" 
              style={{ backgroundColor: isDevnet ? '#F59E0B' : '#10B981' }}
            />
          </View>
          <ConnectButton
            connected={wallet.connected}
            connecting={wallet.connecting}
            publicKey={wallet.publicKey?.toBase58() ?? null}
            onConnect={wallet.connect}
            onDisconnect={wallet.disconnect}
          />
        </View>
        <View className="mt-5 gap-3 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
          <Text className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Portfolio Value
          </Text>
          <View className="flex gap-3">
            <View className="flex flex-row items-center gap-3">
              {showPortfolioValue ? (
                <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  $ {totalPortfolioValue?.toFixed(2)}
                </Text>
              ) : (
                <View className="h-8 w-40 animate-pulse rounded-lg bg-neutral-200" />
              )}
              <Pressable
                onPress={() => setShowPortfolioValue((prev) => !prev)}
                className="rounded-lg border border-neutral-300 bg-neutral-100 p-2 dark:border-neutral-700 dark:bg-neutral-800">
                {showPortfolioValue ? (
                  <Ionicons name="eye" size={16} color="#525252" />
                ) : (
                  <Ionicons name="eye-off" size={16} color="#525252" />
                )}
              </Pressable>
            </View>
            {showPortfolioValue && (
              <>
                <Text className="text-xl font-medium text-neutral-700 dark:text-neutral-300">
                  SOL {sol?.toFixed(6)}
                </Text>
                {/* <View className="flex flex-row items-center gap-3">
            <Text className="text-base font-semibold text-red-500">- $ 20.33</Text>
            <Text className="text-base font-semibold text-red-500">2.00%</Text>
          </View> */}
              </>
            )}
          </View>
        </View>

        {cards.length > 0 ? (
          <>
            {isSortDropdownOpen ? (
              <Pressable
                onPress={() => setIsSortDropdownOpen(false)}
                className="absolute inset-0 z-40"
              />
            ) : null}
            <View className="mt-5 flex flex-row items-center justify-between">
              <View className="relative z-50">
                <Pressable
                  onPress={() => setIsSortDropdownOpen((prev) => !prev)}
                  className="flex-row items-center">
                  <Text className="mr-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {sortMode}
                  </Text>
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
              </View>
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
            <ScrollView
              className="relative mb-6 mt-4 "
              contentInsetAdjustmentBehavior="automatic"
              onScrollBeginDrag={() => setIsSortDropdownOpen(false)}
              refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
              {hasZeroFavoriteCards ? (
                <View className="mt-40 rounded-xl bg-white p-6 dark:bg-neutral-900">
                  <Text className="text-center text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                    You have zero favorite Card
                  </Text>
                </View>
              ) : null}
              {!hasZeroFavoriteCards && viewMode === 'grid' ? (
                <View className="mb-4 flex-row flex-wrap justify-between gap-4">
                  {sortedCards.slice(0, 10).map((card) => {
                    const marketPrice = getMarketPrice(card);
                    const midPrice = getMidPrice(card);
                    const percentDiff =
                      midPrice > 0 ? ((marketPrice - midPrice) / midPrice) * 100 : 0;
                    const isPositive = percentDiff >= 0;

                    return (
                      <TouchableOpacity
                        key={card.id}
                        onPress={() =>
                          router.push({
                            pathname: '/card',
                            params: { id: card.id },
                          })
                        }
                        className="relative aspect-[3/4] w-[45%] overflow-hidden rounded-xl">
                        <Image
                          source={{
                            uri: card?.cardData?.image
                              ? card?.cardData?.image + '/high.jpg'
                              : card.image,
                          }}
                          className="h-full w-full"
                          resizeMode="cover"
                        />
                        <LinearGradient
                          colors={[
                            'transparent',
                            'rgba(15, 23, 42, 0.35)',
                            'rgba(15, 23, 42, 0.85)',
                          ]}
                          start={{ x: 0.5, y: 0 }}
                          end={{ x: 0.5, y: 1 }}
                          className="absolute bottom-0 left-0 right-0 rounded-b-xl px-3 pb-3 pt-10">
                          <View className="flex flex-row items-center justify-between">
                            <Text className="text-white">$ {marketPrice.toFixed(2)}</Text>
                            <Text className={isPositive ? 'text-green-500' : 'text-red-500'}>
                              {isPositive ? '+' : ''}
                              {percentDiff.toFixed(2)}%
                            </Text>
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
              {!hasZeroFavoriteCards && viewMode === 'list' ? (
                <View className="overflow-hidden ">
                  {sortedCards.slice(0, 10).map((card) => {
                    const marketPrice = getMarketPrice(card);
                    const midPrice = getMidPrice(card);
                    const percentDiff =
                      midPrice > 0 ? ((marketPrice - midPrice) / midPrice) * 100 : 0;
                    const isPositive = percentDiff >= 0;
                    const priceChange = marketPrice - midPrice;
                    const priceChangePct = percentDiff;
                    return (
                      <TouchableOpacity
                        key={card.id}
                        onPress={() =>
                          router.push({
                            pathname: '/card',
                            params: { id: card.id },
                          })
                        }
                        className="mb-5 flex flex-row items-center justify-between rounded-xl border border-neutral-300 p-5 dark:border-neutral-700">
                        <View className="flex flex-row items-center gap-3">
                          <View className="h-14 w-10 rounded-full bg-neutral-900">
                            <Image
                              source={{
                                uri: card?.cardData?.image
                                  ? card?.cardData?.image + '/high.jpg'
                                  : card.image,
                              }}
                              className="size-full object-cover"
                            />
                          </View>
                          <View>
                            <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                              {card?.cardData?.name}
                            </Text>
                            <Text className="text-base font-medium text-neutral-600 dark:text-neutral-400">
                              {card?.cardData?.rarity}
                            </Text>
                          </View>
                        </View>
                        <View className="flex items-end">
                          <Text className="text-lg font-bold">$ {marketPrice.toFixed(2)}</Text>
                          <View className="flex flex-row items-center justify-between">
                            <Text className="text-white">$ {marketPrice.toFixed(2)}</Text>
                            <Text
                              className={`text-lg font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {isPositive ? '+' : '-'}
                              {formatCurrency(Math.abs(priceChange))} (
                              {Math.abs(priceChangePct).toFixed(2)}%)
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
              {!hasZeroFavoriteCards && (
                <Pressable
                  onPress={() => router.push('/portfolio')}
                  className="mt-4 w-full items-center justify-center rounded-xl border border-neutral-300 bg-[#9945FF] py-3">
                  <Text className="text-center text-lg font-semibold text-white">
                    View All Cards
                  </Text>
                </Pressable>
              )}
              <View style={{ height: 210 }} />
            </ScrollView>
          </>
        ) : (
          <View className="mt-60 ">
            <Text className="text-center text-lg font-semibold text-neutral-700 dark:text-neutral-300">
              No cards in your portfolio yet.
            </Text>
            <Text className="text-center text-lg font-semibold text-neutral-700 dark:text-neutral-300">
              Start adding some!
            </Text>
          </View>
        )}
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
