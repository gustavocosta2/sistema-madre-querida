import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../api';
import type { Sabor, Tamanho, Borda, Preco, Motoboy, Bebida, PedidoAtivo, Promocao } from '../types';

interface MadreContextType {
  loading: boolean;
  sabores: Sabor[];
  tamanhos: Tamanho[];
  bordas: Borda[];
  precos: Preco[];
  motoboys: Motoboy[];
  bebidas: Bebida[];
  promocoes: Promocao[];
  pedidosAtivos: PedidoAtivo[];
  historicoPedidos: any[];
  user: { username: string; role: string } | null;
  setUser: (user: { username: string; role: string } | null) => void;
  refreshAll: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  triggerPrint: (type: 'cozinha' | 'entrega', order: any) => void;
  printTicket: { type: 'cozinha' | 'entrega', order: any } | null;
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
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [pedidosAtivos, setPedidosAtivos] = useState<PedidoAtivo[]>([]);
  const [historicoPedidos, setHistoricoPedidos] = useState<any[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [lastMaxId, setLastMaxId] = useState(0);
  const [printTicket, setPrintTicket] = useState<{ type: 'cozinha' | 'entrega', order: any } | null>(null);

  const triggerPrint = (type: 'cozinha' | 'entrega', order: any) => {
    setPrintTicket({ type, order });
    setTimeout(() => {
        window.print();
        setTimeout(() => setPrintTicket(null), 500);
    }, 200);
  };

  const tocarAlerta = useCallback(() => {
    if (!audioEnabled) return;
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audio.play().catch(e => console.error("Erro ao tocar som:", e));
  }, [audioEnabled]);

  const refreshAll = useCallback(async () => {
    try {
      console.log("♻️ REFRESH ALL: Buscando dados de referência...");
      const fetchSafe = (p: Promise<any>) => p.then(res => res.data).catch(() => []);
      const [s, t, b, p, m, beb, promos] = await Promise.all([
        fetchSafe(api.getSabores()), fetchSafe(api.getTamanhos()),
        fetchSafe(api.getBordas()), fetchSafe(api.getPrecos()),
        fetchSafe(api.getMotoboys()), fetchSafe(api.getBebidas()),
        fetchSafe(api.getPromocoes())
      ]);
      setSabores(s); setTamanhos(t); setBordas(b); setPrecos(p); setMotoboys(m); setBebidas(beb); setPromocoes(promos);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    if (!user) return;
    try {
      const [ativos, hist] = await Promise.all([
        api.getPedidosAtivos(),
        api.getHistoricoPedidos()
      ]);
      
      const novosAtivos = ativos.data || [];
      
      // Lógica de Alerta Sonoro: Verifica se entrou um ID novo
      if (novosAtivos.length > 0) {
        const currentMaxId = Math.max(...novosAtivos.map((p: any) => p.id_pedido));
        if (lastMaxId > 0 && currentMaxId > lastMaxId) {
          console.log("🔔 NOVO PEDIDO DETECTADO! Tocando alerta...");
          tocarAlerta();
        }
        setLastMaxId(currentMaxId);
      }

      setPedidosAtivos(novosAtivos);
      setHistoricoPedidos(hist.data || []);
    } catch (e) {
      console.error("Erro ao atualizar pedidos", e);
    }
  }, [user, lastMaxId, tocarAlerta]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (!user) return;
    refreshOrders();
    const interval = setInterval(refreshOrders, 10000);
    return () => clearInterval(interval);
  }, [user, refreshOrders]);

  return (
    <MadreContext.Provider value={{
      loading, sabores, tamanhos, bordas, precos, motoboys, bebidas, promocoes,
      pedidosAtivos, historicoPedidos, user, setUser, refreshAll, refreshOrders,
      audioEnabled, setAudioEnabled, triggerPrint, printTicket
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
