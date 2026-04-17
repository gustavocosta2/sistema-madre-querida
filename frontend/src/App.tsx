import { useState, useEffect } from 'react'
import axios from 'axios'
import { Pizza, ShoppingCart, Plus, X, Check, ChefHat, Clock, ArrowRight, Truck, Bike } from 'lucide-react'

// --- INTERFACES ---
interface Sabor { id_sabor: number; nome_sabor: string; ingredientes: string; }
interface Tamanho { id_tamanho: number; nome_tamanho: string; }
interface Borda { id_borda: number; tipo: string; preco_adicional: string; }
interface Preco { id_sabor: number; id_tamanho: number; preco_base: string; }
interface ItemCarrinho { id: string; id_sabor: number; id_tamanho: number; id_borda: number; nome: string; tamanho: string; borda: string; preco: number; }
interface Motoboy { cpf: string; nome: string; placa: string; vinculo: string; }

interface PedidoAtivo {
  id_pedido: number;
  status: string;
  data_hora: string;
  itens: { sabor: string; tamanho: string; borda: string; quantidade: number; }[];
}

function App() {
  const [view, setView] = useState<'pdv' | 'cozinha' | 'entregas'>('pdv')
  const [loading, setLoading] = useState(true)
  
  const [sabores, setSabores] = useState<Sabor[]>([])
  const [tamanhos, setTamanhos] = useState<Tamanho[]>([])
  const [bordas, setBordas] = useState<Borda[]>([])
  const [precos, setPrecos] = useState<Preco[]>([])
  const [motoboys, setMotoboys] = useState<Motoboy[]>([])

  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [saborSelecionado, setSaborSelecionado] = useState<Sabor | null>(null)
  const [tamanhoEscolhido, setTamanhoEscolhido] = useState<Tamanho | null>(null)
  const [bordaEscolhida, setBordaEscolhida] = useState<Borda | null>(null)

  const [pedidosAtivos, setPedidosAtivos] = useState<PedidoAtivo[]>([])
  const [motoboySelecionado, setMotoboySelecionado] = useState<string>('')

  useEffect(() => {
    async function init() {
      try {
        const [s, t, b, p, m] = await Promise.all([
          axios.get('http://localhost:8000/sabores'),
          axios.get('http://localhost:8000/tamanhos'),
          axios.get('http://localhost:8000/bordas'),
          axios.get('http://localhost:8000/precos'),
          axios.get('http://localhost:8000/motoboys')
        ])
        setSabores(s.data || []); setTamanhos(t.data || []); setBordas(b.data || []); setPrecos(p.data || []); setMotoboys(m.data || []);
      } catch (err) { console.error(err) } finally { setLoading(false) }
    }
    init()
  }, [])

  useEffect(() => {
    const fetch = () => axios.get('http://localhost:8000/pedidos/ativos').then(res => setPedidosAtivos(res.data || []))
    fetch()
    const timer = setInterval(fetch, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleAbrirModal = (s: Sabor) => {
    if (!s) return;
    setSaborSelecionado(s);
    // Seleção segura de valores iniciais
    if (tamanhos && tamanhos.length > 0) {
        const grande = tamanhos.find(x => x.nome_tamanho === 'Grande');
        setTamanhoEscolhido(grande || tamanhos[0]);
    }
    if (bordas && bordas.length > 0) {
        setBordaEscolhida(bordas[0]);
    }
  }

  const calcularPreco = () => {
    if (!saborSelecionado || !tamanhoEscolhido || !precos) return 0;
    const item = precos.find(p => p.id_sabor === saborSelecionado.id_sabor && p.id_tamanho === tamanhoEscolhido.id_tamanho);
    const base = item ? parseFloat(item.preco_base) : 0;
    const extra = bordaEscolhida ? parseFloat(bordaEscolhida.preco_adicional) : 0;
    return base + extra;
  }

  const handleFinalizarPedido = () => {
    if (carrinho.length === 0) return;
    const payload = { itens: carrinho.map(i => ({ id_sabor: i.id_sabor, id_tamanho: i.id_tamanho, id_borda: i.id_borda, preco: i.preco })) };
    setCarrinho([]);
    axios.post('http://localhost:8000/pedidos', payload).catch(() => console.error("Erro no envio"));
  }

  const handleMudarStatus = (id: number, atual: string) => {
    const map: any = { "Recebido": "Em Preparo", "Em Preparo": "Aguardando Entrega", "Em Rota": "Finalizado" };
    const novo = map[atual];
    if (!novo) return;
    setPedidosAtivos(prev => prev.map(p => p.id_pedido === id ? { ...p, status: novo } : p));
    axios.patch(`http://localhost:8000/pedidos/${id}/status?novo_status=${novo}`).catch(() => {});
  }

  const handleDespachar = (id: number) => {
    if (!motoboySelecionado) return;
    setPedidosAtivos(prev => prev.map(p => p.id_pedido === id ? { ...p, status: 'Em Rota' } : p));
    axios.patch(`http://localhost:8000/pedidos/${id}/despachar?cpf_motoboy=${motoboySelecionado}`).catch(() => {});
    setMotoboySelecionado('');
  }

  if (loading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold'}}>MADRE QUERIDA: CONECTANDO...</div>

  return (
    <div className="h-screen w-full flex flex-col bg-gray-100 overflow-hidden font-sans text-gray-900">
      <header className="bg-madre-red text-white p-3 flex justify-between items-center shadow-md z-50">
        <div className="flex items-center gap-4">
          <span className="font-black text-xl flex items-center gap-2 uppercase tracking-tighter italic"><Pizza size={24}/> Madre Querida</span>
          <div className="flex bg-black/20 p-1 rounded-lg">
            <button onClick={() => setView('pdv')} className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${view === 'pdv' ? 'bg-white text-madre-red shadow' : 'text-white'}`}>Vendas</button>
            <button onClick={() => setView('cozinha')} className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${view === 'cozinha' ? 'bg-white text-madre-red shadow' : 'text-white'}`}>Cozinha</button>
            <button onClick={() => setView('entregas')} className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${view === 'entregas' ? 'bg-white text-madre-red shadow' : 'text-white'}`}>Entregas</button>
          </div>
        </div>
      </header>

      {view === 'pdv' && (
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
            {sabores.map(s => (
              <button key={s.id_sabor} onClick={() => handleAbrirModal(s)} className="bg-white p-6 rounded-3xl shadow-sm border-2 border-transparent hover:border-madre-red transition-all text-left">
                <h3 className="font-black text-lg uppercase">{s.nome_sabor}</h3>
                <p className="text-[10px] text-gray-400 mt-1 mb-4 uppercase leading-tight line-clamp-2">{s.ingredientes}</p>
                <div className="flex justify-between items-center"><span className="text-madre-green font-black text-xl">R$ 25,00+</span><div className="bg-gray-100 p-2 rounded-xl text-madre-red"><Plus size={20}/></div></div>
              </button>
            ))}
          </div>
          <div className="w-80 lg:w-96 bg-white border-l shadow-2xl flex flex-col shrink-0">
             <div className="p-4 bg-gray-50 border-b font-black text-xs uppercase flex justify-between"><span>Pedido</span><span className="text-madre-red">{carrinho.length} itens</span></div>
             <div className="flex-1 overflow-y-auto p-4 space-y-2 text-center">
                {carrinho.length === 0 ? <div className="mt-20 opacity-10 font-black text-3xl">Vazio</div> : 
                  carrinho.map(i => (
                    <div key={i.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 relative text-left">
                      <button onClick={() => setCarrinho(carrinho.filter(x => x.id !== i.id))} className="absolute top-2 right-2 text-gray-300 hover:text-red-500"><X size={14}/></button>
                      <p className="font-black text-[10px] uppercase">{i.nome}</p>
                      <p className="text-[8px] text-gray-400 font-bold uppercase">{i.tamanho} • {i.borda}</p>
                      <p className="text-sm font-black text-madre-green mt-1 text-right">R$ {i.preco.toFixed(2)}</p>
                    </div>
                  ))
                }
             </div>
             <div className="p-6 bg-gray-50 border-t space-y-4">
                <div className="flex justify-between items-baseline"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</span><span className="text-4xl font-black">R$ {carrinho.reduce((a,b) => a+b.preco, 0).toFixed(2)}</span></div>
                <button onClick={handleFinalizarPedido} disabled={carrinho.length === 0} className="w-full bg-madre-green text-white py-5 rounded-2xl font-black text-xl uppercase shadow-xl hover:bg-green-700 active:scale-95 transition-all">Finalizar</button>
             </div>
          </div>
        </div>
      )}

      {view === 'cozinha' && (
        <div className="flex-1 bg-gray-950 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pedidosAtivos.filter(p => p.status === 'Recebido' || p.status === 'Em Preparo').map(p => (
              <div key={p.id_pedido} className={`rounded-[2rem] border-4 overflow-hidden ${p.status === 'Recebido' ? 'border-red-600 bg-red-600/5' : 'border-yellow-500 bg-yellow-500/5'}`}>
                <div className={`p-4 font-black text-white flex justify-between ${p.status === 'Recebido' ? 'bg-red-600' : 'bg-yellow-500'}`}><span>#{p.id_pedido}</span><span className="text-[10px] uppercase opacity-70">{p.status}</span></div>
                <div className="p-5 space-y-4">
                  <div className="space-y-2">
                    {p.itens && p.itens.map((i, idx) => (
                      <div key={idx} className="bg-white/5 p-2 rounded-xl border border-white/5">
                        <p className="text-white font-black text-xs uppercase tracking-tight">{i.sabor}</p>
                        <p className="text-[8px] text-white/30 font-bold uppercase">{i.tamanho} • {i.borda}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => handleMudarStatus(p.id_pedido, p.status)} className={`w-full py-3 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 ${p.status === 'Recebido' ? 'bg-red-600 text-white shadow-lg' : 'bg-yellow-500 text-black shadow-lg'}`}>
                    {p.status === 'Recebido' ? "Preparar" : "Pronto"} <ArrowRight size={14}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
          {pedidosAtivos.filter(p => p.status === 'Recebido' || p.status === 'Em Preparo').length === 0 && <div className="h-64 flex items-center justify-center text-white/10 text-5xl font-black italic uppercase">Cozinha Vazia</div>}
        </div>
      )}

      {view === 'entregas' && (
        <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-widest px-2 flex items-center gap-2"><Truck size={14}/> Para Despachar</h3>
               {pedidosAtivos.filter(p => p.status === 'Aguardando Entrega').map(p => (
                 <div key={p.id_pedido} className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-gray-200 flex flex-col gap-4">
                    <span className="text-2xl font-black">#{p.id_pedido}</span>
                    <div className="flex gap-2">
                      <select onChange={(e) => setMotoboySelecionado(e.target.value)} className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 font-bold text-xs">
                        <option value="">Motoboy</option>
                        {motoboys.map(m => <option key={m.cpf} value={m.cpf}>[{m.vinculo === 'Próprio' ? 'CASA' : 'FREE'}] {m.nome}</option>)}
                      </select>
                      <button onClick={() => handleDespachar(p.id_pedido)} className="bg-madre-green text-white p-4 rounded-xl shadow-lg"><Bike/></button>
                    </div>
                 </div>
               ))}
            </div>
            <div className="space-y-4">
               <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-widest px-2 flex items-center gap-2"><Bike size={14}/> Em Entrega</h3>
               {pedidosAtivos.filter(p => p.status === 'Em Rota').map(p => (
                 <div key={p.id_pedido} className="bg-white p-6 rounded-[2rem] shadow-md border-2 border-madre-green/20 flex flex-col gap-4">
                    <div className="flex justify-between items-center"><span className="text-2xl font-black">#{p.id_pedido}</span><Bike className="text-madre-green animate-bounce"/></div>
                    <button onClick={() => handleMudarStatus(p.id_pedido, 'Em Rota')} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-xs">Confirmar Recebimento</button>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      {saborSelecionado && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-madre-red p-6 text-white flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase tracking-tighter">{saborSelecionado.nome_sabor}</h2>
              <button onClick={() => setSaborSelecionado(null)}><X/></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-4 gap-2">
                {tamanhos.map(t => (
                  <button key={t.id_tamanho} onClick={() => setTamanhoEscolhido(t)} className={`py-2 text-[8px] font-black rounded-lg border-2 transition-all ${tamanhoEscolhido?.id_tamanho === t.id_tamanho ? 'border-madre-red bg-madre-red text-white shadow-md' : 'border-gray-100 bg-gray-50'}`}>{t.nome_tamanho}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {bordas.map(b => (
                  <button key={b.id_borda} onClick={() => setBordaEscolhida(b)} className={`p-3 text-[8px] font-black rounded-lg border-2 flex justify-between items-center transition-all ${bordaEscolhida?.id_borda === b.id_borda ? 'border-madre-green bg-madre-green text-white shadow-md' : 'border-gray-100 bg-gray-50'}`}>
                    <span>{b.tipo}</span>
                    <span className="opacity-50">+{b.preco_adicional}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-left"><span className="text-[10px] font-bold text-gray-400 uppercase block">Subtotal</span><span className="text-2xl font-black tracking-tight">R$ {calcularPreco().toFixed(2)}</span></div>
                <button onClick={() => {
                  const novo = { id: Math.random().toString(36).substring(7), id_sabor: saborSelecionado.id_sabor, id_tamanho: tamanhoEscolhido?.id_tamanho || 0, id_borda: bordaEscolhida?.id_borda || 0, nome: saborSelecionado.nome_sabor, tamanho: tamanhoEscolhido?.nome_tamanho || '', borda: bordaEscolhida?.tipo || '', preco: calcularPreco() };
                  setCarrinho([...carrinho, novo]);
                  setSaborSelecionado(null);
                }} className="bg-madre-green text-white px-8 py-3 rounded-xl font-black text-sm active:scale-95 transition-all shadow-lg shadow-green-500/20">ADICIONAR</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
