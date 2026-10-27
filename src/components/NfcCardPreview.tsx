import React, { useState, useEffect, useRef } from 'react';
import { ContactCard, NFC_CHIP_SPECS } from '../types';
import { generateVCard, analyzeNfcPayload, encodeCardToUrl } from '../utils/vcardHelper';
import QRCode from 'qrcode';
import { 
  Wifi, 
  RotateCw, 
  Phone, 
  Mail, 
  Building2, 
  Briefcase, 
  Globe, 
  CheckCircle2, 
  AlertTriangle,
  QrCode as QrIcon,
  Sparkles,
  Download
} from 'lucide-react';

interface NfcCardPreviewProps {
  card: ContactCard;
  onSimulateTap?: () => void;
  onDownloadVcf?: () => void;
}

export const NfcCardPreview: React.FC<NfcCardPreviewProps> = ({
  card,
  onSimulateTap,
  onDownloadVcf
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrMode, setQrMode] = useState<'vcard' | 'url'>('url');

  const vcardText = generateVCard(card);
  const analysis = analyzeNfcPayload(vcardText);
  const shareableUrl = encodeCardToUrl(card);

  useEffect(() => {
    const payloadToEncode = qrMode === 'url' ? shareableUrl : vcardText;
    QRCode.toDataURL(payloadToEncode, {
      margin: 1,
      width: 220,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR', err));
  }, [card, qrMode, shareableUrl, vcardText]);

  // Color gradient definitions
  const themeStyles: Record<string, { bg: string; border: string; accent: string; text: string; subtext: string; chipColor: string }> = {
    gold: {
      bg: 'bg-gradient-to-br from-zinc-950 via-neutral-900 to-amber-950',
      border: 'border-amber-500/30 shadow-amber-500/10',
      accent: 'text-amber-400',
      text: 'text-amber-100',
      subtext: 'text-amber-200/70',
      chipColor: 'from-amber-300 via-yellow-400 to-amber-600',
    },
    emerald: {
      bg: 'bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-900',
      border: 'border-emerald-500/30 shadow-emerald-500/10',
      accent: 'text-emerald-400',
      text: 'text-emerald-50',
      subtext: 'text-emerald-200/70',
      chipColor: 'from-amber-300 via-yellow-400 to-amber-600',
    },
    blue: {
      bg: 'bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950',
      border: 'border-blue-500/30 shadow-blue-500/10',
      accent: 'text-blue-400',
      text: 'text-blue-50',
      subtext: 'text-blue-200/70',
      chipColor: 'from-amber-300 via-yellow-400 to-amber-600',
    },
    indigo: {
      bg: 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950',
      border: 'border-indigo-500/30 shadow-indigo-500/10',
      accent: 'text-indigo-400',
      text: 'text-indigo-50',
      subtext: 'text-indigo-200/70',
      chipColor: 'from-amber-300 via-yellow-400 to-amber-600',
    },
    violet: {
      bg: 'bg-gradient-to-br from-neutral-950 via-violet-950 to-fuchsia-950',
      border: 'border-violet-500/30 shadow-violet-500/10',
      accent: 'text-violet-400',
      text: 'text-violet-50',
      subtext: 'text-violet-200/70',
      chipColor: 'from-amber-300 via-yellow-400 to-amber-600',
    },
    rose: {
      bg: 'bg-gradient-to-br from-slate-950 via-rose-950 to-pink-950',
      border: 'border-rose-500/30 shadow-rose-500/10',
      accent: 'text-rose-400',
      text: 'text-rose-50',
      subtext: 'text-rose-200/70',
      chipColor: 'from-amber-300 via-yellow-400 to-amber-600',
    },
    amber: {
      bg: 'bg-gradient-to-br from-zinc-950 via-amber-950/60 to-yellow-950',
      border: 'border-amber-500/30 shadow-amber-500/10',
      accent: 'text-amber-400',
      text: 'text-amber-50',
      subtext: 'text-amber-200/70',
      chipColor: 'from-amber-300 via-yellow-400 to-amber-600',
    },
    slate: {
      bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900',
      border: 'border-slate-600/40 shadow-slate-900/30',
      accent: 'text-cyan-400',
      text: 'text-white',
      subtext: 'text-slate-300',
      chipColor: 'from-amber-300 via-yellow-400 to-amber-600',
    },
  };

  const currentTheme = themeStyles[card.themeColor] || themeStyles.gold;

  const fullName = `${card.firstName || ''} ${card.lastName || ''}`.trim() || 'Nombre y Apellido';
  const orgName = card.organization || 'Organización / Empresa';
  const roleName = card.role || 'Cargo Profesional';

  return (
    <div className="w-full flex flex-col items-center">
      {/* 3D Smart Card Container */}
      <div className="relative w-full max-w-[420px] aspect-[1.586/1] perspective-1000 group">
        <div
          className={`relative w-full h-full rounded-2xl transition-all duration-700 transform-style-3d shadow-2xl cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
          title="Haz clic para voltear la tarjeta"
        >
          {/* Card Front */}
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col justify-between overflow-hidden border backdrop-blur-md backface-hidden shadow-xl ${currentTheme.bg} ${currentTheme.border}`}
          >
            {/* Holographic decorative sheen */}
            <div className="absolute -top-24 -left-24 w-56 h-56 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

            {/* Top row: Chip, Contactless Wave, and Photo */}
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3">
                {/* Metallic Gold Chip */}
                <div
                  className={`w-12 h-9 rounded-md bg-gradient-to-br ${currentTheme.chipColor} p-0.5 shadow-inner border border-amber-200/50 flex flex-col justify-between overflow-hidden`}
                >
                  <div className="w-full h-1/3 border-b border-amber-900/40 flex">
                    <div className="w-1/2 border-r border-amber-900/40" />
                    <div className="w-1/2" />
                  </div>
                  <div className="w-full h-1/3 border-b border-amber-900/40 flex">
                    <div className="w-1/3 border-r border-amber-900/40" />
                    <div className="w-1/3 border-r border-amber-900/40" />
                    <div className="w-1/3" />
                  </div>
                  <div className="w-full h-1/3 flex">
                    <div className="w-1/2 border-r border-amber-900/40" />
                    <div className="w-1/2" />
                  </div>
                </div>

                {/* NFC Contactless Wave */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 border border-white/10 backdrop-blur-sm">
                  <Wifi className="w-4 h-4 text-amber-400 rotate-90 animate-pulse" />
                  <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-white/90">
                    NFC SMART
                  </span>
                </div>
              </div>

              {/* Photo Avatar or Initials */}
              <div className="relative">
                {card.photoUrl ? (
                  <img
                    src={card.photoUrl}
                    alt={fullName}
                    className="w-13 h-13 rounded-xl object-cover border-2 border-white/30 shadow-lg"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-black/60 to-white/10 border border-white/20 flex items-center justify-center text-lg font-bold text-white shadow-md">
                    {card.firstName ? card.firstName[0]?.toUpperCase() : 'N'}
                    {card.lastName ? card.lastName[0]?.toUpperCase() : 'C'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
              </div>
            </div>

            {/* Middle: Person Identity */}
            <div className="relative z-10 my-auto">
              <h3 className={`text-xl font-bold tracking-tight leading-snug truncate ${currentTheme.text}`}>
                {fullName}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs font-medium truncate">
                <Briefcase className={`w-3.5 h-3.5 shrink-0 ${currentTheme.accent}`} />
                <span className={currentTheme.accent}>{roleName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium truncate mt-0.5">
                <Building2 className="w-3.5 h-3.5 shrink-0 text-white/60" />
                <span className="truncate">{orgName}</span>
              </div>
            </div>

            {/* Bottom Row: Contact quick icons & Flip hint */}
            <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-3 truncate text-white/70">
                {card.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span className="truncate max-w-[90px]">{card.phone}</span>
                  </div>
                )}
                {card.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-sky-400" />
                    <span className="truncate max-w-[110px]">{card.email}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 text-[10px] text-white/40 group-hover:text-white/80 transition-colors">
                <RotateCw className="w-3 h-3 animate-spin-slow" />
                <span>Voltear</span>
              </div>
            </div>
          </div>

          {/* Card Back (QR Code + NFC Details) */}
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl p-5 flex flex-col justify-between overflow-hidden border backdrop-blur-md backface-hidden rotate-y-180 shadow-xl ${currentTheme.bg} ${currentTheme.border}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <QrIcon className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-white tracking-wide">
                  Escaneo Rápido de Respaldo
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/50">
                {analysis.bytes} BYTES NDEF
              </span>
            </div>

            <div className="flex items-center gap-4 my-auto">
              <div className="p-2 bg-white rounded-xl shadow-lg shrink-0">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code de contacto" className="w-24 h-24" />
                ) : (
                  <div className="w-24 h-24 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                    Cargando...
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5 text-xs text-white/80">
                <p className="text-[11px] leading-tight text-white/90">
                  Acerca cualquier smartphone a la tarjeta física NFC o escanea este QR con la cámara.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-amber-300 font-mono">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span>Compatible con iPhone y Android</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQrMode(qrMode === 'url' ? 'vcard' : 'url');
                    }}
                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] font-medium text-white transition-colors"
                  >
                    Modo QR: {qrMode === 'url' ? 'Perfil Web' : 'vCard Directo'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-white/50">
              <span>NFC Tools Compatible vCard 3.0</span>
              <div className="flex items-center gap-1 text-white/70">
                <RotateCw className="w-2.5 h-2.5" />
                <span>Voltear al frente</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="flex items-center gap-2 mt-4 w-full max-w-[420px]">
        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{isFlipped ? 'Ver Anverso' : 'Ver Reverso & QR'}</span>
        </button>

        {onSimulateTap && (
          <button
            type="button"
            onClick={onSimulateTap}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
          >
            <Wifi className="w-3.5 h-3.5 rotate-90" />
            <span>Simular Toque NFC</span>
          </button>
        )}

        {onDownloadVcf && (
          <button
            type="button"
            onClick={onDownloadVcf}
            title="Descargar archivo de contacto .vcf"
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* NFC Chip Capacity Bar & Diagnostic Monitor */}
      <div className="w-full max-w-[420px] mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-slate-200">Presupuesto de Memoria NFC</span>
          </div>
          <span className="font-mono text-slate-300 font-medium">
            {analysis.bytes} bytes
          </span>
        </div>

        {/* Chip compatibility pills */}
        <div className="grid grid-cols-3 gap-2">
          {/* NTAG213 */}
          <div
            className={`p-2 rounded-lg border flex flex-col ${
              analysis.chips.ntag213.fits
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span>NTAG213</span>
              {analysis.chips.ntag213.fits ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-rose-400" />
              )}
            </div>
            <span className="text-[10px] opacity-75 mt-0.5">
              Máx 144 B ({analysis.chips.ntag213.percentage}%)
            </span>
          </div>

          {/* NTAG215 */}
          <div
            className={`p-2 rounded-lg border flex flex-col ${
              analysis.chips.ntag215.fits
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span>NTAG215</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </div>
            <span className="text-[10px] opacity-75 mt-0.5">
              Máx 504 B ({analysis.chips.ntag215.percentage}%)
            </span>
          </div>

          {/* NTAG216 */}
          <div className="p-2 rounded-lg border bg-emerald-950/40 border-emerald-800/60 text-emerald-300 flex flex-col">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span>NTAG216</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </div>
            <span className="text-[10px] opacity-75 mt-0.5">
              Máx 888 B ({analysis.chips.ntag216.percentage}%)
            </span>
          </div>
        </div>

        {!analysis.chips.ntag213.fits && (
          <p className="mt-2 text-[11px] text-amber-300/90 leading-tight">
            Nota: Supera los 144B de NTAG213. Se recomienda usar tarjetas <strong>NTAG215</strong> o <strong>NTAG216</strong> (estándar para tarjetas de presentación NFC).
          </p>
        )}
      </div>
    </div>
  );
};
