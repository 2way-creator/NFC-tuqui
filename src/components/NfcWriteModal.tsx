import React, { useState } from 'react';
import { X, Wifi, CheckCircle2, AlertTriangle, Copy, Download, Sparkles, ExternalLink } from 'lucide-react';
import { ContactCard } from '../types';
import { writeNfcTag, isWebNfcSupported } from '../utils/nfcManager';
import { generateVCard, downloadVcfFile, encodeCardToUrl } from '../utils/vcardHelper';
import confetti from 'canvas-confetti';

interface NfcWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: ContactCard;
}

export const NfcWriteModal: React.FC<NfcWriteModalProps> = ({
  isOpen,
  onClose,
  card,
}) => {
  const [writeMode, setWriteMode] = useState<'vcard' | 'url'>('vcard');
  const [status, setStatus] = useState<'idle' | 'waiting' | 'writing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const webNfcAvailable = isWebNfcSupported();
  const vcardText = generateVCard(card);
  const webCardUrl = encodeCardToUrl(card);

  const startWriting = async () => {
    setStatus('waiting');
    setErrorMessage('');

    try {
      const result = await writeNfcTag(
        card,
        writeMode,
        writeMode === 'url' ? webCardUrl : undefined
      );

      setStatus('success');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Error al comunicarse con el chip NFC.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(vcardText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wifi className="w-5 h-5 rotate-90" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Grabar en Tarjeta NFC</h2>
              <p className="text-xs text-slate-400">
                Escribe los datos de {card.firstName || 'Contacto'} en tu chip NFC físico
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

        {/* Mode Selector */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Tipo de Registro NDEF para el Chip:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setWriteMode('vcard')}
              className={`p-3 rounded-xl border text-left transition-all ${
                writeMode === 'vcard'
                  ? 'bg-amber-500/10 border-amber-500/50 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-xs text-amber-300">vCard 3.0 Directo</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Compatible con NFC Tools y agenda de teléfonos.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setWriteMode('url')}
              className={`p-3 rounded-xl border text-left transition-all ${
                writeMode === 'url'
                  ? 'bg-amber-500/10 border-amber-500/50 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-xs text-amber-300">Enlace Digital Web</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Abre la tarjeta con foto y botones al instante.
              </p>
            </button>
          </div>
        </div>

        {/* State Content */}
        {webNfcAvailable ? (
          <div className="mt-6 flex flex-col items-center text-center">
            {status === 'idle' && (
              <div className="w-full flex flex-col items-center py-4">
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-dashed border-amber-400/50 flex items-center justify-center text-amber-400 mb-3 animate-pulse">
                  <Wifi className="w-10 h-10 rotate-90" />
                </div>
                <h4 className="font-bold text-white text-base">Web NFC está listo</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Al presionar el botón, acerca tu tarjeta física inteligente o llavero NFC al sensor de tu dispositivo.
                </p>

                <button
                  onClick={startWriting}
                  className="mt-5 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Wifi className="w-4 h-4 rotate-90" />
                  <span>Iniciar Grabación en Tarjeta</span>
                </button>
              </div>
            )}

            {status === 'waiting' && (
              <div className="w-full flex flex-col items-center py-6">
                <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping" />
                  <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 animate-pulse">
                    <Wifi className="w-10 h-10 rotate-90" />
                  </div>
                </div>
                <h4 className="font-bold text-white text-base">Acerca la Tarjeta NFC</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Mantén la tarjeta pegada a la parte posterior de tu teléfono durante 1 o 2 segundos...
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-5 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
              </div>
            )}

            {status === 'success' && (
              <div className="w-full flex flex-col items-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-white text-base">¡Tarjeta Grabada con Éxito!</h4>
                <p className="text-xs text-emerald-300 mt-1">
                  Tu tarjeta NFC ya contiene la tarjeta inteligente de {card.firstName}.
                </p>
                <div className="mt-5 flex gap-2 w-full">
                  <button
                    onClick={() => setStatus('idle')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                  >
                    Grabar Otra Tarjeta
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                  >
                    Finalizar
                  </button>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="w-full flex flex-col items-center py-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400 mb-3">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-white text-base">No se pudo grabar</h4>
                <p className="text-xs text-rose-300 mt-1 max-w-sm">
                  {errorMessage}
                </p>
                <button
                  onClick={startWriting}
                  className="mt-4 py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Reintentar Grabación
                </button>
              </div>
            )}
          </div>
        ) : (
          /* When Web NFC is not available in browser (e.g. desktop/iOS), provide direct NFC Tools integration */
          <div className="mt-5 space-y-4">
            <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-slate-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Navegador sin Web NFC nativo:</strong>
                <p className="text-slate-400 mt-0.5">
                  El navegador actual no tiene acceso directo a la antena NFC. Puedes grabar tu tarjeta física fácilmente usando la app gratuita <strong>NFC Tools</strong> (Android / iOS):
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCopy}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white flex flex-col items-center text-center transition-colors"
              >
                {copied ? <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-1" /> : <Copy className="w-6 h-6 text-amber-400 mb-1" />}
                <span className="font-semibold text-xs">{copied ? '¡Copiado!' : 'Copiar Payload vCard'}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Para pegar en NFC Tools</span>
              </button>

              <button
                onClick={() => downloadVcfFile(card)}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white flex flex-col items-center text-center transition-colors"
              >
                <Download className="w-6 h-6 text-sky-400 mb-1" />
                <span className="font-semibold text-xs">Descargar Archivo .VCF</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Listo para compartir o importar</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-white">Consejo para Android:</div>
              <div>Si abres esta misma aplicación web desde <strong>Google Chrome en tu teléfono Android</strong>, ¡podrás grabar directamente la tarjeta NFC desde aquí con un solo toque!</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
