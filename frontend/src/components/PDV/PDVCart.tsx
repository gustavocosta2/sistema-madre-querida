import React, { useState } from 'react';
import { ShoppingCart, X, History, Info, Plus, Banknote, QrCode, CreditCard } from 'lucide-react';
import type { ItemCarrinho, ClienteBusca, Endereco } from '../../types';

interface PDVCartProps {
  carrinho: ItemCarrinho[];
  setCarrinho: (c: ItemCarrinho[]) => void;
  clienteSelecionado: ClienteBusca | null;
  onOpenNovoCliente: () => void;
  ultimoPedido: any;
  enderecosCliente: Endereco[];
  enderecoEntrega: Endereco | null;
  setEnderecoEntrega: (e: Endereco | null) => void;
  taxaEntrega: number;
  setTaxaEntrega: (v: number) => void;
  quilometragem: number;
  setQuilometragem: (v: number) => void;
  pagamentos: { forma_pagamento: string, valor_pago: number }[];
  setPagamentos: (p: any) => void;
  formaPagamentoAtual: string;
  setFormaPagamentoAtual: (v: string) => void;
  valorRecebidoDinheiro: number;
  setValorRecebidoDinheiro: (v: number) => void;
  totalPedido: number;
  troco: number;
  faltaPagar: number;
  totalEmPontosNoCarrinho: number;
  onFinalizar: (extra: any) => void;
}

export const PDVCart: React.FC<PDVCartProps> = ({
  carrinho, setCarrinho, clienteSelecionado, onOpenNovoCliente, ultimoPedido,
  enderecosCliente, enderecoEntrega, setEnderecoEntrega, taxaEntrega, setTaxaEntrega,
  quilometragem, setQuilometragem, pagamentos, setPagamentos,
  formaPagamentoAtual, setFormaPagamentoAtual, valorRecebidoDinheiro, setValorRecebidoDinheiro,
  totalPedido, troco, faltaPagar, totalEmPontosNoCarrinho, onFinalizar
}) => {
  const [valorDigitado, setValorDigitado] = useState('');

  const handleAddPagamento = () => {
    const v = parseFloat(valorDigitado) || faltaPagar;
    if (v <= 0) return;
    if (v > (faltaPagar + 0.01)) return alert("Valor maior que o saldo restante.");
    
    setPagamentos([...pagamentos, { forma_pagamento: formaPagamentoAtual, valor_pago: v }]);
    setValorDigitado('');
  };

  const removePagamento = (idx: number) => {
    setPagamentos(pagamentos.filter((_: any, i: number) => i !== idx));
  };

  return (
    <div className="w-[400px] bg-white border-l border-gray-100 flex flex-col shrink-0 shadow-2xl">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center text-gray-900">
        <h2 className="font-black text-xs uppercase tracking-widest flex items-center gap-3"><ShoppingCart size={18} className="text-red-700" /> Comanda</h2>
        <span className="bg-red-700 text-white px-2.5 py-0.5 rounded-full font-black text-[10px]">{carrinho.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {clienteSelecionado && (
          <div className="bg-gray-50 border border-green-600/20 p-6 rounded-3xl shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] font-black text-green-700 uppercase tracking-wider">Dados da Entrega</p>
              <button onClick={onOpenNovoCliente} className="text-[9px] font-black uppercase bg-green-700 text-white px-2.5 py-1 rounded-lg hover:bg-green-800 transition-colors">Novo Endereço</button>
            </div>
            <p className="font-black text-base uppercase text-gray-900 leading-tight mb-4">{clienteSelecionado.nome}</p>

            {ultimoPedido && (
               <div className="mb-4 bg-amber-50 border border-amber-200 p-4 rounded-2xl shadow-sm">
                 <p className="text-[9px] font-black uppercase text-amber-600 flex items-center gap-1 mb-2 tracking-widest"><History size={12}/> Última Compra</p>
                 <p className="text-[11px] text-amber-950 leading-tight">Em <span className="font-bold">{new Date(ultimoPedido.data).toLocaleDateString()}</span>:</p>
                 <p className="text-[11px] font-black text-amber-900 mt-1 italic">"{ultimoPedido.resumo_itens}"</p>
               </div>
            )}

            <div className="space-y-2">
              {enderecosCliente.map(e => (
                <button key={e.id_endereco} onClick={() => setEnderecoEntrega(e)} className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${enderecoEntrega?.id_endereco === e.id_endereco ? 'border-green-600 bg-green-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-700 hover:border-gray-200'}`}>
                  <p className="text-[11px] font-bold uppercase leading-tight">{e.logradouro}, {e.numero}</p>
                  <p className="text-[9px] font-medium mt-0.5 uppercase opacity-60">{e.bairro}</p>
                  {e.ponto_referencia && <p className={`text-[8px] italic mt-2 flex items-center gap-1 ${enderecoEntrega?.id_endereco === e.id_endereco ? 'text-white/80' : 'text-gray-400'}`}><Info size={10} /> {e.ponto_referencia}</p>}
                </button>
              ))}
            </div>
          </div>
        )}
        {carrinho.map(i => (
          <div key={i.id} className={`p-4 rounded-2xl border relative group transition-all ${i.pago_com_pontos ? 'bg-amber-50/50 border-amber-100' : 'bg-white border-gray-100 hover:shadow-md'}`}>
            <button onClick={() => setCarrinho(carrinho.filter(x => x.id !== i.id))} className="absolute -right-2 -top-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} strokeWidth={4} /></button>
            <p className="font-black text-xs uppercase text-gray-900 leading-tight">{i.nome}</p>
            <p className="text-[9px] font-bold text-red-700 uppercase mt-1 tracking-wider">{i.detalhe}</p>
            {i.observacao && <p className="text-[10px] text-gray-500 mt-1 leading-relaxed border-t border-gray-50 pt-1 italic">{i.observacao}</p>}
            <p className={`text-right font-black text-lg mt-1 italic ${i.pago_com_pontos ? 'text-amber-600' : 'text-emerald-700'}`}>
              {i.pago_com_pontos ? `${i.custo_pontos} Pts` : `R$ ${i.preco.toFixed(2)}`}
            </p>
          </div>
        ))}
        {carrinho.length === 0 && <div className="py-20 text-center text-gray-300 font-black text-2xl uppercase tracking-tighter opacity-50 italic">Sem itens na comanda</div>}
      </div>

      <div className="p-5 bg-gray-50/50 border-t border-gray-100 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Taxa Entrega</label>
            <input type="number" min="0" value={taxaEntrega} onChange={e => setTaxaEntrega(parseFloat(e.target.value) || 0)} className="w-full bg-white border border-gray-200 rounded-xl p-2.5 font-bold text-sm outline-none focus:border-green-600" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Km Rodado</label>
            <input type="number" min="0" value={quilometragem} onChange={e => setQuilometragem(parseFloat(e.target.value) || 0)} className="w-full bg-white border border-gray-200 rounded-xl p-2.5 font-bold text-sm outline-none focus:border-green-600" />
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-gray-100">
            <p className="text-[9px] font-black uppercase text-gray-400 ml-2">Pagamento (Mix)</p>
            <div className="space-y-1.5">
                {pagamentos.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white border border-gray-100 px-3 py-2 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2">
                            {p.forma_pagamento === 'Dinheiro' ? <Banknote size={14} className="text-emerald-600"/> : (p.forma_pagamento === 'PIX' ? <QrCode size={14} className="text-blue-500"/> : <CreditCard size={14} className="text-purple-500"/>)}
                            <span className="text-[10px] font-black uppercase text-gray-700">{p.forma_pagamento}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-gray-900">R$ {p.valor_pago.toFixed(2)}</span>
                            <button onClick={() => removePagamento(idx)} className="text-red-500 hover:text-red-700 p-1"><X size={14} strokeWidth={3}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {faltaPagar > 0 && (
                <div className="flex gap-2">
                    <select value={formaPagamentoAtual} onChange={e => setFormaPagamentoAtual(e.target.value)} className="flex-1 bg-white border border-gray-200 rounded-xl p-2.5 font-bold text-xs outline-none focus:border-green-600">
                        <option>Dinheiro</option>
                        <option>PIX</option>
                        <option>Débito</option>
                        <option>Crédito</option>
                        <option>iFood (Online)</option>
                    </select>
                    <input type="number" placeholder={`R$ ${faltaPagar.toFixed(2)}`} value={valorDigitado} onChange={e => setValorDigitado(e.target.value)} className="w-24 bg-white border border-gray-200 rounded-xl p-2.5 font-black text-xs text-right outline-none focus:border-green-600" />
                    <button onClick={handleAddPagamento} className="bg-gray-900 text-white p-2.5 rounded-xl hover:bg-black transition-all">
                        <Plus size={18}/>
                    </button>
                </div>
            )}

            {pagamentos.some(p => p.forma_pagamento === 'Dinheiro') && (
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl space-y-1">
                    <label className="text-[8px] font-black uppercase text-emerald-700 ml-1">Total em Dinheiro Recebido (p/ Troco)</label>
                    <input type="number" placeholder="Valor recebido" value={valorRecebidoDinheiro || ''} onChange={e => setValorRecebidoDinheiro(parseFloat(e.target.value) || 0)} className="w-full bg-white border border-emerald-200 rounded-lg p-2 font-black text-sm outline-none" />
                </div>
            )}
        </div>
      </div>

      <div className="p-8 bg-gray-900 border-t border-gray-800 space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between items-baseline text-gray-500">
            <span className="text-[9px] font-black uppercase tracking-widest">Troco a devolver</span>
            <span className="text-sm font-black italic text-red-500">R$ {troco.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline text-white pt-2 border-t border-white/5">
            <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">Total do Pedido</span>
            <span className="text-4xl font-black tracking-tighter italic">R$ {totalPedido.toFixed(2)}</span>
          </div>
          {faltaPagar > 0.01 && (
            <div className="flex justify-between items-baseline text-amber-500 animate-pulse">
                <span className="text-[9px] font-black uppercase tracking-widest">Falta Receber</span>
                <span className="text-lg font-black italic">R$ {faltaPagar.toFixed(2)}</span>
            </div>
          )}
        </div>
        <button 
          onClick={() => onFinalizar({ taxa_entrega: Number(taxaEntrega) || 0, valor_recebido: Number(valorRecebidoDinheiro) || pagamentos.reduce((acc, p) => acc + p.valor_pago, 0), troco: Number(troco) || 0, quilometragem: Number(quilometragem) || 0, pagamentos })} 
          disabled={!clienteSelecionado || !enderecoEntrega || carrinho.length === 0 || faltaPagar > 0.01 || (pagamentos.some(p => p.forma_pagamento === 'Dinheiro') && valorRecebidoDinheiro < pagamentos.filter(p => p.forma_pagamento === 'Dinheiro').reduce((acc, p) => acc + p.valor_pago, 0))} 
          className="w-full bg-green-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-green-500 disabled:opacity-10 active:scale-95 transition-all"
        >
          {faltaPagar > 0.01 ? "Aguardando Pagto" : "Finalizar Pedido"}
        </button>
      </div>
    </div>
  );
};
