import { useState, useEffect } from 'react'
import axios from 'axios'
import { Pizza, ShoppingCart, Plus, X, Check, ChefHat, Clock, ArrowRight } from 'lucide-react'

// --- INTERFACES ---
interface Sabor { id_sabor: number; nome_sabor: string; ingredientes: string; }
interface Tamanho { id_tamanho: number; nome_tamanho: string; }
interface Borda { id_borda: number; tipo: string; preco_adicional: string; }
interface Preco { id_sabor: number; id_tamanho: number; preco_base: string; }
interface ItemCarrinho { id: string; id_sabor: number; id_tamanho: number; id_borda: number; nome: string; tamanho: string; borda: string; preco: number; }

interface PedidoAtivo {
  id_pedido: number;
  status: string;
  data_hora: string;
  itens: {
    sabor: string;
    tamanho: string;
    borda: string;
    quantidade: number;
  }[];
}

function App() {
  const [view, setView] = useState<'pdv' | 'cozinha'>('pdv')
  const [loading, setLoading] = useState(true)
  
  // Dados fundamentais da API
  const [sabores, setSabores] = useState<Sabor[]>([])
  const [tamanhos, setTamanhos] = useState<Tamanho[]>([])
  const [bordas, setBordas] = useState<Borda[]>([])
  const [precos, setPrecos] = useState<Preco[]>([])

  // Estado das Telas
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [pedidosCozinha, setPedidosCozinha] = useState<PedidoAtivo[]>([])
  const [saborSelecionado, setSaborSelecionado] = useState<Sabor | null>(null)
  const [tamanhoEscolhido, setTamanhoEscolhido] = useState<Tamanho | null>(null)
  const [bordaEscolhida, setBordaEscolhida] = useState<Borda | null>(null)

  // 1. Carregar Dados Iniciais
  useEffect(() => {
    async function init() {
      try {
        const [s, t, b, p] = await Promise.all([
          axios.get('http://localhost:8000/sabores'),
          axios.get('http://localhost:8000/tamanhos'),
          axios.get('http://localhost:8000/bordas'),
          axios.get('http://localhost:8000/precos')
        ])
        setSabores(s.data || []);
        setTamanhos(t.data || []);
        setBordas(b.data || []);
        setPrecos(p.data || []);
        setLoading(false)
      } catch (err) {
        console.error("API Error", err)
        // Mesmo com erro, paramos o loading para mostrar a tela (mesmo que vazia)
        setLoading(false)
      }
    }
    init()
  }, [])

  // 2. Polling da Cozinha
  useEffect(() => {
    let timer: any;
    if (view === 'cozinha') {
      const load = () => axios.get('http://localhost:8000/pedidos/ativos').then(res => setPedidosCozinha(res.data || []))
      load()
      timer = setInterval(load, 5000)
    }
    return () => clearInterval(timer)
  }, [view])

  const abrirModal = (sabor: Sabor) => {
    setSaborSelecionado(sabor)
    // Proteção: só seleciona se houver dados
    if (tamanhos.length > 0) setTamanhoEscolhido(tamanhos.find(x => x.nome_tamanho === 'Grande') || tamanhos[0])
    if (bordas.length > 0) setBordaEscolhida(bordas[0])
  }

  const calcularPreco = () => {
    if (!saborSelecionado || !tamanhoEscolhido) return 0
    const itemPreco = precos.find(p => p.id_sabor === saborSelecionado.id_sabor && p.id_tamanho === tamanhoEscolhido.id_tamanho)
    const base = itemPreco ? parseFloat(itemPreco.preco_base) : 0
    const extra = bordaEscolhida ? parseFloat(bordaEscolhida.preco_adicional) : 0
    return base + extra
  }

  const adicionarAoCarrinho = () => {
    if (!saborSelecionado || !tamanhoEscolhido || !bordaEscolhida) return
    const novo: ItemCarrinho = {
      id: Math.random().toString(36).substring(7),
      id_sabor: saborSelecionado.id_sabor,
      id_tamanho: tamanhoEscolhido.id_tamanho,
      id_borda: bordaEscolhida.id_borda,
      nome: saborSelecionado.nome_sabor,
      tamanho: tamanhoEscolhido.nome_tamanho,
      borda: bordaEscolhida.tipo,
      preco: calcularPreco()
    }
    setCarrinho([...carrinho, novo])
    setSaborSelecionado(null)
  }

  const mudarStatus = async (id: number, atual: string) => {
    const map: any = { "Recebido": "Em Preparo", "Em Preparo": "Aguardando Entrega", "Aguardando Entrega": "Finalizado" }
    await axios.patch(`http://localhost:8000/pedidos/${id}/status?novo_status=${map[atual]}`)
    const res = await axios.get('http://localhost:8000/pedidos/ativos')
    setPedidosCozinha(res.data || [])
  }

  if (loading) return <div style={{height: '100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f3f4f6', fontWeight:'bold'}}>CONECTANDO À PIZZARIA...</div>

  return (
    <div className="h-screen w-full flex flex-col bg-gray-100 overflow-hidden font-sans text-gray-900">
      {/* NAVBAR */}
      <header className="bg-madre-red text-white p-3 flex justify-between items-center shadow-md z-50">
        <div className="flex items-center gap-4">
          <span className="font-black text-xl flex items-center gap-2 uppercase italic tracking-tighter"><Pizza size={24}/> Madre Querida</span>
          <div className="flex bg-black/20 p-1 rounded-lg">
            <button onClick={() => setView('pdv')} className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${view === 'pdv' ? 'bg-white text-madre-red shadow' : 'text-white'}`}>Vendas</button>
            <button onClick={() => setView('cozinha')} className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${view === 'cozinha' ? 'bg-white text-madre-red shadow' : 'text-white'}`}>Cozinha</button>
          </div>
        </div>
      </header>

      {view === 'pdv' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* CATALOGO */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
            {sabores.map(s => (
              <button key={s.id_sabor} onClick={() => abrirModal(s)} className="bg-white p-6 rounded-3xl shadow-sm border-2 border-transparent hover:border-madre-red transition-all text-left">
                <h3 className="font-black text-lg uppercase">{s.nome_sabor}</h3>
                <p className="text-[10px] text-gray-400 mt-1 mb-4 uppercase leading-tight line-clamp-2">{s.ingredientes}</p>
                <div className="flex justify-between items-center"><span className="text-madre-green font-black text-xl">R$ 25,00+</span><div className="bg-gray-100 p-2 rounded-xl text-madre-red"><Plus size={20}/></div></div>
              </button>
            ))}
          </div>
          {/* CARRINHO */}
          <div className="w-80 lg:w-96 bg-white border-l shadow-2xl flex flex-col shrink-0">
             <div className="p-4 bg-gray-50 border-b font-black text-xs uppercase flex justify-between"><span>Pedido Atual</span><span className="text-madre-red">{carrinho.length} itens</span></div>
             <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {carrinho.map(i => (
                  <div key={i.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="font-black text-[10px] uppercase">{i.nome}</p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase">{i.tamanho} • {i.borda}</p>
                    <div className="flex justify-between items-end mt-1">
                      <button onClick={() => setCarrinho(carrinho.filter(x => x.id !== i.id))} className="text-[8px] text-red-500 font-black uppercase underline">Remover</button>
                      <span className="text-sm font-black text-madre-green">R$ {i.preco.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
             </div>
             <div className="p-6 bg-gray-50 border-t space-y-4">
                <div className="flex justify-between items-baseline"><span className="text-[10px] font-black text-gray-400 uppercase">Total</span><span className="text-3xl font-black">R$ {carrinho.reduce((a,b) => a+b.preco, 0).toFixed(2)}</span></div>
                <button onClick={() => axios.post('http://localhost:8000/pedidos', { itens: carrinho.map(c => ({ id_sabor: c.id_sabor, id_tamanho: c.id_tamanho, id_borda: c.id_borda, preco: c.preco })) }).then(() => { alert("Sucesso!"); setCarrinho([]) })} disabled={carrinho.length === 0} className="w-full bg-madre-green text-white py-4 rounded-2xl font-black text-lg uppercase shadow-lg">Finalizar</button>
             </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-gray-900 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pedidosCozinha.map(p => (
              <div key={p.id_pedido} className={`rounded-[2rem] border-4 overflow-hidden ${p.status === 'Recebido' ? 'border-red-600' : 'border-yellow-500'}`}>
                <div className={`p-4 font-black text-white flex justify-between ${p.status === 'Recebido' ? 'bg-red-600' : 'bg-yellow-500'}`}>
                  <span>#{p.id_pedido}</span>
                  <span className="text-[10px] uppercase opacity-70">{p.status}</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="space-y-2">
                    {p.itens.map((i, idx) => (
                      <div key={idx} className="bg-white/5 p-2 rounded-xl border border-white/5">
                        <p className="text-white font-black text-xs uppercase tracking-tight">{i.sabor}</p>
                        <p className="text-[8px] text-white/30 font-bold uppercase">{i.tamanho} • {i.borda}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => mudarStatus(p.id_pedido, p.status)} className={`w-full py-3 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 ${p.status === 'Recebido' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-black'}`}>
                    {p.status === 'Recebido' ? "Preparar" : "Finalizar"} <ArrowRight size={14}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL */}
      {saborSelecionado && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden">
            <div className="bg-madre-red p-6 text-white flex justify-between">
              <h2 className="text-2xl font-black uppercase tracking-tighter">{saborSelecionado.nome_sabor}</h2>
              <button onClick={() => setSaborSelecionado(null)}><X/></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-4 gap-2">
                {tamanhos.map(t => (
                  <button key={t.id_tamanho} onClick={() => setTamanhoEscolhido(t)} className={`py-2 text-[8px] font-black rounded-lg border-2 ${tamanhoEscolhido?.id_tamanho === t.id_tamanho ? 'border-madre-red bg-madre-red text-white' : 'border-gray-100 bg-gray-50'}`}>{t.nome_tamanho}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {bordas.map(b => (
                  <button key={b.id_borda} onClick={() => setBordaEscolhida(b)} className={`p-3 text-[8px] font-black rounded-lg border-2 flex justify-between ${bordaEscolhida?.id_borda === b.id_borda ? 'border-madre-green bg-madre-green text-white' : 'border-gray-100 bg-gray-50'}`}>
                    <span>{b.tipo}</span>
                    <span className="opacity-50">+{b.preco_adicional}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-2xl font-black">R$ {calcularPreco().toFixed(2)}</span>
                <button onClick={adicionarAoCarrinho} className="bg-madre-green text-white px-8 py-3 rounded-xl font-black text-sm">ADICIONAR</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
