import { Truck, MapPin } from 'lucide-react';
import type { PedidoAtivo, Motoboy } from '../types';
import { api } from '../api';

interface EntregasProps {
  pedidos: PedidoAtivo[];
  motoboys: Motoboy[];
  refresh: () => void;
}

export function Entregas({ pedidos, motoboys, refresh }: EntregasProps) {
  const pedidosLogistica = pedidos.filter(p => ['Aguardando Entrega', 'Em Rota'].includes(p.status));

  const despachar = (id: number) => {
    const selectMoto = document.getElementById(`select-moto-${id}`) as HTMLSelectElement;
    if (!selectMoto?.value) return alert("Selecione um motoboy!");
    api.patchDespacharPedido(id, selectMoto.value).then(refresh);
  };

  const finalizar = (id: number) => {
    api.patchStatusPedido(id, 'Finalizado').then(refresh);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-[#eef2f3]">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex justify-between items-center border-b-4 border-black/5 pb-8">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic flex items-center gap-4 text-gray-900">
            <Truck size={45} className="text-blue-600" /> Logística
          </h2>
        </div>

        {pedidosLogistica.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-20">
            <Truck size={120} strokeWidth={1} className="text-gray-400 mb-6" />
            <p className="text-3xl font-black uppercase italic text-gray-400 tracking-tighter">Logística em Espera...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pedidosLogistica.map(p => (
              <div key={p.id_pedido} className={`bg-white rounded-[3.5rem] border-8 shadow-2xl overflow-hidden transform transition-all ${p.status === 'Aguardando Entrega' ? 'border-emerald-500 bg-emerald-50/10' : 'border-blue-600 bg-blue-50/10'}`}>
                <div className={`p-8 flex justify-between items-center text-white ${p.status === 'Aguardando Entrega' ? 'bg-emerald-500' : 'bg-blue-600'}`}>
                  <span className="text-4xl font-black italic">#{p.id_pedido}</span>
                  <p className="text-[10px] uppercase font-black bg-black/20 px-4 py-1.5 rounded-full">{p.status}</p>
                </div>
                <div className="p-8 space-y-6">
                  <div className="bg-white p-6 rounded-[2.5rem] border-2 border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-start gap-4">
                      <MapPin size={24} className="text-red-500 shrink-0 mt-1" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Destino</p>
                        <p className="font-black text-sm uppercase text-gray-950 leading-tight mt-1">{p.endereco || "Balcão / Retirada"}</p>
                      </div>
                    </div>
                  </div>

                  {p.status === 'Aguardando Entrega' ? (
                    <div className="space-y-4">
                      <select id={`select-moto-${p.id_pedido}`} className="w-full bg-gray-50 border-4 border-gray-100 rounded-3xl p-5 font-black text-xs uppercase outline-none focus:border-emerald-500">
                        <option value="">--- MOTOBOY ---</option>
                        {motoboys.map(m => (<option key={m.cpf} value={m.cpf}>{m.nome} ({m.placa})</option>))}
                      </select>
                      <button onClick={() => despachar(p.id_pedido)} className="w-full bg-emerald-500 text-white py-7 rounded-[2.5rem] font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Despachar</button>
                    </div>
                  ) : (
                    <button onClick={() => finalizar(p.id_pedido)} className="w-full bg-blue-600 text-white py-8 rounded-[2.5rem] font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Confirmar Entrega</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
