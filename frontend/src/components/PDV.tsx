import { Search, UserPlus, Plus, Coffee, AlertTriangle, ShoppingCart, Info, X, Gift, History } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../api';
import { useMadre } from '../context/MadreContext';
import type { ClienteBusca, Endereco, ItemCarrinho, Sabor } from '../types';

interface PDVProps {
  carrinho: ItemCarrinho[];
  setCarrinho: (c: ItemCarrinho[]) => void;
  clienteSelecionado: ClienteBusca | null;
  setClienteSelecionado: (c: ClienteBusca | null) => void;
  enderecoEntrega: Endereco | null;
  setEnderecoEntrega: (e: Endereco | null) => void;
  onFinalizar: (extra: any) => void;
  onOpenNovoCliente: () => void;
  onOpenConfigPizza: (s: Sabor, custoPontos?: number | null) => void;
}

export function PDV({ 
  carrinho, setCarrinho, clienteSelecionado, setClienteSelecionado,
  enderecoEntrega, setEnderecoEntrega, onFinalizar, onOpenNovoCliente, onOpenConfigPizza
}: PDVProps) {
  
  const { sabores, bebidas, precos, tamanhos } = useMadre();
  const [buscaCliente, setBuscaCliente] = useState('');
  const [sugestoesClientes, setSugestoesClientes] = useState<ClienteBusca[]>([]);
  const [enderecosCliente, setEnderecosCliente] = useState<Endereco[]>([]);
  const [ultimoPedido, setUltimoPedido] = useState<any>(null);
  const [pdvTab, setPdvTab] = useState<'pizzas' | 'bebidas'>('pizzas');

  // Novos campos de fechamento
  const [taxaEntrega, setTaxaEntrega] = useState(0);
  const [valorRecebido, setValorRecebido] = useState(0);
  const [quilometragem, setQuilometragem] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState('Dinheiro');

  const totalPedido = carrinho.reduce((a, b) => a + b.preco, 0) + taxaEntrega;
  const troco = valorRecebido > totalPedido ? valorRecebido - totalPedido : 0;

  // Atualiza valor recebido automaticamente para meios eletrônicos
  useEffect(() => {
    if (formaPagamento !== 'Dinheiro' && totalPedido > 0) {
      setValorRecebido(totalPedido);
    }
  }, [formaPagamento, totalPedido]);

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
      
      // Busca a inteligência do último pedido
      api.getUltimoPedidoCliente(c.cpf).then(res => {
          setUltimoPedido(res.data);
      }).catch(() => setUltimoPedido(null));
      
    } catch (e) { console.error(e); }
  };

  const getPrecoBaseSabor = (idSabor: number) => {
    const p = precos.find(p => p.id_sabor === idSabor && p.id_tamanho === (tamanhos[2]?.id_tamanho || 1));
    return p ? parseFloat(p.preco_base).toFixed(2) : '0.00';
  };

  const totalEmPontosNoCarrinho = carrinho.reduce((acc, item) => acc + (item.pago_com_pontos ? (item.custo_pontos || 0) : 0), 0);

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
              <div className="flex items-center gap-3 shrink-0">
                <div className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase border-2 flex items-center gap-2 shadow-sm transition-all ${totalEmPontosNoCarrinho > clienteSelecionado.pontos ? 'bg-red-100 border-red-200 text-red-700' : 'bg-amber-100 border-amber-200 text-amber-900'}`}>
                  🏆 {clienteSelecionado.pontos - totalEmPontosNoCarrinho} Pts
                </div>
                <div className="bg-green-100 text-green-900 px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 border-2 border-green-200 shadow-sm">
                  {clienteSelecionado.nome}
                  <button onClick={() => { setClienteSelecionado(null); setEnderecoEntrega(null); setUltimoPedido(null); }} className="hover:scale-125 transition-transform"><X size={14} /></button>
                </div>
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
                    <div className="text-right">
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">🏆 {c.pontos} Pts</p>
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
              <div key={s.id_sabor} className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-200 hover:border-[#b91c1c] shadow-md hover:shadow-2xl transition-all text-left group flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-black uppercase text-gray-900 leading-tight">{s.nome_sabor}</h3>
                  <p className="text-xs text-gray-800 font-bold uppercase mt-3 mb-8 line-clamp-2 leading-tight opacity-70">{s.ingredientes}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-black text-green-700 italic">R$ {getPrecoBaseSabor(s.id_sabor)}+</span>
                    <button onClick={() => onOpenConfigPizza(s)} className="bg-gray-100 p-3 rounded-2xl text-[#b91c1c] hover:bg-[#b91c1c] hover:text-white transition-all"><Plus size={24} strokeWidth={4} /></button>
                  </div>
                  <button 
                    onClick={() => onOpenConfigPizza(s, s.preco_pontos || 500)}
                    disabled={!clienteSelecionado || (clienteSelecionado.pontos - totalEmPontosNoCarrinho) < (s.preco_pontos || 500)}
                    className="w-full py-2 bg-amber-50 border-2 border-amber-200 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase text-amber-700 hover:bg-amber-100 disabled:opacity-30 disabled:grayscale transition-all"
                  >
                    <Gift size={14}/> Trocar ({s.preco_pontos || 500} Pts)
                  </button>
                </div>
              </div>
            )) : <div className="col-span-full py-20 text-center"><AlertTriangle size={48} className="mx-auto text-gray-300 mb-4" /><p className="font-black text-gray-400 uppercase italic">Nenhuma pizza encontrada.</p></div>
          ) : (
            bebidas.map(b => (
              <div key={b.id_produto} className={`relative group bg-white rounded-[2.5rem] border-4 transition-all duration-300 overflow-hidden shadow-md hover:shadow-2xl ${b.quantidade <= 0 ? 'opacity-60 grayscale cursor-not-allowed border-gray-100' : 'hover:border-emerald-500 border-gray-100'}`}>
                {/* SELO DE ESTOQUE FLUTUANTE */}
                <div className={`absolute top-5 right-5 px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-tighter shadow-sm z-10 ${b.quantidade > 10 ? 'bg-emerald-100 text-emerald-700' : (b.quantidade > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-600 text-white')}`}>
                  {b.quantidade > 0 ? `${b.quantidade} em estoque` : 'Esgotado'}
                </div>

                {/* CONTEÚDO DO CARD */}
                <div className="p-8 space-y-6">
                  <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-500">
                    <Coffee size={32} strokeWidth={2.5} />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-black uppercase text-gray-900 leading-none tracking-tighter">{b.nome}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">Bebida Gelada</p>
                  </div>

                  <div className="pt-4 border-t-2 border-gray-50 flex justify-between items-center">
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase">Preço Venda</p>
                        <p className="text-3xl font-black text-emerald-600 italic">R$ {parseFloat(b.preco).toFixed(2)}</p>
                    </div>
                    <button 
                      disabled={b.quantidade <= 0}
                      onClick={() => setCarrinho([...carrinho, { id: Math.random().toString(36).slice(2, 11), id_original: b.id_produto, tipo: 'bebida', nome: b.nome, preco: parseFloat(b.preco), detalhe: 'Bebida' }])} 
                      className="bg-emerald-600 text-white p-5 rounded-2xl shadow-lg hover:bg-emerald-700 active:scale-90 transition-all disabled:opacity-0"
                    >
                      <Plus size={24} strokeWidth={4} />
                    </button>
                  </div>

                  {b.preco_pontos > 0 && (
                    <button 
                      onClick={() => setCarrinho([...carrinho, { id: Math.random().toString(36).slice(2, 11), id_original: b.id_produto, tipo: 'bebida', nome: `🎁 ${b.nome}`, preco: 0, pago_com_pontos: true, custo_pontos: b.preco_pontos, detalhe: 'Resgate' }])}
                      disabled={!clienteSelecionado || (clienteSelecionado.pontos - totalEmPontosNoCarrinho) < b.preco_pontos}
                      className="w-full py-3 bg-amber-50 border-2 border-amber-100 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-amber-700 hover:bg-amber-100 disabled:opacity-30 disabled:grayscale transition-all"
                    >
                      <Gift size={16}/> Resgatar com {b.preco_pontos} Pts
                    </button>
                  )}
                </div>
              </div>
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

              {/* INTELIGÊNCIA DE CLIENTE */}
              {ultimoPedido && (
                 <div className="mb-4 bg-amber-50 border-2 border-amber-100 p-4 rounded-2xl shadow-sm">
                   <p className="text-[9px] font-black uppercase text-amber-600 flex items-center gap-1 mb-2 tracking-widest"><History size={12}/> Inteligência de Venda</p>
                   <p className="text-[11px] text-amber-950 leading-tight">Última compra em <span className="font-bold">{new Date(ultimoPedido.data).toLocaleDateString()}</span>:</p>
                   <p className="text-[11px] font-black text-amber-900 mt-1 italic">"{ultimoPedido.resumo_itens}"</p>
                 </div>
              )}

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
            <div key={i.id} className={`p-5 rounded-[2rem] border-2 relative group transition-all ${i.pago_com_pontos ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
              <button onClick={() => setCarrinho(carrinho.filter(x => x.id !== i.id))} className="absolute -right-2 -top-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl"><X size={16} strokeWidth={4} /></button>
              <p className="font-black text-sm uppercase text-gray-900 leading-tight">{i.nome}</p>
              <p className="text-[10px] font-bold text-[#b91c1c] uppercase mt-1">{i.detalhe}</p>
              {i.observacao && <p className="text-[9px] italic text-gray-500 mt-1">Nota: {i.observacao}</p>}
              <p className={`text-right font-black text-xl mt-2 italic ${i.pago_com_pontos ? 'text-amber-600' : 'text-green-700'}`}>
                {i.pago_com_pontos ? `${i.custo_pontos} Pts` : `R$ ${i.preco.toFixed(2)}`}
              </p>
            </div>
          ))}
          {carrinho.length === 0 && <div className="py-20 text-center text-gray-200 font-black text-5xl uppercase italic tracking-tighter">Vazio</div>}
        </div>

        {/* CAMPOS DE FECHAMENTO */}
        <div className="p-6 bg-[#fcfaf7] border-t-4 border-gray-100 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Taxa Entrega</label>
              <input 
                type="number" 
                min="0"
                value={taxaEntrega} 
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setTaxaEntrega(val < 0 ? 0 : (val || 0));
                }} 
                className="w-full bg-white border-2 border-gray-100 rounded-xl p-3 font-black text-sm" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Km Entrega</label>
              <input 
                type="number" 
                min="0"
                value={quilometragem} 
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setQuilometragem(val < 0 ? 0 : (val || 0));
                }} 
                className="w-full bg-white border-2 border-gray-100 rounded-xl p-3 font-black text-sm" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Pagamento</label>
              <select value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)} className="w-full bg-white border-2 border-gray-100 rounded-xl p-3 font-black text-sm outline-none">
                <option>Dinheiro</option>
                <option>PIX</option>
                <option>Débito</option>
                <option>Crédito</option>
                <option>iFood (Online)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Valor Recebido</label>
              <input 
                type="number" 
                min="0"
                value={valorRecebido} 
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setValorRecebido(val < 0 ? 0 : (val || 0));
                }} 
                className="w-full bg-white border-2 border-gray-100 rounded-xl p-3 font-black text-sm" 
              />
            </div>
          </div>
        </div>

        <div className="p-10 bg-gray-100 border-t-4 border-gray-200 space-y-4 shadow-inner">
          <div className="space-y-1">
            <div className="flex justify-between items-baseline text-gray-400">
              <span className="text-[9px] font-black uppercase tracking-widest">Troco a devolver</span>
              <span className="text-sm font-black italic text-red-600">R$ {troco.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-baseline text-gray-950 pt-2 border-t border-gray-200">
              <span className="text-[11px] font-black uppercase">Total Geral</span>
              <span className="text-5xl font-black tracking-tighter italic">R$ {totalPedido.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={() => {
              const payloadExtra = {
                taxa_entrega: Number(taxaEntrega) || 0,
                valor_recebido: Number(valorRecebido) || 0,
                troco: Number(troco) || 0,
                quilometragem: Number(quilometragem) || 0,
                pagamentos: [{ forma_pagamento: formaPagamento, valor_pago: totalPedido }]
              };
              console.log("CARRINHO DEBUG:", payloadExtra);
              onFinalizar(payloadExtra);
            }} 
            disabled={
              !clienteSelecionado || 
              !enderecoEntrega || 
              carrinho.length === 0 || 
              totalEmPontosNoCarrinho > (clienteSelecionado?.pontos || 0) ||
              (formaPagamento === 'Dinheiro' && valorRecebido < totalPedido)
            } 
            className="w-full bg-green-700 text-white py-7 rounded-[2rem] font-black uppercase tracking-widest text-lg shadow-2xl hover:bg-green-600 disabled:opacity-20 active:scale-95 transition-all"
          >
            {formaPagamento === 'Dinheiro' && valorRecebido < totalPedido && valorRecebido > 0 
              ? "Valor Insuficiente" 
              : "Finalizar Venda"}
          </button>
        </div>
      </div>
    </div>
  );
}
