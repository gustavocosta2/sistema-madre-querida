import React from 'react';
import { DollarSign, Package, TrendingUp, PieChart } from 'lucide-react';

interface DashboardStatsProps {
  stats: any;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-enterprise">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-green-50 p-2.5 rounded-xl text-green-600"><DollarSign size={20}/></div>
          <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Hoje</span>
        </div>
        <p className="text-3xl font-black text-gray-900 leading-none italic">R$ {stats?.faturamento_hoje.toFixed(2) || '0.00'}</p>
        <p className="text-[10px] font-bold text-gray-400 uppercase mt-3">Receita Bruta</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-enterprise">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600"><Package size={20}/></div>
          <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Total</span>
        </div>
        <p className="text-3xl font-black text-gray-900 leading-none italic">{stats?.pedidos_hoje || 0}</p>
        <p className="text-[10px] font-bold text-gray-400 uppercase mt-3">Vendas Realizadas</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-enterprise">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-purple-50 p-2.5 rounded-xl text-purple-600"><TrendingUp size={20}/></div>
          <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Média</span>
        </div>
        <p className="text-3xl font-black text-gray-900 leading-none italic">R$ {stats?.ticket_medio.toFixed(2) || '0.00'}</p>
        <p className="text-[10px] font-bold text-gray-400 uppercase mt-3">Ticket Médio</p>
      </div>

      <div className="bg-red-600 p-6 rounded-3xl shadow-lg shadow-red-100 text-white">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-white/20 p-2.5 rounded-xl text-white"><PieChart size={20}/></div>
          <span className="text-[9px] font-black uppercase text-white/50 tracking-wider">Top Sabor</span>
        </div>
        <p className="text-2xl font-black leading-none italic truncate uppercase">{stats?.top_sabores[0]?.nome || '---'}</p>
        <p className="text-[10px] font-bold text-white/60 uppercase mt-3 tracking-wide">Produto Líder</p>
      </div>
    </div>
  );
};
