import { ContactCard } from '../types';
import { generateVCard, parseVCard } from './vcardHelper';

export interface NfcReadResult {
  serialNumber?: string;
  cardData: Partial<ContactCard>;
  rawRecords: Array<{
    recordType: string;
    mediaType?: string;
    text?: string;
  }>;
}

/**
 * Check if the current browser environment supports the Web NFC API.
 */
export function isWebNfcSupported(): boolean {
  return typeof window !== 'undefined' && 'NDEFReader' in window;
}

/**
 * Write contact card to an NFC tag using Web NFC API.
 * Supports writing as MIME (vCard) or as URL (Digital Profile Link).
 */
export async function writeNfcTag(
  card: ContactCard,
  mode: 'vcard' | 'url',
  customUrl?: string,
  abortSignal?: AbortSignal
): Promise<{ success: boolean; serialNumber?: string; message: string }> {
  if (!isWebNfcSupported()) {
    throw new Error(
      'Web NFC no está soportado en este navegador. Utiliza Google Chrome en Android o exporta el payload a la app NFC Tools.'
    );
  }

  // @ts-expect-error Web NFC API might not be fully typed in standard TS lib
  const ndef = new window.NDEFReader();

  try {
    if (mode === 'vcard') {
      const vcardContent = generateVCard(card);
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(vcardContent);

      await ndef.write(
        {
          records: [
            {
              recordType: 'mime',
              mediaType: 'text/vcard',
              data: encodedData,
            },
          ],
        },
        { signal: abortSignal }
      );

      return {
        success: true,
        message: '¡Tarjeta NFC grabada exitosamente con formato vCard para NFC Tools!',
      };
    } else {
      const urlToWrite = customUrl || window.location.href;
      await ndef.write(
        {
          records: [
            {
              recordType: 'url',
              data: urlToWrite,
            },
          ],
        },
        { signal: abortSignal }
      );

      return {
        success: true,
        message: '¡Enlace directo grabado exitosamente en el chip NFC!',
      };
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Operación de grabación cancelada.');
    }
    throw new Error(error.message || 'Error al comunicarse con la tarjeta NFC.');
  }
}

/**
 * Starts an NFC scan session and returns data when a tag is detected.
 */
export async function scanNfcTag(
  onReading: (result: NfcReadResult) => void,
  abortSignal?: AbortSignal
): Promise<void> {
  if (!isWebNfcSupported()) {
    throw new Error(
      'Web NFC no está soportado en este navegador. Prueba con Google Chrome en Android o ingresa los datos manualmente.'
    );
  }

  // @ts-expect-error Web NFC API
  const ndef = new window.NDEFReader();
  await ndef.scan({ signal: abortSignal });

  ndef.onreading = (event: any) => {
    const serialNumber = event.serialNumber;
    const rawRecords: Array<{ recordType: string; mediaType?: string; text?: string }> = [];
    let combinedText = '';

    for (const record of event.message.records) {
      const textDecoder = new TextDecoder(record.encoding || 'utf-8');
      const textContent = textDecoder.decode(record.data);
      rawRecords.push({
        recordType: record.recordType,
        mediaType: record.mediaType,
        text: textContent,
      });

      // Accumulate text for vCard or contact parsing
      combinedText += '\n' + textContent;
    }

    const parsedCard = parseVCard(combinedText);
    onReading({
      serialNumber,
      cardData: parsedCard,
      rawRecords,
    });
  };

  ndef.onreadingerror = () => {
    console.error('Error al leer la tarjeta NFC. Asegúrate de mantener la tarjeta fija.');
  };
}
