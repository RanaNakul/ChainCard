// ─────────────────────────────────────────────────────────────
// Card Recognition & Market Data Service
// ─────────────────────────────────────────────────────────────
// Accepts a camera image URI, simulates card recognition via a
// placeholder function, then fetches live market pricing from
// the Pokémon TCG API.
// ─────────────────────────────────────────────────────────────

/** Shape returned by the placeholder card-recognition function. */
interface RecognizedCard {
  id: string; // Pokémon TCG API card id, e.g. "xy1-1"
  name: string; // Card name, e.g. "Venusaur-EX"
  set: string; // Set name, e.g. "XY"
}

/** Final typed object returned to consumers. */
export interface CardMarketData {
  id: string;
  name: string;
  set: string;
  marketPriceUSD: number;
}

/** Shape of the relevant portion of the Pokémon TCG API response. */
interface PokemonTCGCardResponse {
  data: {
    id: string;
    name: string;
    set: { name: string };
    cardmarket?: {
      prices?: {
        averageSellPrice?: number;
        trendPrice?: number;
      };
    };
    tcgplayer?: {
      prices?: Record<string, { market?: number; mid?: number }>;
    };
  };
}

// ─────────────────────────────────────────────────────────────
// 1. Placeholder card-recognition function
// ─────────────────────────────────────────────────────────────
/**
 * Simulates image-based card recognition.
 *
 * In production this would forward the image to an ML model or
 * third-party recognition API. For now it returns a hard-coded
 * sample card so the rest of the pipeline can be developed and
 * tested independently.
 *
 * @param _imageUri - The local file URI captured by Expo Camera
 *                    (unused in the placeholder implementation).
 */
async function recognizeCard(_imageUri: string): Promise<RecognizedCard> {
  // Simulate network / processing delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return a well-known card for testing purposes
  return {
    id: 'xy1-1',
    name: 'Venusaur-EX',
    set: 'XY',
  };
}

// ─────────────────────────────────────────────────────────────
// 2. Fetch market price from the Pokémon TCG API
// ─────────────────────────────────────────────────────────────
/**
 * Queries the Pokémon TCG API for the given card ID and extracts
 * a USD market price.
 *
 * Price resolution order:
 *   1. cardmarket.prices.averageSellPrice
 *   2. cardmarket.prices.trendPrice
 *   3. First available tcgplayer market / mid price
 *   4. Falls back to 0 if no pricing data exists
 *
 * @param cardId - The Pokémon TCG API card identifier (e.g. "xy1-1").
 * @returns The market price in USD.
 * @throws If the API request fails or returns a non-OK status.
 */
async function fetchMarketPrice(cardId: string): Promise<number> {
  const apiKey = process.env.EXPO_PUBLIC_POKEMON_API_KEY ?? '';
  const url = `https://api.pokemontcg.io/v2/cards/${cardId}`;

  // Build request headers; include the API key if available
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Pokémon TCG API error: ${response.status} ${response.statusText}`);
  }

  const json: PokemonTCGCardResponse = await response.json();
  const { data } = json;

  // Attempt to extract from cardmarket first
  const cardmarketPrices = data.cardmarket?.prices;
  if (cardmarketPrices?.averageSellPrice) {
    return cardmarketPrices.averageSellPrice;
  }
  if (cardmarketPrices?.trendPrice) {
    return cardmarketPrices.trendPrice;
  }

  // Fall back to tcgplayer prices
  const tcgplayerPrices = data.tcgplayer?.prices;
  if (tcgplayerPrices) {
    for (const variant of Object.values(tcgplayerPrices)) {
      if (variant.market) return variant.market;
      if (variant.mid) return variant.mid;
    }
  }

  // No pricing data available for this card
  return 0;
}

// ─────────────────────────────────────────────────────────────
// 3. Main service function – orchestrates recognition + pricing
// ─────────────────────────────────────────────────────────────
/**
 * End-to-end pipeline: recognise a Pokémon card from a camera
 * image and enrich it with live market data.
 *
 * @param imageUri - The local file URI produced by Expo Camera's
 *                   `takePictureAsync()`.
 * @returns A `CardMarketData` object containing identification
 *          details and the current USD market price.
 * @throws Propagates errors from recognition or API calls after
 *         logging them for debugging.
 *
 * @example
 * ```ts
 * const photo = await cameraRef.current.takePictureAsync();
 * const data  = await getCardMarketData(photo.uri);
 * console.log(data.name, data.marketPriceUSD);
 * ```
 */
export async function getCardMarketData(imageUri: string): Promise<CardMarketData> {
  try {
    // Step 1 – Identify the card from the captured image
    const recognized = await recognizeCard(imageUri);

    // Step 2 – Fetch the current market price for the identified card
    const marketPriceUSD = await fetchMarketPrice(recognized.id);

    // Step 3 – Assemble and return the final typed result
    return {
      id: recognized.id,
      name: recognized.name,
      set: recognized.set,
      marketPriceUSD,
    };
  } catch (error) {
    // Log the raw error for debugging; re-throw a descriptive message
    console.error('[cardRecognitionService] Failed:', error);

    throw new Error(
      `Card recognition failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
