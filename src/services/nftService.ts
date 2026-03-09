import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from '@solana/spl-token';
import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

const APP_IDENTITY = {
  name: 'ChainCard',
  uri: 'https://chaincard.app',
  icon: 'favicon.ico',
};

// ============================================================
// Types
// ============================================================

export interface MintResult {
  mintAddress: string;
}

export interface WalletNFT {
  mintAddress: string;
}

// ============================================================
// mintPokemonCardNFT
//
// Creates a lightweight NFT (SPL token with decimals=0, supply=1)
// for a scanned Pokémon card. Uses the Mobile Wallet Adapter to
// sign and send the transaction from the user's mobile wallet.
// ============================================================

export async function mintPokemonCardNFT(
  cardId: string,
  isDevnet: boolean,
  walletPublicKeyStr: string
): Promise<MintResult> {
  const cluster = isDevnet ? 'devnet' : 'mainnet-beta';
  const connection = new Connection(clusterApiUrl(cluster), 'confirmed');

  // Generate a brand-new mint keypair
  const mintKeypair = Keypair.generate();
  const mintPublicKey = mintKeypair.publicKey;

  // Open the mobile wallet for authorization + signing
  const signature = await transact(async (wallet: Web3MobileWallet) => {
    // We already know the wallet's public key from the app state
    const walletPublicKey = new PublicKey(walletPublicKeyStr);

    // 1. Authorize (or re-authorize) the app to establish the session
    await wallet.authorize({
      chain: `solana:${cluster}`,
      identity: APP_IDENTITY,
    });

    // 2. Get the minimum rent-exempt balance for the mint account
    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    // 3. Derive the associated token account (ATA) for the wallet
    const associatedTokenAddress = getAssociatedTokenAddressSync(mintPublicKey, walletPublicKey);

    // 4. Build the transaction
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

    const transaction = new Transaction({
      feePayer: walletPublicKey,
      blockhash,
      lastValidBlockHeight,
    }).add(
      // Create the mint account
      SystemProgram.createAccount({
        fromPubkey: walletPublicKey,
        newAccountPubkey: mintPublicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      // Initialize the mint (decimals = 0, authority = wallet)
      createInitializeMintInstruction(
        mintPublicKey, // mint
        0, // decimals
        walletPublicKey, // mint authority
        walletPublicKey // freeze authority (optional)
      ),
      // Create the associated token account
      createAssociatedTokenAccountInstruction(
        walletPublicKey, // payer
        associatedTokenAddress, // ATA address
        walletPublicKey, // wallet owner
        mintPublicKey // mint
      ),
      // Mint exactly 1 token → makes it an NFT
      createMintToInstruction(
        mintPublicKey, // mint
        associatedTokenAddress, // destination
        walletPublicKey, // authority
        1 // amount (1 indivisible token)
      )
    );

    // 5. Partially sign with the mint keypair (wallet will sign with its key)
    transaction.partialSign(mintKeypair);

    // 6. Let the mobile wallet sign & send
    const txSignatures = await wallet.signAndSendTransactions({
      transactions: [transaction],
    });

    return txSignatures[0];
  });

  // 7. Confirm the transaction
  if (signature) {
    const latestBlockhash = await connection.getLatestBlockhash('confirmed');
    await connection.confirmTransaction(
      {
        signature: signature,
        ...latestBlockhash,
      },
      'confirmed'
    );
  }

  console.log(`[NFT] Minted card "${cardId}" → mint: ${mintPublicKey.toBase58()}`);

  return {
    mintAddress: mintPublicKey.toBase58(),
  };
}

// ============================================================
// fetchWalletNFTs
//
// Fetches all SPL tokens owned by the wallet where
//   amount === "1" && decimals === 0
// (the standard lightweight NFT pattern on Solana).
// ============================================================

export async function fetchWalletNFTs(
  walletPublicKey: string,
  isDevnet: boolean
): Promise<WalletNFT[]> {
  const cluster = isDevnet ? 'devnet' : 'mainnet-beta';
  const connection = new Connection(clusterApiUrl(cluster), 'confirmed');

  const ownerPubkey = new PublicKey(walletPublicKey);

  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(ownerPubkey, {
    programId: TOKEN_PROGRAM_ID,
  });

  const nfts: WalletNFT[] = [];

  for (const { account } of tokenAccounts.value) {
    const parsed = account.data.parsed;
    const info = parsed?.info;
    const tokenAmount = info?.tokenAmount;

    if (tokenAmount && tokenAmount.amount === '1' && tokenAmount.decimals === 0) {
      nfts.push({
        mintAddress: info.mint as string,
      });
    }
  }

  return nfts;
}
