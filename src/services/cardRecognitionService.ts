import { setMap } from "../lib/setMap";

async function extractTextFromImage(imageUri: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY;
  if (!apiKey) {
    throw new Error('Missing EXPO_PUBLIC_GOOGLE_VISION_API_KEY');
  }

  const base64 = await fetch(imageUri)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve((reader.result as string).replace('data:image/jpeg;base64,', ''));
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );

  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          image: { content: base64 },
          features: [{ type: 'TEXT_DETECTION' }],
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        `Vision API request failed (${response.status} ${response.statusText})`
    );
  }

  // console.log('OCR text: ', data?.responses?.[0]?.fullTextAnnotation?.text);
  return data?.responses?.[0]?.fullTextAnnotation?.text || '';
}

async function findPokemonCard(id: string) {
  if (!id) {
    throw new Error('Card id is required.');
  }

  const response = await fetch(`https://api.tcgdex.net/v2/en/cards/${id}`);

  const data = await response.json();

  return data ?? null;
}

function detectSet(total: string) {
  const setId = setMap[total] || null;

  return setId;
}

function parseCardInfo(text: string) {
  const lines = text.split('\n');

  const possibleNumber = lines.find((line) => /\d+\/\d+/.test(line));

  const match = possibleNumber?.match(/(\d+)\/(\d+)/);

  if (!match) throw new Error('Card number format not detected');

  return {
    localId: match[1],
    total: match[2],
  };
}

export async function recognizeCard(imageUri: string) {
  if (!imageUri || typeof imageUri !== 'string') {
    throw new Error('Invalid image URI provided for card recognition.');
  }

  const text = await extractTextFromImage(imageUri);
  const { localId, total } = parseCardInfo(text);
  console.log('localId: ', localId, ' total: ', total);
  if (!total) throw new Error('Card total not detected');
  const setId = detectSet(total);
  if (!setId) throw new Error('Card set not recognized');
  const id = `${setId}-${localId}`;
  console.log('id: ', id);
  const card = await findPokemonCard(id);

  if (!card) throw new Error('Card not found');
  return {
    card,
  };
}
