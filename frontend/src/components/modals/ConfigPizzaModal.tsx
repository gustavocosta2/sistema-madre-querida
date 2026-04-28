import { X, ScrollText } from 'lucide-react';
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
  const [tamanhoEscolhido, setTamanhoEscolhido] = useState<Tamanho>(tamanhos.find(t => t.nome_tamanho === 'Grande') || tamanhos[0]);
  const [bordaEscolhida, setBordaEscolhida] = useState<Borda>(bordas[0]);
  const [observacao, setObservacao] = useState('');

  const handleSetTamanho = (t: Tamanho) => {
    setTamanhoEscolhido(t);
    if (t.qtd_sabor_max <= 1) {
      setSaborExtra(null);
    }
  };

  const calcularPreco = () => {
    const p1 = parseFloat(precos.find(p => p.id_sabor === saborBase.id_sabor && p.id_tamanho === tamanhoEscolhido.id_tamanho)?.preco_base || '0');
    const p2 = saborExtra ? parseFloat(precos.find(p => p.id_sabor === saborExtra.id_sabor && p.id_tamanho === tamanhoEscolhido.id_tamanho)?.preco_base || '0') : p1;
    return Math.max(p1, p2) + parseFloat(bordaEscolhida.preco_adicional || '0');
  };

  return (
    <div className="fixed inset-0 bg-gray-950/90 flex items-center justify-center p-4 z-[100] backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden rounded-[3rem] shadow-2xl border-4 border-gray-100">
        {/* HEADER - FIXO NO TOPO */}
        <div className="p-8 border-b-2 border-gray-100 text-center relative bg-[#fcfaf7] shrink-0">
          <button onClick={onClose} className="absolute top-6 right-8 text-gray-400 hover:text-red-600 transition-colors">
            <X size={32} strokeWidth={3}/>
          </button>
          <span className="text-[10px] font-black uppercase text-red-600 tracking-widest">Personalize sua Pizza</span>
          <h2 className="text-3xl font-black uppercase italic mt-2 text-gray-950 leading-tight">
            {saborExtra ? (
              <div className="flex items-center justify-center gap-2">
                <span>½ {saborBase.nome_sabor} / ½ {saborExtra.nome_sabor}</span>
                <button onClick={() => setSaborExtra(null)} className="text-red-600 hover:scale-110"><X size={20}/></button>
              </div>
            ) : `Pizza de ${saborBase.nome_sabor}`}
          </h2>
        </div>

        {/* CONTEÚDO COM SCROLL */}
        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
          {/* SELEÇÃO DE TAMANHO */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-400 block text-center tracking-widest">Tamanho Disponível</label>
            <div className="grid grid-cols-3 gap-3">
              {tamanhos.map(t => (
                <button 
                  key={t.id_tamanho} 
                  onClick={() => handleSetTamanho(t)} 
                  className={`py-4 text-[10px] font-black uppercase rounded-2xl border-2 transition-all ${tamanhoEscolhido.id_tamanho === t.id_tamanho ? 'border-[#b91c1c] bg-[#b91c1c] text-white shadow-lg' : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'}`}
                >
                  {t.nome_name || t.nome_tamanho}
                </button>
              ))}
            </div>
          </div>

          {/* MEIO A MEIO (Condicional) */}
          {tamanhoEscolhido.qtd_sabor_max > 1 && !saborExtra && (
            <div className="space-y-4 pt-6 border-t-2 border-gray-50">
              <label className="text-[10px] font-black uppercase text-gray-400 block text-center tracking-widest">Adicionar Segundo Sabor?</label>
              <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                {sabores.filter(s => s.id_sabor !== saborBase.id_sabor && s.disponivel).map(s => (
                  <button 
                    key={s.id_sabor} 
                    onClick={() => setSaborExtra(s)} 
                    className="shrink-0 px-6 py-3 bg-white border-2 border-gray-100 rounded-xl text-[10px] font-black uppercase hover:border-[#b91c1c] hover:bg-red-50 transition-all text-gray-600"
                  >
                    +{s.nome_sabor}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SELEÇÃO DE BORDA */}
          <div className="space-y-4 pt-6 border-t-2 border-gray-50">
            <label className="text-[10px] font-black uppercase text-gray-400 block text-center tracking-widest">Borda Recheada</label>
            <div className="grid grid-cols-2 gap-3">
              {bordas.map(b => (
                <button 
                  key={b.id_borda} 
                  onClick={() => setBordaEscolhida(b)} 
                  className={`p-4 text-[10px] font-black uppercase rounded-2xl border-2 flex justify-between items-center transition-all ${bordaEscolhida.id_borda === b.id_borda ? 'border-green-600 bg-green-600 text-white shadow-md' : 'bg-gray-50 text-gray-500 border-gray-100'}`}
                >
                  <span>{b.tipo}</span>
                  <span className={bordaEscolhida.id_borda === b.id_borda ? 'text-white' : 'text-green-600'}>+ R$ {parseFloat(b.preco_adicional).toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* OBSERVAÇÕES */}
          <div className="space-y-3 pt-6 border-t-2 border-gray-50">
            <label className="text-[10px] font-black uppercase text-gray-400 block text-center tracking-widest">Notas Especiais</label>
            <textarea 
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Sem cebola, massa bem assada..."
              className="w-full h-20 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-[11px] font-bold focus:border-[#b91c1c] outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* FOOTER - FIXO NA BASE */}
        <div className="p-8 bg-[#fcfaf7] border-t-2 border-gray-100 flex justify-between items-center shrink-0">
          <div className="text-left">
            <span className="text-[10px] font-black text-gray-400 uppercase block leading-none mb-1">Subtotal</span>
            <span className="text-4xl font-black text-green-700 italic leading-none">R$ {calcularPreco().toFixed(2)}</span>
          </div>
          <button 
            onClick={() => onConfirm({ saborBase, saborExtra, tamanho: tamanhoEscolhido, borda: bordaEscolhida, preco: calcularPreco(), observacao })} 
            className="bg-green-700 text-white px-10 py-5 rounded-2xl font-black uppercase text-sm shadow-xl hover:bg-green-800 transition-all active:scale-95"
          >
            Adicionar à Comanda
          </button>
        </div>
      </div>
    </div>
  );
}
