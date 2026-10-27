import React, { useState } from 'react';
import { 
  X, 
  Wifi, 
  Phone, 
  Mail, 
  Building2, 
  Briefcase, 
  Globe, 
  UserPlus, 
  MessageCircle, 
  Smartphone,
  Check,
  ExternalLink
} from 'lucide-react';
import { ContactCard } from '../types';
import { downloadVcfFile } from '../utils/vcardHelper';

interface MobileSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: ContactCard;
}

export const MobileSimulatorModal: React.FC<MobileSimulatorModalProps> = ({
  isOpen,
  onClose,
  card,
}) => {
  const [deviceOs, setDeviceOs] = useState<'ios' | 'android'>('ios');
  const [hasTapped, setHasTapped] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const fullName = `${card.firstName || ''} ${card.lastName || ''}`.trim() || 'Nombre de la Persona';
  const orgName = card.organization || 'Empresa / Organización';
  const roleName = card.role || 'Cargo Profesional';

  const handleSaveContact = () => {
    downloadVcfFile(card);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 p-6 flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Simulador de Toque NFC</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-2 mt-4 w-full p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setDeviceOs('ios')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
              deviceOs === 'ios' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vista iPhone (iOS)
          </button>
          <button
            onClick={() => setDeviceOs('android')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
              deviceOs === 'android' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vista Android (Samsung / Pixel)
          </button>
        </div>

        {/* Interactive Smartphone Screen Simulation */}
        <div className="mt-4 w-full max-w-[340px] rounded-[36px] bg-slate-950 border-[6px] border-slate-800 p-4 shadow-2xl relative overflow-hidden flex flex-col min-h-[480px]">
          {/* Phone Top Notch / Dynamic Island */}
          <div className="flex justify-center mb-3">
            {deviceOs === 'ios' ? (
              <div className="w-28 h-6 bg-black rounded-full flex items-center justify-between px-3 text-[9px] text-white/70">
                <div className="w-2 h-2 rounded-full bg-slate-800" />
                <div className="flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-amber-400 rotate-90" />
                  <span className="text-[10px] text-amber-300 font-mono">NFC Tag</span>
                </div>
              </div>
            ) : (
              <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-800" />
            )}
          </div>

          {/* Prompt to Tap or Active Card */}
          {!hasTapped ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <button
                type="button"
                onClick={() => setHasTapped(true)}
                className="group relative w-24 h-24 rounded-full bg-amber-500/10 border-2 border-dashed border-amber-500/50 flex flex-col items-center justify-center text-amber-400 hover:scale-105 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
              >
                <div className="absolute inset-0 rounded-full border border-amber-400/30 animate-ping pointer-events-none" />
                <Wifi className="w-10 h-10 rotate-90 group-hover:scale-110 transition-transform" />
              </button>
              <h4 className="font-bold text-white text-sm mt-4">Toca para Acercar Tarjeta</h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
                Haz clic en el sensor para simular que un teléfono toca tu tarjeta física NFC.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between animate-fade-in">
              {/* Notification Banner */}
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-lg text-left backdrop-blur-md">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-md bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Wifi className="w-3.5 h-3.5 rotate-90" />
                  </div>
                  <span className="text-[11px] font-bold text-amber-300 tracking-wide uppercase">
                    Tarjeta NFC Detectada
                  </span>
                  <span className="text-[9px] text-slate-500 ml-auto">Ahora</span>
                </div>

                {/* Person Details Card in Phone */}
                <div className="flex items-center gap-3 mt-2">
                  {card.photoUrl ? (
                    <img
                      src={card.photoUrl}
                      alt={fullName}
                      className="w-12 h-12 rounded-full object-cover border border-white/20 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-base font-bold text-white shrink-0">
                      {card.firstName?.[0] || 'N'}
                      {card.lastName?.[0] || 'C'}
                    </div>
                  )}

                  <div className="truncate">
                    <h5 className="font-bold text-white text-xs truncate">{fullName}</h5>
                    <p className="text-[11px] text-amber-400 truncate">{roleName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{orgName}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Phone */}
              <div className="space-y-2 mt-4">
                <button
                  type="button"
                  onClick={handleSaveContact}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>¡Guardado en Contactos!</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Guardar en Mi Agenda</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  {card.phone && (
                    <a
                      href={`tel:${card.phone}`}
                      className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Llamar</span>
                    </a>
                  )}

                  {card.phone && (
                    <a
                      href={`https://wa.me/${card.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>

                {card.email && (
                  <a
                    href={`mailto:${card.email}`}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    <span className="truncate">{card.email}</span>
                  </a>
                )}
              </div>

              {/* Bottom reset simulator button */}
              <button
                type="button"
                onClick={() => setHasTapped(false)}
                className="mt-4 text-[10px] text-slate-500 hover:text-slate-300 py-1 transition-colors"
              >
                Volver a simular toque
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
