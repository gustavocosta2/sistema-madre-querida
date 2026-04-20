import { Clock, CheckCircle, XCircle, Info } from 'lucide-react';
import { useMadre } from '../context/MadreContext';

export function Historico() {
  const { historicoPedidos } = useMadre();
  
  return (
    <div className="flex-1 p-10 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex justify-between items-center border-b-4 border-black/5 pb-6">
          <div className="flex flex-col">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic text-gray-900">
              <Clock size={40} className="inline mr-4 text-blue-600" /> Histórico do Dia
            </h2>
            <p className="text-[10px] font-bold text-blue-600 uppercase mt-2 bg-blue-50 px-3 py-1 rounded-lg w-fit flex items-center gap-2">
              <Info size={12}/> Exibindo pedidos finalizados ou cancelados desde as 00:00 de hoje
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase">Total Vendido (Hoje)</p>
            <p className="text-2xl font-black text-green-700 italic">R$ {historicoPedidos.filter(p => p.status === 'Finalizado').reduce((acc, p) => acc + p.valor_total, 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-4">
          {historicoPedidos.length === 0 ? (
            <div className="py-20 text-center opacity-20">
              <Clock size={80} className="mx-auto mb-4" />
              <p className="font-black uppercase italic">Nenhum pedido finalizado ainda.</p>
            </div>
          ) : (
            historicoPedidos.map(p => (
              <div key={p.id_pedido} className="bg-white rounded-[2.5rem] border-2 border-gray-100 p-8 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-full ${p.status === 'Finalizado' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {p.status === 'Finalizado' ? <CheckCircle size={32} /> : <XCircle size={32} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black italic">#{p.id_pedido}</span>
                      <span className="text-xs font-bold text-gray-400 uppercase">{new Date(p.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="font-black text-sm uppercase text-gray-950 mt-1">{p.cliente}</p>
                    <div className="flex gap-2 mt-2">
                      {p.itens.map((it: any, idx: number) => (
                        <span key={idx} className="text-[9px] font-black uppercase bg-gray-100 px-2 py-1 rounded-lg text-gray-500">
                          {it.quantidade}x {it.nome}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Valor Total</p>
                  <p className="text-3xl font-black text-gray-900 italic">R$ {p.valor_total.toFixed(2)}</p>
                  <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${p.status === 'Finalizado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
