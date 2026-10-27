import React, { useState } from 'react';
import { Download, Check, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'hero';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setModalOpen(true);
      }
    } else {
      setModalOpen(true);
    }
  };

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-medium">
        <Check className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">App Instalada</span>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <>
        <button
          onClick={handleClick}
          className="py-2 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center gap-1.5 transform active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar como App en tu Celular</span>
        </button>

        <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
        title="Instalar como aplicación en tu pantalla de inicio"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>

      <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
