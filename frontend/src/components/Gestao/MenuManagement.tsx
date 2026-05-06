import React from 'react';
import { Award, Pencil, Trash2 } from 'lucide-react';
import type { Sabor, Bebida, Promocao } from '../../types';

interface MenuManagementProps {
  sabores: Sabor[];
  bebidas: Bebida[];
  promocoes: Promocao[];
  stats: any;
  setEditando: (v: { item: any, tipo: 'pizza' | 'bebida' } | null) => void;
  handleExcluirPromocao: (id: number) => void;
}

export const MenuManagement: React.FC<MenuManagementProps> = ({
  sabores, bebidas, promocoes, stats, setEditando, handleExcluirPromocao
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-10">
        {/* TABELA DE PIZZAS */}
        <div className="space-y-4">
          <h3 className="text-base font-black uppercase italic text-gray-400 flex items-center gap-2 px-4">
            <Award size={18}/> Cardápio de Pizzas
          </h3>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-[9px] font-black uppercase text-gray-400 tracking-widest">
                <tr>
                  <th className="p-6">Sabor / Composição</th>
                  <th className="p-6">Fidelidade</th>
                  <th className="p-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sabores.map(s => (
                  <tr key={s.id_sabor} className="bg-white hover:bg-gray-50/50 transition-colors">
                    <td className="p-6">
                      <p className="font-black uppercase text-sm text-gray-900">{s.nome_sabor}</p>
                      <p className="text-[10px] font-medium text-gray-400 mt-1 line-clamp-1">{s.ingredientes}</p>
                    </td>
                    <td className="p-6 font-black text-xs text-amber-600">{s.preco_pontos || 0} Pts</td>
                    <td className="p-6 text-center">
                      <button onClick={() => setEditando({ item: s, tipo: 'pizza' })} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-900 hover:text-white transition-all">
                        <Pencil size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TABELA DE BEBIDAS */}
        <div className="space-y-4">
          <h3 className="text-base font-black uppercase italic text-gray-400 flex items-center gap-2 px-4">
            <Award size={18}/> Tabela de Bebidas
          </h3>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-[9px] font-black uppercase text-gray-400 tracking-widest">
                <tr>
                  <th className="p-6">Produto</th>
                  <th className="p-6">Venda (R$)</th>
                  <th className="p-6">Disponibilidade</th>
                  <th className="p-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bebidas.map(b => (
                  <tr key={b.id_produto} className="bg-white hover:bg-gray-50/50 transition-colors">
                    <td className="p-6 font-black uppercase text-sm text-gray-900">{b.nome}</td>
                    <td className="p-6 font-black text-sm text-green-700">R$ {parseFloat(b.preco.toString()).toFixed(2)}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-lg font-black text-[9px] uppercase border ${b.quantidade > 5 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                        {b.quantidade} unidades
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <button onClick={() => setEditando({ item: b, tipo: 'bebida' })} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-900 hover:text-white transition-all">
                        <Pencil size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {/* RANKING DE SABORES */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-8 border-b-2 border-red-600 pb-2 inline-block">Top Vendidos</h3>
          <div className="space-y-6">
            {stats?.top_sabores.map((s: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xl font-black text-gray-100 italic">#{idx+1}</span>
                  <p className="font-black text-xs uppercase text-gray-800">{s.nome}</p>
                </div>
                <span className="bg-gray-50 px-2.5 py-1 rounded-lg font-black text-[9px] text-gray-400 border border-gray-100">{s.vendas} vds</span>
              </div>
            ))}
          </div>
        </div>

        {/* MEIOS DE PAGAMENTO */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-8 border-b-2 border-emerald-600 pb-2 inline-block">Financeiro Hoje</h3>
          <div className="space-y-6">
            {stats?.pagamentos.map((p: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center">
                <p className="font-black text-xs uppercase text-gray-400 tracking-tight">{p.forma}</p>
                <p className="font-black text-sm text-emerald-700">R$ {p.valor.toFixed(2)}</p>
              </div>
            ))}
            {stats?.pagamentos.length === 0 && <p className="text-[10px] font-bold text-gray-300 uppercase italic">Aguardando vendas...</p>}
          </div>
        </div>

        {/* CAMPANHAS */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-6">Campanhas Ativas</h3>
            <div className="space-y-3">
                {promocoes.map(p => (
                    <div key={p.id_promo} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                        <p className="text-[10px] font-black uppercase text-gray-900">{p.nome}</p>
                        <button onClick={() => handleExcluirPromocao(p.id_promo)} className="p-1.5 bg-white text-red-400 hover:text-red-600 rounded-lg shadow-sm transition-colors"><Trash2 size={14}/></button>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
