import { Megaphone, Plus, UserPlus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
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
  const [abaAtiva, setAbaAtiva] = useState<'cardapio' | 'equipe' | 'caixas'>('cardapio');
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
            <button 
                onClick={() => setAbaAtiva('caixas')}
                className={`pb-4 px-2 font-black uppercase text-[10px] tracking-[0.2em] transition-all ${abaAtiva === 'caixas' ? 'border-b-2 border-red-600 text-gray-950' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Histórico de Caixas
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
        ) : abaAtiva === 'equipe' ? (
            <TeamManagement 
              funcionarios={funcionarios} 
              setFuncParaEditar={setFuncParaEditar} 
              handleToggleStatusFunc={handleToggleStatusFunc} 
            />
        ) : (
            <CashHistory />
        )}
      </div>
    </div>
  );
}

// Subcomponente de Histórico de Caixas
import { Calendar, History, ArrowRight, DollarSign, Receipt, Info, CheckCircle2, AlertCircle, X, ClipboardList } from 'lucide-react';

function CashHistory() {
    const [historico, setHistorico] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [detalheCaixa, setDetalheCaixa] = useState<any>(null);

    const fetchHistorico = async () => {
        setLoading(true);
        try {
            const res = await api.getHistoricoCaixas();
            setHistorico(res.data);
        } catch {
            alert("Erro ao buscar histórico de caixas.");
        } finally {
            setLoading(false);
        }
    };

    const verDetalhesCaixa = async (id: number) => {
        try {
            const res = await api.getDetalhesCaixa(id);
            setDetalheCaixa(res.data);
        } catch {
            alert("Erro ao buscar detalhes do caixa.");
        }
    };

    useEffect(() => {
        fetchHistorico();
    }, []);

    if (loading) return <div className="py-20 text-center font-bold text-gray-400 uppercase animate-pulse">Buscando Arquivos...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-2xl mb-10">
                <div className="flex gap-4">
                    <Info className="text-amber-600" size={24} />
                    <div>
                        <p className="text-sm font-black uppercase text-amber-900 mb-1">Auditoria de Turnos</p>
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                            Aqui você pode revisar todos os caixas encerrados. Verifique sobras, faltas e o detalhamento 
                            de cada movimentação financeira ocorrida em turnos passados.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {historico.length === 0 ? (
                    <div className="py-20 text-center opacity-20 border-4 border-dashed border-gray-200 rounded-[3rem]">
                        <History size={80} className="mx-auto mb-4" />
                        <p className="font-black uppercase italic text-xl">Nenhum caixa fechado no histórico.</p>
                    </div>
                ) : (
                    historico.map(c => (
                        <button 
                            key={c.id_caixa} 
                            onClick={() => verDetalhesCaixa(c.id_caixa)}
                            className="bg-white border-4 border-gray-100 p-8 rounded-[2.5rem] flex flex-wrap md:flex-nowrap justify-between items-center hover:border-gray-900 transition-all group shadow-sm hover:shadow-xl"
                        >
                            <div className="flex items-center gap-6">
                                <div className={`p-4 rounded-2xl ${c.diferenca === 0 ? 'bg-emerald-50 text-emerald-600' : (c.diferenca > 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600')}`}>
                                    <Calendar size={28} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Turno #{c.id_caixa}</p>
                                    <h4 className="text-2xl font-black text-gray-900 italic">
                                        {new Date(c.fechamento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                                    </h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                                        {new Date(c.abertura).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ➔ {new Date(c.fechamento).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-8 items-center mt-4 md:mt-0">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Informado</p>
                                    <p className="text-xl font-black text-gray-950">R$ {c.valor_informado.toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Diferença</p>
                                    <p className={`text-xl font-black italic ${c.diferenca === 0 ? 'text-emerald-600' : (c.diferenca > 0 ? 'text-blue-600' : 'text-red-600')}`}>
                                        {c.diferenca > 0 ? '+' : ''}R$ {c.diferenca.toFixed(2)}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-full group-hover:bg-gray-900 group-hover:text-white transition-all">
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>

            {/* MODAL DE DETALHES DO CAIXA HISTÓRICO */}
            {detalheCaixa && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-[100]">
                    <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden border-8 border-gray-100 animate-in zoom-in-95 duration-300">
                        <div className="bg-gray-950 p-12 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-4xl font-black uppercase italic leading-none flex items-center gap-4">
                                    <History size={40} className="text-amber-500"/> Turno #{detalheCaixa.id_caixa}
                                </h2>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mt-4 italic">
                                    Encerrado em {new Date(detalheCaixa.data_fechamento).toLocaleString()}
                                </p>
                            </div>
                            <button onClick={() => setDetalheCaixa(null)} className="p-4 bg-white/10 rounded-full hover:bg-white/20"><X size={32}/></button>
                        </div>

                        <div className="p-12 space-y-10 max-h-[65vh] overflow-y-auto custom-scrollbar">
                            {/* CARDS DE RESUMO */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Abertura</p>
                                    <p className="text-2xl font-black text-gray-900">R$ {detalheCaixa.valor_abertura.toFixed(2)}</p>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Esperado</p>
                                    <p className="text-2xl font-black text-gray-900">R$ {detalheCaixa.valor_esperado.toFixed(2)}</p>
                                </div>
                                <div className="bg-gray-900 p-6 rounded-3xl text-center text-white">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Final (Contado)</p>
                                    <p className="text-2xl font-black">R$ {detalheCaixa.valor_informado.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* MÉTRICAS POR PAGAMENTO */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase border-b-2 border-gray-50 pb-2 flex items-center gap-2">
                                    <Receipt size={14}/> Composição das Vendas
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.entries(detalheCaixa.breakdown).map(([forma, valor]: [any, any]) => (
                                        <div key={forma} className="bg-white border-2 border-gray-100 p-4 rounded-2xl shadow-sm">
                                            <p className="text-[9px] font-black text-gray-400 uppercase">{forma}</p>
                                            <p className="text-lg font-black text-gray-900">R$ {valor.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* LOG DE MOVIMENTAÇÕES */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase border-b-2 border-gray-50 pb-2 flex items-center gap-2">
                                    <ClipboardList size={14}/> Todas as Movimentações do Turno
                                </p>
                                <div className="space-y-3">
                                    {detalheCaixa.movimentacoes.map((m: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.tipo === 'Sangria' || m.tipo === 'Acerto Motoboy' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                    {m.tipo === 'Sangria' ? <ArrowDownCircle size={20}/> : <ArrowUpCircle size={20}/>}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-gray-900 leading-none">{m.tipo}</p>
                                                    <p className="text-[9px] text-gray-400 mt-1">{m.hora} • {m.descricao || 'Sem descrição'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-black ${m.tipo === 'Sangria' || m.tipo === 'Acerto Motoboy' ? 'text-red-600' : 'text-green-600'}`}>
                                                    {m.tipo === 'Sangria' || m.tipo === 'Acerto Motoboy' ? '-' : '+'} R$ {m.valor.toFixed(2)}
                                                </p>
                                                <p className="text-[8px] font-bold text-gray-300 uppercase">{m.forma}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-10 bg-gray-50 border-t-4 border-gray-100 flex justify-center">
                            <button onClick={() => setDetalheCaixa(null)} className="bg-gray-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase text-xs shadow-xl hover:bg-black transition-all">
                                Fechar Detalhamento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
