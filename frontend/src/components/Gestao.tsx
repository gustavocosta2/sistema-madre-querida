import { Settings, Plus, EyeOff, Eye } from 'lucide-react';
import type { Sabor } from '../types';
import { api } from '../api';

interface GestaoProps {
  sabores: Sabor[];
  refresh: () => void;
  onOpenNovoSabor: () => void;
}

export function Gestao({ sabores, refresh, onOpenNovoSabor }: GestaoProps) {
  const alternarSabor = (id: number, atual: boolean) => {
    api.patchSaborDisponibilidade(id, !atual).then(refresh);
  };

  return (
    <div className="flex-1 p-10 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex justify-between items-center border-b-4 border-black/5 pb-6">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">
            <Settings size={40} className="inline mr-4 text-[#b91c1c]" /> Gestão Administrativa
          </h2>
          <button onClick={onOpenNovoSabor} className="bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-xl hover:bg-gray-800">
            <Plus /> Nova Pizza
          </button>
        </div>
        <div className="bg-white rounded-[3rem] shadow-2xl border-2 border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b-2 border-gray-200 text-[10px] font-black uppercase text-gray-900">
              <tr>
                <th className="p-6">Sabor da Pizza</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {sabores.map(s => (
                <tr key={s.id_sabor} className={s.disponivel ? 'bg-white' : 'bg-gray-50 opacity-50'}>
                  <td className="p-6 font-black uppercase text-sm">{s.nome_sabor}</td>
                  <td className="p-6">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${s.disponivel ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {s.disponivel ? 'VENDENDO' : 'OCULTO'}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <button onClick={() => alternarSabor(s.id_sabor, !!s.disponivel)} className="p-3 bg-gray-200 rounded-xl hover:bg-black hover:text-white transition-all">
                      {s.disponivel ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
