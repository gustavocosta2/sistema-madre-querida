import { Pizza, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  view: string;
  setView: (v: any) => void;
  user: { username: string, role: string } | null;
  onLogout: () => void;
}

export function Layout({ children, view, setView, user, onLogout }: LayoutProps) {
  if (!user) return <>{children}</>;

  const menuItems = [
    { id: 'pdv', label: 'Vender' },
    { id: 'cozinha', label: 'Cozinha' },
    { id: 'entregas', label: 'Entregas' },
    { id: 'financeiro', label: 'Financeiro' },
    { id: 'historico', label: 'Histórico' },
    { id: 'gestao', label: 'Gestão', adminOnly: true },
  ];

  return (
    <div className="h-screen w-full flex flex-col bg-[#fcfaf7] text-gray-950 font-sans overflow-hidden">
      <nav className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2.5">
            <div className="bg-red-600 p-1.5 rounded-lg">
                <Pizza size={20} className="text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase italic text-gray-900">Madre <span className="text-red-600">Querida</span></span>
          </div>
          <div className="flex gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100/50">
            {menuItems.map((item) => {
              if (item.adminOnly && user.role !== 'admin') return null;
              const isActive = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    isActive ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase text-gray-900">{user.username}</span>
            <span className="text-[8px] font-bold uppercase text-gray-400 tracking-widest">{user.role}</span>
          </div>
          <button onClick={onLogout} className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-gray-100">
            <LogOut size={18} />
          </button>
        </div>
      </nav>
      {children}
    </div>
  );
}
