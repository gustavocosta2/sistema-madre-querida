import React from 'react';
import { Search, X, UserPlus, Info } from 'lucide-react';
import type { ClienteBusca } from '../../types';

interface PDVSearchClientProps {
  buscaCliente: string;
  setBuscaCliente: (v: string) => void;
  clienteSelecionado: ClienteBusca | null;
  setClienteSelecionado: (c: ClienteBusca | null) => void;
  sugestoesClientes: ClienteBusca[];
  handleSelecionarCliente: (c: ClienteBusca) => void;
  onOpenNovoCliente: () => void;
  isBirthdayMonth: () => boolean;
  totalEmPontosNoCarrinho: number;
  editingCrm: boolean;
  setEditingCrm: (v: boolean) => void;
  tempObs: string;
  setTempObs: (v: string) => void;
  handleSaveCRM: () => void;
  ultimoPedido: any;
  setEnderecoEntrega: (e: any) => void;
  setUltimoPedido: (p: any) => void;
}

export const PDVSearchClient: React.FC<PDVSearchClientProps> = ({
  buscaCliente, setBuscaCliente, clienteSelecionado, setClienteSelecionado,
  sugestoesClientes, handleSelecionarCliente, onOpenNovoCliente, isBirthdayMonth,
  totalEmPontosNoCarrinho, editingCrm, setEditingCrm, tempObs, setTempObs, handleSaveCRM,
  ultimoPedido, setEnderecoEntrega, setUltimoPedido
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative bg-white rounded-3xl shadow-sm border border-gray-100 focus-within:border-red-600/30 transition-all flex items-center px-5">
          <Search className="text-gray-400" size={20} />
          <input 
            value={buscaCliente} 
            onChange={e => setBuscaCliente(e.target.value)} 
            className="flex-1 py-5 px-4 font-bold text-gray-900 outline-none text-base placeholder:text-gray-300" 
            placeholder="Buscar Cliente por Nome ou CPF..." 
          />
          {clienteSelecionado && (
            <div className="flex items-center gap-3 shrink-0">
              {isBirthdayMonth() && (
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-lg animate-pulse border-2 border-white/20">
                  🎉 Aniversariante!
                </div>
              )}
              <div className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase border flex items-center gap-2 shadow-sm transition-all ${totalEmPontosNoCarrinho > clienteSelecionado.pontos ? 'bg-red-50 border-red-100 text-red-700' : 'bg-amber-50 border-amber-100 text-amber-900'}`}>
                🏆 {clienteSelecionado.pontos - totalEmPontosNoCarrinho} Pts
              </div>
              <div className="bg-green-50 text-green-900 px-4 py-2 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 border border-green-100 shadow-sm">
                {clienteSelecionado.nome}
                <button onClick={() => { setClienteSelecionado(null); setEnderecoEntrega(null); setUltimoPedido(null); }} className="hover:scale-125 transition-transform"><X size={14} /></button>
              </div>
            </div>
          )}
          {sugestoesClientes.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[60]">
              {sugestoesClientes.map(c => (
                <button key={c.cpf} onClick={() => handleSelecionarCliente(c)} className="w-full p-5 text-left hover:bg-gray-50 flex justify-between items-center border-b border-gray-50 transition-colors">
                  <div>
                    <p className="font-black text-base text-gray-900">{c.nome}</p>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500 font-bold">{c.cpf}</p>
                        {c.data_nascimento && new Date(c.data_nascimento).getMonth() === new Date().getMonth() && (
                            <span className="text-[9px] bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full font-black uppercase border border-pink-100">Aniversário 🎂</span>
                        )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">🏆 {c.pontos} Pts</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={onOpenNovoCliente} className="bg-white border border-gray-200 px-8 py-5 rounded-3xl font-black text-[10px] uppercase text-red-700 hover:bg-gray-50 shadow-sm flex items-center gap-2 transition-all">
          <UserPlus size={18} /> Novo Cadastro
        </button>
      </div>

      {clienteSelecionado && (
        <div className="bg-gray-900 rounded-3xl p-6 shadow-xl flex items-center justify-between gap-6 border-t-4 border-amber-500 shadow-enterprise">
            <div className="flex items-center gap-4 flex-1">
                <div className="bg-amber-500/10 p-3 rounded-xl text-amber-500">
                    <Info size={24} />
                </div>
                <div className="flex-1">
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1.5">Preferências & CRM</p>
                    {editingCrm ? (
                        <div className="flex gap-2">
                            <input 
                                autoFocus
                                value={tempObs} 
                                onChange={e => setTempObs(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white font-medium text-sm outline-none focus:border-amber-500 transition-all"
                                placeholder="Notas do cliente..."
                            />
                            <button onClick={handleSaveCRM} className="bg-amber-500 text-black px-4 py-2 rounded-xl font-black text-[10px] uppercase">Salvar</button>
                            <button onClick={() => setEditingCrm(false)} className="bg-white/10 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase">Sair</button>
                        </div>
                    ) : (
                        <p onClick={() => { setEditingCrm(true); setTempObs(clienteSelecionado.observacao || ''); }} className="text-white font-semibold text-sm cursor-pointer hover:text-amber-500 transition-colors leading-relaxed">
                            {clienteSelecionado.observacao || "Nenhuma observação registrada. Clique para adicionar..."}
                        </p>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
