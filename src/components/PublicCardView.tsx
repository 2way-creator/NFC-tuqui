import React, { useState } from 'react';
import { ContactCard } from '../types';
import { downloadVcfFile } from '../utils/vcardHelper';
import { 
  UserPlus, 
  Phone, 
  Mail, 
  Building2, 
  Briefcase, 
  Globe, 
  MessageCircle, 
  Check, 
  Share2, 
  Wifi, 
  ArrowLeft 
} from 'lucide-react';

interface PublicCardViewProps {
  card: ContactCard;
  onOpenStudio?: () => void;
}

export const PublicCardView: React.FC<PublicCardViewProps> = ({
  card,
  onOpenStudio,
}) => {
  const [downloaded, setDownloaded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fullName = `${card.firstName || ''} ${card.lastName || ''}`.trim() || 'Contacto';
  const orgName = card.organization || 'Empresa';
  const roleName = card.role || 'Profesional';

  const handleDownload = () => {
    downloadVcfFile(card);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tarjeta de contacto - ${fullName}`,
          text: `${fullName} • ${roleName} en ${orgName}`,
          url: window.location.href,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Top Banner */}
      <div className="w-full max-w-md flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Wifi className="w-4 h-4 rotate-90" />
          </div>
          <span className="text-xs font-mono font-bold tracking-wider text-amber-300 uppercase">
            Tarjeta Inteligente NFC
          </span>
        </div>

        {onOpenStudio && (
          <button
            onClick={onOpenStudio}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Editor NFC</span>
          </button>
        )}
      </div>

      {/* Main Card Profile Container */}
      <div className="w-full max-w-md my-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Profile Header */}
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="relative mb-4">
            {card.photoUrl ? (
              <img
                src={card.photoUrl}
                alt={fullName}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-400/50 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 border-2 border-amber-300 flex items-center justify-center text-3xl font-extrabold text-slate-950 shadow-xl">
                {card.firstName?.[0] || 'N'}
                {card.lastName?.[0] || 'C'}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight">{fullName}</h1>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-400 mt-1">
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>{roleName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span>{orgName}</span>
          </div>
        </div>

        {/* Primary CTA: Add to Contacts */}
        <div className="mt-6 relative z-10">
          <button
            onClick={handleDownload}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
          >
            {downloaded ? (
              <>
                <Check className="w-5 h-5" />
                <span>¡Contacto Descargado a la Agenda!</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Guardar en Mi Teléfono</span>
              </>
            )}
          </button>
        </div>

        {/* Direct Action Quick Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4 relative z-10">
          {card.phone && (
            <a
              href={`tel:${card.phone}`}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-100 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Llamar</span>
            </a>
          )}

          {card.phone && (
            <a
              href={`https://wa.me/${card.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-100 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
          )}

          {card.email && (
            <a
              href={`mailto:${card.email}`}
              className="col-span-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-100 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Mail className="w-4 h-4 text-sky-400" />
              <span className="truncate">{card.email}</span>
            </a>
          )}

          {card.website && (
            <a
              href={card.website.startsWith('http') ? card.website : `https://${card.website}`}
              target="_blank"
              rel="noreferrer"
              className="col-span-2 py-2.5 px-4 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="truncate">{card.website}</span>
            </a>
          )}
        </div>

        {/* Notes / Bio */}
        {card.notes && (
          <div className="mt-5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 relative z-10">
            <p className="leading-relaxed">{card.notes}</p>
          </div>
        )}

        {/* Share Button */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 relative z-10">
          <span>Tarjeta compartida vía NFC</span>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? '¡Enlace copiado!' : 'Compartir'}</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-md text-center py-4 text-[11px] text-slate-500">
        NFC Card Studio • Compatible con NFC Tools y etiquetas NTAG
      </footer>
    </div>
  );
};
