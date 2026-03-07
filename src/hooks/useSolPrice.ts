import { useEffect, useState, useCallback } from "react";

const API =
  "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd";

export function useSolPrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch(API);
      const json = await res.json();

      const solPrice = json?.solana?.usd;
      if (!solPrice) throw new Error("Invalid price response");

      setPrice(solPrice);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch SOL price";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();

    const interval = setInterval(fetchPrice, 10000); // refresh every 10 sec

    return () => clearInterval(interval);
  }, [fetchPrice]);

  const usdToSol = useCallback(
    (usd: number) => {
      if (!price) return 0;
      return usd / price;
    },
    [price]
  );

  const solToUsd = useCallback(
    (sol: number) => {
      if (!price) return 0;
      return sol * price;
    },
    [price]
  );

  return {
    price,
    loading,
    error,
    usdToSol,
    solToUsd,
  };
}