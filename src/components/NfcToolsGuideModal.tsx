import React, { useState } from 'react';
import { X, Smartphone, CheckCircle, Copy, ExternalLink, Zap, AlertCircle, FileText } from 'lucide-react';
import { ContactCard } from '../types';
import { generateVCard } from '../utils/vcardHelper';

interface NfcToolsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: ContactCard;
}

export const NfcToolsGuideModal: React.FC<NfcToolsGuideModalProps> = ({
  isOpen,
  onClose,
  card,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'vcard' | 'url' | 'steps'>('steps');

  if (!isOpen) return null;

  const vcardText = generateVCard(card);

  const handleCopy = () => {
    navigator.clipboard.writeText(vcardText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Guía de Programación con NFC Tools</h2>
              <p className="text-xs text-slate-400">
                Paso a paso para grabar tu tarjeta física con la app oficial NFC Tools (Android / iOS)
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('steps')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
              activeTab === 'steps' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Pasos en NFC Tools
          </button>
          <button
            onClick={() => setActiveTab('vcard')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
              activeTab === 'vcard' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Payload vCard 3.0
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
              activeTab === 'url' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Alternativa URL Web
          </button>
        </div>

        {/* Tab 1: Detailed Steps */}
        {activeTab === 'steps' && (
          <div className="mt-5 space-y-4 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-orange-950/20 border border-orange-800/40 text-orange-200 flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <strong>¿No tienes la app?</strong> Descarga <strong>NFC Tools</strong> gratis desde
                Google Play Store o Apple App Store en tu celular.
              </div>
            </div>

            <ol className="space-y-3">
              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </span>
                <div>
                  <h4 className="font-semibold text-white">Abre la app NFC Tools</h4>
                  <p className="text-slate-400 mt-0.5">
                    Ve a la pestaña superior <strong>"Escribir" (Write)</strong>.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </span>
                <div>
                  <h4 className="font-semibold text-white">Añadir un registro</h4>
                  <p className="text-slate-400 mt-0.5">
                    Presiona el botón <strong>"Añadir un registro" (Add a record)</strong>.
                    <br />
                    • Para contacto nativo en agenda: Elige <strong>"Contacto" (Contact / vCard)</strong>.
                    <br />
                    • Para abrir tu tarjeta web completa: Elige <strong>"URL / Enlace"</strong>.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </span>
                <div>
                  <h4 className="font-semibold text-white">Completar o Pegar Datos</h4>
                  <p className="text-slate-400 mt-0.5">
                    Puedes escribir los datos o copiar el <strong>Payload vCard</strong> generado aquí con un solo clic.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 flex items-center justify-center font-bold text-xs shrink-0">
                  4
                </span>
                <div>
                  <h4 className="font-semibold text-white">Escribir en la tarjeta</h4>
                  <p className="text-slate-400 mt-0.5">
                    Toca en <strong>"Escribir / X Bytes"</strong> y acerca tu tarjeta inteligente NFC al sensor de tu celular (parte superior en iPhone, zona central o cámara en Android) hasta escuchar la confirmación sonora.
                  </p>
                </div>
              </li>
            </ol>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Copiar payload vCard directo:</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-semibold transition-colors"
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado!' : 'Copiar vCard'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Raw vCard Text */}
        {activeTab === 'vcard' && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Código NDEF vCard 3.0 estándar listo para NFC Tools o etiquetas RFID:
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 font-medium"
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado al portapapeles' : 'Copiar'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed select-all">
              {vcardText}
            </pre>
          </div>
        )}

        {/* Tab 3: URL Web NFC Alternative */}
        {activeTab === 'url' && (
          <div className="mt-5 space-y-3 text-xs text-slate-300">
            <p>
              Grabar una <strong>URL</strong> en la tarjeta tiene dos grandes ventajas:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Funciona en cualquier chip, incluso los económicos <strong>NTAG213</strong> (ocupa menos de 80 bytes).</li>
              <li>Al tocar con un iPhone o Android, abre automáticamente la pantalla de bienvenida con foto, WhatsApp directo y botón para guardar en la agenda.</li>
            </ul>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono block mb-1">ENLACE DIGITAL GENERADO:</span>
              <div className="p-2 rounded bg-slate-900 font-mono text-[11px] text-sky-400 break-all select-all">
                {window.location.origin + window.location.pathname}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
