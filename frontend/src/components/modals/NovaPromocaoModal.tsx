import { X, Check } from 'lucide-react';
import { useState } from 'react';
import { api } from '../../api';
import { useMadre } from '../../context/MadreContext';

interface NovaPromocaoModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function NovaPromocaoModal({ onClose, onSuccess }: NovaPromocaoModalProps) {
  const { sabores, tamanhos, bebidas } = useMadre();
  const [nome, setNome] = useState('');
  const [valorDesconto, setValorDesconto] = useState(0);
  
  const [idsSabores, setIdsSabores] = useState<number[]>([]);
  const [idsTamanhos, setIdsTamanhos] = useState<number[]>([]);
  const [idsProdutos, setIdsProdutos] = useState<number[]>([]);

  const toggle = (id: number, list: number[], setList: (l: number[]) => void) => {
    if (list.includes(id)) setList(list.filter(i => i !== id));
    else setList([...list, id]);
  };

  const handleSalvar = async () => {
    try {
      await api.postPromocao({
        nome,
        valor_desconto: valorDesconto,
        ids_sabores: idsSabores,
        ids_tamanhos: idsTamanhos,
        ids_produtos: idsProdutos
      });
      onSuccess();
    } catch {
      alert("Erro ao criar promoção.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-950/95 flex items-center justify-center p-6 z-[130] backdrop-blur-3xl">
      <div className="bg-white w-full max-w-4xl p-10 rounded-[3rem] shadow-2xl space-y-8 border-8 border-gray-100 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center border-b-4 border-gray-100 pb-6">
          <h2 className="text-3xl font-black uppercase italic text-[#b91c1c]">Nova Promoção</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black"><X size={40}/></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase ml-4">Nome da Campanha</label>
                <input value={nome} onChange={e => setNome(e.target.value)} className="w-full bg-gray-50 border-4 border-gray-100 rounded-2xl p-5 font-black text-xl" placeholder="Ex: Terça Maluca" />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase ml-4">Desconto (R$)</label>
                <input 
                    type="number" 
                    min="0"
                    value={valorDesconto} 
                    onChange={e => {
                        const val = parseFloat(e.target.value);
                        setValorDesconto(val < 0 ? 0 : val);
                    }} 
                    className="w-full bg-gray-50 border-4 border-gray-100 rounded-2xl p-5 font-black text-xl text-green-700" 
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {/* VALIDA SABORES */}
            <div className="space-y-4">
                <h4 className="font-black text-[10px] uppercase text-gray-400 border-b-2 border-gray-50 pb-2">Valida Sabores</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {sabores.map(s => (
                        <button key={s.id_sabor} onClick={() => toggle(s.id_sabor, idsSabores, setIdsSabores)} className={`w-full text-left p-3 rounded-xl border-2 font-bold text-[10px] uppercase flex justify-between items-center transition-all ${idsSabores.includes(s.id_sabor) ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-100 text-gray-400'}`}>
                            {s.nome_sabor} {idsSabores.includes(s.id_sabor) && <Check size={14}/>}
                        </button>
                    ))}
                </div>
            </div>

            {/* VALIDA TAMANHOS */}
            <div className="space-y-4">
                <h4 className="font-black text-[10px] uppercase text-gray-400 border-b-2 border-gray-50 pb-2">Valida Tamanhos</h4>
                <div className="space-y-2">
                    {tamanhos.map(t => (
                        <button key={t.id_tamanho} onClick={() => toggle(t.id_tamanho, idsTamanhos, setIdsTamanhos)} className={`w-full text-left p-3 rounded-xl border-2 font-bold text-[10px] uppercase flex justify-between items-center transition-all ${idsTamanhos.includes(t.id_tamanho) ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-100 text-gray-400'}`}>
                            {t.nome_tamanho} {idsTamanhos.includes(t.id_tamanho) && <Check size={14}/>}
                        </button>
                    ))}
                </div>
            </div>

            {/* VALIDA BEBIDAS */}
            <div className="space-y-4">
                <h4 className="font-black text-[10px] uppercase text-gray-400 border-b-2 border-gray-50 pb-2">Valida Bebidas</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {bebidas.map(b => (
                        <button key={b.id_produto} onClick={() => toggle(b.id_produto, idsProdutos, setIdsProdutos)} className={`w-full text-left p-3 rounded-xl border-2 font-bold text-[10px] uppercase flex justify-between items-center transition-all ${idsProdutos.includes(b.id_produto) ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-100 text-gray-400'}`}>
                            {b.nome} {idsProdutos.includes(b.id_produto) && <Check size={14}/>}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <button onClick={handleSalvar} className="w-full bg-black text-white py-8 rounded-[2rem] font-black uppercase text-xl shadow-2xl hover:bg-gray-900 active:scale-95 transition-all">
          Ativar Promoção
        </button>
      </div>
    </div>
  );
}
