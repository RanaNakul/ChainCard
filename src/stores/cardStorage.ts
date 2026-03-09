import * as FileSystem from 'expo-file-system/legacy';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorageAdapter } from '../lib/storage';
import { PublicKey } from '@solana/web3.js';

const CARD_SCANS_DIR = `${FileSystem.documentDirectory}data/Cards/`;

export interface CardScan {
  id: string;
  image: string;
  scannedAt: number;
  cardData?: any;
}

export interface MintedCard {
  cardId: string;
  mintAddress: string;
  mintedAt: number;
}

export type AppTheme = 'system' | 'light' | 'dark';

interface CardStorageState {
  cards: CardScan[];
  isIdentifying: boolean;
  isSaving: boolean;
  isMinting: boolean;
  error: string | null;
  totalPortfolioValue?: number;
  favoriteCards?: CardScan[];
  searchHistory?: string[];
  rarestCards?: CardScan[];
  mintedCards: MintedCard[];
  theme: AppTheme;
  isDevnet: boolean;
  connectedPublicKey: PublicKey | null;

  saveCardScan: (imageUri: string, cardData?: any) => Promise<CardScan>;
  removeScan: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => void;
  clearAll: () => Promise<void>;
  calPortfolioValue: () => Promise<void>;
  addToHistory: (query: string) => void;
  setTheme: (theme: AppTheme) => void;
  setISaveing: (isSaving: boolean) => void;
  setIsIdentifying: (isIdentifying: boolean) => void;
  setIsMinting: (isMinting: boolean) => void;
  toggleNetwork: () => void;
  setConnectedPublicKey: (publicKey: PublicKey | null) => void;
  addMintedCard: (cardId: string, mintAddress: string) => void;
  setMintedCards: (cards: MintedCard[]) => void;
}

function getFileExtension(uri: string): string {
  const pathWithoutQuery = uri.split('?')[0] ?? uri;
  const maybeExtension = pathWithoutQuery.split('.').pop();
  if (!maybeExtension || maybeExtension.includes('/')) {
    return 'jpg';
  }
  return maybeExtension.toLowerCase();
}

async function persistCardScan(croppedUri: string, cardData?: any): Promise<CardScan> {
  if (!croppedUri) {
    throw new Error('Missing cropped image URI.');
  }

  await FileSystem.makeDirectoryAsync(CARD_SCANS_DIR, { intermediates: true });

  const scannedAt = Date.now();
  const extension = getFileExtension(croppedUri);
  const fileName = `card-${scannedAt}.${extension}`;
  const image = `${CARD_SCANS_DIR}${fileName}`;

  await FileSystem.copyAsync({
    from: croppedUri,
    to: image,
  });

  const card: CardScan = {
    id: `scan-${scannedAt}`,
    image,
    scannedAt,
    cardData,
  };

  console.log('cardd: ', card);

  return card;
}

export const useCardStorage = create<CardStorageState>()(
  persist(
    (set, get) => ({
      cards: [],
      isSaving: false,
      isMinting: false,
      error: null,
      totalPortfolioValue: 0,
      isIdentifying: false,
      favoriteCards: [],
      searchHistory: [],
      rarestCards: [],
      mintedCards: [],
      theme: 'system',
      isDevnet: true,
      connectedPublicKey: null,

      toggleNetwork: () => set((state) => ({ isDevnet: !state.isDevnet })),

      setConnectedPublicKey: (publicKey: PublicKey | null) =>
        set({ connectedPublicKey: publicKey }),

      setIsMinting: (isMinting: boolean) => set({ isMinting }),

      addMintedCard: (cardId: string, mintAddress: string) =>
        set((state) => ({
          mintedCards: [...state.mintedCards, { cardId, mintAddress, mintedAt: Date.now() }],
        })),

      setMintedCards: (cards: MintedCard[]) => set({ mintedCards: cards }),

      saveCardScan: async (imageUri: string, cardData) => {
        set({ error: null });
        try {
          const card = await persistCardScan(imageUri, cardData);
          set((state) => ({
            cards: [...state.cards, card],
            isSaving: false,
          }));
          return card;
        } catch (error) {
          set({
            isSaving: false,
            error: error instanceof Error ? error.message : 'Failed to save scan.',
          });
          throw error;
        }
      },

      addToHistory: (query: string) =>
        set((state) => {
          const term = query.trim();
          if (!term) return { searchHistory: state.searchHistory ?? [] };

          return {
            searchHistory: [
              term,
              ...(state.searchHistory ?? []).filter(
                (item) => item.toLowerCase() !== term.toLowerCase()
              ),
            ].slice(0, 8),
          };
        }),

      setTheme: (theme: AppTheme) => {
        set({ theme });
      },

      calPortfolioValue: async () => {
        set((state) => ({
          totalPortfolioValue: state.cards.reduce(
            (acc, card) =>
              acc +
              Number(
                card?.cardData?.pricing?.tcgplayer?.holofoil?.marketPrice ??
                  card?.cardData?.pricing?.cardmarket?.avg1 ??
                  0
              ),
            0
          ),
        }));
      },

      removeScan: async (id: string) => {
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
          favoriteCards: (state.favoriteCards ?? []).filter((card) => card.id !== id),
          error: null,
        }));
      },

      toggleFavorite: (id: string) => {
        set((state) => {
          const favorites = state.favoriteCards ?? [];
          const isAlreadyFavorite = favorites.some((card) => card.id === id);

          if (isAlreadyFavorite) {
            return {
              favoriteCards: favorites.filter((card) => card.id !== id),
            };
          }

          const cardToAdd = state.cards.find((card) => card.id === id);
          if (!cardToAdd) {
            return { favoriteCards: favorites };
          }

          return {
            favoriteCards: [...favorites, cardToAdd],
          };
        });
      },

      setIsIdentifying: (isIdentifying: boolean) => set({ isIdentifying }),

      setISaveing: (isSaving: boolean) => set({ isSaving }),

      clearAll: async () => {
        set({ cards: [], favoriteCards: [], totalPortfolioValue: 0, error: null });
      },
    }),
    {
      name: 'card-storage',
      storage: createJSONStorage(() => asyncStorageAdapter),
    }
  )
);

export async function saveCardScan(croppedUri: string): Promise<CardScan> {
  return useCardStorage.getState().saveCardScan(croppedUri);
}
