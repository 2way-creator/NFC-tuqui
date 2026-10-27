import React from 'react';
import { ContactCard } from '../types';
import { downloadVcfFile } from '../utils/vcardHelper';
import { 
  Building2, 
  Briefcase, 
  Phone, 
  Mail, 
  Download, 
  Trash2, 
  Edit3, 
  Plus, 
  Copy,
  Users
} from 'lucide-react';

interface CardLibraryProps {
  cards: ContactCard[];
  activeCardId: string;
  onSelectCard: (card: ContactCard) => void;
  onNewCard: () => void;
  onDuplicateCard: (card: ContactCard) => void;
  onDeleteCard: (id: string) => void;
}

export const CardLibrary: React.FC<CardLibraryProps> = ({
  cards,
  activeCardId,
  onSelectCard,
  onNewCard,
  onDuplicateCard,
  onDeleteCard,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-base">Tarjetas Guardadas ({cards.length})</h3>
        </div>
        <button
          onClick={onNewCard}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/10"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Tarjeta</span>
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
          <p>No tienes tarjetas guardadas todavía.</p>
          <button
            onClick={onNewCard}
            className="mt-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
          >
            Crear primera tarjeta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cards.map((c) => {
            const isActive = c.id === activeCardId;
            const fullName = `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Sin Nombre';

            return (
              <div
                key={c.id}
                className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                  isActive
                    ? 'bg-slate-900 border-amber-500/60 ring-1 ring-amber-500/40 shadow-lg'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      {c.photoUrl ? (
                        <img
                          src={c.photoUrl}
                          alt={fullName}
                          className="w-10 h-10 rounded-xl object-cover border border-white/20 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {c.firstName?.[0] || 'N'}
                          {c.lastName?.[0] || 'C'}
                        </div>
                      )}
                      <div className="truncate">
                        <h4 className="font-bold text-white text-sm truncate">{fullName}</h4>
                        <div className="flex items-center gap-1 text-[11px] text-amber-400 truncate">
                          <Briefcase className="w-3 h-3 shrink-0" />
                          <span className="truncate">{c.role || 'Sin cargo'}</span>
                        </div>
                      </div>
                    </div>

                    {isActive && (
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                        En edición
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-slate-400 mt-2">
                    {c.organization && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{c.organization}</span>
                      </div>
                    )}
                    {c.phone && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3 h-3 text-emerald-500/80 shrink-0" />
                        <span className="truncate">{c.phone}</span>
                      </div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3 h-3 text-sky-500/80 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onSelectCard(c)}
                    className="flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar en Editor</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onDuplicateCard(c)}
                      title="Duplicar tarjeta"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => downloadVcfFile(c)}
                      title="Descargar .vcf"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCard(c.id)}
                      title="Eliminar tarjeta"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
