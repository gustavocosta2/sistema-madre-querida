import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../api';
import type { Sabor, Tamanho, Borda, Preco, Motoboy, Bebida, PedidoAtivo, ClienteBusca, Endereco, ItemCarrinho } from './types';

interface MadreContextType {
  loading: boolean;
  sabores: Sabor[];
  tamanhos: Tamanho[];
  bordas: Borda[];
  precos: Preco[];
  motoboys: Motoboy[];
  bebidas: Bebida[];
  pedidosAtivos: PedidoAtivo[];
  historicoPedidos: any[];
  user: { username: string; role: string } | null;
  setUser: (user: { username: string; role: string } | null) => void;
  refreshAll: () => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const MadreContext = createContext<MadreContextType | undefined>(undefined);

export function MadreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ username: string; role: string } | null>(() => {
    const saved = localStorage.getItem('madre_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);
  const [sabores, setSabores] = useState<Sabor[]>([]);
  const [tamanhos, setTamanhos] = useState<Tamanho[]>([]);
  const [bordas, setBordas] = useState<Borda[]>([]);
  const [precos, setPrecos] = useState<Preco[]>([]);
  const [motoboys, setMotoboys] = useState<Motoboy[]>([]);
  const [bebidas, setBebidas] = useState<Bebida[]>([]);
  const [pedidosAtivos, setPedidosAtivos] = useState<PedidoAtivo[]>([]);
  const [historicoPedidos, setHistoricoPedidos] = useState<any[]>([]);

  const refreshAll = useCallback(async () => {
    try {
      console.log("♻️ REFRESH ALL: Buscando dados de referência...");
      const fetchSafe = (p: Promise<any>) => p.then(res => res.data).catch(() => []);
      const [s, t, b, p, m, beb] = await Promise.all([
        fetchSafe(api.getSabores()), fetchSafe(api.getTamanhos()),
        fetchSafe(api.getBordas()), fetchSafe(api.getPrecos()),
        fetchSafe(api.getMotoboys()), fetchSafe(api.getBebidas())
      ]);
      console.log("✅ DADOS RECEBIDOS:", { sabores: s.length, precos: p.length });
      setSabores(s); setTamanhos(t); setBordas(b); setPrecos(p); setMotoboys(m); setBebidas(beb);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    if (!user) return;
    try {
      console.log("♻️ REFRESH ORDERS: Buscando pedidos...");
      const [ativos, hist] = await Promise.all([
        api.getPedidosAtivos(),
        api.getHistoricoPedidos()
      ]);
      setPedidosAtivos(ativos.data || []);
      setHistoricoPedidos(hist.data || []);
    } catch (e) {
      console.error("Erro ao atualizar pedidos", e);
    }
  }, [user]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (!user) return;
    refreshOrders();
    const interval = setInterval(refreshOrders, 5000);
    return () => clearInterval(interval);
  }, [user, refreshOrders]);

  return (
    <MadreContext.Provider value={{
      loading, sabores, tamanhos, bordas, precos, motoboys, bebidas,
      pedidosAtivos, historicoPedidos, user, setUser, refreshAll, refreshOrders
    }}>
      {children}
    </MadreContext.Provider>
  );
}

export function useMadre() {
  const context = useContext(MadreContext);
  if (context === undefined) throw new Error('useMadre deve ser usado dentro de um MadreProvider');
  return context;
}
