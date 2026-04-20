import { useState } from 'react'
import { api } from './api'
import type { Sabor, ItemCarrinho, ClienteBusca, Endereco } from './types'

// Hooks
import { useMadreData } from './hooks/useMadreData'

// Componentes
import { Layout } from './components/Layout'
import { Login } from './components/Login'
import { PDV } from './components/PDV'
import { Cozinha } from './components/Cozinha'
import { Entregas } from './components/Entregas'
import { Gestao } from './components/Gestao'
import { Historico } from './components/Historico'

// Modais
import { ConfigPizzaModal } from './components/modals/ConfigPizzaModal'
import { NovoClienteModal } from './components/modals/NovoClienteModal'
import { NovoSaborModal } from './components/modals/NovoSaborModal'

function App() {
  const [user, setUser] = useState<{username: string, role: string} | null>(() => {
    const saved = localStorage.getItem('madre_user');
    return saved ? JSON.parse(saved) : null;
  })

  const { 
    loading, sabores, tamanhos, bordas, precos, motoboys, bebidas, 
    pedidosAtivos, historicoPedidos, refreshOrders, loadReferenceData 
  } = useMadreData(user);

  const [view, setView] = useState<'pdv' | 'cozinha' | 'entregas' | 'gestao' | 'historico'>('pdv')
  
  // PDV State
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteBusca | null>(null)
  const [enderecoEntrega, setEnderecoEntrega] = useState<Endereco | null>(null)

  // Modais State
  const [saborConfigurando, setSaborConfigurando] = useState<Sabor | null>(null)
  const [showNovoCliente, setShowNovoCliente] = useState(false)
  const [showNovoSabor, setShowNovoSabor] = useState(false)

  const generateId = () => Math.random().toString(36).slice(2, 11);

  const handleFinalizarPedido = async () => {
    if (!clienteSelecionado || !enderecoEntrega) return;
    try {
      const payload = {
        cpf_cliente: clienteSelecionado.cpf,
        id_endereco_entrega: enderecoEntrega.id_endereco,
        itens: carrinho.map(item => ({
          tipo: item.tipo, id_produto: item.tipo === 'bebida' ? item.id_original : null,
          sabores: item.sabores || [], id_tamanho: item.id_tamanho || null,
          id_borda: item.id_borda || null, preco: item.preco
        }))
      };
      await api.postPedido(payload);
      setCarrinho([]); setClienteSelecionado(null); setEnderecoEntrega(null); 
      refreshOrders(); alert("Pedido enviado com sucesso!");
    } catch { alert("Erro ao salvar pedido."); }
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#fcfaf7] text-[#b91c1c] font-black text-2xl animate-pulse uppercase italic tracking-tighter">Madre Querida...</div>
  if (!user) return <Login onLogin={setUser} />;

  return (
    <Layout view={view} setView={setView} user={user} onLogout={() => { localStorage.removeItem('madre_user'); setUser(null); }}>
      {view === 'pdv' && (
        <PDV 
          sabores={sabores} bebidas={bebidas} precos={precos} tamanhos={tamanhos} bordas={bordas}
          carrinho={carrinho} setCarrinho={setCarrinho}
          clienteSelecionado={clienteSelecionado} setClienteSelecionado={setClienteSelecionado}
          enderecoEntrega={enderecoEntrega} setEnderecoEntrega={setEnderecoEntrega}
          onFinalizar={handleFinalizarPedido}
          onOpenNovoCliente={() => setShowNovoCliente(true)}
          onOpenConfigPizza={setSaborConfigurando}
          onAddBebida={(b) => setCarrinho([...carrinho, { id: generateId(), id_original: b.id_produto, tipo: 'bebida', nome: b.nome, preco: parseFloat(b.preco), detalhe: `${b.volume}ml` }])}
        />
      )}
      {view === 'cozinha' && <Cozinha pedidos={pedidosAtivos} refresh={refreshOrders} />}
      {view === 'entregas' && <Entregas pedidos={pedidosAtivos} motoboys={motoboys} refresh={refreshOrders} />}
      {view === 'historico' && <Historico pedidos={historicoPedidos} />}
      {view === 'gestao' && <Gestao sabores={sabores} refresh={loadReferenceData} onOpenNovoSabor={() => setShowNovoSabor(true)} />}

      {/* MODAIS ISOLADOS */}
      {saborConfigurando && (
        <ConfigPizzaModal 
          saborBase={saborConfigurando} sabores={sabores} tamanhos={tamanhos} bordas={bordas} precos={precos}
          onClose={() => setSaborConfigurando(null)}
          onConfirm={(cfg) => {
            setCarrinho([...carrinho, { 
              id: generateId(), tipo: 'pizza', nome: cfg.saborExtra ? `½ ${cfg.saborBase.nome_sabor} / ½ ${cfg.saborExtra.nome_sabor}` : `Pizza ${cfg.saborBase.nome_sabor}`,
              preco: cfg.preco, sabores: cfg.saborExtra ? [cfg.saborBase.id_sabor, cfg.saborExtra.id_sabor] : [cfg.saborBase.id_sabor],
              id_tamanho: cfg.tamanho.id_tamanho, id_borda: cfg.borda.id_borda, detalhe: `${cfg.tamanho.nome_tamanho} + Borda ${cfg.borda.tipo}`
            }]);
            setSaborConfigurando(null);
          }}
        />
      )}

      {showNovoCliente && (
        <NovoClienteModal 
          clienteSelecionado={clienteSelecionado} 
          onClose={() => setShowNovoCliente(false)}
          onSuccess={(cli, end) => { setClienteSelecionado(cli); setEnderecoEntrega(end); setShowNovoCliente(false); }}
        />
      )}

      {showNovoSabor && (
        <NovoSaborModal 
          onClose={() => setShowNovoSabor(false)} 
          onSuccess={() => { loadReferenceData(); setShowNovoSabor(false); }} 
        />
      )}
    </Layout>
  )
}

export default App
