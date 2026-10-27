import { ContactCard, NFC_CHIP_SPECS, NfcChipType } from '../types';

/**
 * Generates standard vCard 3.0 text formatted strictly for NFC tags and NFC Tools.
 * Keeps lines clean to minimize byte count for standard NTAG213/215/216 chips.
 */
export function generateVCard(card: ContactCard, minimal: boolean = false): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

  const fullName = `${card.firstName || ''} ${card.lastName || ''}`.trim() || 'Contacto';
  lines.push(`FN:${fullName}`);
  lines.push(`N:${card.lastName || ''};${card.firstName || ''};;;`);

  if (card.organization) {
    lines.push(`ORG:${card.organization}`);
  }

  if (card.role) {
    lines.push(`TITLE:${card.role}`);
  }

  if (card.phone) {
    // Standard cellular phone
    lines.push(`TEL;TYPE=CELL,VOICE:${card.phone.replace(/\s+/g, '')}`);
  }

  if (card.email) {
    lines.push(`EMAIL;TYPE=INTERNET,PREF:${card.email.trim()}`);
  }

  if (!minimal) {
    if (card.website) {
      const cleanUrl = card.website.startsWith('http') ? card.website : `https://${card.website}`;
      lines.push(`URL:${cleanUrl}`);
    }
    if (card.address) {
      lines.push(`ADR;TYPE=WORK:;;${card.address};;;;`);
    }
    if (card.notes) {
      lines.push(`NOTE:${card.notes}`);
    }
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

/**
 * Calculates UTF-8 byte length of a string (crucial for NFC capacity checks)
 */
export function getByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

/**
 * Checks compatibility of payload with each NFC chip type
 */
export function analyzeNfcPayload(payload: string) {
  const bytes = getByteLength(payload);
  const chips: Record<NfcChipType, { fits: boolean; percentage: number; maxBytes: number }> = {
    ntag213: {
      maxBytes: NFC_CHIP_SPECS.ntag213.capacityBytes,
      fits: bytes <= NFC_CHIP_SPECS.ntag213.capacityBytes,
      percentage: Math.min(100, Math.round((bytes / NFC_CHIP_SPECS.ntag213.capacityBytes) * 100)),
    },
    ntag215: {
      maxBytes: NFC_CHIP_SPECS.ntag215.capacityBytes,
      fits: bytes <= NFC_CHIP_SPECS.ntag215.capacityBytes,
      percentage: Math.min(100, Math.round((bytes / NFC_CHIP_SPECS.ntag215.capacityBytes) * 100)),
    },
    ntag216: {
      maxBytes: NFC_CHIP_SPECS.ntag216.capacityBytes,
      fits: bytes <= NFC_CHIP_SPECS.ntag216.capacityBytes,
      percentage: Math.min(100, Math.round((bytes / NFC_CHIP_SPECS.ntag216.capacityBytes) * 100)),
    },
    mifare: {
      maxBytes: NFC_CHIP_SPECS.mifare.capacityBytes,
      fits: bytes <= NFC_CHIP_SPECS.mifare.capacityBytes,
      percentage: Math.min(100, Math.round((bytes / NFC_CHIP_SPECS.mifare.capacityBytes) * 100)),
    },
  };

  return {
    bytes,
    chips,
  };
}

/**
 * Parses raw text or vCard content into ContactCard fields
 */
export function parseVCard(rawText: string): Partial<ContactCard> {
  const result: Partial<ContactCard> = {};
  const lines = rawText.split(/\r?\n/);

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // First check for colon separation
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const keyPart = line.slice(0, colonIdx).toUpperCase();
    const value = line.slice(colonIdx + 1).trim();

    if (keyPart === 'FN') {
      const parts = value.split(' ');
      if (!result.firstName) {
        result.firstName = parts[0] || '';
        result.lastName = parts.slice(1).join(' ') || '';
      }
    } else if (keyPart.startsWith('N')) {
      const parts = value.split(';');
      if (parts[1]) result.firstName = parts[1];
      if (parts[0]) result.lastName = parts[0];
    } else if (keyPart.startsWith('ORG')) {
      result.organization = value.replace(/;/g, ' ').trim();
    } else if (keyPart.startsWith('TITLE')) {
      result.role = value;
    } else if (keyPart.startsWith('TEL')) {
      result.phone = value;
    } else if (keyPart.startsWith('EMAIL')) {
      result.email = value;
    } else if (keyPart.startsWith('URL')) {
      result.website = value;
    } else if (keyPart.startsWith('ADR')) {
      result.address = value.replace(/;+/g, ' ').trim();
    } else if (keyPart.startsWith('NOTE')) {
      result.notes = value;
    }
  }

  // If rawText wasn't formatted as standard vCard, try regex patterns for common text layouts
  if (!result.phone) {
    const phoneMatch = rawText.match(/(?:\+?\d{1,3}[ -]?)?\(?\d{2,4}\)?[ -]?\d{3,4}[ -]?\d{3,4}/);
    if (phoneMatch) result.phone = phoneMatch[0];
  }
  if (!result.email) {
    const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) result.email = emailMatch[0];
  }

  return result;
}

/**
 * Encodes card into a URL string for web NFC reading (taps open web card directly)
 */
export function encodeCardToUrl(card: ContactCard): string {
  const baseUrl = window.location.origin + window.location.pathname;
  const data = {
    fn: card.firstName,
    ln: card.lastName,
    org: card.organization,
    ro: card.role,
    ph: card.phone,
    em: card.email,
    ws: card.website || '',
    ad: card.address || '',
    nt: card.notes || '',
    tc: card.themeColor,
    cs: card.cardStyle,
  };
  try {
    const jsonStr = JSON.stringify(data);
    const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
    return `${baseUrl}?card=${encoded}`;
  } catch {
    return baseUrl;
  }
}

/**
 * Decodes card from URL parameters
 */
export function decodeCardFromUrl(): ContactCard | null {
  const params = new URLSearchParams(window.location.search);
  const cardParam = params.get('card');
  if (!cardParam) return null;

  try {
    const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(cardParam))));
    const d = JSON.parse(jsonStr);
    return {
      id: 'shared-' + Date.now(),
      firstName: d.fn || '',
      lastName: d.ln || '',
      organization: d.org || '',
      role: d.ro || '',
      phone: d.ph || '',
      email: d.em || '',
      website: d.ws || '',
      address: d.ad || '',
      notes: d.nt || '',
      themeColor: d.tc || 'emerald',
      cardStyle: d.cs || 'modern',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  } catch (e) {
    console.error('Failed to parse card from URL', e);
    return null;
  }
}

/**
 * Initiates browser download of .vcf file
 */
export function downloadVcfFile(card: ContactCard) {
  const vcardText = generateVCard(card);
  const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = `${card.firstName}_${card.lastName}`.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') || 'contacto';
  link.href = url;
  link.setAttribute('download', `${safeName}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
