import { api } from '../../api';
import { useState, useEffect } from 'react';
import type { Tamanho } from '../../types';
import { X } from 'lucide-react';

interface NovoSaborModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function NovoSaborModal({ onClose, onSuccess }: NovoSaborModalProps) {
  const [novoSabor, setNovoSabor] = useState({ nome_sabor: '', ingredientes: '', preco_pontos: 500 });
  const [tamanhos, setTamanhos] = useState<Tamanho[]>([]);
  const [precos, setPrecos] = useState<Record<number, number>>({});

  useEffect(() => {
    api.getTamanhos().then(res => {
      setTamanhos(res.data);
      const initialPrecos: Record<number, number> = {};
      res.data.forEach((t: Tamanho) => initialPrecos[t.id_tamanho] = 0);
      setPrecos(initialPrecos);
    });
  }, []);

  const handleSalvar = async () => {
    try {
      await api.postSabor({ ...novoSabor, precos_por_tamanho: precos });
      onSuccess();
    } catch {
      alert("Erro ao cadastrar pizza e preços.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-950/95 flex items-center justify-center p-6 z-[100] backdrop-blur-3xl">
      <div className="bg-white w-full max-w-2xl p-12 rounded-[4rem] shadow-2xl space-y-10 border-8 border-gray-100 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-black uppercase italic text-black">Cadastrar Nova Pizza</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-red-600"><X size={32}/></button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Nome do Sabor</label>
                <input value={novoSabor.nome_sabor} onChange={e => setNovoSabor({...novoSabor, nome_sabor: e.target.value})} className="w-full bg-gray-50 border-4 border-gray-100 rounded-3xl p-6 font-black text-xl" placeholder="Ex: Calabresa" />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Resgate (Pontos)</label>
                <input type="number" value={novoSabor.preco_pontos} onChange={e => setNovoSabor({...novoSabor, preco_pontos: parseInt(e.target.value)})} className="w-full bg-gray-50 border-4 border-gray-100 rounded-3xl p-6 font-black text-xl text-amber-600" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Ingredientes</label>
            <textarea value={novoSabor.ingredientes} onChange={e => setNovoSabor({...novoSabor, ingredientes: e.target.value})} className="w-full bg-gray-50 border-4 border-gray-100 rounded-3xl p-6 font-bold text-sm h-24" placeholder="Lista de ingredientes..." />
          </div>

          <div className="space-y-4 pt-4 border-t-4 border-gray-50">
            <label className="text-[10px] font-black text-gray-900 uppercase ml-4">Precificação por Tamanho (R$)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {tamanhos.map(t => (
                    <div key={t.id_tamanho} className="bg-gray-50 p-4 rounded-3xl border-2 border-gray-100 space-y-2">
                        <p className="text-[9px] font-black uppercase text-gray-400 text-center">{t.nome_tamanho}</p>
                        <input 
                            type="number" 
                            value={precos[t.id_tamanho]} 
                            onChange={e => setPrecos({...precos, [t.id_tamanho]: parseFloat(e.target.value)})}
                            className="w-full bg-white border-2 border-gray-200 rounded-xl p-2 text-center font-black text-green-700" 
                        />
                    </div>
                ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-6 rounded-[2rem] font-black uppercase bg-gray-100 text-gray-400">Cancelar</button>
          <button onClick={handleSalvar} className="flex-1 py-6 rounded-[2rem] font-black uppercase bg-black text-white shadow-2xl active:scale-95 transition-all">Salvar Pizza</button>
        </div>
      </div>
    </div>
  );
}
