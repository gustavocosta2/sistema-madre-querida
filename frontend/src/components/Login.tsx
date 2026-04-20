import { Pizza } from 'lucide-react';
import { api } from '../api';

interface LoginProps {
  onLogin: (user: { username: string, role: string }) => void;
}

export function Login({ onLogin }: LoginProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    try {
      const res = await api.login({ 
        username: target[0].value, 
        password: target[1].value 
      });
      const userData = { username: res.data.username, role: res.data.role };
      localStorage.setItem('madre_user', JSON.stringify(userData));
      onLogin(userData);
    } catch {
      alert("Usuário ou senha inválidos.");
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#fcfaf7] p-6">
      <div className="w-full max-w-sm bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10 text-center border border-gray-100">
        <div className="bg-[#b91c1c] -mx-10 -mt-10 p-12 text-white mb-8 shadow-lg">
          <Pizza size={64} className="mx-auto mb-4 rotate-12" />
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Madre Querida</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="text" placeholder="Usuário" className="w-full bg-[#fcfaf7] border-2 rounded-2xl py-4 px-6 font-black outline-none focus:border-[#b91c1c]" />
          <input required type="password" placeholder="Senha" className="w-full bg-[#fcfaf7] border-2 rounded-2xl py-4 px-6 font-black outline-none focus:border-[#b91c1c]" />
          <button type="submit" className="w-full bg-[#b91c1c] text-white py-5 rounded-2xl font-black uppercase shadow-xl hover:bg-red-800 transition-all active:scale-95">
            Acessar Sistema
          </button>
        </form>
      </div>
    </div>
  );
}
