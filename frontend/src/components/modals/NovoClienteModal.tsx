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
    telefone: ''
  });

  const handleSalvar = async () => {
    try {
      if (clienteSelecionado) {
        const res = await api.postEndereco({ cpf_pessoa: clienteSelecionado.cpf, ...novoCli });
        onSuccess(clienteSelecionado, res.data);
      } else {
        const res = await api.postClienteCompleto({ ...novoCli, telefones: novoCli.telefone ? [novoCli.telefone] : [] });
        onSuccess({ cpf: novoCli.cpf, nome: novoCli.nome, pontos: 0 }, { id_endereco: res.data.id_endereco });
      }
    } catch {
      alert("Erro ao salvar dados do cliente.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-950/95 flex items-center justify-center p-6 z-[100] backdrop-blur-3xl">
      <div className="bg-white w-full max-w-2xl p-14 rounded-[4rem] shadow-2xl space-y-12 border-8 border-gray-100 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center border-b-4 border-gray-100 pb-8">
          <h2 className="text-4xl font-black uppercase italic text-[#b91c1c]">{clienteSelecionado ? 'Novo Endereço' : 'Novo Cadastro'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black"><X size={48}/></button>
        </div>
        <div className="space-y-8">
          {!clienteSelecionado && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-900 ml-6 uppercase">CPF *</label>
                <input value={novoCli.cpf} onChange={e => setNovoCli({...novoCli, cpf: e.target.value})} className="w-full bg-[#fcfaf7] border-4 border-gray-200 rounded-[2rem] p-6 text-xl font-black" placeholder="000.000.000-00" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-900 ml-6 uppercase">Nome *</label>
                <input value={novoCli.nome} onChange={e => setNovoCli({...novoCli, nome: e.target.value})} className="w-full bg-[#fcfaf7] border-4 border-gray-200 rounded-[2rem] p-6 text-xl font-black" placeholder="Nome do Cliente" />
              </div>
            </div>
          )}
          {!clienteSelecionado && (
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-900 ml-6 uppercase">Telefone / WhatsApp *</label>
              <input value={novoCli.telefone} onChange={e => setNovoCli({...novoCli, telefone: e.target.value})} className="w-full bg-[#fcfaf7] border-4 border-gray-200 rounded-[2rem] p-6 text-xl font-black" placeholder="(00) 00000-0000" />
            </div>
          )}
          <div className="space-y-6 pt-8 border-t-4 border-gray-100">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-gray-500 ml-6 uppercase">Rua *</label>
                <input value={novoCli.logradouro} onChange={e => setNovoCli({...novoCli, logradouro: e.target.value})} className="w-full bg-[#fcfaf7] border-4 border-gray-200 rounded-[2rem] p-6 text-xl font-black" placeholder="Rua..." />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 ml-6 uppercase">Nº</label>
                <input value={novoCli.numero} onChange={e => setNovoCli({...novoCli, numero: e.target.value})} placeholder="S/N" className="w-full bg-[#fcfaf7] border-4 border-gray-200 rounded-[2rem] p-6 font-black text-xl text-center" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 ml-6 uppercase">Complemento</label>
                <input value={novoCli.complemento} onChange={e => setNovoCli({...novoCli, complemento: e.target.value})} className="w-full bg-[#fcfaf7] border-4 border-gray-200 rounded-[2rem] p-6 text-xl font-black" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 ml-6 uppercase">Bairro *</label>
                <input value={novoCli.bairro} onChange={e => setNovoCli({...novoCli, bairro: e.target.value})} placeholder="Bairro" className="w-full bg-[#fcfaf7] border-4 border-gray-200 rounded-[2rem] p-6 font-black text-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 ml-6 uppercase">CEP *</label>
                <input value={novoCli.cep} onChange={e => setNovoCli({...novoCli, cep: e.target.value})} className="w-full bg-[#fcfaf7] border-4 border-gray-200 rounded-[2rem] p-6 text-xl font-black" placeholder="00000-000" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 ml-6 uppercase">Referência</label>
                <input value={novoCli.ponto_referencia} onChange={e => setNovoCli({...novoCli, ponto_referencia: e.target.value})} placeholder="Perto de..." className="w-full bg-[#fcfaf7] border-4 border-gray-200 rounded-[2rem] p-6 font-black text-xl" />
              </div>
            </div>
          </div>
        </div>
        <button onClick={handleSalvar} className="w-full bg-green-700 text-white py-8 rounded-[3rem] font-black uppercase text-2xl shadow-2xl active:scale-95 transition-all">
          {clienteSelecionado ? 'Confirmar Novo Endereço' : 'Salvar e Selecionar'}
        </button>
      </div>
    </div>
  );
}
