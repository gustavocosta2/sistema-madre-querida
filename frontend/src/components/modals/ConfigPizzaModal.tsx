import { X } from 'lucide-react';
import { useState } from 'react';
import type { Sabor, Tamanho, Borda, Preco } from '../../types';

interface ConfigPizzaModalProps {
  saborBase: Sabor;
  sabores: Sabor[];
  tamanhos: Tamanho[];
  bordas: Borda[];
  precos: Preco[];
  onClose: () => void;
  onConfirm: (config: { saborBase: Sabor, saborExtra: Sabor | null, tamanho: Tamanho, borda: Borda, preco: number, observacao: string }) => void;
}

export function ConfigPizzaModal({ saborBase, sabores, tamanhos, bordas, precos, onClose, onConfirm }: ConfigPizzaModalProps) {
  const [saborExtra, setSaborExtra] = useState<Sabor | null>(null);
  const [tamanhoEscolhido, setTamanhoEscolhido] = useState<Tamanho>(tamanhos[2] || tamanhos[0]);
  const [bordaEscolhida, setBordaEscolhida] = useState<Borda>(bordas[0]);
  const [observacao, setObservacao] = useState('');

  const calcularPreco = () => {
    const p1 = parseFloat(precos.find(p => p.id_sabor === saborBase.id_sabor && p.id_tamanho === tamanhoEscolhido.id_tamanho)?.preco_base || '0');
    const p2 = saborExtra ? parseFloat(precos.find(p => p.id_sabor === saborExtra.id_sabor && p.id_tamanho === tamanhoEscolhido.id_tamanho)?.preco_base || '0') : p1;
    return Math.max(p1, p2) + parseFloat(bordaEscolhida.preco_adicional || '0');
  };

  return (
    <div className="fixed inset-0 bg-gray-950/95 flex items-center justify-center p-6 z-[100] backdrop-blur-3xl">
      <div className="bg-white w-full max-w-2xl overflow-hidden rounded-[5rem] shadow-2xl border-8 border-gray-100">
        <div className="p-14 border-b-4 border-gray-100 text-center relative bg-[#fcfaf7]">
          <button onClick={onClose} className="absolute top-12 right-12 text-gray-400 hover:text-red-600"><X size={48} strokeWidth={4}/></button>
          <span className="text-[10px] font-black uppercase text-red-600 tracking-widest">Ajuste seu pedido</span>
          <h2 className="text-5xl font-black uppercase italic mt-6 text-gray-950 leading-none">
            {saborExtra ? (
              <div className="flex items-center justify-center gap-4">
                <span>½ {saborBase.nome_sabor} / ½ {saborExtra.nome_sabor}</span>
                <button onClick={() => setSaborExtra(null)} className="text-red-600 hover:scale-110"><X size={32}/></button>
              </div>
            ) : `Pizza de ${saborBase.nome_sabor}`}
          </h2>
        </div>
        <div className="p-12 space-y-12">
          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase text-gray-500 block text-center">Tamanho</label>
            <div className="grid grid-cols-4 gap-3">
              {tamanhos.map(t => (
                <button key={t.id_tamanho} onClick={() => setTamanhoEscolhido(t)} className={`py-6 text-[10px] font-black uppercase rounded-3xl border-4 transition-all ${tamanhoEscolhido.id_tamanho === t.id_tamanho ? 'border-[#b91c1c] bg-[#b91c1c] text-white shadow-xl scale-110' : 'bg-gray-100 text-gray-400 hover:border-gray-300'}`}>{t.nome_tamanho}</button>
              ))}
            </div>
          </div>
          {tamanhoEscolhido.qtd_sabor_max > 1 && !saborExtra && (
            <div className="space-y-6 pt-6 border-t-4 border-gray-50">
              <label className="text-[10px] font-black uppercase text-gray-500 block text-center">Deseja outro sabor?</label>
              <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar">
                {sabores.filter(s => s.id_sabor !== saborBase.id_sabor && s.disponivel).map(s => (
                  <button key={s.id_sabor} onClick={() => setSaborExtra(s)} className="shrink-0 px-8 py-5 bg-gray-100 border-4 border-gray-200 rounded-3xl text-[10px] font-black uppercase hover:border-[#b91c1c] transition-all">+{s.nome_sabor}</button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase text-gray-500 block text-center">Borda</label>
            <div className="grid grid-cols-2 gap-4">
              {bordas.map(b => (
                <button key={b.id_borda} onClick={() => setBordaEscolhida(b)} className={`p-5 text-[10px] font-black uppercase rounded-3xl border-4 flex justify-between items-center transition-all ${bordaEscolhida.id_borda === b.id_borda ? 'border-green-600 bg-green-600 text-white shadow-xl' : 'bg-gray-100 text-gray-400'}`}>
                  <span>{b.tipo}</span><span>+{b.preco_adicional}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-500 block text-center">Observações</label>
            <textarea 
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Sem cebola, massa bem assada..."
              className="w-full h-24 p-6 bg-gray-100 border-4 border-gray-200 rounded-[2rem] text-[12px] font-bold focus:border-[#b91c1c] outline-none transition-all resize-none"
            />
          </div>
          <div className="flex justify-between items-center pt-10 border-t-8 border-gray-100">
            <div className="text-left"><span className="text-[11px] font-black text-gray-500 uppercase">Subtotal</span><span className="text-5xl font-black text-green-700 italic leading-none">R$ {calcularPreco().toFixed(2)}</span></div>
            <button onClick={() => onConfirm({ saborBase, saborExtra, tamanho: tamanhoEscolhido, borda: bordaEscolhida, preco: calcularPreco(), observacao })} className="bg-green-700 text-white px-16 py-8 rounded-[3rem] font-black uppercase text-lg shadow-2xl active:scale-95">Colocar no Carrinho</button>
          </div>
        </div>
      </div>
    </div>
  );
}
