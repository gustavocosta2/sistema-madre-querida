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
    <div className="fixed inset-0 bg-gray-950/95 flex items-center justify-center p-4 z-[100] backdrop-blur-xl">
      <div className="bg-white w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden rounded-3xl shadow-2xl border border-white/20">
        {/* HEADER - FIXO NO TOPO */}
        <div className="p-8 border-b border-gray-100 text-center relative bg-gray-50/50 shrink-0">
          <button onClick={onClose} className="absolute top-6 right-8 text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-white rounded-full">
            <X size={24} />
          </button>
          <span className="text-[10px] font-black uppercase text-red-600 tracking-[0.2em]">Personalização</span>
          <h2 className="text-3xl font-black uppercase italic mt-2 text-gray-900 leading-tight">
            {saborExtra ? (
              <div className="flex items-center justify-center gap-3">
                <span className="bg-gray-900 text-white px-3 py-1 rounded-lg not-italic text-sm font-black mr-2">½</span>
                {saborBase.nome_sabor} / {saborExtra.nome_sabor}
                <button onClick={() => setSaborExtra(null)} className="text-red-600 hover:scale-110 p-1.5 bg-red-50 rounded-lg ml-2"><X size={16}/></button>
              </div>
            ) : `Pizza de ${saborBase.nome_sabor}`}
          </h2>
        </div>

        {/* CONTEÚDO COM SCROLL */}
        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
          {/* SELEÇÃO DE TAMANHO */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase text-gray-400 block text-center tracking-[0.1em]">Escolha o Tamanho</label>
            <div className="grid grid-cols-3 gap-3">
              {tamanhos.map(t => (
                <button 
                  key={t.id_tamanho} 
                  onClick={() => handleSetTamanho(t)} 
                  className={`py-4 text-[10px] font-black uppercase rounded-xl border-2 transition-all ${tamanhoEscolhido.id_tamanho === t.id_tamanho ? 'border-gray-900 bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                >
                  {t.nome_tamanho}
                </button>
              ))}
            </div>
          </div>

          {/* MEIO A MEIO (Condicional) */}
          {tamanhoEscolhido.qtd_sabor_max > 1 && (
            <div className="space-y-4 pt-6 border-t border-gray-50">
              <label className="text-[10px] font-bold uppercase text-gray-400 block text-center tracking-[0.1em]">
                {saborExtra ? 'Alterar Segundo Sabor' : 'Adicionar Segundo Sabor?'}
              </label>
              <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                {sabores.filter(s => s.id_sabor !== saborBase.id_sabor && s.disponivel).map(s => {
                  const isSelected = saborExtra?.id_sabor === s.id_sabor;
                  return (
                    <button 
                      key={s.id_sabor} 
                      onClick={() => setSaborExtra(isSelected ? null : s)} 
                      className={`shrink-0 px-6 py-3 border-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                        isSelected 
                          ? 'border-red-600 bg-red-600 text-white shadow-md' 
                          : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {isSelected ? `✓ ${s.nome_sabor}` : `+ ${s.nome_sabor}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SELEÇÃO DE BORDA */}
          <div className="space-y-4 pt-6 border-t border-gray-50">
            <label className="text-[10px] font-bold uppercase text-gray-400 block text-center tracking-[0.1em]">Borda Recheada</label>
            <div className="grid grid-cols-2 gap-3">
              {bordas.map(b => (
                <button 
                  key={b.id_borda} 
                  onClick={() => setBordaEscolhida(b)} 
                  className={`p-4 text-[10px] font-black uppercase rounded-xl border-2 flex justify-between items-center transition-all ${bordaEscolhida.id_borda === b.id_borda ? 'border-emerald-600 bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}
                >
                  <span>{b.tipo}</span>
                  <span className={bordaEscolhida.id_borda === b.id_borda ? 'text-white/80' : 'text-emerald-600'}>+ R$ {parseFloat(b.preco_adicional).toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* OBSERVAÇÕES */}
          <div className="space-y-3 pt-6 border-t border-gray-50">
            <label className="text-[10px] font-bold uppercase text-gray-400 block text-center tracking-[0.1em]">Observações do Item</label>
            <textarea 
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Sem cebola, massa bem assada..."
              className="w-full h-20 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:border-gray-900 outline-none transition-all resize-none placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* FOOTER - FIXO NA BASE */}
        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center shrink-0">
          <div className="text-left">
            <span className="text-[10px] font-bold text-gray-400 uppercase block leading-none mb-1">Preço do Item</span>
            <span className="text-4xl font-black text-gray-900 italic leading-none">R$ {calcularPreco().toFixed(2)}</span>
          </div>
          <button 
            onClick={() => onConfirm({ saborBase, saborExtra, tamanho: tamanhoEscolhido, borda: bordaEscolhida, preco: calcularPreco(), observacao })} 
            className="bg-emerald-700 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-emerald-800 transition-all active:scale-95"
          >
            Confirmar e Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
