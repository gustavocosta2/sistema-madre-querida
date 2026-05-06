import React from 'react';
import { Users, DollarSign, Pencil, UserMinus, UserCheck } from 'lucide-react';
import type { Funcionario } from '../../types';

interface TeamManagementProps {
  funcionarios: Funcionario[];
  setFuncParaEditar: (f: Funcionario) => void;
  handleToggleStatusFunc: (cpf: string) => void;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({
  funcionarios, setFuncParaEditar, handleToggleStatusFunc
}) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-enterprise">
                <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                    <Users size={24} />
                </div>
                <p className="text-3xl font-black text-gray-900 leading-none">{funcionarios.filter(f => f.ativo).length}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-3 tracking-widest">Colaboradores Ativos</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-enterprise">
                <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center text-green-600 mb-4">
                    <DollarSign size={24} />
                </div>
                <p className="text-3xl font-black text-gray-900 leading-none">R$ {funcionarios.filter(f => f.ativo).reduce((acc, f) => acc + parseFloat(f.salario.toString()), 0).toFixed(2)}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-3 tracking-widest">Folha Estimada</p>
            </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-[9px] font-black uppercase text-gray-400 tracking-widest">
                    <tr>
                        <th className="p-8">Colaborador</th>
                        <th className="p-8">Função</th>
                        <th className="p-8">Vencimento Base</th>
                        <th className="p-8">Status</th>
                        <th className="p-8 text-center">Gestão</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {funcionarios.map(f => (
                        <tr key={f.cpf} className={`bg-white hover:bg-gray-50/50 transition-colors ${!f.ativo ? 'opacity-50 grayscale' : ''}`}>
                            <td className="p-8">
                                <p className="font-black uppercase text-base text-gray-900">{f.nome}</p>
                                <p className="text-xs font-bold text-gray-400">{f.cpf}</p>
                            </td>
                            <td className="p-8">
                                <div className="flex items-center gap-2">
                                    <span className="bg-gray-900 text-white px-4 py-1 rounded-lg font-black text-[9px] uppercase tracking-wider">
                                        {f.cargo}
                                    </span>
                                    {f.placa_veiculo && f.placa_veiculo !== '---' && (
                                        <span className="bg-amber-50 text-amber-800 px-3 py-1 rounded-lg font-black text-[9px] uppercase border border-amber-200">
                                            Moto: {f.placa_veiculo}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="p-8 font-black text-sm text-emerald-700">
                                R$ {parseFloat(f.salario.toString()).toFixed(2)}
                            </td>
                            <td className="p-8">
                                <span className={`px-4 py-1 rounded-full font-black text-[9px] uppercase border ${f.ativo ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                    {f.ativo ? 'Ativo' : 'Desligado'}
                                </span>
                            </td>
                            <td className="p-8 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <button 
                                        onClick={() => setFuncParaEditar(f)}
                                        className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-900 hover:text-white transition-all"
                                        title="Editar"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleToggleStatusFunc(f.cpf)}
                                        title={f.ativo ? "Desativar" : "Reativar"}
                                        className={`p-3 rounded-xl transition-all ${f.ativo ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                                    >
                                        {f.ativo ? <UserMinus size={18} /> : <UserCheck size={18} />}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {funcionarios.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-20 text-center text-gray-400 font-black uppercase italic">Sem registros de equipe.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};
