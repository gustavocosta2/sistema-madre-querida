import { api } from '../../api';
import { useState } from 'react';

interface NovoSaborModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function NovoSaborModal({ onClose, onSuccess }: NovoSaborModalProps) {
  const [novoSabor, setNovoSabor] = useState({ nome_sabor: '', ingredientes: '' });

  const handleSalvar = async () => {
    try {
      await api.postSabor(novoSabor);
      onSuccess();
    } catch {
      alert("Erro ao cadastrar pizza.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-950/95 flex items-center justify-center p-6 z-[100] backdrop-blur-3xl">
      <div className="bg-white w-full max-w-lg p-12 rounded-[4rem] shadow-2xl space-y-10 border-8 border-gray-100">
        <h2 className="text-3xl font-black uppercase italic text-black">Cadastrar Pizza</h2>
        <div className="space-y-6">
          <input value={novoSabor.nome_sabor} onChange={e => setNovoSabor({...novoSabor, nome_sabor: e.target.value})} className="w-full bg-gray-50 border-4 border-gray-100 rounded-3xl p-6 font-black text-xl" placeholder="Nome do Sabor" />
          <textarea value={novoSabor.ingredientes} onChange={e => setNovoSabor({...novoSabor, ingredientes: e.target.value})} className="w-full bg-gray-50 border-4 border-gray-100 rounded-3xl p-6 font-black text-sm h-40" placeholder="Ingredientes..." />
        </div>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-6 rounded-[2rem] font-black uppercase bg-gray-100 text-gray-400">Cancelar</button>
          <button onClick={handleSalvar} className="flex-1 py-6 rounded-[2rem] font-black uppercase bg-black text-white shadow-2xl active:scale-95 transition-all">Salvar</button>
        </div>
      </div>
    </div>
  );
}
