import React from 'react';
import { ShoppingCart, X, History, Info } from 'lucide-react';
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
  formaPagamento: string;
  setFormaPagamento: (v: string) => void;
  valorRecebido: number;
  setValorRecebido: (v: number) => void;
  totalPedido: number;
  troco: number;
  totalEmPontosNoCarrinho: number;
  onFinalizar: (extra: any) => void;
}

export const PDVCart: React.FC<PDVCartProps> = ({
  carrinho, setCarrinho, clienteSelecionado, onOpenNovoCliente, ultimoPedido,
  enderecosCliente, enderecoEntrega, setEnderecoEntrega, taxaEntrega, setTaxaEntrega,
  quilometragem, setQuilometragem, formaPagamento, setFormaPagamento,
  valorRecebido, setValorRecebido, totalPedido, troco, totalEmPontosNoCarrinho, onFinalizar
}) => {
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
            <p className="text-[9px] font-bold text-red-700 uppercase mt-1 opacity-70 tracking-wider">{i.detalhe}</p>
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
            <input 
              type="number" 
              min="0"
              value={taxaEntrega} 
              onChange={e => {
                const val = parseFloat(e.target.value);
                setTaxaEntrega(val < 0 ? 0 : (val || 0));
              }} 
              className="w-full bg-white border border-gray-200 rounded-xl p-2.5 font-bold text-sm focus:border-green-600 outline-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Km Rodado</label>
            <input 
              type="number" 
              min="0"
              value={quilometragem} 
              onChange={e => {
                const val = parseFloat(e.target.value);
                setQuilometragem(val < 0 ? 0 : (val || 0));
              }} 
              className="w-full bg-white border border-gray-200 rounded-xl p-2.5 font-bold text-sm focus:border-green-600 outline-none" 
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Pagamento</label>
            <select value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-2.5 font-bold text-sm outline-none focus:border-green-600">
              <option>Dinheiro</option>
              <option>PIX</option>
              <option>Débito</option>
              <option>Crédito</option>
              <option>iFood (Online)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Recebido</label>
            <input 
              type="number" 
              min="0"
              value={valorRecebido} 
              onChange={e => {
                const val = parseFloat(e.target.value);
                setValorRecebido(val < 0 ? 0 : (val || 0));
              }} 
              className="w-full bg-white border border-gray-200 rounded-xl p-2.5 font-bold text-sm focus:border-green-600 outline-none" 
            />
          </div>
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
            onFinalizar(payloadExtra);
          }} 
          disabled={
            !clienteSelecionado || 
            !enderecoEntrega || 
            carrinho.length === 0 || 
            totalEmPontosNoCarrinho > (clienteSelecionado?.pontos || 0) ||
            (formaPagamento === 'Dinheiro' && valorRecebido < totalPedido)
          } 
          className="w-full bg-green-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-green-500 disabled:opacity-10 active:scale-95 transition-all"
        >
          {formaPagamento === 'Dinheiro' && valorRecebido < totalPedido && valorRecebido > 0 
            ? "Valor Insuficiente" 
            : "Finalizar Pedido"}
        </button>
      </div>
    </div>
  );
};
