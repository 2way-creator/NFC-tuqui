import React, { useState, useEffect } from 'react';
import { ContactCard } from './types';
import { NfcCardPreview } from './components/NfcCardPreview';
import { NfcToolsGuideModal } from './components/NfcToolsGuideModal';
import { NfcWriteModal } from './components/NfcWriteModal';
import { NfcScanModal } from './components/NfcScanModal';
import { MobileSimulatorModal } from './components/MobileSimulatorModal';
import { PublicCardView } from './components/PublicCardView';
import { CardLibrary } from './components/CardLibrary';
import { AppPackagingModal } from './components/AppPackagingModal';
import { decodeCardFromUrl, downloadVcfFile, encodeCardToUrl, generateVCard } from './utils/vcardHelper';
import { isWebNfcSupported } from './utils/nfcManager';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

import { 
  Wifi, 
  Copy, 
  Check, 
  Download, 
  Smartphone, 
  BookOpen, 
  Plus, 
  Sparkles, 
  User, 
  Building2, 
  Briefcase, 
  Phone, 
  Mail, 
  Globe, 
  Image as ImageIcon, 
  Upload, 
  Palette, 
  ExternalLink,
  ShieldCheck,
  Zap,
  FolderOpen
} from 'lucide-react';

// Default generated high-quality asset images
const DEFAULT_HERO_IMAGE = new URL('./assets/images/nfc_smart_card_1793125290881.jpg', import.meta.url).href;
const PRESET_AVATAR_MALE = new URL('./assets/images/avatar_profile_1793125303519.jpg', import.meta.url).href;
const PRESET_AVATAR_FEMALE = new URL('./assets/images/avatar_female_1793125317178.jpg', import.meta.url).href;

const DEFAULT_CARD: ContactCard = {
  id: 'card-default',
  firstName: 'Alejandro',
  lastName: 'Chen',
  organization: 'Synapse Innovations',
  role: 'Chief Technology Officer',
  phone: '+34 654 987 321',
  email: 'alejandro.chen@synapse.tech',
  website: 'synapse.tech',
  address: 'Paseo de la Castellana 80, Madrid',
  notes: 'Especialista en IoT, tarjetas inteligentes NFC y sistemas embebidos.',
  themeColor: 'gold',
  cardStyle: 'modern',
  photoUrl: PRESET_AVATAR_MALE,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export default function App() {
  const [cards, setCards] = useState<ContactCard[]>(() => {
    try {
      const saved = localStorage.getItem('nfc_cards_store');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading saved cards', e);
    }
    return [DEFAULT_CARD];
  });

  const [activeCardId, setActiveCardId] = useState<string>(DEFAULT_CARD.id);
  const [activeTab, setActiveTab] = useState<'editor' | 'library'>('editor');
  
  // Public standalone card mode (e.g. from ?card=...)
  const [publicCard, setPublicCard] = useState<ContactCard | null>(null);

  // Modals state
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isPackagingOpen, setIsPackagingOpen] = useState(false);
  const [isPhoneFrameActive, setIsPhoneFrameActive] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Active card reference
  const currentCard = cards.find((c) => c.id === activeCardId) || cards[0] || DEFAULT_CARD;

  // Save to localStorage whenever cards array changes
  useEffect(() => {
    try {
      localStorage.setItem('nfc_cards_store', JSON.stringify(cards));
    } catch (e) {
      console.error('Error saving cards', e);
    }
  }, [cards]);

  // Check URL on startup for ?card=... payload (when tapped via NFC in real life)
  useEffect(() => {
    const fromUrl = decodeCardFromUrl();
    if (fromUrl) {
      setPublicCard(fromUrl);
    }
  }, []);

  const updateCurrentCard = (partial: Partial<ContactCard>) => {
    setCards((prev) =>
      prev.map((c) => (c.id === currentCard.id ? { ...c, ...partial, updatedAt: Date.now() } : c))
    );
  };

  const handleCreateNewCard = () => {
    const newCard: ContactCard = {
      id: 'card-' + Date.now(),
      firstName: '',
      lastName: '',
      organization: '',
      role: '',
      phone: '',
      email: '',
      website: '',
      themeColor: 'emerald',
      cardStyle: 'modern',
      photoUrl: PRESET_AVATAR_FEMALE,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCards((prev) => [newCard, ...prev]);
    setActiveCardId(newCard.id);
    setActiveTab('editor');
  };

  const handleDuplicateCard = (cardToDup: ContactCard) => {
    const newCard: ContactCard = {
      ...cardToDup,
      id: 'card-' + Date.now(),
      firstName: cardToDup.firstName + ' (Copia)',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCards((prev) => [newCard, ...prev]);
    setActiveCardId(newCard.id);
    setActiveTab('editor');
  };

  const handleDeleteCard = (id: string) => {
    if (cards.length <= 1) {
      alert('Debes mantener al menos una tarjeta en la biblioteca.');
      return;
    }
    const nextCards = cards.filter((c) => c.id !== id);
    setCards(nextCards);
    if (activeCardId === id) {
      setActiveCardId(nextCards[0].id);
    }
  };

  const handleCardRead = (cardData: Partial<ContactCard>) => {
    updateCurrentCard(cardData);
  };

  const handleCopyNfcToolsPayload = () => {
    const vcard = generateVCard(currentCard);
    navigator.clipboard.writeText(vcard);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2200);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        updateCurrentCard({ photoUrl: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  // If in public tapped card mode, render the public card view
  if (publicCard) {
    return (
      <PublicCardView
        card={publicCard}
        onOpenStudio={() => {
          // Clear URL query param and switch to studio
          window.history.pushState({}, '', window.location.pathname);
          setPublicCard(null);
        }}
      />
    );
  }

  const webNfcActive = isWebNfcSupported();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
            <Wifi className="w-5 h-5 rotate-90" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white">NFC Card Studio</h1>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                NFC Tools Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Creación y lectura automatizada de tarjetas inteligentes NFC
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Web NFC indicator badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border ${
              webNfcActive
                ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${webNfcActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span>{webNfcActive ? 'Web NFC Antena Activa' : 'Modo NFC Tools / Web'}</span>
          </div>

          <button
            onClick={() => setIsScanOpen(true)}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all"
            title="Leer tarjeta física o pegar lectura de NFC Tools"
          >
            <Wifi className="w-3.5 h-3.5 rotate-90" />
            <span>Leer Tarjeta</span>
          </button>

          <button
            onClick={() => setIsPackagingOpen(true)}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
            title="Centro de instalación PWA, empaquetado y generación de APK Android"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Centro App & APK</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className={`w-full flex justify-center ${isPhoneFrameActive ? 'py-6 px-2' : ''}`}>
        <main
          className={`flex-1 flex flex-col gap-6 transition-all duration-300 ${
            isPhoneFrameActive
              ? 'max-w-[430px] border-[10px] border-slate-800 rounded-[50px] shadow-2xl p-4 bg-slate-950 overflow-hidden relative'
              : 'max-w-7xl w-full p-4 lg:p-8'
          }`}
        >
        {/* Hero Banner with physical card image showcase */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 p-5 md:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-semibold text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Compatible con chips NTAG213, NTAG215 y NTAG216</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Diseña, Lee y Graba Tarjetas Inteligentes NFC
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Configura los datos personales y profesionales de contacto. Genera el payload vCard 3.0 exacto para programar tus tarjetas físicas con la app <strong>NFC Tools</strong> o graba directamente con Web NFC.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2 justify-center md:justify-start">
              <button
                onClick={() => setIsWriteOpen(true)}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Grabar en Tarjeta Física</span>
              </button>

              <button
                onClick={handleCopyNfcToolsPayload}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPayload ? '¡Copiado para NFC Tools!' : 'Copiar Payload NFC Tools'}</span>
              </button>

              <button
                onClick={() => setIsSimulatorOpen(true)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs transition-colors flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>Simular Toque con Celular</span>
              </button>

              <PWAInstallButton variant="hero" />
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div className="relative w-full max-w-[280px] shrink-0 group">
            <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl shadow-black/80">
              <img
                src={DEFAULT_HERO_IMAGE}
                alt="Tarjeta Inteligente NFC con Chip Dorado"
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-[11px] font-mono text-amber-300 font-semibold flex items-center gap-1">
                  <Wifi className="w-3 h-3 rotate-90" />
                  <span>Hardware NFC Contactless</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Studio Workspace: Tabs and Editor */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'editor'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Editor de Tarjeta</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'library'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Mis Tarjetas Guardadas ({cards.length})</span>
          </button>
        </div>

        {activeTab === 'library' ? (
          <CardLibrary
            cards={cards}
            activeCardId={activeCardId}
            onSelectCard={(c) => {
              setActiveCardId(c.id);
              setActiveTab('editor');
            }}
            onNewCard={handleCreateNewCard}
            onDuplicateCard={handleDuplicateCard}
            onDeleteCard={handleDeleteCard}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form & Settings (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Form Container */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-white text-base">Datos de la Persona</h3>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Formato compatible con Contactos de iOS y Android
                  </span>
                </div>

                {/* Name Fields: Nombre y Apellido */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Nombre <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentCard.firstName}
                      onChange={(e) => updateCurrentCard({ firstName: e.target.value })}
                      placeholder="Ej. Juan o Alejandro"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Apellido(s) <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentCard.lastName}
                      onChange={(e) => updateCurrentCard({ lastName: e.target.value })}
                      placeholder="Ej. Pérez o Chen"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Organization and Role: Organización y Cargo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Organización / Empresa</span>
                    </label>
                    <input
                      type="text"
                      value={currentCard.organization}
                      onChange={(e) => updateCurrentCard({ organization: e.target.value })}
                      placeholder="Ej. Tech Corp, Hospital, Estudio Legal"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>Cargo / Posición</span>
                    </label>
                    <input
                      type="text"
                      value={currentCard.role}
                      onChange={(e) => updateCurrentCard({ role: e.target.value })}
                      placeholder="Ej. Director General, Gerente de Ventas"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Contact: Teléfono y Correo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Teléfono de Contacto</span>
                    </label>
                    <input
                      type="tel"
                      value={currentCard.phone}
                      onChange={(e) => updateCurrentCard({ phone: e.target.value })}
                      placeholder="+34 600 000 000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-sky-400" />
                      <span>Correo Electrónico</span>
                    </label>
                    <input
                      type="email"
                      value={currentCard.email}
                      onChange={(e) => updateCurrentCard({ email: e.target.value })}
                      placeholder="contacto@organizacion.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Image / Avatar Selection (per user request: "incluir una imagen") */}
                <div className="pt-2 border-t border-slate-800/80">
                  <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Imagen de Perfil / Foto de la Persona o Logo</span>
                  </label>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Current Image Preview */}
                    <div className="relative">
                      {currentCard.photoUrl ? (
                        <img
                          src={currentCard.photoUrl}
                          alt="Foto seleccionada"
                          className="w-14 h-14 rounded-xl object-cover border-2 border-amber-400/60 shadow-md"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-400 font-bold">
                          Iniciales
                        </div>
                      )}
                    </div>

                    {/* Image Preset Selectors */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateCurrentCard({ photoUrl: PRESET_AVATAR_MALE })}
                        className={`p-1 rounded-xl border transition-all ${
                          currentCard.photoUrl === PRESET_AVATAR_MALE
                            ? 'border-amber-400 ring-2 ring-amber-400/30'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                        title="Seleccionar retrato ejecutivo masculino"
                      >
                        <img
                          src={PRESET_AVATAR_MALE}
                          alt="Preset 1"
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => updateCurrentCard({ photoUrl: PRESET_AVATAR_FEMALE })}
                        className={`p-1 rounded-xl border transition-all ${
                          currentCard.photoUrl === PRESET_AVATAR_FEMALE
                            ? 'border-amber-400 ring-2 ring-amber-400/30'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                        title="Seleccionar retrato ejecutiva femenina"
                      >
                        <img
                          src={PRESET_AVATAR_FEMALE}
                          alt="Preset 2"
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      </button>

                      {/* Upload Own Photo Button */}
                      <label className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Subir mi foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>

                      {currentCard.photoUrl && (
                        <button
                          type="button"
                          onClick={() => updateCurrentCard({ photoUrl: '' })}
                          className="text-xs text-slate-500 hover:text-rose-400 py-1 px-2"
                        >
                          Quitar foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional optional fields: Sitio web, Notas */}
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sitio Web / LinkedIn</span>
                    </label>
                    <input
                      type="text"
                      value={currentCard.website || ''}
                      onChange={(e) => updateCurrentCard({ website: e.target.value })}
                      placeholder="www.organizacion.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Nota / Resumen breve
                    </label>
                    <input
                      type="text"
                      value={currentCard.notes || ''}
                      onChange={(e) => updateCurrentCard({ notes: e.target.value })}
                      placeholder="Presentación o bio corta"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Visual Theme Color Picker */}
                <div className="pt-2 border-t border-slate-800/80">
                  <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                    <span>Estilo Visual de la Tarjeta</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'gold', label: 'Gold Elegance', bg: 'bg-amber-500' },
                      { id: 'emerald', label: 'Tech Emerald', bg: 'bg-emerald-500' },
                      { id: 'blue', label: 'Executive Blue', bg: 'bg-blue-600' },
                      { id: 'indigo', label: 'Deep Indigo', bg: 'bg-indigo-600' },
                      { id: 'violet', label: 'Modern Violet', bg: 'bg-violet-600' },
                      { id: 'rose', label: 'Rose Gold', bg: 'bg-rose-500' },
                      { id: 'slate', label: 'Titanium Slate', bg: 'bg-slate-500' },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => updateCurrentCard({ themeColor: theme.id as any })}
                        className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                          currentCard.themeColor === theme.id
                            ? 'bg-slate-800 border-amber-400 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${theme.bg}`} />
                        <span>{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* NFC Tools Quick Action Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-950/30 via-slate-900 to-slate-900 border border-orange-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">¿Listo para flashear con NFC Tools?</h4>
                    <p className="text-slate-400 text-[11px]">
                      Copia el texto del registro o descarga el archivo .vcf con 1 clic.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopyNfcToolsPayload}
                    className="flex-1 sm:flex-initial py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    {copiedPayload ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPayload ? '¡Copiado!' : 'Copiar Registro'}</span>
                  </button>

                  <button
                    onClick={() => downloadVcfFile(currentCard)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold transition-colors flex items-center gap-1.5"
                    title="Descargar archivo vCard (.vcf)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">.VCF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3D Card Preview & Chip Diagnostics (5 cols) */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Wifi className="w-3.5 h-3.5 text-amber-400 rotate-90" />
                  <span>Vista Previa de Tarjeta Inteligente</span>
                </div>
                <span className="text-[11px] text-slate-500">Toca la tarjeta para voltear</span>
              </div>

              {/* Interactive Card Component */}
              <NfcCardPreview
                card={currentCard}
                onSimulateTap={() => setIsSimulatorOpen(true)}
                onDownloadVcf={() => downloadVcfFile(currentCard)}
              />

              {/* Digital Profile URL Box */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Enlace Público de Perfil NFC</span>
                  <a
                    href={encodeCardToUrl(currentCard)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
                  >
                    <span>Abrir Perfil</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Si programas el chip NFC con este enlace web, cualquier smartphone que toque la tarjeta abrirá directamente tu perfil interactivo sin necesidad de tener instalada ninguna aplicación.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>

      {/* Modals */}
      <NfcToolsGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        card={currentCard}
      />

      <NfcWriteModal
        isOpen={isWriteOpen}
        onClose={() => setIsWriteOpen(false)}
        card={currentCard}
      />

      <NfcScanModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onCardRead={handleCardRead}
      />

      <MobileSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        card={currentCard}
      />

      <AppPackagingModal
        isOpen={isPackagingOpen}
        onClose={() => setIsPackagingOpen(false)}
        onTogglePhoneFrame={() => setIsPhoneFrameActive(!isPhoneFrameActive)}
        isPhoneFrameActive={isPhoneFrameActive}
      />

      {/* Native Mobile App Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl flex items-center justify-around py-2 px-1 shadow-2xl">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors ${
            activeTab === 'editor' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span className="text-[10px]">Editor</span>
        </button>

        <button
          onClick={() => setIsScanOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-2.5 text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <Wifi className="w-4 h-4 rotate-90 text-cyan-400" />
          <span className="text-[10px]">Leer NFC</span>
        </button>

        <button
          onClick={() => setIsWriteOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-2.5 text-slate-400 hover:text-amber-400 transition-colors"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-[10px]">Grabar</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors ${
            activeTab === 'library' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span className="text-[10px]">Tarjetas</span>
        </button>

        <button
          onClick={() => setIsPackagingOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-2.5 text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px]">Instalar App</span>
        </button>
      </nav>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 px-4 py-4 pb-20 sm:pb-4 text-center text-xs text-slate-500">
        NFC Card Studio • Creado para grabación y lectura de tarjetas inteligentes NDEF compatibles con NFC Tools (iOS & Android).
      </footer>

      {/* Offline Connectivity Toast */}
      <OfflineIndicator />
    </div>
  );
}
