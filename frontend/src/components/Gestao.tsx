import { Settings, Plus, Award, Pencil, Megaphone, Trash2, TrendingUp, DollarSign, Package, PieChart } from 'lucide-react';
import { api } from '../api';
import { useState, useEffect } from 'react';
import { useMadre } from '../context/MadreContext';
import { EditProdutoModal } from './modals/EditProdutoModal';

interface GestaoProps {
  onOpenNovoSabor: () => void;
  onOpenNovaBebida: () => void;
  onOpenNovaPromocao: () => void;
}

export function Gestao({ onOpenNovoSabor, onOpenNovaBebida, onOpenNovaPromocao }: GestaoProps) {
  const { sabores, bebidas, promocoes, refreshAll } = useMadre();
  const [editando, setEditando] = useState<{ item: any, tipo: 'pizza' | 'bebida' } | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.getDashboard().then(res => setStats(res.data));
  }, [sabores, bebidas]); // Atualiza stats quando o cardápio mudar (provavelmente após um refresh)

  const handleSalvarEdicao = (novosDados: any) => {
    if (!editando) return;
    const promise = editando.tipo === 'pizza'
      ? api.patchSabor(editando.item.id_sabor, {
          nome_sabor: novosDados.nome,
          ingredientes: novosDados.ingredientes,
          preco_pontos: novosDados.preco_pontos,
          precos_por_tamanho: novosDados.precos_por_tamanho
        })
      : api.patchBebida(editando.item.id_produto, {
          nome: novosDados.nome,
          preco: novosDados.preco,
          quantidade: novosDados.quantidade,
          preco_pontos: novosDados.preco_pontos
        });

    promise.then(() => {
      refreshAll();
      setEditando(null);
    }).catch((err) => {
      console.error(err);
      alert("Erro ao salvar alterações.");
    });
  };

  const handleExcluir = () => {
    if (!editando || editando.tipo !== 'pizza') return;
    api.deleteSabor(editando.item.id_sabor).then(() => {
      refreshAll();
      setEditando(null);
    });
  };

  const handleExcluirPromocao = (id: number) => {
    if (confirm("Deseja realmente remover esta promoção?")) {
        api.deletePromocao(id).then(refreshAll);
    }
  };

  return (
    <div className="flex-1 p-10 overflow-y-auto bg-[#fcfaf7]">
      {editando && (
        <EditProdutoModal 
          item={editando.item} 
          tipo={editando.tipo} 
          onClose={() => setEditando(null)} 
          onConfirm={handleSalvarEdicao}
          onDelete={editando.tipo === 'pizza' ? handleExcluir : undefined}
        />
      )}
      
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-5xl font-black uppercase tracking-tighter italic text-gray-900 leading-none">
              Gestão <span className="text-[#b91c1c]">Estratégica</span>
            </h2>
            <p className="text-gray-400 font-bold uppercase text-[10px] mt-2 tracking-widest">Painel de Controle Madre Querida</p>
          </div>
          <div className="flex gap-4">
            <button onClick={onOpenNovaPromocao} className="bg-amber-100 border-4 border-amber-200 text-amber-900 px-8 py-4 rounded-3xl font-black text-xs uppercase flex items-center gap-2 shadow-xl hover:bg-amber-200 transition-all active:scale-95">
                <Megaphone size={18}/> Nova Promoção
            </button>
            <button onClick={onOpenNovaBebida} className="bg-white border-4 border-gray-100 text-gray-900 px-8 py-4 rounded-3xl font-black text-xs uppercase flex items-center gap-2 shadow-xl hover:bg-gray-50 transition-all active:scale-95">
                <Plus size={18} /> Nova Bebida
            </button>
            <button onClick={onOpenNovoSabor} className="bg-black text-white px-8 py-4 rounded-3xl font-black text-xs uppercase flex items-center gap-2 shadow-xl hover:bg-gray-800 transition-all active:scale-95">
                <Plus size={18} /> Nova Pizza
            </button>
          </div>
        </div>

        {/* DASHBOARD CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-gray-100 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-green-100 p-3 rounded-2xl text-green-700"><DollarSign /></div>
              <span className="text-[10px] font-black uppercase text-gray-400">Hoje</span>
            </div>
            <p className="text-3xl font-black text-gray-900 leading-none italic">R$ {stats?.faturamento_hoje.toFixed(2) || '0.00'}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">Faturamento Bruto</p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-gray-100 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-100 p-3 rounded-2xl text-blue-700"><Package /></div>
              <span className="text-[10px] font-black uppercase text-gray-400">Total</span>
            </div>
            <p className="text-3xl font-black text-gray-900 leading-none italic">{stats?.pedidos_hoje || 0}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">Pedidos Realizados</p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-gray-100 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-purple-100 p-3 rounded-2xl text-purple-700"><TrendingUp /></div>
              <span className="text-[10px] font-black uppercase text-gray-400">Média</span>
            </div>
            <p className="text-3xl font-black text-gray-900 leading-none italic">R$ {stats?.ticket_medio.toFixed(2) || '0.00'}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">Ticket Médio</p>
          </div>

          <div className="bg-[#b91c1c] p-8 rounded-[2.5rem] shadow-xl text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-white/20 p-3 rounded-2xl text-white"><PieChart /></div>
              <span className="text-[10px] font-black uppercase text-white/60">Top Sabor</span>
            </div>
            <p className="text-2xl font-black leading-none italic truncate uppercase">{stats?.top_sabores[0]?.nome || '---'}</p>
            <p className="text-[10px] font-bold text-white/60 uppercase mt-2">Sabor Campeão</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* TABELA DE PIZZAS */}
            <div className="space-y-4">
              <h3 className="text-xl font-black uppercase italic text-gray-400 flex items-center gap-2 px-6">
                <Award size={20}/> Cardápio de Pizzas
              </h3>
              <div className="bg-white rounded-[3rem] shadow-2xl border-2 border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 border-b-2 border-gray-200 text-[10px] font-black uppercase text-gray-900">
                    <tr>
                      <th className="p-6">Sabor</th>
                      <th className="p-6">Resgate</th>
                      <th className="p-6 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-100">
                    {sabores.map(s => (
                      <tr key={s.id_sabor} className="bg-white hover:bg-gray-50 transition-colors">
                        <td className="p-6">
                          <p className="font-black uppercase text-sm">{s.nome_sabor}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase line-clamp-1">{s.ingredientes}</p>
                        </td>
                        <td className="p-6 font-black text-xs text-amber-600">{s.preco_pontos || 0} Pts</td>
                        <td className="p-6 text-center">
                          <button onClick={() => setEditando({ item: s, tipo: 'pizza' })} className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-black hover:text-white transition-all">
                            <Pencil size={16} />
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
              <h3 className="text-xl font-black uppercase italic text-gray-400 flex items-center gap-2 px-6">
                <Award size={20}/> Tabela de Bebidas
              </h3>
              <div className="bg-white rounded-[3rem] shadow-2xl border-2 border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 border-b-2 border-gray-200 text-[10px] font-black uppercase text-gray-900">
                    <tr>
                      <th className="p-6">Bebida</th>
                      <th className="p-6">Preço (R$)</th>
                      <th className="p-6">Estoque</th>
                      <th className="p-6 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-100">
                    {bebidas.map(b => (
                      <tr key={b.id_produto} className="bg-white hover:bg-gray-50 transition-colors">
                        <td className="p-6 font-black uppercase text-sm">{b.nome}</td>
                        <td className="p-6 font-black text-sm text-green-700">R$ {parseFloat(b.preco).toFixed(2)}</td>
                        <td className="p-6">
                          <span className={`px-4 py-1 rounded-full font-black text-[10px] uppercase border-2 ${b.quantidade > 5 ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                            {b.quantidade} un
                          </span>
                        </td>
                        <td className="p-6 text-center">
                          <button onClick={() => setEditando({ item: b, tipo: 'bebida' })} className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-black hover:text-white transition-all">
                            <Pencil size={16} />
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
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-2 border-gray-100">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-8 border-b-4 border-[#b91c1c] pb-2 inline-block">Top Vendidos</h3>
              <div className="space-y-6">
                {stats?.top_sabores.map((s: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-black text-gray-200 italic">#{idx+1}</span>
                      <p className="font-black text-xs uppercase text-gray-900">{s.nome}</p>
                    </div>
                    <span className="bg-gray-100 px-3 py-1 rounded-lg font-black text-[10px] text-gray-500">{s.vendas} vds</span>
                  </div>
                ))}
              </div>
            </div>

            {/* MEIOS DE PAGAMENTO */}
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-2 border-gray-100">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-8 border-b-4 border-green-600 pb-2 inline-block">Recebimentos</h3>
              <div className="space-y-6">
                {stats?.pagamentos.map((p: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <p className="font-black text-xs uppercase text-gray-400">{p.forma}</p>
                    <p className="font-black text-sm text-green-700">R$ {p.valor.toFixed(2)}</p>
                  </div>
                ))}
                {stats?.pagamentos.length === 0 && <p className="text-[10px] font-black text-gray-300 uppercase italic">Nenhum pagamento hoje.</p>}
              </div>
            </div>

            {/* CAMPANHAS */}
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-2 border-gray-100">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-6">Campanhas</h3>
                <div className="space-y-3">
                    {promocoes.map(p => (
                        <div key={p.id_promo} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border-2 border-gray-100">
                            <p className="text-[10px] font-black uppercase text-gray-900">{p.nome}</p>
                            <button onClick={() => handleExcluirPromocao(p.id_promo)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
