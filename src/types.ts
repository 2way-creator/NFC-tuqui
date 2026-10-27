export interface ContactCard {
  id: string;
  firstName: string;
  lastName: string;
  organization: string;
  role: string;
  phone: string;
  email: string;
  photoUrl?: string;
  website?: string;
  address?: string;
  notes?: string;
  themeColor: 'emerald' | 'blue' | 'indigo' | 'violet' | 'rose' | 'amber' | 'slate' | 'gold';
  cardStyle: 'modern' | 'glass' | 'corporate' | 'dark-tech';
  avatarInitials?: string;
  updatedAt: number;
  createdAt: number;
}

export type NfcChipType = 'ntag213' | 'ntag215' | 'ntag216' | 'mifare';

export interface NfcChipInfo {
  name: string;
  capacityBytes: number;
  description: string;
}

export const NFC_CHIP_SPECS: Record<NfcChipType, NfcChipInfo> = {
  ntag213: {
    name: 'NTAG213',
    capacityBytes: 144,
    description: '144 bytes útiles. Ideal para enlaces URL cortos o vCard minimalista.',
  },
  ntag215: {
    name: 'NTAG215',
    capacityBytes: 504,
    description: '504 bytes útiles. Muy popular y estándar para vCard completa.',
  },
  ntag216: {
    name: 'NTAG216',
    capacityBytes: 888,
    description: '888 bytes útiles. Recomendado para tarjetas con notas o múltiples enlaces.',
  },
  mifare: {
    name: 'Mifare Classic 1K',
    capacityBytes: 716,
    description: '716 bytes útiles NDEF formateado. Usado en tarjetas RFID/NFC de acceso.',
  },
};
