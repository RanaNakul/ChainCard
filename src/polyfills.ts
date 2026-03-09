import { getRandomValues as expoCryptoGetRandomValues } from 'expo-crypto';
import { Buffer as NodeBuffer } from 'buffer';

global.Buffer = global.Buffer || NodeBuffer;
(globalThis as any).Buffer = (globalThis as any).Buffer || NodeBuffer;

class Crypto {
  getRandomValues = expoCryptoGetRandomValues;
}

const webCrypto = typeof crypto !== 'undefined' ? crypto : new Crypto();

if (typeof crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    enumerable: true,
    get: () => webCrypto,
  });
}
