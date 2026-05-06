import { useState, useEffect } from 'react';
import { api } from '../api';
import { useMadre } from '../context/MadreContext';
import type { ClienteBusca, Endereco, ItemCarrinho, Sabor } from '../types';

// Subcomponentes
import { PDVSearchClient } from './PDV/PDVSearchClient';
import { PDVProductList } from './PDV/PDVProductList';
import { PDVCart } from './PDV/PDVCart';

interface PDVProps {
  carrinho: ItemCarrinho[];
  setCarrinho: (c: ItemCarrinho[]) => void;
  clienteSelecionado: ClienteBusca | null;
  setClienteSelecionado: (c: ClienteBusca | null) => void;
  enderecoEntrega: Endereco | null;
  setEnderecoEntrega: (e: Endereco | null) => void;
  onFinalizar: (extra: any) => void;
  onOpenNovoCliente: () => void;
  onOpenConfigPizza: (s: Sabor, custoPontos?: number | null) => void;
}

export function PDV({ 
  carrinho, setCarrinho, clienteSelecionado, setClienteSelecionado,
  enderecoEntrega, setEnderecoEntrega, onFinalizar, onOpenNovoCliente, onOpenConfigPizza
}: PDVProps) {
  
  const { sabores, bebidas, precos, tamanhos } = useMadre();
  const [buscaCliente, setBuscaCliente] = useState('');
  const [sugestoesClientes, setSugestoesClientes] = useState<ClienteBusca[]>([]);
  const [enderecosCliente, setEnderecosCliente] = useState<Endereco[]>([]);
  const [ultimoPedido, setUltimoPedido] = useState<any>(null);
  const [pdvTab, setPdvTab] = useState<'pizzas' | 'bebidas'>('pizzas');

  // Campos de fechamento
  const [taxaEntrega, setTaxaEntrega] = useState(0);
  const [valorRecebido, setValorRecebido] = useState(0);
  const [quilometragem, setQuilometragem] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState('Dinheiro');
  const [editingCrm, setEditingCrm] = useState(false);
  const [tempObs, setTempObs] = useState('');

  const totalPedido = carrinho.reduce((a, b) => a + b.preco, 0) + taxaEntrega;
  const troco = valorRecebido > totalPedido ? valorRecebido - totalPedido : 0;

  useEffect(() => {
    if (formaPagamento !== 'Dinheiro' && totalPedido > 0) {
      setValorRecebido(totalPedido);
    }
  }, [formaPagamento, totalPedido]);

  useEffect(() => {
    if (buscaCliente.length > 2) {
      api.buscarClientes(buscaCliente).then(res => setSugestoesClientes(res.data || []));
    } else {
      setSugestoesClientes([]);
    }
  }, [buscaCliente]);

  const handleSelecionarCliente = async (c: ClienteBusca) => {
    setClienteSelecionado(c);
    setTempObs(c.observacao || '');
    setBuscaCliente('');
    setSugestoesClientes([]);
    try {
      const res = await api.getEnderecosCliente(c.cpf);
      const ends = res.data || [];
      setEnderecosCliente(ends);
      setEnderecoEntrega(ends[0] || null);
      api.getUltimoPedidoCliente(c.cpf).then(res => setUltimoPedido(res.data)).catch(() => setUltimoPedido(null));
    } catch (e) { console.error(e); }
  };

  const handleSaveCRM = async () => {
    if (!clienteSelecionado) return;
    try {
      await api.patchClienteCrm(clienteSelecionado.cpf, { observacao: tempObs });
      setClienteSelecionado({ ...clienteSelecionado, observacao: tempObs });
      setEditingCrm(false);
    } catch { alert("Erro ao salvar observação."); }
  };

  const isBirthdayMonth = () => {
    if (!clienteSelecionado?.data_nascimento) return false;
    return new Date(clienteSelecionado.data_nascimento).getMonth() === new Date().getMonth();
  };

  const getPrecoBaseSabor = (idSabor: number) => {
    const p = precos.find(p => p.id_sabor === idSabor && p.id_tamanho === (tamanhos[2]?.id_tamanho || 1));
    return p ? parseFloat(p.preco_base.toString()).toFixed(2) : '0.00';
  };

  const totalEmPontosNoCarrinho = carrinho.reduce((acc, item) => acc + (item.pago_com_pontos ? (item.custo_pontos || 0) : 0), 0);

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        
        <PDVSearchClient 
          buscaCliente={buscaCliente}
          setBuscaCliente={setBuscaCliente}
          clienteSelecionado={clienteSelecionado}
          setClienteSelecionado={setClienteSelecionado}
          sugestoesClientes={sugestoesClientes}
          handleSelecionarCliente={handleSelecionarCliente}
          onOpenNovoCliente={onOpenNovoCliente}
          isBirthdayMonth={isBirthdayMonth}
          totalEmPontosNoCarrinho={totalEmPontosNoCarrinho}
          editingCrm={editingCrm}
          setEditingCrm={setEditingCrm}
          tempObs={tempObs}
          setTempObs={setTempObs}
          handleSaveCRM={handleSaveCRM}
          ultimoPedido={ultimoPedido}
          setEnderecoEntrega={setEnderecoEntrega}
          setUltimoPedido={setUltimoPedido}
        />

        {/* TABS NAVEGAÇÃO */}
        <div className="max-w-4xl mx-auto flex gap-4 border-b border-gray-200">
          <button onClick={() => setPdvTab('pizzas')} className={`px-10 py-4 rounded-t-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${pdvTab === 'pizzas' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}>Pizzas</button>
          <button onClick={() => setPdvTab('bebidas')} className={`px-10 py-4 rounded-t-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${pdvTab === 'bebidas' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}>Bebidas</button>
        </div>

        <PDVProductList 
          pdvTab={pdvTab}
          sabores={sabores}
          bebidas={bebidas}
          clienteSelecionado={clienteSelecionado}
          totalEmPontosNoCarrinho={totalEmPontosNoCarrinho}
          getPrecoBaseSabor={getPrecoBaseSabor}
          onOpenConfigPizza={onOpenConfigPizza}
          setCarrinho={setCarrinho}
          carrinho={carrinho}
        />
      </div>

      <PDVCart 
        carrinho={carrinho}
        setCarrinho={setCarrinho}
        clienteSelecionado={clienteSelecionado}
        onOpenNovoCliente={onOpenNovoCliente}
        ultimoPedido={ultimoPedido}
        enderecosCliente={enderecosCliente}
        enderecoEntrega={enderecoEntrega}
        setEnderecoEntrega={setEnderecoEntrega}
        taxaEntrega={taxaEntrega}
        setTaxaEntrega={setTaxaEntrega}
        quilometragem={quilometragem}
        setQuilometragem={setQuilometragem}
        formaPagamento={formaPagamento}
        setFormaPagamento={setFormaPagamento}
        valorRecebido={valorRecebido}
        setValorRecebido={setValorRecebido}
        totalPedido={totalPedido}
        troco={troco}
        totalEmPontosNoCarrinho={totalEmPontosNoCarrinho}
        onFinalizar={onFinalizar}
      />
    </div>
  );
}
