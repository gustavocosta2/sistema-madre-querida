import { X } from 'lucide-react';
import { useState } from 'react';
import { api } from '../../api';
import type { ClienteBusca } from '../../types';

interface NovoClienteModalProps {
  clienteSelecionado: ClienteBusca | null;
  onClose: () => void;
  onSuccess: (cliente: ClienteBusca, endereco: any) => void;
}

export function NovoClienteModal({ clienteSelecionado, onClose, onSuccess }: NovoClienteModalProps) {
  const [novoCli, setNovoCli] = useState({ 
    cpf: '', nome: '', logradouro: '', numero: '', 
    bairro: '', complemento: '', cep: '', ponto_referencia: '',
    telefone: '', data_nascimento: '', observacao: ''
  });

  const handleSalvar = async () => {
    try {
      if (clienteSelecionado) {
        const res = await api.postEndereco({ cpf_pessoa: clienteSelecionado.cpf, ...novoCli });
        onSuccess(clienteSelecionado, res.data);
      } else {
        const res = await api.postClienteCompleto({ ...novoCli, telefones: novoCli.telefone ? [novoCli.telefone] : [] });
        onSuccess({ 
          cpf: novoCli.cpf, 
          nome: novoCli.nome, 
          pontos: 0, 
          data_nascimento: novoCli.data_nascimento || null, 
          observacao: novoCli.observacao || null 
        }, { id_endereco: res.data.id_endereco });
      }
    } catch {
      alert("Erro ao salvar dados do cliente.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-950/95 flex items-center justify-center p-6 z-[100] backdrop-blur-xl">
      <div className="bg-white w-full max-w-2xl p-10 rounded-3xl shadow-2xl space-y-10 border border-white/20 overflow-y-auto max-h-[90vh] custom-scrollbar shadow-enterprise">
        <div className="flex justify-between items-center border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-3xl font-black uppercase italic text-gray-900 leading-none">{clienteSelecionado ? 'Novo Endereço' : 'Novo Cliente'}</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{clienteSelecionado ? 'Adicionar destino secundário' : 'Cadastro completo de fidelidade'}</p>
          </div>
          <button onClick={onClose} className="p-3 text-gray-400 hover:text-red-600 transition-colors bg-gray-50 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8">
          {!clienteSelecionado && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 ml-4 uppercase tracking-wider">CPF *</label>
                <input value={novoCli.cpf} onChange={e => setNovoCli({...novoCli, cpf: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-lg font-bold focus:border-red-600 outline-none transition-all" placeholder="000.000.000-00" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 ml-4 uppercase tracking-wider">Nome *</label>
                <input value={novoCli.nome} onChange={e => setNovoCli({...novoCli, nome: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-lg font-bold focus:border-red-600 outline-none transition-all" placeholder="Nome Completo" />
              </div>
            </div>
          )}

          {!clienteSelecionado && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 ml-4 uppercase tracking-wider">Telefone / WhatsApp *</label>
              <input value={novoCli.telefone} onChange={e => setNovoCli({...novoCli, telefone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-lg font-bold focus:border-red-600 outline-none transition-all" placeholder="(00) 00000-0000" />
            </div>
          )}

          {!clienteSelecionado && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 ml-4 uppercase tracking-wider">Data de Nascimento</label>
                <input type="date" value={novoCli.data_nascimento} onChange={e => setNovoCli({...novoCli, data_nascimento: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-lg font-bold focus:border-red-600 outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 ml-4 uppercase tracking-wider">Observações / Preferências</label>
                <input value={novoCli.observacao} onChange={e => setNovoCli({...novoCli, observacao: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-lg font-bold focus:border-red-600 outline-none transition-all" placeholder="Ex: Sem cebola..." />
              </div>
            </div>
          )}

          <div className="space-y-6 pt-8 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 ml-4 uppercase tracking-wider">Logradouro *</label>
                <input value={novoCli.logradouro} onChange={e => setNovoCli({...novoCli, logradouro: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-lg font-bold focus:border-green-600 outline-none transition-all" placeholder="Rua / Avenida..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 ml-4 uppercase tracking-wider">Nº</label>
                <input value={novoCli.numero} onChange={e => setNovoCli({...novoCli, numero: e.target.value})} placeholder="S/N" className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold text-lg text-center focus:border-green-600 outline-none transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 ml-4 uppercase tracking-wider">Complemento</label>
                <input value={novoCli.complemento} onChange={e => setNovoCli({...novoCli, complemento: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-lg font-bold focus:border-green-600 outline-none transition-all" placeholder="Apt / Bloco" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 ml-4 uppercase tracking-wider">Bairro *</label>
                <input value={novoCli.bairro} onChange={e => setNovoCli({...novoCli, bairro: e.target.value})} placeholder="Bairro" className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold text-lg focus:border-green-600 outline-none transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 ml-4 uppercase tracking-wider">CEP *</label>
                <input value={novoCli.cep} onChange={e => setNovoCli({...novoCli, cep: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-lg font-bold focus:border-green-600 outline-none transition-all" placeholder="00000-000" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 ml-4 uppercase tracking-wider">Referência</label>
                <input value={novoCli.ponto_referencia} onChange={e => setNovoCli({...novoCli, ponto_referencia: e.target.value})} placeholder="Perto de..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold text-lg focus:border-green-600 outline-none transition-all" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
            <button onClick={handleSalvar} className="w-full bg-gray-900 text-white py-6 rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-xl hover:bg-black active:scale-95 transition-all">
                {clienteSelecionado ? 'Confirmar Novo Endereço' : 'Finalizar Cadastro'}
            </button>
        </div>
      </div>
    </div>
  );
}
