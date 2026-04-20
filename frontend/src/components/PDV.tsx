import { Search, UserPlus, Plus, Coffee, AlertTriangle, ShoppingCart, Info, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../api';
import type { Sabor, Bebida, ClienteBusca, Endereco, ItemCarrinho, Tamanho, Borda, Preco } from '../types';

interface PDVProps {
  sabores: Sabor[];
  bebidas: Bebida[];
  precos: Preco[];
  tamanhos: Tamanho[];
  bordas: Borda[];
  onAddPizza: (sabor: Sabor, tamanho: Tamanho, borda: Borda | null, saborExtra?: Sabor | null) => void;
  onAddBebida: (bebida: Bebida) => void;
  carrinho: ItemCarrinho[];
  setCarrinho: (c: ItemCarrinho[]) => void;
  clienteSelecionado: ClienteBusca | null;
  setClienteSelecionado: (c: ClienteBusca | null) => void;
  enderecoEntrega: Endereco | null;
  setEnderecoEntrega: (e: Endereco | null) => void;
  onFinalizar: () => void;
  onOpenNovoCliente: () => void;
  onOpenConfigPizza: (s: Sabor) => void;
}

export function PDV({ 
  sabores, bebidas, precos, tamanhos, bordas, 
  carrinho, setCarrinho, clienteSelecionado, setClienteSelecionado,
  enderecoEntrega, setEnderecoEntrega, onFinalizar, onOpenNovoCliente, onOpenConfigPizza
}: PDVProps) {
  
  const [buscaCliente, setBuscaCliente] = useState('');
  const [sugestoesClientes, setSugestoesClientes] = useState<ClienteBusca[]>([]);
  const [enderecosCliente, setEnderecosCliente] = useState<Endereco[]>([]);
  const [pdvTab, setPdvTab] = useState<'pizzas' | 'bebidas'>('pizzas');

  useEffect(() => {
    if (buscaCliente.length > 2) {
      api.buscarClientes(buscaCliente).then(res => setSugestoesClientes(res.data || []));
    } else {
      setSugestoesClientes([]);
    }
  }, [buscaCliente]);

  const handleSelecionarCliente = async (c: ClienteBusca) => {
    setClienteSelecionado(c);
    setBuscaCliente('');
    setSugestoesClientes([]);
    try {
      const res = await api.getEnderecosCliente(c.cpf);
      const ends = res.data || [];
      setEnderecosCliente(ends);
      setEnderecoEntrega(ends[0] || null);
    } catch (e) { console.error(e); }
  };

  const getPrecoBaseSabor = (idSabor: number) => {
    const p = precos.find(p => p.id_sabor === idSabor && p.id_tamanho === (tamanhos[2]?.id_tamanho || 1));
    return p ? parseFloat(p.preco_base).toFixed(2) : '0.00';
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* BUSCA DE CLIENTE */}
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="flex-1 relative bg-white rounded-3xl shadow-sm border-2 border-gray-200 focus-within:border-[#b91c1c] transition-all flex items-center px-5">
            <Search className="text-gray-900" size={20} />
            <input 
              value={buscaCliente} 
              onChange={e => setBuscaCliente(e.target.value)} 
              className="flex-1 py-5 px-4 font-black text-gray-900 outline-none text-base placeholder:text-gray-400" 
              placeholder="Digite Nome ou CPF do Cliente..." 
            />
            {clienteSelecionado && (
              <div className="bg-green-100 text-green-900 px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 border-2 border-green-200">
                {clienteSelecionado.nome}
                <button onClick={() => { setClienteSelecionado(null); setEnderecoEntrega(null); }}><X size={14} /></button>
              </div>
            )}
            {sugestoesClientes.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[2rem] shadow-2xl border-4 border-gray-100 overflow-hidden z-[60]">
                {sugestoesClientes.map(c => (
                  <button key={c.cpf} onClick={() => handleSelecionarCliente(c)} className="w-full p-5 text-left hover:bg-gray-100 flex justify-between items-center border-b-2 border-gray-50 transition-colors">
                    <div>
                      <p className="font-black text-base text-gray-900">{c.nome}</p>
                      <p className="text-xs text-gray-500 font-bold">{c.cpf}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={onOpenNovoCliente} className="bg-white border-2 border-gray-200 px-8 py-5 rounded-3xl font-black text-xs uppercase text-[#b91c1c] hover:bg-gray-100 shadow-sm flex items-center gap-2">
            <UserPlus size={20} /> Novo Cliente
          </button>
        </div>

        {/* TABS E PRODUTOS */}
        <div className="max-w-4xl mx-auto flex gap-4 border-b-4 border-gray-200">
          <button onClick={() => setPdvTab('pizzas')} className={`px-10 py-4 rounded-t-3xl font-black text-xs uppercase tracking-widest transition-all ${pdvTab === 'pizzas' ? 'bg-[#b91c1c] text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}>Cardápio de Pizzas</button>
          <button onClick={() => setPdvTab('bebidas')} className={`px-10 py-4 rounded-t-3xl font-black text-xs uppercase tracking-widest transition-all ${pdvTab === 'bebidas' ? 'bg-[#b91c1c] text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}>Bebidas e Outros</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pdvTab === 'pizzas' ? (
            sabores.length > 0 ? sabores.filter(s => s.disponivel !== false).map(s => (
              <button key={s.id_sabor} onClick={() => onOpenConfigPizza(s)} className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-200 hover:border-[#b91c1c] shadow-md hover:shadow-2xl transition-all text-left group">
                <h3 className="text-2xl font-black uppercase text-gray-900 leading-tight">{s.nome_sabor}</h3>
                <p className="text-xs text-gray-800 font-bold uppercase mt-3 mb-8 line-clamp-2 leading-tight opacity-70">{s.ingredientes}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-black text-green-700 italic">R$ {getPrecoBaseSabor(s.id_sabor)}+</span>
                  <div className="bg-gray-100 p-3 rounded-2xl text-[#b91c1c] group-hover:bg-[#b91c1c] group-hover:text-white transition-all"><Plus size={24} strokeWidth={4} /></div>
                </div>
              </button>
            )) : <div className="col-span-full py-20 text-center"><AlertTriangle size={48} className="mx-auto text-gray-300 mb-4" /><p className="font-black text-gray-400 uppercase italic">Nenhuma pizza encontrada.</p></div>
          ) : (
            bebidas.map(b => (
              <button key={b.id_produto} onClick={() => onAddBebida(b)} className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-200 hover:border-emerald-600 shadow-md transition-all text-left group">
                <h3 className="text-2xl font-black uppercase text-gray-900 leading-none">{b.nome}</h3>
                <p className="text-xs text-gray-600 font-bold uppercase mt-3 mb-8">{b.volume}ml</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-black text-emerald-600 italic">R$ {parseFloat(b.preco).toFixed(2)}</span>
                  <div className="bg-gray-100 p-3 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all"><Coffee size={24} /></div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* CARRINHO (LATERAL DIREITA) */}
      <div className="w-[440px] bg-white border-l-4 border-gray-100 flex flex-col shrink-0 shadow-2xl">
        <div className="p-8 border-b-4 border-gray-100 bg-gray-50 flex justify-between items-center text-gray-900">
          <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-3"><ShoppingCart size={20} className="text-[#b91c1c]" /> Comanda Atual</h2>
          <span className="bg-[#b91c1c] text-white px-3 py-1 rounded-full font-black text-xs">{carrinho.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {clienteSelecionado && (
            <div className="bg-[#fcfaf7] border-4 border-green-600/30 p-8 rounded-[2.5rem] shadow-sm">
              <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] font-black text-green-700 uppercase">Destino:</p>
                <button onClick={onOpenNovoCliente} className="text-[9px] font-black uppercase bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700">+ Novo Endereço</button>
              </div>
              <p className="font-black text-lg uppercase text-gray-900 leading-none mb-4">{clienteSelecionado.nome}</p>
              <div className="space-y-3">
                {enderecosCliente.map(e => (
                  <button key={e.id_endereco} onClick={() => setEnderecoEntrega(e)} className={`w-full text-left p-5 rounded-2xl border-4 transition-all ${enderecoEntrega?.id_endereco === e.id_endereco ? 'border-green-600 bg-green-600 text-white shadow-xl scale-[1.03]' : 'bg-gray-100 border-gray-200 text-gray-900'}`}>
                    <p className="text-[11px] font-black uppercase leading-tight">{e.logradouro}, {e.numero} {e.complemento && `- ${e.complemento}`}</p>
                    <p className="text-[9px] font-bold mt-1 uppercase opacity-60">{e.bairro} | {e.cep}</p>
                    {e.ponto_referencia && <p className="text-[8px] italic mt-2 opacity-80 flex items-center gap-1"><Info size={10} /> {e.ponto_referencia}</p>}
                  </button>
                ))}
              </div>
            </div>
          )}
          {carrinho.map(i => (
            <div key={i.id} className="p-5 bg-gray-50 rounded-[2rem] border-2 border-gray-200 relative group">
              <button onClick={() => setCarrinho(carrinho.filter(x => x.id !== i.id))} className="absolute -right-2 -top-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl"><X size={16} strokeWidth={4} /></button>
              <p className="font-black text-sm uppercase text-gray-900 leading-tight">{i.nome}</p>
              <p className="text-[10px] font-bold text-[#b91c1c] uppercase mt-1">{i.detalhe}</p>
              <p className="text-right font-black text-xl text-green-700 mt-2 italic">R$ {i.preco.toFixed(2)}</p>
            </div>
          ))}
          {carrinho.length === 0 && <div className="py-20 text-center text-gray-200 font-black text-5xl uppercase italic tracking-tighter">Vazio</div>}
        </div>
        <div className="p-10 bg-gray-100 border-t-4 border-gray-200 space-y-6 shadow-inner">
          <div className="flex justify-between items-baseline text-gray-950">
            <span className="text-[11px] font-black uppercase">Total a Pagar</span>
            <span className="text-5xl font-black tracking-tighter italic">R$ {carrinho.reduce((a, b) => a + b.preco, 0).toFixed(2)}</span>
          </div>
          <button 
            onClick={onFinalizar} 
            disabled={!clienteSelecionado || !enderecoEntrega || carrinho.length === 0} 
            className="w-full bg-green-700 text-white py-7 rounded-[2rem] font-black uppercase tracking-widest text-lg shadow-2xl hover:bg-green-600 disabled:opacity-20 active:scale-95 transition-all"
          >
            Finalizar Venda
          </button>
        </div>
      </div>
    </div>
  );
}
