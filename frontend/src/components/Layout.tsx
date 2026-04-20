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
    { id: 'historico', label: 'Histórico' },
    { id: 'gestao', label: 'Gestão', adminOnly: true },
  ];

  return (
    <div className="h-screen w-full flex flex-col bg-[#fcfaf7] text-gray-950 font-sans overflow-hidden">
      <nav className="h-16 bg-white border-b-2 border-gray-100 flex items-center justify-between px-8 shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <Pizza size={24} className="text-[#b91c1c]" />
            <span className="text-xl font-black tracking-tighter uppercase italic text-[#b91c1c]">Madre Querida</span>
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {menuItems.map((item) => {
              if (item.adminOnly && user.role !== 'admin') return null;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`px-6 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                    view === item.id ? 'bg-[#b91c1c] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase text-gray-900">
          <span>{user.username}</span>
          <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-600">
            <LogOut size={20} />
          </button>
        </div>
      </nav>
      {children}
    </div>
  );
}
