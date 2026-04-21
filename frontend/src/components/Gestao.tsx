import { Settings, Plus, Award, Pencil, Megaphone, Trash2 } from 'lucide-react';
import { api } from '../api';
import { useState } from 'react';
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
      alert("Erro ao salvar alterações. Verifique o console.");
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
    <div className="flex-1 p-10 overflow-y-auto">
      {editando && (
        <EditProdutoModal 
          item={editando.item} 
          tipo={editando.tipo} 
          onClose={() => setEditando(null)} 
          onConfirm={handleSalvarEdicao}
          onDelete={editando.tipo === 'pizza' ? handleExcluir : undefined}
        />
      )}
      
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex justify-between items-center border-b-4 border-black/5 pb-6">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic text-gray-900">
            <Settings size={40} className="inline mr-4 text-[#b91c1c]" /> Painel de Gestão
          </h2>
          <div className="flex gap-4">
            <button onClick={onOpenNovaPromocao} className="bg-amber-100 border-4 border-amber-200 text-amber-900 px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-xl hover:bg-amber-200 transition-all active:scale-95">
                <Megaphone size={20}/> Nova Promoção
            </button>
            <button onClick={onOpenNovaBebida} className="bg-white border-4 border-gray-100 text-gray-900 px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-xl hover:bg-gray-50 transition-all active:scale-95">
                <Plus /> Nova Bebida
            </button>
            <button onClick={onOpenNovoSabor} className="bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-xl hover:bg-gray-800 transition-all active:scale-95">
                <Plus /> Nova Pizza
            </button>
          </div>
        </div>

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
                  <tr key={s.id_sabor} className="bg-white">
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
        <div className="space-y-4 pt-10">
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
                  <th className="p-6">Resgate</th>
                  <th className="p-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-100">
                {bebidas.map(b => (
                  <tr key={b.id_produto} className="bg-white">
                    <td className="p-6 font-black uppercase text-sm">{b.nome}</td>
                    <td className="p-6 font-black text-sm text-green-700">R$ {parseFloat(b.preco).toFixed(2)}</td>
                    <td className="p-6">
                      <span className={`px-4 py-1 rounded-full font-black text-[10px] uppercase border-2 ${b.quantidade > 5 ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                        {b.quantidade} un
                      </span>
                    </td>
                    <td className="p-6 font-black text-xs text-amber-600">{b.preco_pontos || 0} Pts</td>
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

        {/* TABELA DE PROMOÇÕES */}
        <div className="space-y-4 pt-10 pb-20">
          <h3 className="text-xl font-black uppercase italic text-gray-400 flex items-center gap-2 px-6">
            <Megaphone size={20}/> Campanhas Promocionais
          </h3>
          <div className="bg-white rounded-[3rem] shadow-2xl border-2 border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b-2 border-gray-200 text-[10px] font-black uppercase text-gray-900">
                <tr>
                  <th className="p-6">Campanha</th>
                  <th className="p-6">Desconto</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-100">
                {promocoes.map(p => (
                  <tr key={p.id_promo} className="bg-white">
                    <td className="p-6">
                      <p className="font-black uppercase text-sm">{p.nome}</p>
                    </td>
                    <td className="p-6 font-black text-sm text-green-700">- R$ {parseFloat(p.valor_desconto).toFixed(2)}</td>
                    <td className="p-6">
                      <span className={`px-4 py-1 rounded-full font-black text-[10px] uppercase border-2 ${p.status ? 'bg-green-50 border-green-100 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                        {p.status ? 'Ativa' : 'Pausada'}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <button onClick={() => handleExcluirPromocao(p.id_promo)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {promocoes.length === 0 && (
                    <tr>
                        <td colSpan={4} className="p-10 text-center font-black text-gray-200 uppercase italic">Nenhuma promoção ativa.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
