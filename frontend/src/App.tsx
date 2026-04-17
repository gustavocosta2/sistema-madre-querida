import { useState, useEffect } from 'react'
import axios from 'axios'
import { Pizza, ShoppingCart, User, Plus, X, Check, AlertCircle } from 'lucide-react'

// Interfaces
interface Sabor {
  id_sabor: number;
  nome_sabor: string;
  ingredientes: string;
}

interface Tamanho {
  id_tamanho: number;
  nome_tamanho: string;
  qtd_sabor_max: number;
}

interface Borda {
  id_borda: number;
  tipo: string;
  preco_adicional: string;
}

interface Preco {
  id_sabor: number;
  id_tamanho: number;
  preco_base: string;
}

interface ItemCarrinho {
  id: string;
  id_sabor: number;
  id_tamanho: number;
  id_borda: number;
  nome: string;
  tamanho: string;
  borda: string;
  preco: number;
}

function App() {
  const [sabores, setSabores] = useState<Sabor[]>([])
  const [tamanhos, setTamanhos] = useState<Tamanho[]>([])
  const [bordas, setBordas] = useState<Borda[]>([])
  const [precos, setPrecos] = useState<Preco[]>([])
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  // Estado para o Modal
  const [saborSelecionado, setSaborSelecionado] = useState<Sabor | null>(null)
  const [tamanhoEscolhido, setTamanhoEscolhido] = useState<Tamanho | null>(null)
  const [bordaEscolhida, setBordaEscolhida] = useState<Borda | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [resSabores, resTamanhos, resBordas, resPrecos] = await Promise.all([
          axios.get('http://localhost:8000/sabores'),
          axios.get('http://localhost:8000/tamanhos'),
          axios.get('http://localhost:8000/bordas'),
          axios.get('http://localhost:8000/precos')
        ])
        setSabores(resSabores.data)
        setTamanhos(resTamanhos.data)
        setBordas(resBordas.data)
        setPrecos(resPrecos.data)
        setError(null)
      } catch (err) {
        console.error("Erro na API:", err)
        setError("Não foi possível conectar ao servidor da pizzaria.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const abrirCustomizacao = (sabor: Sabor) => {
    setSaborSelecionado(sabor)
    const grande = tamanhos.find(t => t.nome_tamanho === 'Grande') || tamanhos[0]
    setTamanhoEscolhido(grande || null)
    setBordaEscolhida(bordas[0] || null)
  }

  const calcularPrecoAtual = () => {
    if (!saborSelecionado || !tamanhoEscolhido) return 0
    const precoMatriz = precos.find(
      p => p.id_sabor === saborSelecionado.id_sabor && p.id_tamanho === tamanhoEscolhido.id_tamanho
    )
    const base = precoMatriz ? parseFloat(precoMatriz.preco_base) : 0
    const adicionalBorda = bordaEscolhida ? parseFloat(bordaEscolhida.preco_adicional) : 0
    return base + adicionalBorda
  }

  const confirmarAdicao = () => {
    if (!saborSelecionado || !tamanhoEscolhido || !bordaEscolhida) return
    const novoItem: ItemCarrinho = {
      id: Math.random().toString(36).substring(2, 11),
      id_sabor: saborSelecionado.id_sabor,
      id_tamanho: tamanhoEscolhido.id_tamanho,
      id_borda: bordaEscolhida.id_borda,
      nome: saborSelecionado.nome_sabor,
      tamanho: tamanhoEscolhido.nome_tamanho,
      borda: bordaEscolhida.tipo,
      preco: calcularPrecoAtual()
    }
    setCarrinho([...carrinho, novoItem])
    setSaborSelecionado(null)
  }

  const finalizarPedido = async () => {
    if (carrinho.length === 0) return
    
    setEnviando(true)
    try {
      const payload = {
        cpf_cliente: "111.111.111-11", // Usando o cliente de teste padrão
        itens: carrinho.map(item => ({
          id_sabor: item.id_sabor,
          id_tamanho: item.id_tamanho,
          id_borda: item.id_borda,
          preco: item.preco
        }))
      }

      const response = await axios.post('http://localhost:8000/pedidos', payload)
      alert(`Sucesso! Pedido #${response.data.id_pedido} enviado para a cozinha.`)
      setCarrinho([]) // Limpa o carrinho
    } catch (err) {
      console.error("Erro ao enviar pedido:", err)
      alert("Erro ao finalizar pedido. Tente novamente.")
    } finally {
      setEnviando(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-red-50 p-8 rounded-3xl border-2 border-red-200">
          <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-red-700 uppercase">Erro de Conexão</h2>
          <p className="mt-4 text-red-600 font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-6 bg-red-600 text-white px-6 py-3 rounded-xl font-bold">
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <header className="bg-madre-red text-white p-4 flex justify-between items-center shadow-lg shrink-0">
        <h1 className="text-xl font-black flex items-center gap-2 tracking-tighter uppercase">
          <Pizza className="rotate-12" /> Madre Querida PDV
        </h1>
        <div className="bg-black/20 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
          <User size={14} /> ADMIN
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* CARDÁPIO */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sabores.map(s => (
              <button
                key={s.id_sabor}
                onClick={() => abrirCustomizacao(s)}
                className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all text-left border-2 border-transparent hover:border-madre-red"
              >
                <h3 className="font-black text-lg uppercase">{s.nome_sabor}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.ingredientes}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-madre-green font-black">A partir R$ 25,00</span>
                  <div className="bg-gray-100 p-2 rounded-lg text-madre-red"><Plus size={20} /></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CARRINHO */}
        <div className="w-80 lg:w-96 bg-white border-l shadow-xl flex flex-col shrink-0">
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h2 className="font-black text-sm uppercase flex items-center gap-2"><ShoppingCart size={16} /> Pedido</h2>
            <span className="bg-madre-red text-white text-[10px] px-2 py-0.5 rounded font-black">{carrinho.length}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {carrinho.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 italic text-sm text-center">
                <ShoppingCart className="opacity-10 mb-2 mx-auto" size={40} />
                Nenhum item
              </div>
            ) : (
              carrinho.map(item => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex justify-between font-bold text-sm uppercase tracking-tight">
                    <span>{item.nome}</span>
                    <span>R$ {item.preco.toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold mt-1">
                    {item.tamanho} • Borda: {item.borda}
                  </div>
                  <button onClick={() => setCarrinho(carrinho.filter(i => i.id !== item.id))} className="text-[10px] text-red-500 mt-2 font-black uppercase underline">Remover</button>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-gray-50 border-t space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-gray-400 uppercase">Total</span>
              <span className="text-3xl font-black">R$ {carrinho.reduce((a, b) => a + b.preco, 0).toFixed(2)}</span>
            </div>
            <button 
              onClick={finalizarPedido}
              disabled={carrinho.length === 0 || enviando} 
              className="w-full bg-madre-green text-white py-4 rounded-xl font-black text-lg uppercase disabled:opacity-30 shadow-lg active:scale-95 transition-all"
            >
              {enviando ? "Enviando..." : "Finalizar Pedido"}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {saborSelecionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-madre-red p-6 text-white relative">
              <button onClick={() => setSaborSelecionado(null)} className="absolute top-4 right-4"><X /></button>
              <h2 className="text-2xl font-black uppercase tracking-tighter">{saborSelecionado.nome_sabor}</h2>
              <p className="text-xs opacity-80 mt-1">{saborSelecionado.ingredientes}</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Tamanho</label>
                <div className="grid grid-cols-4 gap-2">
                  {tamanhos.map(t => (
                    <button key={t.id_tamanho} onClick={() => setTamanhoEscolhido(t)} className={`py-2 text-[10px] font-black rounded-lg border-2 ${tamanhoEscolhido?.id_tamanho === t.id_tamanho ? 'border-madre-red bg-madre-red text-white' : 'border-gray-100 bg-gray-50'}`}>
                      {t.nome_tamanho}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Borda</label>
                <div className="grid grid-cols-2 gap-2">
                  {bordas.map(b => (
                    <button key={b.id_borda} onClick={() => setBordaEscolhida(b)} className={`p-3 text-[10px] font-black rounded-lg border-2 flex justify-between ${bordaEscolhida?.id_borda === b.id_borda ? 'border-madre-green bg-madre-green text-white' : 'border-gray-100 bg-gray-50'}`}>
                      <span>{b.tipo}</span>
                      <span className="opacity-60">{parseFloat(b.preco_adicional) > 0 ? `+${b.preco_adicional}` : ''}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-2xl font-black">R$ {calcularPrecoAtual().toFixed(2)}</span>
                <button onClick={confirmarAdicao} className="bg-madre-green text-white px-8 py-3 rounded-xl font-black uppercase flex items-center gap-2"><Check size={20} /> Adicionar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
