import { ChefHat, Clock, AlertTriangle, Printer, ScrollText, Volume2, VolumeX } from 'lucide-react';
import { useMadre } from '../context/MadreContext';
import { api } from '../api';
import { useEffect, useState } from 'react';

export function Cozinha() {
  const { pedidosAtivos, refreshOrders, refreshAll, sabores, audioEnabled, setAudioEnabled } = useMadre();
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

  const handleImprimirCozinha = (id: number) => {
    alert(`Enviando comanda #${id} para a impressora térmica da cozinha...`);
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
          <div className="flex flex-col items-center justify-center py-32 opacity-30">
            <ChefHat size={120} strokeWidth={1} className="text-gray-400 mb-6" />
            <p className="text-3xl font-black uppercase italic text-gray-400 tracking-tighter">Cozinha Vazia...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {pedidosCozinha.map(p => {
              const tempoEspera = getTempoEspera(p.data_hora);
              const estaAtrasado = tempoEspera > 30;

              return (
                <div key={p.id_pedido} className={`bg-white rounded-[2rem] border-8 overflow-hidden shadow-2xl flex flex-col ${p.status === 'Recebido' ? 'border-gray-200' : 'border-amber-400'} ${estaAtrasado ? 'animate-pulse border-red-600' : ''}`}>
                  {/* CABEÇALHO DA COMANDA (Estilo Cupom) */}
                  <div className={`p-6 border-b-4 border-dashed flex justify-between items-start ${p.status === 'Recebido' ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-amber-400 border-amber-500 text-amber-950'}`}>
                    <div>
                        <span className="text-4xl font-black italic tracking-tighter">#{p.id_pedido}</span>
                        <p className="text-[10px] font-black uppercase mt-1 opacity-70 flex items-center gap-1">
                            <Clock size={12}/> {new Date(p.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            <span className="ml-2">({tempoEspera} min)</span>
                        </p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${p.status === 'Recebido' ? 'bg-gray-200 text-gray-600' : 'bg-amber-900 text-amber-100'}`}>
                        {p.status}
                      </span>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleImprimirCozinha(p.id_pedido)} className="text-current opacity-50 hover:opacity-100"><Printer size={16}/></button>
                        <button onClick={() => handleCancelar(p.id_pedido)} className="text-red-700 opacity-50 hover:opacity-100 hover:scale-110 transition-all"><AlertTriangle size={16}/></button>
                      </div>
                    </div>
                  </div>

                  {estaAtrasado && (
                    <div className="bg-red-600 text-white p-2 text-center text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-2">
                        <AlertTriangle size={14}/> Pedido Atrasado
                    </div>
                  )}

                  {/* CORPO DA COMANDA */}
                  <div className="p-6 flex-1 bg-[#fffaeb] space-y-4">
                      {p.itens?.map((i, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm relative">
                          <span className="absolute -left-3 -top-3 bg-black text-white w-8 h-8 flex items-center justify-center rounded-full font-black text-xs border-4 border-[#fffaeb]">{i.quantidade}x</span>
                          
                          <p className="font-black text-lg uppercase text-gray-900 leading-tight ml-2">
                            {i.tipo === 'pizza' ? (i.detalhes_pizza?.sabores.join(' / ')) : i.nome}
                          </p>

                          {/* INGREDIENTES DOS SABORES (Dica para o pizzaiolo) */}
                          {i.tipo === 'pizza' && i.detalhes_pizza && (
                            <div className="mt-2 ml-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1 mb-1"><ScrollText size={10}/> Receita:</p>
                                {i.detalhes_pizza.sabores.map((sNome, sIdx) => (
                                    <p key={sIdx} className="text-[10px] font-bold text-gray-600 leading-tight mb-1">
                                        <span className="text-[#b91c1c]">{sNome}:</span> {getIngredientesSabor(sNome)}
                                    </p>
                                ))}
                            </div>
                          )}
                          
                          {i.tipo === 'pizza' && i.detalhes_pizza && (
                            <div className="flex flex-wrap gap-2 mt-3 ml-2">
                                <span className="bg-gray-900 text-white text-[9px] font-black px-3 py-1 rounded-lg uppercase">{i.detalhes_pizza.tamanho}</span>
                                {i.detalhes_pizza.borda !== 'Sem Borda' && <span className="bg-yellow-100 text-yellow-800 text-[9px] font-black px-3 py-1 rounded-lg uppercase border border-yellow-200">Borda {i.detalhes_pizza.borda}</span>}
                            </div>
                          )}
                          
                          {i.observacao && (
                            <div className="mt-3 ml-2 bg-red-50 border-l-4 border-red-500 p-2">
                               <p className="text-[10px] font-black uppercase text-red-700 italic">⚠️ {i.observacao}</p>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  {/* RODAPÉ E AÇÕES */}
                  <div className="p-6 bg-white border-t-4 border-gray-100">
                    <button 
                        onClick={() => atualizarStatus(p.id_pedido, p.status)} 
                        className={`w-full py-6 rounded-2xl font-black uppercase text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 ${p.status === 'Recebido' ? 'bg-gray-900 text-white hover:bg-black' : 'bg-green-600 text-white hover:bg-green-700'}`}
                    >
                      {p.status === 'Recebido' ? "Iniciar Preparo" : "Pronto para Entrega"}
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
