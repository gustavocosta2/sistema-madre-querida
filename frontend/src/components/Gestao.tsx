import { Megaphone, Plus, UserPlus } from 'lucide-react';
import { api } from '../api';
import { useState, useEffect } from 'react';
import { useMadre } from '../context/MadreContext';

// Subcomponentes & Modais
import { EditProdutoModal } from './modals/EditProdutoModal';
import { NovoFuncionarioModal } from './modals/NovoFuncionarioModal';
import { EditFuncionarioModal } from './modals/EditFuncionarioModal';
import { DashboardStats } from './Gestao/DashboardStats';
import { MenuManagement } from './Gestao/MenuManagement';
import { TeamManagement } from './Gestao/TeamManagement';

import type { Funcionario } from '../types';

interface GestaoProps {
  onOpenNovoSabor: () => void;
  onOpenNovaBebida: () => void;
  onOpenNovaPromocao: () => void;
}

export function Gestao({ onOpenNovoSabor, onOpenNovaBebida, onOpenNovaPromocao }: GestaoProps) {
  const { sabores, bebidas, promocoes, refreshAll } = useMadre();
  const [editando, setEditando] = useState<{ item: any, tipo: 'pizza' | 'bebida' } | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [abaAtiva, setAbaAtiva] = useState<'cardapio' | 'equipe'>('cardapio');
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [showNovoFunc, setShowNovoFunc] = useState(false);
  const [funcParaEditar, setFuncParaEditar] = useState<Funcionario | null>(null);

  useEffect(() => {
    api.getDashboard().then(res => setStats(res.data));
  }, [sabores, bebidas]);

  const fetchFuncionarios = () => {
    api.getFuncionarios().then(res => setFuncionarios(res.data));
  };

  useEffect(() => {
    if (abaAtiva === 'equipe') {
        fetchFuncionarios();
    }
  }, [abaAtiva]);

  const handleToggleStatusFunc = (cpf: string) => {
    if (confirm("Deseja alterar o status de atividade deste funcionário?")) {
        api.patchFuncionarioStatus(cpf).then(fetchFuncionarios);
    }
  };

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
    <div className="flex-1 p-10 overflow-y-auto bg-[#fcfaf7] custom-scrollbar">
      {editando && (
        <EditProdutoModal 
          item={editando.item} 
          tipo={editando.tipo} 
          onClose={() => setEditando(null)} 
          onConfirm={handleSalvarEdicao}
          onDelete={editando.tipo === 'pizza' ? handleExcluir : undefined}
        />
      )}

      {showNovoFunc && (
        <NovoFuncionarioModal 
            onClose={() => setShowNovoFunc(false)} 
            onSuccess={() => { fetchFuncionarios(); setShowNovoFunc(false); }} 
        />
      )}

      {funcParaEditar && (
        <EditFuncionarioModal 
            funcionario={funcParaEditar}
            onClose={() => setFuncParaEditar(null)}
            onSuccess={() => { fetchFuncionarios(); setFuncParaEditar(null); }}
        />
      )}
      
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-5xl font-black uppercase tracking-tighter italic text-gray-900 leading-none">
              Gestão <span className="text-[#b91c1c]">Estratégica</span>
            </h2>
            <p className="text-gray-400 font-bold uppercase text-[10px] mt-2 tracking-widest">Painel de Controle Administrativo</p>
          </div>
          <div className="flex gap-4">
            {abaAtiva === 'cardapio' ? (
                <>
                    <button onClick={onOpenNovaPromocao} className="bg-amber-50 border border-amber-200 text-amber-900 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 shadow-sm hover:bg-amber-100 transition-all active:scale-95">
                        <Megaphone size={16}/> Nova Promoção
                    </button>
                    <button onClick={onOpenNovaBebida} className="bg-white border border-gray-200 text-gray-900 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 shadow-sm hover:bg-gray-50 transition-all active:scale-95">
                        <Plus size={16} /> Nova Bebida
                    </button>
                    <button onClick={onOpenNovoSabor} className="bg-gray-900 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 shadow-lg hover:bg-black transition-all active:scale-95">
                        <Plus size={16} /> Nova Pizza
                    </button>
                </>
            ) : (
                <button onClick={() => setShowNovoFunc(true)} className="bg-red-600 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 shadow-lg hover:bg-red-700 transition-all active:scale-95">
                    <UserPlus size={16} /> Cadastrar Membro
                </button>
            )}
          </div>
        </div>

        <div className="flex gap-10 border-b border-gray-200">
            <button 
                onClick={() => setAbaAtiva('cardapio')}
                className={`pb-4 px-2 font-black uppercase text-[10px] tracking-[0.2em] transition-all ${abaAtiva === 'cardapio' ? 'border-b-2 border-red-600 text-gray-950' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Cardápio & Vendas
            </button>
            <button 
                onClick={() => setAbaAtiva('equipe')}
                className={`pb-4 px-2 font-black uppercase text-[10px] tracking-[0.2em] transition-all ${abaAtiva === 'equipe' ? 'border-b-2 border-red-600 text-gray-950' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Equipe & RH
            </button>
        </div>

        {abaAtiva === 'cardapio' ? (
            <>
                <DashboardStats stats={stats} />
                <MenuManagement 
                  sabores={sabores} 
                  bebidas={bebidas} 
                  promocoes={promocoes} 
                  stats={stats} 
                  setEditando={setEditando} 
                  handleExcluirPromocao={handleExcluirPromocao} 
                />
            </>
        ) : (
            <TeamManagement 
              funcionarios={funcionarios} 
              setFuncParaEditar={setFuncParaEditar} 
              handleToggleStatusFunc={handleToggleStatusFunc} 
            />
        )}
      </div>
    </div>
  );
}
