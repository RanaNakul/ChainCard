# ChainCard

Here is a High-Level Architecture Overview of the ChainCard application based on the current codebase:

## 1. Core Technology Stack

- **Framework:** React Native managed by Expo (`expo`), giving you robust access to native mobile capabilities without writing native code.
- **Navigation:** Expo Router handles file-based routing scheme (Stack and Tab-based navigation inside the `app/` directory).
- **Styling:** NativeWind (Tailwind CSS for React Native) paired with `react-native-css-interop` for a robust, utility-class responsive design system that supports dark/light themes.
- **Language:** TypeScript, ensuring strong type safety across React components, API responses, and blockchain transactions.

## 2. Application Layers

### A. Presentational Layer (UI & Navigation)

Located primarily in the `app/` directory, this layer defines what the user sees and interacts with.

- **Root Layout (`app/_layout.tsx`):** Coordinates the base app constraints, applies the global theme (`ThemeProvider`), initializes `SafeAreaProvider`, and sets up the root routing `Stack`. (We also just added `index.js` as an entry point to bootstrap Node polyfills first).
- **Main Navigation (`app/(tabs)`):** Defines your primary tab-based screens (`index.tsx` for Dashboard/Home, `portfolio.tsx` for your full collection, `search.tsx`, `settings.tsx`).
- **Floating/Modal Screens:** The `scanScreen.tsx` operates outside the tabs structure for a fully immersive camera experience. Detailed card views exist in `card.tsx`.

### B. Device Integration Layer

This handles physical hardware and gallery interaction.

- **Camera & Image Processing (`app/scanScreen.tsx`):** Uses `expo-camera` to capture live photos and `expo-image-picker` to select from the gallery. It implements `expo-image-manipulator` to automatically crop the user's photos based on the on-screen bounding box, preparing it for OCR text recognition.

### C. External Services & APIs Integration Layer

Located in `src/services/`.

- **Card Recognition (`cardRecognitionService.ts`):**
  - Sends the cropped image to Google Vision API to perform OCR (Optical Character Recognition) to extract text.
  - Runs custom Regex/parsing logic to extract the card's `localId` and `total` print numbers (e.g., "12/102").
  - Cross-references this with a mapping (`src/lib/setMap.ts`) and queries the TCGDex API to pull definitive Pokémon TCG metadata and pricing information.
- **Web3 & Blockchain (`nftService.ts`):** Handles Solana operations. It generates mint keypairs and relies on the Solana Mobile Wallet Adapter protocol. This bridges the application securely to a user's local mobile wallet (like Phantom), requests authorization, and signs transactions to mint standard SPL Tokens (with 0 decimals and a supply of 1, effectively making them NFTs).

### D. State Management & Persistence Layer

Located in `src/stores/`.

- **Global State (`cardStorage.ts`):** Powered by Zustand. This central store tracks your physical cards array, favorite cards, minted NFT records, search history, network preferences (Devnet/Mainnet), and total portfolio value.
- **Local Storage (`src/lib/storage.ts`):** Zustand relies on the `persist` middleware hooked into `@react-native-async-storage/async-storage` and `expo-file-system/legacy` to permanently cache images and state on the device so it persists across app reloads.
- **Custom Hooks:** Hooks like `useWallet.ts` abstract the complexities of checking wallet authorization statuses, tracking the connected PublicKey, and disconnecting. Hook `useSolPrice.ts` is pulling live Solana pricing (likely via an external endpoint).

## 3. Data Flow (Example Use Case: Scanning & Minting a Card)

- **Capture:** The user points their camera at a card inside `scanScreen.tsx`. `expo-camera` snaps it.
- **Process:** The image gets cropped locally, then sent to Google Vision API via `cardRecognitionService.ts`.
- **Identify:** The extracted text determines the card set and number; TCGDex API returns the card's market price, image, and rarity.
- **Store:** The card data and a local file URI are dispatched to the Zustand store (`cardStorage.ts`) and saved to local AsyncStorage.
- **Mint:** On the `card.tsx` screen, the user taps "Mint NFT". `nftService.ts` constructs an SPL token transaction and hands it off to the user's downloaded Solana Wallet via the Mobile Wallet Adapter for signing and submission to the Solana Devnet/Mainnet.
