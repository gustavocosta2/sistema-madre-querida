import { X, UserPlus, Briefcase, DollarSign, Bike } from 'lucide-react';
import { useState } from 'react';
import { api } from '../../api';

interface NovoFuncionarioModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function NovoFuncionarioModal({ onClose, onSuccess }: NovoFuncionarioModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    cpf: '',
    nome: '',
    cargo: 'Atendente',
    salario: '',
    placa_veiculo: ''
  });

  const handleSalvar = async () => {
    if (!form.cpf || !form.nome || !form.salario) {
      return alert("Preencha todos os campos obrigatórios (*)");
    }

    setLoading(true);
    try {
      await api.postFuncionario({
        ...form,
        salario: parseFloat(form.salario)
      });
      alert("Funcionário cadastrado com sucesso!");
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Erro ao salvar funcionário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-950/95 flex items-center justify-center p-6 z-[100] backdrop-blur-xl">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border-8 border-gray-100 animate-in zoom-in-95 duration-200">
        <div className="bg-[#b91c1c] p-10 text-white flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-black uppercase italic leading-none flex items-center gap-4">
              <UserPlus size={40} /> Novo Membro
            </h2>
            <p className="text-xs font-black uppercase tracking-widest opacity-70 mt-4">Cadastro de Equipe (RH)</p>
          </div>
          <button onClick={onClose} className="p-4 bg-black/10 rounded-full hover:bg-black/20 transition-colors">
            <X size={32} />
          </button>
        </div>

        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* DADOS PESSOAIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-4">CPF *</label>
              <input 
                value={form.cpf} 
                onChange={e => setForm({...form, cpf: e.target.value})}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 font-bold text-lg focus:border-[#b91c1c] outline-none transition-all"
                placeholder="000.000.000-00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Nome Completo *</label>
              <input 
                value={form.nome} 
                onChange={e => setForm({...form, nome: e.target.value})}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 font-bold text-lg focus:border-[#b91c1c] outline-none transition-all"
                placeholder="Ex: João da Silva"
              />
            </div>
          </div>

          {/* DADOS TRABALHISTAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t-2 border-gray-50">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-4 flex items-center gap-1">
                <Briefcase size={12}/> Cargo
              </label>
              <select 
                value={form.cargo}
                onChange={e => setForm({...form, cargo: e.target.value})}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 font-bold text-lg focus:border-[#b91c1c] outline-none transition-all appearance-none"
              >
                <option value="Atendente">Atendente</option>
                <option value="Pizzaiolo">Pizzaiolo</option>
                <option value="Auxiliar de Cozinha">Auxiliar de Cozinha</option>
                <option value="Motoboy">Motoboy</option>
                <option value="Gerente">Gerente</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-4 flex items-center gap-1">
                <DollarSign size={12}/> Salário Base *
              </label>
              <input 
                type="number"
                value={form.salario} 
                onChange={e => setForm({...form, salario: e.target.value})}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 font-bold text-lg focus:border-[#b91c1c] outline-none transition-all text-green-700"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* DADOS ESPECÍFICOS MOTOBOY */}
          {form.cargo === 'Motoboy' && (
            <div className="space-y-2 pt-6 border-t-2 border-gray-50 animate-in slide-in-from-top-4 duration-300">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-4 flex items-center gap-1">
                <Bike size={12}/> Placa do Veículo
              </label>
              <input 
                value={form.placa_veiculo} 
                onChange={e => setForm({...form, placa_veiculo: e.target.value})}
                className="w-full bg-amber-50 border-2 border-amber-100 rounded-2xl p-5 font-black text-2xl text-center focus:border-amber-500 outline-none transition-all uppercase"
                placeholder="ABC-1234"
              />
              <p className="text-[9px] font-bold text-amber-600 text-center uppercase tracking-tighter">Obrigatório para despacho de pedidos</p>
            </div>
          )}
        </div>

        <div className="p-10 bg-gray-50 border-t-4 border-gray-100 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-6 rounded-2xl font-black uppercase text-sm text-gray-400 hover:bg-gray-200 transition-all"
          >
            Cancelar
          </button>
          <button 
            disabled={loading}
            onClick={handleSalvar}
            className="flex-[2] bg-green-700 text-white py-6 rounded-2xl font-black uppercase text-sm shadow-xl hover:bg-green-800 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Confirmar Contratação"}
          </button>
        </div>
      </div>
    </div>
  );
}
