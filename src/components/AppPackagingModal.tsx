import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Package, 
  CheckCircle, 
  Share, 
  PlusSquare, 
  ExternalLink, 
  FileCode, 
  Zap, 
  ShieldCheck,
  Layers,
  ArrowRight
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { downloadAndroidProject } from '../utils/androidProjectExport';

interface AppPackagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTogglePhoneFrame?: () => void;
  isPhoneFrameActive?: boolean;
}

export const AppPackagingModal: React.FC<AppPackagingModalProps> = ({
  isOpen,
  onClose,
  onTogglePhoneFrame,
  isPhoneFrameActive,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'install' | 'apk' | 'project'>('install');
  const [downloadingZip, setDownloadingZip] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  const handleDownloadZip = () => {
    setDownloadingZip(true);
    try {
      downloadAndroidProject();
      setTimeout(() => setDownloadingZip(false), 2000);
    } catch {
      setDownloadingZip(false);
    }
  };

  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(window.location.origin)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Centro de Aplicación Móvil</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Android & iOS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Elige cómo deseas instalar o compilar tu aplicación para usarla como app nativa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-1.5 mt-4 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('install')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'install'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>1. Instalar App Directa</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'apk'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>2. Generar APK Online</span>
          </button>

          <button
            onClick={() => setActiveTab('project')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'project'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>3. Proyecto Android (ZIP)</span>
          </button>
        </div>

        {/* Tab 1: PWA Direct Install */}
        {activeTab === 'install' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-4">
              <img
                src="/pwa-192x192.png"
                alt="Icono App"
                className="w-16 h-16 rounded-2xl shadow-lg border border-white/10 shrink-0"
              />
              <div className="flex-1">
                <h4 className="font-extrabold text-white text-base">NFC Card Studio</h4>
                <p className="text-xs text-amber-400">Versión 1.0.0 • Aplicación Móvil PWA</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Se instala directamente en tu pantalla de inicio como una app del sistema, sin tiendas y con soporte Web NFC.
                </p>
              </div>
            </div>

            {isInstalled ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                  <CheckCircle className="w-5 h-5" />
                  <span>¡Esta app ya está instalada en tu dispositivo!</span>
                </div>
                <p className="text-xs text-emerald-200/80">
                  Puedes abrirla en cualquier momento desde el menú de aplicaciones de tu smartphone.
                </p>
              </div>
            ) : isIOS ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3 text-xs">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  <span>Pasos para instalar en iPhone / iPad (Safari):</span>
                </div>
                <ol className="space-y-2 text-slate-300 pl-1">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Toca el botón <strong>Compartir</strong> (<Share className="w-3.5 h-3.5 inline text-sky-400 -mt-0.5" />) en la barra inferior de Safari.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Selecciona <strong>"Añadir a pantalla de inicio"</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-slate-200 -mt-0.5" />).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Presiona <strong>"Añadir"</strong>. Aparecerá en tu pantalla con su propio icono.
                    </span>
                  </li>
                </ol>
              </div>
            ) : isInstallable ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
              >
                <Download className="w-5 h-5" />
                <span>Instalar Aplicación en este Dispositivo</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Para instalar en Android (Google Chrome):</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Toca el menú de los <strong>3 puntos (⋮)</strong> en la esquina superior de Chrome y presiona <strong>"Instalar aplicación"</strong> o <strong>"Añadir a la pantalla principal"</strong>.
                </p>
              </div>
            )}

            {/* Phone Frame Toggle */}
            {onTogglePhoneFrame && (
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-white text-xs">Modo Marco de Teléfono (Simulador)</h5>
                  <p className="text-[11px] text-slate-400">Ver la aplicación en formato smartphone vertical</p>
                </div>
                <button
                  onClick={onTogglePhoneFrame}
                  className={`py-1.5 px-3 rounded-xl font-bold text-xs transition-colors ${
                    isPhoneFrameActive
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {isPhoneFrameActive ? 'Desactivar Marco' : 'Activar Marco'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Generate APK via PWABuilder */}
        {activeTab === 'apk' && (
          <div className="mt-5 space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-950 to-slate-950 border border-blue-500/30 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <Package className="w-4 h-4" />
                <span>Generador Oficial de APK (PWABuilder / TWA)</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                PWABuilder es la herramienta recomendada por Google y Microsoft para empaquetar una PWA directamente en un archivo <strong>.APK o .AAB</strong> listo para publicar en Google Play Store o instalar mediante sideloading en cualquier teléfono Android.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-white">¿Cómo generar tu archivo APK en 2 clics?</h5>
              <ol className="list-decimal pl-5 space-y-1.5 text-slate-400">
                <li>Haz clic en el botón de abajo para abrir <strong>PWABuilder</strong> con esta URL.</li>
                <li>Presiona en <strong>"Package for Stores"</strong> y selecciona <strong>Android</strong>.</li>
                <li>Haz clic en <strong>"Generate APK"</strong> para descargar tu archivo de instalación directo.</li>
              </ol>
            </div>

            <a
              href={pwaBuilderUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Abrir Generador de APK en PWABuilder</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Tab 3: Native Android Project ZIP */}
        {activeTab === 'project' && (
          <div className="mt-5 space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <FileCode className="w-4 h-4" />
                <span>Código Fuente Nativo Android (Capacitor + NFC Intents)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Descarga el proyecto completo de Android Studio con el archivo <code className="text-amber-300 font-mono">AndroidManifest.xml</code> configurado con permisos de hardware para antenas NFC (<code className="text-cyan-300 font-mono">android.permission.NFC</code>) y captura automática de tarjetas vCard.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1 font-mono text-slate-400">
              <div className="text-white font-bold font-sans">Archivos incluidos en el ZIP:</div>
              <div>• capacitor.config.json (Configuración de ID de App)</div>
              <div>• android/app/src/main/AndroidManifest.xml (Permisos NFC)</div>
              <div>• android/app/src/main/java/.../MainActivity.java</div>
              <div>• android/app/build.gradle (Configuración Gradle SDK 34)</div>
              <div>• README_ANDROID.md (Guía para compilar APK en 1 minuto)</div>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingZip ? 'Generando ZIP...' : 'Descargar Proyecto Android (ZIP)'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
