import { ChefHat, Clock } from 'lucide-react';
import { useMadre } from '../context/MadreContext';
import { api } from '../api';

export function Cozinha() {
  const { pedidosAtivos, refreshOrders } = useMadre();
  const pedidosCozinha = pedidosAtivos.filter(p => ['Recebido', 'Em Preparo'].includes(p.status));

  const atualizarStatus = (id: number, atual: string) => {
    const proximo = atual === 'Recebido' ? 'Em Preparo' : 'Aguardando Entrega';
    api.patchStatusPedido(id, proximo).then(refreshOrders);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-[#f4f1ee]">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex justify-between items-center border-b-4 border-black/5 pb-8">
          <h2 className="text-5xl font-black uppercase tracking-tighter italic flex items-center gap-4 text-gray-900">
            <ChefHat size={50} className="text-[#b91c1c]" /> Produção
          </h2>
        </div>

        {pedidosCozinha.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-20">
            <ChefHat size={120} strokeWidth={1} className="text-gray-400 mb-6" />
            <p className="text-3xl font-black uppercase italic text-gray-400 tracking-tighter">Cozinha em Silêncio...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {pedidosCozinha.map(p => (
              <div key={p.id_pedido} className={`bg-white rounded-[3.5rem] border-8 overflow-hidden shadow-2xl transform transition-all hover:scale-[1.02] ${p.status === 'Recebido' ? 'border-red-500 bg-red-50/30' : 'border-orange-400 bg-orange-50/30'}`}>
                <div className={`p-8 flex justify-between items-center text-white ${p.status === 'Recebido' ? 'bg-red-500' : 'bg-orange-400'}`}>
                  <span className="text-5xl font-black italic">#{p.id_pedido}</span>
                  <div className="text-right flex flex-col items-end">
                    <p className="text-[10px] font-black bg-black/20 px-3 py-1 rounded-full mb-1">{p.status === 'Recebido' ? '🆕 NOVO' : '🔥 FORNO'}</p>
                    <div className="flex items-center gap-1 text-[10px] font-bold"><Clock size={12} /> {new Date(p.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    {p.itens?.map((i, idx) => (
                      <div key={idx} className="bg-white/80 p-6 rounded-3xl border-2 border-gray-100 group">
                        <p className="font-black text-xl uppercase text-gray-900 leading-tight">{i.sabor}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase mt-2 leading-relaxed">{i.ingredientes}</p>
                        <div className="flex items-center gap-2 mt-4">
                          <span className="bg-white text-gray-600 text-[8px] font-black px-2 py-1 rounded-full border border-gray-200 uppercase">{i.tamanho}</span>
                          {i.borda !== 'Sem Borda' && <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-2 py-1 rounded-full uppercase border border-amber-200">Borda {i.borda}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => atualizarStatus(p.id_pedido, p.status)} className={`w-full py-7 rounded-[2rem] font-black uppercase text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 ${p.status === 'Recebido' ? 'bg-red-500 text-white' : 'bg-orange-400 text-white'}`}>
                    {p.status === 'Recebido' ? "Iniciar" : "Concluir"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
