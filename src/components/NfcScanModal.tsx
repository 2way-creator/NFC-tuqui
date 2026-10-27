import React, { useState, useEffect, useRef } from 'react';
import { X, Wifi, CheckCircle2, AlertTriangle, Upload, FileText, Sparkles, Smartphone } from 'lucide-react';
import { ContactCard } from '../types';
import { scanNfcTag, isWebNfcSupported, NfcReadResult } from '../utils/nfcManager';
import { parseVCard } from '../utils/vcardHelper';

interface NfcScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardRead: (cardData: Partial<ContactCard>) => void;
}

export const NfcScanModal: React.FC<NfcScanModalProps> = ({
  isOpen,
  onClose,
  onCardRead,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('Esperando tarjeta NFC...');
  const [rawPastedText, setRawPastedText] = useState('');
  const [readSerial, setReadSerial] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const webNfcAvailable = isWebNfcSupported();

  useEffect(() => {
    if (isOpen && webNfcAvailable) {
      startScanning();
    }
    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = async () => {
    setIsScanning(true);
    setScanStatus('Acerca la tarjeta inteligente NFC a la antena de tu dispositivo...');
    setReadSerial(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await scanNfcTag((result: NfcReadResult) => {
        setReadSerial(result.serialNumber || 'Detectado');
        setScanStatus('¡Tarjeta NFC leída exitosamente!');
        onCardRead(result.cardData);
        setTimeout(() => {
          onClose();
        }, 1200);
      }, controller.signal);
    } catch (err: any) {
      setIsScanning(false);
      setScanStatus(`Error: ${err.message || 'No se pudo iniciar el escáner NFC'}`);
    }
  };

  const stopScanning = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsScanning(false);
  };

  const handlePasteParse = () => {
    if (!rawPastedText.trim()) return;
    const parsed = parseVCard(rawPastedText);
    onCardRead(parsed);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = parseVCard(content);
        onCardRead(parsed);
        onClose();
      }
    };
    reader.readAsText(file);
  };

  // Preset demo tags for quick testing on devices without physical NFC tags
  const handleSimulatedCard = (preset: 'executive' | 'tech' | 'medical') => {
    const presets: Record<string, Partial<ContactCard>> = {
      executive: {
        firstName: 'Carlos',
        lastName: 'Mendoza Ruiz',
        organization: 'Banco Santander Tech',
        role: 'Director de Innovación Digital',
        phone: '+34 612 345 678',
        email: 'carlos.mendoza@santander.com',
        website: 'santander.com',
        themeColor: 'blue',
      },
      tech: {
        firstName: 'Elena',
        lastName: 'Vargas Silva',
        organization: 'CloudScale AI Corp',
        role: 'Lead Cloud Solutions Architect',
        phone: '+52 55 9876 5432',
        email: 'elena.vargas@cloudscale.io',
        website: 'cloudscale.io',
        themeColor: 'emerald',
      },
      medical: {
        firstName: 'Dra. Sofía',
        lastName: 'Pérez Navarro',
        organization: 'Hospital Universitario Central',
        role: 'Especialista en Cardiología',
        phone: '+54 11 4455 6677',
        email: 'sofia.perez@saludcentral.org',
        website: 'saludcentral.org',
        themeColor: 'violet',
      },
    };

    onCardRead(presets[preset]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Wifi className="w-5 h-5 rotate-90" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Lectura Automática de Tarjeta NFC</h2>
              <p className="text-xs text-slate-400">
                Lee una tarjeta NFC física o importa la lectura de NFC Tools
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanning();
              onClose();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live NFC Antenna Sensor (when Web NFC is supported) */}
        {webNfcAvailable ? (
          <div className="mt-5 p-5 rounded-2xl bg-slate-950 border border-cyan-500/30 flex flex-col items-center text-center">
            <div className="relative w-20 h-20 flex items-center justify-center mb-3">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-ping" />
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 animate-pulse">
                <Wifi className="w-8 h-8 rotate-90" />
              </div>
            </div>
            <h4 className="font-bold text-white text-sm">Sensor NFC Escuchando</h4>
            <p className="text-xs text-slate-400 mt-1">{scanStatus}</p>
            {readSerial && (
              <span className="mt-2 text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                UID Tarjeta: {readSerial}
              </span>
            )}
          </div>
        ) : (
          <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
              <Smartphone className="w-4 h-4" />
              <span>Para lectura física automática:</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Abre esta aplicación en <strong>Google Chrome en Android</strong> con NFC activado en tu teléfono para leer tarjetas físicas al instante con solo acercarlas.
            </p>
          </div>
        )}

        {/* Option 2: Paste from NFC Tools app */}
        <div className="mt-5 space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Pegar lectura de NFC Tools o vCard:</span>
            <span className="text-[10px] text-slate-500">vCard / Texto plano</span>
          </label>
          <textarea
            rows={3}
            value={rawPastedText}
            onChange={(e) => setRawPastedText(e.target.value)}
            placeholder="Pega aquí el resultado leído en NFC Tools (ej. BEGIN:VCARD... o texto con nombre, cargo, teléfono)"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePasteParse}
              disabled={!rawPastedText.trim()}
              className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Cargar Datos al Formulario</span>
            </button>

            <label className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs cursor-pointer border border-slate-700 transition-colors flex items-center justify-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              <span>Subir .vcf</span>
              <input
                type="file"
                accept=".vcf,text/vcard"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {/* Option 3: Quick Demo Simulator (To test automated reading immediately) */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>O prueba con una tarjeta inteligente simulada:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSimulatedCard('executive')}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left transition-colors"
            >
              <div className="text-[11px] font-semibold text-slate-200 truncate">Carlos M.</div>
              <div className="text-[10px] text-slate-400 truncate">Director Innovación</div>
            </button>
            <button
              onClick={() => handleSimulatedCard('tech')}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left transition-colors"
            >
              <div className="text-[11px] font-semibold text-slate-200 truncate">Elena V.</div>
              <div className="text-[10px] text-slate-400 truncate">Cloud Architect</div>
            </button>
            <button
              onClick={() => handleSimulatedCard('medical')}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left transition-colors"
            >
              <div className="text-[11px] font-semibold text-slate-200 truncate">Dra. Sofía P.</div>
              <div className="text-[10px] text-slate-400 truncate">Cardiología</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
