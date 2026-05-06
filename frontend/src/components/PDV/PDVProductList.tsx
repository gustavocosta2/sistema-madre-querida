import React from 'react';
import { AlertTriangle, Plus, Gift, Coffee } from 'lucide-react';
import type { Sabor, Bebida, ClienteBusca, ItemCarrinho } from '../../types';

interface PDVProductListProps {
  pdvTab: 'pizzas' | 'bebidas';
  sabores: Sabor[];
  bebidas: Bebida[];
  clienteSelecionado: ClienteBusca | null;
  totalEmPontosNoCarrinho: number;
  getPrecoBaseSabor: (idSabor: number) => string;
  onOpenConfigPizza: (s: Sabor, custoPontos?: number | null) => void;
  setCarrinho: (c: ItemCarrinho[]) => void;
  carrinho: ItemCarrinho[];
}

export const PDVProductList: React.FC<PDVProductListProps> = ({
  pdvTab, sabores, bebidas, clienteSelecionado, totalEmPontosNoCarrinho,
  getPrecoBaseSabor, onOpenConfigPizza, setCarrinho, carrinho
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pdvTab === 'pizzas' ? (
        sabores.length > 0 ? sabores.filter(s => s.disponivel !== false).map(s => (
          <div key={s.id_sabor} className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-red-600/30 shadow-md hover:shadow-xl transition-all text-left group flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black uppercase text-gray-900 leading-tight tracking-tight">{s.nome_sabor}</h3>
              <p className="text-[11px] text-gray-500 font-medium mt-2 mb-6 line-clamp-2 leading-relaxed">{s.ingredientes}</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-black text-green-700 italic">R$ {getPrecoBaseSabor(s.id_sabor)}+</span>
                <button onClick={() => onOpenConfigPizza(s)} className="bg-gray-50 p-2.5 rounded-xl text-red-700 hover:bg-red-600 hover:text-white transition-all"><Plus size={20} strokeWidth={3} /></button>
              </div>
              <button 
                onClick={() => onOpenConfigPizza(s, s.preco_pontos || 500)}
                disabled={!clienteSelecionado || (clienteSelecionado.pontos - totalEmPontosNoCarrinho) < (s.preco_pontos || 500)}
                className="w-full py-2 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-amber-700 hover:bg-amber-100 disabled:opacity-30 disabled:grayscale transition-all"
              >
                <Gift size={14}/> Resgate ({s.preco_pontos || 500} Pts)
              </button>
            </div>
          </div>
        )) : <div className="col-span-full py-20 text-center"><AlertTriangle size={48} className="mx-auto text-gray-200 mb-4" /><p className="font-bold text-gray-400 uppercase">Nenhum sabor cadastrado</p></div>
      ) : (
        bebidas.map(b => (
          <div key={b.id_produto} className={`relative group bg-white rounded-3xl border border-gray-100 transition-all duration-300 overflow-hidden shadow-md hover:shadow-xl ${b.quantidade <= 0 ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:border-emerald-600/30'}`}>
            <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-lg font-black text-[9px] uppercase tracking-wider shadow-sm z-10 ${b.quantidade > 10 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : (b.quantidade > 0 ? 'bg-amber-100 text-amber-700 border border-amber-100' : 'bg-red-600 text-white')}`}>
              {b.quantidade > 0 ? `${b.quantidade} un` : 'Esgotado'}
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-500">
                <Coffee size={24} strokeWidth={2.5} />
              </div>
              
              <div>
                <h3 className="text-xl font-black uppercase text-gray-900 leading-none tracking-tight">{b.nome}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1.5">Bebida</p>
              </div>

              <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase">Valor Unitário</p>
                    <p className="text-2xl font-black text-emerald-700 italic">R$ {parseFloat(b.preco.toString()).toFixed(2)}</p>
                </div>
                <button 
                  disabled={b.quantidade <= 0}
                  onClick={() => setCarrinho([...carrinho, { id: Math.random().toString(36).slice(2, 11), id_original: b.id_produto, tipo: 'bebida', nome: b.nome, preco: parseFloat(b.preco.toString()), detalhe: 'Bebida' }])} 
                  className="bg-emerald-700 text-white p-3.5 rounded-xl shadow-lg hover:bg-emerald-800 active:scale-90 transition-all disabled:opacity-0"
                >
                  <Plus size={20} strokeWidth={3} />
                </button>
              </div>

              {b.preco_pontos > 0 && (
                <button 
                  onClick={() => setCarrinho([...carrinho, { id: Math.random().toString(36).slice(2, 11), id_original: b.id_produto, tipo: 'bebida', nome: `🎁 ${b.nome}`, preco: 0, pago_com_pontos: true, custo_pontos: b.preco_pontos, detalhe: 'Resgate' }])}
                  disabled={!clienteSelecionado || (clienteSelecionado.pontos - totalEmPontosNoCarrinho) < b.preco_pontos}
                  className="w-full py-2.5 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-amber-700 hover:bg-amber-100 disabled:opacity-30 disabled:grayscale transition-all"
                >
                  <Gift size={14}/> Resgatar {b.preco_pontos} Pts
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
