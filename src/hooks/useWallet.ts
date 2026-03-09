import { useState, useCallback, useMemo, useEffect } from 'react';
import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { useCardStorage } from '../stores/cardStorage';
import { fetchWalletNFTs } from '../services/nftService';

const APP_IDENTITY = {
  name: 'ChainCard',
  uri: 'https://chaincard.app',
  icon: 'favicon.png',
};

export function useWallet() {
  const setPublicKey = useCardStorage((s) => s.setConnectedPublicKey);
  const connectedPublicKey = useCardStorage((s) => s.connectedPublicKey);
  const setMintedCards = useCardStorage((s) => s.setMintedCards);
  const [connecting, setConnecting] = useState(false);
  const isDevnet = useCardStorage((s) => s.isDevnet);

  const publicKey = useMemo(() => {
    if (!connectedPublicKey) return null;
    try {
      return new PublicKey(connectedPublicKey);
    } catch {
      return null;
    }
  }, [connectedPublicKey]);

  const cluster = isDevnet ? 'devnet' : 'mainnet-beta';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const connection = new Connection(clusterApiUrl(cluster), 'confirmed');

  // ============================================
  // SYNC — Fetch NFTs from wallet on connect
  // ============================================
  const syncNFTs = useCallback(
    async (walletPubkey: string) => {
      try {
        const nfts = await fetchWalletNFTs(walletPubkey, isDevnet);
        const mintedCards = nfts.map((nft) => ({
          cardId: '', // cardId is unknown for externally held NFTs
          mintAddress: nft.mintAddress,
          mintedAt: 0,
        }));
        setMintedCards(mintedCards);
        // console.log(`[Wallet] Synced ${nfts.length} NFTs from wallet`);
      } catch (error) {
        console.warn('[Wallet] Failed to sync NFTs:', error);
      }
    },
    [isDevnet, setMintedCards]
  );

  // Auto-sync when public key changes (wallet connects)
  useEffect(() => {
    if (publicKey) {
      syncNFTs(publicKey.toBase58());
    }
  }, [publicKey, syncNFTs]);

  // ============================================
  // CONNECT — Ask Phantom to authorize our app
  // ============================================
  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const authResult = await transact(async (wallet: Web3MobileWallet) => {
        // This opens Phantom, shows an "Authorize" dialog
        // User taps "Approve" → we get their public key
        const result = await wallet.authorize({
          chain: `solana:${cluster}`,
          identity: APP_IDENTITY,
        });
        return result;
      });

      // authResult.accounts[0].address is a base64 public key
      const pubkey = new PublicKey(Buffer.from(authResult.accounts[0].address, 'base64'));
      setPublicKey(pubkey);
      return pubkey;
    } catch (error: any) {
      console.error('Connect failed:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [cluster]);

  // ============================================
  // DISCONNECT
  // ============================================
  const disconnect = useCallback(() => {
    setPublicKey(null);
    setMintedCards([]);
  }, [setMintedCards]);

  return {
    publicKey,
    connected: !!publicKey,
    connecting,
    connect,
    disconnect,
    connection,
    syncNFTs,
  };
}
