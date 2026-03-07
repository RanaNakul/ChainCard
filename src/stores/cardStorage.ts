import * as FileSystem from 'expo-file-system/legacy';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorageAdapter } from '../lib/storage';

const CARD_SCANS_DIR = `${FileSystem.documentDirectory}data/Cards/`;

interface CardScan {
  id: string;
  image: string;
  scannedAt: number;
  cardData?: any;
}

interface CardStorageState {
  cards: CardScan[];
  isSaving: boolean;
  error: string | null;
  saveCardScan: (croppedUri: string, cardData?: any) => Promise<CardScan>;
  removeScan: (id: string) => Promise<void>;
  clearScans: () => Promise<void>;
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

  console.log("cardd: ", card);

  return card;
}

export const useCardStorage = create<CardStorageState>()(
  persist(
    (set, get) => ({
      cards: [],
      isSaving: false,
      error: null,
     
      saveCardScan: async (croppedUri: string, cardData) => {
        set({ isSaving: true, error: null });
        try {
          const card = await persistCardScan(croppedUri , cardData);
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

      removeScan: async (id: string) => {
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
          error: null
        }));
      },

      clearScans: async () => {
        set({ cards: [], error: null });
      },
    }),
    {
      name: 'card-storage',
      storage: createJSONStorage(() => asyncStorageAdapter),
    }
  )
);

// Backward-compatible function for existing callers in screens/services.
export async function saveCardScan(croppedUri: string): Promise<CardScan> {
  return useCardStorage.getState().saveCardScan(croppedUri);
}
