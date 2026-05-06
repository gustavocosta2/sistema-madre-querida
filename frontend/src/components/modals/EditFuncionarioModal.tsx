import { X, UserPlus, Briefcase, DollarSign, Bike, Pencil } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../api';
import type { Funcionario } from '../../types';

interface EditFuncionarioModalProps {
  funcionario: Funcionario;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditFuncionarioModal({ funcionario, onClose, onSuccess }: EditFuncionarioModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: funcionario.nome,
    cargo: funcionario.cargo,
    salario: funcionario.salario.toString(),
    placa_veiculo: funcionario.placa_veiculo || ''
  });

  const handleSalvar = async () => {
    if (!form.nome || !form.salario) {
      return alert("Preencha todos os campos obrigatórios (*)");
    }

    setLoading(true);
    try {
      await api.putFuncionario(funcionario.cpf, {
        ...form,
        salario: parseFloat(form.salario)
      });
      alert("Funcionário atualizado com sucesso!");
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Erro ao atualizar funcionário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-950/95 flex items-center justify-center p-6 z-[100] backdrop-blur-xl">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border-8 border-gray-100 animate-in zoom-in-95 duration-200">
        <div className="bg-black p-10 text-white flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-black uppercase italic leading-none flex items-center gap-4">
              <Pencil size={40} /> Editar Dados
            </h2>
            <p className="text-xs font-black uppercase tracking-widest opacity-70 mt-4">Atualização de Cadastro: {funcionario.cpf}</p>
          </div>
          <button onClick={onClose} className="p-4 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <X size={32} />
          </button>
        </div>

        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* CPF (BLOQUEADO) */}
          <div className="space-y-2 opacity-60">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-4">CPF (Identificador único)</label>
            <input 
              disabled
              value={funcionario.cpf}
              className="w-full bg-gray-100 border-2 border-gray-200 rounded-2xl p-5 font-bold text-lg cursor-not-allowed"
            />
          </div>

          {/* NOME */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Nome Completo *</label>
            <input 
              value={form.nome} 
              onChange={e => setForm({...form, nome: e.target.value})}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 font-bold text-lg focus:border-black outline-none transition-all"
            />
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
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 font-bold text-lg focus:border-black outline-none transition-all appearance-none"
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
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 font-bold text-lg focus:border-black outline-none transition-all text-green-700"
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
            className="flex-[2] bg-black text-white py-6 rounded-2xl font-black uppercase text-sm shadow-xl hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
