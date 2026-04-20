import { X, Award, Check } from 'lucide-react';
import { useState } from 'react';

interface EditPontosModalProps {
  nome: string;
  atual: number;
  onClose: () => void;
  onConfirm: (novo: number) => void;
}

export function EditPontosModal({ nome, atual, onClose, onConfirm }: EditPontosModalProps) {
  const [valor, setValor] = useState(atual);

  return (
    <div className="fixed inset-0 bg-gray-950/95 flex items-center justify-center p-6 z-[110] backdrop-blur-3xl">
      <div className="bg-white w-full max-w-sm p-10 rounded-[3rem] shadow-2xl space-y-8 border-8 border-gray-100 text-center animate-in zoom-in-95 duration-200">
        <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-amber-600">
          <Award size={40} strokeWidth={2.5}/>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase italic text-gray-950">Custo de Resgate</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{nome}</p>
        </div>

        <div className="relative">
          <input 
            type="number" 
            autoFocus
            value={valor} 
            onChange={e => setValor(parseInt(e.target.value) || 0)}
            className="w-full bg-gray-50 border-4 border-gray-100 rounded-3xl p-8 text-4xl font-black text-center text-amber-600 outline-none focus:border-amber-500 transition-all"
          />
          <span className="absolute bottom-2 left-0 right-0 text-[9px] font-black text-gray-300 uppercase">Pontos Fidelidade</span>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-5 rounded-2xl font-black uppercase text-[10px] bg-gray-100 text-gray-400 hover:bg-gray-200 transition-all">Cancelar</button>
          <button onClick={() => onConfirm(valor)} className="flex-1 py-5 rounded-2xl font-black uppercase text-[10px] bg-black text-white shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
            <Check size={14}/> Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
