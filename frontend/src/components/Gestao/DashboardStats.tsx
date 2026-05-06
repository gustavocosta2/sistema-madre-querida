import React from 'react';
import { DollarSign, Package, TrendingUp, PieChart, Activity, Clock, Trophy } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart as RePieChart, Pie, Cell, Legend 
} from 'recharts';

interface DashboardStatsProps {
  stats: any;
}

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6366f1'];

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-green-50 p-2.5 rounded-xl text-green-600"><DollarSign size={20}/></div>
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Faturamento</span>
          </div>
          <p className="text-3xl font-black text-gray-900 leading-none italic">R$ {stats?.faturamento_hoje.toFixed(2) || '0.00'}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase mt-3">Receita do Dia</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600"><Package size={20}/></div>
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Volume</span>
          </div>
          <p className="text-3xl font-black text-gray-900 leading-none italic">{stats?.pedidos_hoje || 0}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase mt-3">Pedidos Finalizados</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-purple-50 p-2.5 rounded-xl text-purple-600"><TrendingUp size={20}/></div>
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Média</span>
          </div>
          <p className="text-3xl font-black text-gray-900 leading-none italic">R$ {stats?.ticket_medio.toFixed(2) || '0.00'}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase mt-3">Ticket Médio</p>
        </div>

        <div className="bg-gray-950 p-6 rounded-3xl shadow-xl text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/10 p-2.5 rounded-xl text-white"><Trophy size={20}/></div>
            <span className="text-[9px] font-black uppercase text-white/50 tracking-wider">Destaque</span>
          </div>
          <p className="text-xl font-black leading-none italic truncate uppercase">{stats?.top_sabores[0]?.nome || '---'}</p>
          <p className="text-[10px] font-bold text-white/40 uppercase mt-3 tracking-wide">Produto Mais Vendido</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tendência de Faturamento */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <div className="flex items-center gap-3 mb-8">
             <Activity className="text-red-600" size={24} />
             <h3 className="text-sm font-black uppercase tracking-tighter text-gray-900">Tendência de Receita (7 Dias)</h3>
           </div>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={stats?.trend_7_dias || []}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                 <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#999'}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#999'}} tickFormatter={(v) => `R$${v}`} />
                 <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    formatter={(v: any) => [`R$ ${v.toFixed(2)}`, 'Vendas']}
                 />
                 <Line type="monotone" dataKey="valor" stroke="#ef4444" strokeWidth={4} dot={{ r: 6, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Horários de Pico */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <div className="flex items-center gap-3 mb-8">
             <Clock className="text-blue-600" size={24} />
             <h3 className="text-sm font-black uppercase tracking-tighter text-gray-900">Volume por Horário (Pico)</h3>
           </div>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={stats?.horarios_pico || []}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                 <XAxis dataKey="hora" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#999'}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#999'}} />
                 <Tooltip 
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                 />
                 <Bar dataKey="pedidos" fill="#3b82f6" radius={[6, 6, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Top Sabores (Horizontal) */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <div className="flex items-center gap-3 mb-8">
             <Trophy className="text-amber-500" size={24} />
             <h3 className="text-sm font-black uppercase tracking-tighter text-gray-900">Top 5 Sabores Vendidos</h3>
           </div>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart layout="vertical" data={stats?.top_sabores || []} margin={{ left: 40 }}>
                 <XAxis type="number" hide />
                 <YAxis dataKey="nome" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#666'}} width={80} />
                 <Tooltip 
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                 />
                 <Bar dataKey="vendas" fill="#ef4444" radius={[0, 6, 6, 0]} barSize={20} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Meios de Pagamento */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <div className="flex items-center gap-3 mb-8">
             <PieChart className="text-emerald-600" size={24} />
             <h3 className="text-sm font-black uppercase tracking-tighter text-gray-900">Mix de Pagamentos</h3>
           </div>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <RePieChart>
                 <Pie
                   data={stats?.pagamentos || []}
                   dataKey="valor"
                   nameKey="forma"
                   cx="50%"
                   cy="50%"
                   outerRadius={80}
                   innerRadius={50}
                   paddingAngle={5}
                 >
                   {stats?.pagamentos.map((_: any, index: number) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    formatter={(v: any) => `R$ ${v.toFixed(2)}`}
                 />
                 <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'}} />
               </RePieChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};
