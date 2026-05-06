import React from 'react';

interface PrintTicketProps {
  type: 'cozinha' | 'entrega';
  order: any;
}

export const PrintTicket: React.FC<PrintTicketProps> = ({ type, order }) => {
  if (!order) return null;

  return (
    <div id="print-ticket" className="font-mono text-black">
      <div className="text-center border-b-2 border-black pb-2 mb-2">
        <h2 className="text-2xl font-bold uppercase tracking-tighter">MADRE QUERIDA</h2>
        <p className="text-[10px] font-bold uppercase italic">Pizzaria Artesanal</p>
      </div>

      <div className="flex justify-between items-baseline mb-4">
        <span className="text-3xl font-bold">#{order.id_pedido}</span>
        <span className="text-[12px] font-bold">{new Date(order.data_hora).toLocaleString()}</span>
      </div>

      <div className="border-b border-black pb-2 mb-2">
        <p className="font-bold text-[14px] uppercase">{type === 'cozinha' ? 'PRODUÇÃO - COZINHA' : 'COMPROVANTE DE ENTREGA'}</p>
        <p className="text-[12px] font-bold uppercase mt-1">Cliente: {order.cliente_nome || order.cliente?.nome || 'Balcão'}</p>
      </div>

      {type === 'entrega' && order.endereco && (
        <div className="border-b border-black pb-2 mb-2">
          <p className="text-[11px] font-bold uppercase leading-tight">Endereço:</p>
          <p className="text-[13px] font-bold uppercase leading-tight mt-1">{order.endereco}</p>
        </div>
      )}

      <div className="space-y-3 mb-4">
        <p className="text-[11px] font-bold border-b border-black pb-1 uppercase">Itens do Pedido</p>
        {order.itens?.map((it: any, idx: number) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between font-bold text-[14px]">
              <span>{it.quantidade}x {it.tipo === 'pizza' ? (it.detalhes_pizza?.sabores.join(' / ')) : it.nome}</span>
              {type === 'entrega' && <span>R$ {(it.preco_unitario * it.quantidade).toFixed(2)}</span>}
            </div>
            {it.detalhes_pizza && (
              <p className="text-[11px] font-bold uppercase ml-2">
                &gt; {it.detalhes_pizza.tamanho} | {it.detalhes_pizza.borda}
              </p>
            )}
            {it.observacao && (
              <p className="text-[11px] font-bold border border-black p-1 ml-2 uppercase italic">
                OBS: {it.observacao}
              </p>
            )}
          </div>
        ))}
      </div>

      {type === 'entrega' && (
        <div className="border-t-2 border-black pt-2 space-y-1">
          <div className="flex justify-between text-[12px] font-bold">
            <span>Taxa de Entrega</span>
            <span>R$ {parseFloat(order.taxa_entrega || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[18px] font-bold border-b border-black pb-1">
            <span>TOTAL A PAGAR</span>
            <span>R$ {parseFloat(order.valor_total).toFixed(2)}</span>
          </div>
          <div className="pt-2">
            <p className="text-[11px] font-bold uppercase">Forma de Pagamento:</p>
            <div className="space-y-1 mt-1">
                {order.pagamentos?.map((pag: any, pIdx: number) => (
                    <div key={pIdx} className="flex justify-between text-[13px] font-bold">
                        <span>{pag.forma || pag.forma_pagamento}</span>
                        <span>R$ {parseFloat(pag.valor || pag.valor_pago).toFixed(2)}</span>
                    </div>
                ))}
            </div>
          </div>
          {order.troco > 0 && (
            <div className="flex justify-between text-[14px] font-bold border-t border-dashed border-black pt-1">
              <span>TROCO PARA</span>
              <span>R$ {parseFloat(order.troco).toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      <div className="text-center mt-10 border-t border-black pt-4">
        <p className="text-[10px] font-bold uppercase italic">Obrigado pela preferência!</p>
        <p className="text-[9px] font-bold mt-2 opacity-50">SISTEMA MADRE QUERIDA v3.0</p>
      </div>
    </div>
  );
};
