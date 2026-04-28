import { Truck, MapPin, Phone, Printer, CheckCircle, Package } from 'lucide-react';
import { useMadre } from '../context/MadreContext';
import { api } from '../api';

export function Entregas() {
  const { pedidosAtivos, motoboys, refreshOrders, refreshAll } = useMadre();
  const pedidosLogistica = pedidosAtivos.filter(p => ['Aguardando Entrega', 'Em Rota'].includes(p.status));

  const despachar = (id: number) => {
    const selectMoto = document.getElementById(`select-moto-${id}`) as HTMLSelectElement;
    if (!selectMoto?.value) return alert("Selecione um motoboy!");
    api.patchDespacharPedido(id, selectMoto.value).then(refreshOrders);
  };

  const finalizar = (id: number) => {
    if(confirm("Confirmar que o pedido foi entregue ao cliente?")) {
        api.patchStatusPedido(id, 'Finalizado').then(refreshOrders);
    }
  };

  const handleImprimirComprovante = (id: number) => {
    alert(`Imprimindo via do Motoboy para o pedido #${id}...`);
  };

  const handleCancelar = (id: number) => {
    if (window.confirm(`⚠️ Deseja realmente CANCELAR o pedido #${id}? As bebidas voltarão ao estoque.`)) {
      api.patchStatusPedido(id, 'Cancelado').then(() => {
          refreshOrders();
          refreshAll();
      });
    }
  };

  return (
    <div className="flex-1 p-10 overflow-y-auto bg-[#f0f4f8]">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex justify-between items-end border-b-4 border-black/10 pb-8">
          <div>
            <h2 className="text-5xl font-black uppercase tracking-tighter italic flex items-center gap-4 text-gray-900 leading-none">
              <Truck size={50} className="text-blue-600" /> Logística
            </h2>
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mt-2">Centro de Distribuição</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white px-6 py-3 rounded-2xl border-4 border-gray-100 shadow-sm text-center">
                 <p className="text-[10px] font-black uppercase text-gray-400">Pacotes Hoje</p>
                 <p className="text-2xl font-black text-gray-900 leading-none">{pedidosLogistica.length}</p>
             </div>
          </div>
        </div>

        {pedidosLogistica.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-30">
            <Truck size={120} strokeWidth={1} className="text-gray-400 mb-6" />
            <p className="text-3xl font-black uppercase italic text-gray-400 tracking-tighter">Nenhuma Entrega Pendente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {pedidosLogistica.map(p => (
              <div key={p.id_pedido} className={`bg-white rounded-[2.5rem] border-4 shadow-xl overflow-hidden flex flex-col ${p.status === 'Aguardando Entrega' ? 'border-gray-200' : 'border-blue-600'}`}>
                {/* HEADER DA ENTREGA */}
                <div className={`p-6 border-b-2 flex justify-between items-center ${p.status === 'Aguardando Entrega' ? 'bg-gray-50 border-gray-100' : 'bg-blue-600 text-white border-blue-700'}`}>
                  <div>
                      <span className="text-3xl font-black italic tracking-tighter">#{p.id_pedido}</span>
                      <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-80">{p.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleImprimirComprovante(p.id_pedido)} className={`p-3 rounded-xl transition-all ${p.status === 'Aguardando Entrega' ? 'bg-white text-gray-400 hover:text-gray-900 border-2' : 'bg-blue-700 text-white hover:bg-blue-800'}`}>
                        <Printer size={20} />
                    </button>
                    <button onClick={() => handleCancelar(p.id_pedido)} className={`p-3 rounded-xl transition-all ${p.status === 'Aguardando Entrega' ? 'bg-white text-red-500 hover:bg-red-50 border-2' : 'bg-blue-700 text-white hover:bg-red-600'}`}>
                        <Package size={20} className="rotate-45" />
                    </button>
                  </div>
                </div>

                {/* CORPO DA ENTREGA */}
                <div className="p-8 flex-1 space-y-6">
                  {/* DADOS DO CLIENTE */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <MapPin size={24} className="text-red-500 shrink-0 mt-1" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Endereço de Destino</p>
                        <p className="font-black text-sm uppercase text-gray-950 leading-tight mt-1">{p.endereco || "Retirada no Balcão"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Phone size={20} className="text-gray-400 shrink-0 mt-1 ml-1" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Cliente</p>
                        <p className="font-bold text-xs uppercase text-gray-900 mt-1">{p.cliente_nome}</p>
                      </div>
                    </div>
                  </div>

                  {/* RESUMO DO PEDIDO E FINANCEIRO */}
                  <div className="bg-gray-50 p-5 rounded-2xl border-2 border-gray-100 flex justify-between items-center">
                      <div>
                          <p className="text-[9px] font-black uppercase text-gray-400">Total a Cobrar</p>
                          <p className="font-black text-xl italic text-green-700">R$ {p.valor_total.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                          <p className="text-[9px] font-black uppercase text-gray-400">Itens</p>
                          <p className="font-black text-sm text-gray-900 flex items-center justify-end gap-1"><Package size={14}/> {p.itens.length}</p>
                      </div>
                  </div>
                </div>

                {/* AÇÕES DE LOGÍSTICA */}
                <div className="p-6 bg-gray-50 border-t-4 border-gray-100">
                  {p.status === 'Aguardando Entrega' ? (
                    <div className="space-y-4">
                      <select id={`select-moto-${p.id_pedido}`} className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 font-black text-xs uppercase outline-none focus:border-blue-500">
                        <option value="">--- ESCOLHA O MOTOBOY ---</option>
                        {motoboys.map(m => (<option key={m.cpf} value={m.cpf}>{m.nome} ({m.placa})</option>))}
                      </select>
                      <button onClick={() => despachar(p.id_pedido)} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase text-xs shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2">
                        <Truck size={16}/> Enviar para Rota
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => finalizar(p.id_pedido)} className="w-full bg-green-600 text-white py-6 rounded-2xl font-black uppercase text-sm shadow-xl hover:bg-green-700 active:scale-95 transition-all flex justify-center items-center gap-2">
                      <CheckCircle size={18}/> Confirmar Entrega
                    </button>
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
