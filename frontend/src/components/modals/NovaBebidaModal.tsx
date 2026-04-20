import { api } from '../../api';
import { useState } from 'react';
import { X } from 'lucide-react';

interface NovaBebidaModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function NovaBebidaModal({ onClose, onSuccess }: NovaBebidaModalProps) {
  const [novaBebida, setNovaBebida] = useState({ 
    nome: '', 
    preco: 0, 
    volume: 350, 
    preco_pontos: 100 
  });

  const handleSalvar = async () => {
    try {
      await api.postBebida(novaBebida);
      onSuccess();
    } catch {
      alert("Erro ao cadastrar bebida.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-950/95 flex items-center justify-center p-6 z-[100] backdrop-blur-3xl">
      <div className="bg-white w-full max-w-lg p-12 rounded-[4rem] shadow-2xl space-y-10 border-8 border-gray-100">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-black uppercase italic text-black">Cadastrar Bebida</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-red-600"><X size={32}/></button>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Nome da Bebida</label>
            <input value={novaBebida.nome} onChange={e => setNovaBebida({...novaBebida, nome: e.target.value})} className="w-full bg-gray-50 border-4 border-gray-100 rounded-3xl p-6 font-black text-xl" placeholder="Ex: Coca-Cola 2L" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Preço (R$)</label>
                <input type="number" value={novaBebida.preco} onChange={e => setNovaBebida({...novaBebida, preco: parseFloat(e.target.value)})} className="w-full bg-gray-50 border-4 border-gray-100 rounded-3xl p-6 font-black text-xl" />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Volume (ml)</label>
                <input type="number" value={novaBebida.volume} onChange={e => setNovaBebida({...novaBebida, volume: parseInt(e.target.value)})} className="w-full bg-gray-50 border-4 border-gray-100 rounded-3xl p-6 font-black text-xl" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Custo Resgate (Pontos)</label>
            <input type="number" value={novaBebida.preco_pontos} onChange={e => setNovaBebida({...novaBebida, preco_pontos: parseInt(e.target.value)})} className="w-full bg-gray-50 border-4 border-gray-100 rounded-3xl p-6 font-black text-xl text-amber-600" />
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-6 rounded-[2rem] font-black uppercase bg-gray-100 text-gray-400">Cancelar</button>
          <button onClick={handleSalvar} className="flex-1 py-6 rounded-[2rem] font-black uppercase bg-black text-white shadow-2xl active:scale-95 transition-all">Salvar</button>
        </div>
      </div>
    </div>
  );
}
