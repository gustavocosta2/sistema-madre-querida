import { useState } from 'react'
import { api } from './api'
import { useMadre } from './context/MadreContext'
import type { Sabor, ItemCarrinho, ClienteBusca, Endereco } from './types'

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
import { NovaBebidaModal } from './components/modals/NovaBebidaModal'

function App() {
  const { user, setUser, loading, refreshAll, refreshOrders } = useMadre();
  const [view, setView] = useState<'pdv' | 'cozinha' | 'entregas' | 'gestao' | 'historico'>('pdv')
  
  // PDV Shared State (Apenas o que é efêmero/venda atual)
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteBusca | null>(null)
  const [enderecoEntrega, setEnderecoEntrega] = useState<Endereco | null>(null)

  // Modais Toggle
  const [saborConfigurando, setSaborConfigurando] = useState<Sabor | null>(null)
  const [custoPontosModal, setCustoPontosModal] = useState<number | null>(null)
  const [showNovoCliente, setShowNovoCliente] = useState(false)
  const [showNovoSabor, setShowNovoSabor] = useState(false)
  const [showNovaBebida, setShowNovaBebida] = useState(false)

  const handleFinalizarPedido = async () => {
    if (!clienteSelecionado || !enderecoEntrega) return;
    try {
      const pontosResgateTotal = carrinho.reduce((acc, item) => acc + (item.pago_com_pontos ? (item.custo_pontos || 0) : 0), 0);
      const payload = {
        cpf_cliente: clienteSelecionado.cpf,
        id_endereco_entrega: enderecoEntrega.id_endereco,
        pontos_resgatados: pontosResgateTotal,
        itens: carrinho.map(item => ({
          tipo: item.tipo, id_produto: item.tipo === 'bebida' ? item.id_original : null,
          sabores: item.sabores || [], id_tamanho: item.id_tamanho || null,
          id_borda: item.id_borda || null, preco: item.pago_com_pontos ? 0 : item.preco
        }))
      };
      await api.postPedido(payload);
      setCarrinho([]); setClienteSelecionado(null); setEnderecoEntrega(null); 
      refreshOrders(); alert("Pedido enviado com sucesso!");
    } catch { alert("Erro ao salvar pedido."); }
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#fcfaf7] text-[#b91c1c] font-black text-2xl animate-pulse uppercase italic tracking-tighter">Carregando Madre Querida...</div>
  if (!user) return <Login onLogin={setUser} />;

  return (
    <Layout view={view} setView={setView} user={user} onLogout={() => { localStorage.removeItem('madre_user'); setUser(null); }}>
      {view === 'pdv' && (
        <PDV 
          carrinho={carrinho} setCarrinho={setCarrinho}
          clienteSelecionado={clienteSelecionado} setClienteSelecionado={setClienteSelecionado}
          enderecoEntrega={enderecoEntrega} setEnderecoEntrega={setEnderecoEntrega}
          onFinalizar={handleFinalizarPedido}
          onOpenNovoCliente={() => setShowNovoCliente(true)}
          onOpenConfigPizza={(s, pontos) => { setSaborConfigurando(s); setCustoPontosModal(pontos || null); }}
        />
      )}
      
      {view === 'cozinha' && <Cozinha />}
      {view === 'entregas' && <Entregas />}
      {view === 'historico' && <Historico />}
      {view === 'gestao' && (
        <Gestao 
            onOpenNovoSabor={() => setShowNovoSabor(true)} 
            onOpenNovaBebida={() => setShowNovaBebida(true)} 
        />
      )}

      {/* RENDERIZAÇÃO DE MODAIS */}
      {saborConfigurando && (
        <ConfigPizzaModal 
          saborBase={saborConfigurando}
          onClose={() => { setSaborConfigurando(null); setCustoPontosModal(null); }}
          onConfirm={(cfg) => {
            setCarrinho([...carrinho, { 
              id: Math.random().toString(36).slice(2, 11), tipo: 'pizza', 
              nome: custoPontosModal ? `🎁 ${cfg.saborBase.nome_sabor}` : (cfg.saborExtra ? `½ ${cfg.saborBase.nome_sabor} / ½ ${cfg.saborExtra.nome_sabor}` : `Pizza ${cfg.saborBase.nome_sabor}`),
              preco: custoPontosModal ? 0 : cfg.preco, 
              pago_com_pontos: !!custoPontosModal, custo_pontos: custoPontosModal || 0,
              sabores: cfg.saborExtra ? [cfg.saborBase.id_sabor, cfg.saborExtra.id_sabor] : [cfg.saborBase.id_sabor],
              id_tamanho: cfg.tamanho.id_tamanho, id_borda: cfg.borda.id_borda, 
              detalhe: `${cfg.tamanho.nome_tamanho}${custoPontosModal ? ' (Resgate)' : ''}`
            }]);
            setSaborConfigurando(null); setCustoPontosModal(null);
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

      {showNovoSabor && <NovoSaborModal onClose={() => setShowNovoSabor(false)} onSuccess={() => { refreshAll(); setShowNovoSabor(false); }} />}
      {showNovaBebida && <NovaBebidaModal onClose={() => setShowNovaBebida(false)} onSuccess={() => { refreshAll(); setShowNovaBebida(false); }} />}
    </Layout>
  )
}

export default App
