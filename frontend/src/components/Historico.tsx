import { Clock, CheckCircle, XCircle, Info, X, MapPin, Package, Printer, Receipt } from 'lucide-react';
import { useMadre } from '../context/MadreContext';
import { useState } from 'react';
import { api } from '../api';

export function Historico() {
  const { historicoPedidos, triggerPrint } = useMadre();
  const [detalhe, setDetalhe] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const verDetalhes = async (id: number) => {
    setLoading(true);
    try {
      const res = await api.getPedidoDetalhado(id);
      setDetalhe(res.data);
    } catch {
      alert("Erro ao buscar detalhes do pedido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-10 overflow-y-auto bg-[#fcfaf7]">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex justify-between items-center border-b-4 border-black/5 pb-6">
          <div className="flex flex-col">
            <h2 className="text-5xl font-black uppercase tracking-tighter italic text-gray-900 leading-none">
              <Clock size={40} className="inline mr-4 text-blue-600" /> Histórico <span className="text-blue-600">do Dia</span>
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-4 flex items-center gap-2">
              <Info size={12}/> Vendas finalizadas ou canceladas hoje
            </p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border-4 border-gray-100 shadow-xl text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Vendido</p>
            <p className="text-4xl font-black text-green-700 italic leading-none">R$ {historicoPedidos.filter(p => p.status === 'Finalizado').reduce((acc, p) => acc + p.valor_total, 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-4">
          {historicoPedidos.length === 0 ? (
            <div className="py-20 text-center opacity-20">
              <Clock size={80} className="mx-auto mb-4" />
              <p className="font-black uppercase italic">Nenhum pedido processado hoje.</p>
            </div>
          ) : (
            historicoPedidos.map(p => (
              <button 
                key={p.id_pedido} 
                onClick={() => verDetalhes(p.id_pedido)}
                className="w-full bg-white rounded-[2.5rem] border-4 border-gray-100 p-8 flex justify-between items-center shadow-md hover:shadow-2xl hover:border-blue-600/30 transition-all group"
              >
                <div className="flex items-center gap-8">
                  <div className={`p-5 rounded-3xl transition-all ${p.status === 'Finalizado' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {p.status === 'Finalizado' ? <CheckCircle size={32} /> : <XCircle size={32} />}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-black italic tracking-tighter">#{p.id_pedido}</span>
                      <span className="text-[10px] font-black text-gray-400 uppercase bg-gray-100 px-3 py-1 rounded-full">{new Date(p.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="font-black text-lg uppercase text-gray-950 mt-1">{p.cliente}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-gray-950 italic leading-none mb-2">R$ {p.valor_total.toFixed(2)}</p>
                  <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full ${p.status === 'Finalizado' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {p.status}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* MODAL DE DETALHES DETALHADOS */}
      {detalhe && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden border-8 border-gray-100 animate-in zoom-in-95 duration-200">
            <div className={`p-10 text-white flex justify-between items-center ${detalhe.status === 'Finalizado' ? 'bg-green-600' : 'bg-red-600'}`}>
               <div>
                  <h3 className="text-4xl font-black uppercase italic leading-none">Pedido #{detalhe.id_pedido}</h3>
                  <p className="text-[10px] font-black uppercase opacity-70 mt-2">{new Date(detalhe.data_hora).toLocaleString()}</p>
               </div>
               <button onClick={() => setDetalhe(null)} className="p-3 bg-black/10 rounded-full hover:bg-black/20"><X size={32}/></button>
            </div>
            
            <div className="p-10 space-y-8 overflow-y-auto max-h-[70vh]">
                {/* INFO CLIENTE */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Cliente</p>
                        <p className="font-black text-gray-950 uppercase">{detalhe.cliente.nome}</p>
                        <p className="text-xs font-bold text-gray-400">{detalhe.cliente.cpf}</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Local de Entrega</p>
                        <p className="font-black text-xs text-gray-900 uppercase leading-tight"><MapPin size={12} className="inline mr-1 text-red-500"/> {detalhe.endereco}</p>
                    </div>
                </div>

                {/* ITENS */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase border-b-2 border-gray-100 pb-2 flex items-center gap-2"><Package size={14}/> Itens Consumidos</p>
                    {detalhe.itens.map((it: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 p-5 rounded-3xl border-2 border-gray-100 flex justify-between items-center">
                            <div>
                                <p className="font-black text-sm uppercase text-gray-900">{it.quantidade}x {it.tipo === 'pizza' ? it.detalhes_pizza.sabores.join(' / ') : it.nome}</p>
                                {it.detalhes_pizza && (
                                    <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">
                                        {it.detalhes_pizza.tamanho} | Borda: {it.detalhes_pizza.borda}
                                    </p>
                                )}
                                {it.observacao && <p className="text-[10px] italic text-[#b91c1c] mt-1">Nota: {it.observacao}</p>}
                            </div>
                            <p className="font-black text-lg italic text-gray-950">R$ {it.preco_unitario.toFixed(2)}</p>
                        </div>
                    ))}
                </div>

                {/* PAGAMENTOS */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase border-b-2 border-gray-100 pb-2 flex items-center gap-2"><Receipt size={14}/> Detalhes do Pagamento</p>
                    <div className="bg-gray-100/50 p-6 rounded-3xl space-y-3">
                        {detalhe.pagamentos.map((pag: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center">
                                <p className="font-black text-xs uppercase text-gray-500">{pag.forma}</p>
                                <p className="font-black text-sm text-gray-950">R$ {pag.valor.toFixed(2)}</p>
                            </div>
                        ))}
                        <div className="border-t-2 border-gray-200 pt-3 flex justify-between items-baseline">
                            <p className="text-xs font-black uppercase text-gray-400">Total Pago</p>
                            <p className="text-4xl font-black italic text-green-700">R$ {detalhe.valor_total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button 
                        onClick={() => triggerPrint('entrega', detalhe)}
                        className="flex-1 bg-gray-900 text-white py-5 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-black transition-all"
                    >
                        <Printer size={18}/> Re-imprimir Cupom
                    </button>
                    <button onClick={() => setDetalhe(null)} className="flex-1 bg-gray-100 text-gray-600 py-5 rounded-2xl font-black uppercase text-xs hover:bg-gray-200 transition-all">
                        Fechar Detalhes
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center z-[200]">
            <div className="text-[#b91c1c] font-black text-2xl animate-bounce uppercase italic">Buscando Detalhes...</div>
        </div>
      )}
    </div>
  );
}
