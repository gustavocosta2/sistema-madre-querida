import { ChefHat, Clock, AlertTriangle, Printer, ScrollText, Volume2, VolumeX } from 'lucide-react';
import { useMadre } from '../context/MadreContext';
import { api } from '../api';
import { useEffect, useState } from 'react';

export function Cozinha() {
  const { pedidosAtivos, refreshOrders, refreshAll, sabores, audioEnabled, setAudioEnabled, triggerPrint } = useMadre();
  const pedidosCozinha = pedidosAtivos.filter(p => ['Recebido', 'Em Preparo'].includes(p.status));
  const [agora, setAgora] = useState(new Date());

  // EFEITO 1: Atualiza o relógio interno a cada minuto para o cálculo de atraso
  useEffect(() => {
    const timer = setInterval(() => setAgora(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // EFEITO 2: AUTO-REFRESH (Monitor de Cozinha)
  // Busca novos pedidos no servidor a cada 15 segundos automaticamente
  useEffect(() => {
    const autoRefresh = setInterval(() => {
      refreshOrders();
    }, 15000); 
    return () => clearInterval(autoRefresh);
  }, [refreshOrders]);

  const atualizarStatus = (id: number, atual: string) => {
    const proximo = atual === 'Recebido' ? 'Em Preparo' : 'Aguardando Entrega';
    api.patchStatusPedido(id, proximo).then(refreshOrders);
  };

  const getTempoEspera = (dataHora: string) => {
    const diff = Math.floor((agora.getTime() - new Date(dataHora).getTime()) / 60000);
    return diff;
  };

  const getIngredientesSabor = (nomeSabor: string) => {
    const sabor = sabores.find(s => s.nome_sabor === nomeSabor);
    return sabor?.ingredientes || "";
  };

  const handleImprimirCozinha = (pedido: any) => {
    triggerPrint('cozinha', pedido);
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
    <div className="flex-1 p-10 overflow-y-auto bg-[#e8e4de]">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex justify-between items-end border-b-4 border-black/10 pb-8">
          <div>
            <h2 className="text-5xl font-black uppercase tracking-tighter italic flex items-center gap-4 text-gray-900 leading-none">
              <ChefHat size={50} className="text-[#b91c1c]" /> Tela de Produção
            </h2>
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mt-2">Pizzaria Madre Querida - {agora.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
          <div className="flex gap-4">
             <button 
                onClick={() => setAudioEnabled(!audioEnabled)} 
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl border-4 transition-all shadow-sm font-black uppercase text-[10px] ${audioEnabled ? 'bg-green-100 border-green-200 text-green-700' : 'bg-red-100 border-red-200 text-red-700'}`}
             >
                {audioEnabled ? <><Volume2 size={20}/> Áudio Ativo</> : <><VolumeX size={20}/> Áudio Mudo</>}
             </button>
             <div className="bg-white px-6 py-3 rounded-2xl border-4 border-gray-100 shadow-sm text-center">
                 <p className="text-[10px] font-black uppercase text-gray-400">Total na Fila</p>
                 <p className="text-2xl font-black text-gray-900 leading-none">{pedidosCozinha.length}</p>
             </div>
             <div className="bg-amber-400 px-6 py-3 rounded-2xl border-4 border-amber-500 shadow-sm text-center">
                 <p className="text-[10px] font-black uppercase text-amber-900">Auto-Update</p>
                 <p className="text-[10px] font-black text-amber-950 leading-none mt-1">ATIVO (15s)</p>
             </div>
          </div>
        </div>

        {pedidosCozinha.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-20">
            <ChefHat size={120} strokeWidth={1} className="text-gray-400 mb-6" />
            <p className="text-2xl font-bold uppercase text-gray-500 tracking-tight">Nenhum pedido em produção</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {pedidosCozinha.map(p => {
              const tempoEspera = getTempoEspera(p.data_hora);
              const estaAtrasado = tempoEspera > 30;

              return (
                <div key={p.id_pedido} className={`bg-white rounded-3xl border-2 overflow-hidden shadow-lg flex flex-col ${p.status === 'Recebido' ? 'border-gray-100' : 'border-amber-200'} ${estaAtrasado ? 'animate-pulse border-red-500' : ''}`}>
                  {/* CABEÇALHO DA COMANDA (Estilo Cupom) */}
                  <div className={`p-5 border-b-2 border-dashed flex justify-between items-start ${p.status === 'Recebido' ? 'bg-gray-50/50 border-gray-100 text-gray-900' : 'bg-amber-50 border-amber-100 text-amber-950'}`}>
                    <div>
                        <span className="text-3xl font-black italic tracking-tighter">#{p.id_pedido}</span>
                        <p className="text-[10px] font-bold uppercase mt-1 opacity-60 flex items-center gap-1 tracking-wider">
                            <Clock size={12}/> {new Date(p.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            <span className="ml-2 font-medium">({tempoEspera} min)</span>
                        </p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg ${p.status === 'Recebido' ? 'bg-gray-200 text-gray-600' : 'bg-amber-200 text-amber-800'}`}>
                        {p.status}
                      </span>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleImprimirCozinha(p)} className="text-current opacity-40 hover:opacity-100 transition-opacity"><Printer size={16}/></button>
                        <button onClick={() => handleCancelar(p.id_pedido)} className="text-red-700 opacity-40 hover:opacity-100 hover:scale-110 transition-all"><AlertTriangle size={16}/></button>
                      </div>
                    </div>
                  </div>

                  {estaAtrasado && (
                    <div className="bg-red-500 text-white p-2 text-center text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-2">
                        <AlertTriangle size={14}/> Pedido em Atraso
                    </div>
                  )}

                  {/* CORPO DA COMANDA */}
                  <div className="p-5 flex-1 bg-white space-y-4">
                      {p.itens?.map((i, idx) => (
                        <div key={idx} className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 shadow-sm relative">
                          <span className="absolute -left-3 -top-3 bg-gray-900 text-white w-7 h-7 flex items-center justify-center rounded-full font-black text-[10px] border-4 border-white shadow-sm">{i.quantidade}x</span>
                          
                          <p className="font-black text-base uppercase text-gray-900 leading-tight ml-1">
                            {i.tipo === 'pizza' ? (i.detalhes_pizza?.sabores.join(' / ')) : i.nome}
                          </p>

                          {/* INGREDIENTES DOS SABORES (Dica para o pizzaiolo) */}
                          {i.tipo === 'pizza' && i.detalhes_pizza && (
                            <div className="mt-2 ml-1 p-3 bg-white rounded-xl border border-gray-100/50">
                                <p className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1 mb-1.5"><ScrollText size={10}/> Composição:</p>
                                {i.detalhes_pizza.sabores.map((sNome, sIdx) => (
                                    <p key={sIdx} className="text-[10px] font-medium text-gray-600 leading-tight mb-1">
                                        <span className="text-[#b91c1c] font-bold">{sNome}:</span> {getIngredientesSabor(sNome)}
                                    </p>
                                ))}
                            </div>
                          )}
                          
                          {i.tipo === 'pizza' && i.detalhes_pizza && (
                            <div className="flex flex-wrap gap-2 mt-3 ml-1">
                                <span className="bg-gray-900 text-white text-[8px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">{i.detalhes_pizza.tamanho}</span>
                                {i.detalhes_pizza.borda !== 'Sem Borda' && <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-2.5 py-1 rounded-md uppercase border border-amber-200 tracking-wider">Borda {i.detalhes_pizza.borda}</span>}
                            </div>
                          )}
                          
                          {i.observacao && (
                            <div className="mt-3 ml-1 bg-red-50/50 border-l-2 border-red-500 p-2.5 rounded-r-lg">
                               <p className="text-[10px] font-bold uppercase text-red-800 italic leading-relaxed">Nota: {i.observacao}</p>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  {/* RODAPÉ E AÇÕES */}
                  <div className="p-5 bg-white border-t border-gray-100">
                    <button 
                        onClick={() => atualizarStatus(p.id_pedido, p.status)} 
                        className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-md active:scale-95 transition-all flex items-center justify-center gap-3 ${p.status === 'Recebido' ? 'bg-gray-900 text-white hover:bg-black' : 'bg-green-700 text-white hover:bg-green-800'}`}
                    >
                      {p.status === 'Recebido' ? "Iniciar Preparo" : "Concluir Produção"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
