import React from 'react';
import { X, Download, Smartphone, Share, PlusSquare, CheckCircle, ShieldCheck, Zap } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Instalar NFC Card Studio</h3>
              <p className="text-[11px] text-slate-400">Aplicación Móvil y de Escritorio (PWA)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* App Preview Icon & Title */}
        <div className="my-5 flex items-center gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <img
            src="/pwa-192x192.png"
            alt="Logo NFC Studio"
            className="w-16 h-16 rounded-2xl shadow-lg border border-white/10 shrink-0"
          />
          <div>
            <h4 className="font-extrabold text-white text-base leading-tight">NFC Card Studio</h4>
            <p className="text-xs text-amber-400 font-medium mt-0.5">Tarjetas Inteligentes & NFC Tools</p>
            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-mono">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                PWA Nativa
              </span>
              <span>100% Offline</span>
            </div>
          </div>
        </div>

        {/* Features / Benefits */}
        <div className="space-y-2.5 text-xs text-slate-300 mb-5">
          <div className="flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Acceso instantáneo desde la pantalla de inicio de tu celular sin barras de navegador.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Integración directa con el sensor NFC de tu teléfono para leer y grabar tarjetas físicas.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>Tus datos de tarjetas se guardan seguros en tu dispositivo y funcionan sin internet.</span>
          </div>
        </div>

        {/* Action based on platform */}
        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-center">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm mb-1">
              <CheckCircle className="w-5 h-5" />
              <span>¡La aplicación ya está instalada!</span>
            </div>
            <p className="text-xs text-emerald-200/80">
              Estás utilizando la versión instalada de NFC Card Studio en tu dispositivo.
            </p>
          </div>
        ) : isIOS ? (
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3 text-xs">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>Instrucciones para iPhone / iPad (Safari):</span>
            </div>
            <ol className="space-y-2 text-slate-300 pl-1">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Toca el botón <strong>Compartir</strong> (icono <Share className="w-3.5 h-3.5 inline text-sky-400 -mt-0.5" />) en la barra inferior de Safari.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Desplázate hacia abajo y selecciona <strong>"Añadir a pantalla de inicio"</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-slate-200 -mt-0.5" />).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Presiona <strong>"Añadir"</strong> en la esquina superior derecha. ¡Listo!
                </span>
              </li>
            </ol>
          </div>
        ) : isInstallable ? (
          <button
            onClick={handleInstallClick}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Instalar Aplicación en este Dispositivo</span>
          </button>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => {
                alert('Para instalar en Chrome / Edge o Android: Abre el menú de 3 puntos (⋮) en tu navegador y selecciona "Instalar aplicación" o "Agregar a la pantalla principal".');
              }}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Ver cómo agregar al teléfono / PC</span>
            </button>
            <p className="text-[11px] text-slate-500 text-center">
              En Chrome Android o PC: Menú ⋮ → "Instalar NFC Card Studio"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
