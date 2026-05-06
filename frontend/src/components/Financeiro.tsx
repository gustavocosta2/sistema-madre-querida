import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, CheckCircle, Lock, Unlock, ClipboardList, Info } from 'lucide-react';

const Financeiro: React.FC = () => {
  const [caixaStatus, setCaixaStatus] = useState<any>(null);
  const [valorAbertura, setValorAbertura] = useState('');
  const [valorFechamento, setValorFechamento] = useState('');
  const [tipoMovimentacao, setTipoMovimentacao] = useState('Sangria');
  const [valorMovimentacao, setValorMovimentacao] = useState('');
  const [descMovimentacao, setDescMovimentacao] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.getCaixaStatus();
      setCaixaStatus(res.data);
    } catch (error) {
      console.error("Erro ao buscar status do caixa", error);
    } finally {
      setLoading(false);
    }
  };

  const preventNegativeInput = (e: React.KeyboardEvent) => {
    if (e.key === '-' || e.key === 'e') {
      e.preventDefault();
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleAbrirCaixa = async () => {
    const valor = parseFloat(valorAbertura);
    if (isNaN(valor) || valor < 0) return alert("Informe um valor de abertura válido (mínimo R$ 0,00)");
    
    try {
      await api.postAbrirCaixa({
        id_usuario_abertura: 1, // Mock por enquanto
        valor_abertura: valor,
        observacao: "Abertura manual"
      });
      alert("Caixa aberto com sucesso!");
      fetchStatus();
    } catch (error: any) {
      alert(error.response?.data?.detail?.[0]?.msg || error.response?.data?.detail || "Erro ao abrir caixa");
    }
  };

  const handleMovimentacao = async () => {
    const valor = parseFloat(valorMovimentacao);
    if (isNaN(valor) || valor <= 0) return alert("Informe um valor válido maior que zero");
    
    try {
      await api.postMovimentacaoCaixa({
        id_caixa: caixaStatus.id_caixa,
        tipo_movimentacao: tipoMovimentacao,
        forma_pagamento: "Dinheiro",
        valor: valor,
        descricao: descMovimentacao
      });
      alert("Movimentação registrada!");
      setValorMovimentacao('');
      setDescMovimentacao('');
      fetchStatus();
    } catch (error: any) {
      alert(error.response?.data?.detail?.[0]?.msg || error.response?.data?.detail || "Erro na movimentação");
    }
  };

  const handleFecharCaixa = async () => {
    const valor = parseFloat(valorFechamento);
    if (isNaN(valor) || valor < 0) return alert("Informe o valor contado no caixa (mínimo R$ 0,00)");
    
    try {
      const res = await api.postFecharCaixa({
        id_usuario_fechamento: 1, // Mock
        valor_fechamento_informado: valor,
        observacao: "Fechamento manual"
      });
      alert(`Caixa fechado!\nEsperado: R$ ${res.data.esperado.toFixed(2)}\nInformado: R$ ${res.data.informado.toFixed(2)}\nDiferença: R$ ${res.data.diferenca.toFixed(2)}`);
      fetchStatus();
    } catch (error: any) {
      alert(error.response?.data?.detail?.[0]?.msg || error.response?.data?.detail || "Erro ao fechar caixa");
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando dados financeiros...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
          <DollarSign className="text-green-600" /> GESTÃO FINANCEIRA
        </h1>
        <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${caixaStatus?.caixa_aberto ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {caixaStatus?.caixa_aberto ? 'Caixa Aberto' : 'Caixa Fechado'}
        </div>
      </div>

      {!caixaStatus?.caixa_aberto ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center space-y-4">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <Unlock className="text-gray-400" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-700">O Caixa está Fechado</h2>
            <p className="text-gray-500">Para registrar vendas e movimentações, você precisa abrir o caixa do dia.</p>
          </div>
          <div className="max-w-xs mx-auto pt-4">
            <label className="block text-left text-xs font-bold text-gray-400 mb-1 uppercase">Fundo de Caixa (R$)</label>
            <input 
              type="number" 
              placeholder="0.00"
              min="0"
              step="0.01"
              onKeyDown={preventNegativeInput}
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold text-center text-2xl focus:border-green-500 outline-none transition-all"
              value={valorAbertura}
              onChange={(e) => setValorAbertura(e.target.value)}
            />
            <button 
              onClick={handleAbrirCaixa}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
            >
              ABRIR CAIXA AGORA
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status do Caixa */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase">Fundo de Abertura</p>
                <p className="text-2xl font-black text-gray-700">R$ {caixaStatus.valor_abertura.toFixed(2)}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-400 uppercase">Saldo Esperado (Em mãos)</p>
                <p className="text-2xl font-black text-blue-700">R$ {caixaStatus.valor_esperado.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <ArrowDownCircle className="text-orange-500" size={18} /> LANÇAR MOVIMENTAÇÃO MANUAL
              </h3>

              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl">
                <div className="flex gap-3">
                    <Info className="text-amber-600 shrink-0" size={20} />
                    <div>
                        <p className="text-xs font-black uppercase text-amber-700 mb-1">Atenção: Vendas Automáticas</p>
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                          As vendas feitas no PDV já são lançadas <strong>automaticamente</strong> no caixa. 
                          Use este campo apenas para despesas extras (Sangria) ou entrada de troco (Suprimento).
                        </p>
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Tipo</label>
                  <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                    value={tipoMovimentacao}
                    onChange={(e) => setTipoMovimentacao(e.target.value)}
                  >
                    <option value="Sangria">Sangria (Saída de Dinheiro)</option>
                    <option value="Suprimento">Suprimento (Entrada de Dinheiro)</option>
                    <option value="Acerto Motoboy">Acerto de Motoboy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Valor (R$)</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    onKeyDown={preventNegativeInput}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                    placeholder="0.00"
                    value={valorMovimentacao}
                    onChange={(e) => setValorMovimentacao(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Motivo / Descrição</label>
                  <input 
                    type="text"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                    placeholder="Ex: Pagamento fornecedor de gás"
                    value={descMovimentacao}
                    onChange={(e) => setDescMovimentacao(e.target.value)}
                  />
                </div>
              </div>
              <button 
                onClick={handleMovimentacao}
                className="w-full bg-gray-800 hover:bg-black text-white font-bold py-3 rounded-lg transition-all"
              >
                REGISTRAR MOVIMENTAÇÃO
              </button>
            </div>
          </div>

          {/* Fechamento */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <Lock className="text-red-500" size={18} /> FECHAMENTO DE CAIXA
              </h3>
              <p className="text-sm text-gray-500">Conte todo o dinheiro físico da gaveta e informe o valor abaixo para conferência.</p>
              
              <div className="pt-4">
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Dinheiro Contado (R$)</label>
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  onKeyDown={preventNegativeInput}
                  className="w-full p-4 bg-red-50 border-2 border-red-100 rounded-xl font-black text-center text-3xl text-red-700 outline-none focus:border-red-500"
                  placeholder="0.00"
                  value={valorFechamento}
                  onChange={(e) => setValorFechamento(e.target.value)}
                />
              </div>
            </div>
            
            <button 
              onClick={handleFecharCaixa}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl shadow-lg shadow-red-100 transition-all"
            >
              ENCERRAR EXPEDIENTE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financeiro;
