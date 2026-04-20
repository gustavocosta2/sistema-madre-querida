import { useState, useCallback, useEffect } from 'react';
import { api } from '../api';
import type { Sabor, Tamanho, Borda, Preco, Motoboy, Bebida, PedidoAtivo } from '../types';

export function useMadreData(user: any) {
  const [loading, setLoading] = useState(true);
  const [sabores, setSabores] = useState<Sabor[]>([]);
  const [tamanhos, setTamanhos] = useState<Tamanho[]>([]);
  const [bordas, setBordas] = useState<Borda[]>([]);
  const [precos, setPrecos] = useState<Preco[]>([]);
  const [motoboys, setMotoboys] = useState<Motoboy[]>([]);
  const [bebidas, setBebidas] = useState<Bebida[]>([]);
  const [pedidosAtivos, setPedidosAtivos] = useState<PedidoAtivo[]>([]);
  const [historicoPedidos, setHistoricoPedidos] = useState<any[]>([]);

  const loadReferenceData = useCallback(async () => {
    try {
      const fetchSafe = (p: Promise<any>) => p.then(res => res.data).catch(() => []);
      const [s, t, b, p, m, beb] = await Promise.all([
        fetchSafe(api.getSabores()), fetchSafe(api.getTamanhos()),
        fetchSafe(api.getBordas()), fetchSafe(api.getPrecos()),
        fetchSafe(api.getMotoboys()), fetchSafe(api.getBebidas())
      ]);
      setSabores(s); setTamanhos(t); setBordas(b); setPrecos(p); setMotoboys(m); setBebidas(beb);
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
      setPedidosAtivos(ativos.data || []);
      setHistoricoPedidos(hist.data || []);
    } catch (e) {
      console.error("Erro ao atualizar pedidos", e);
    }
  }, [user]);

  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  useEffect(() => {
    if (!user) return;
    refreshOrders();
    const interval = setInterval(refreshOrders, 5000);
    return () => clearInterval(interval);
  }, [user, refreshOrders]);

  return {
    loading,
    sabores, tamanhos, bordas, precos, motoboys, bebidas,
    pedidosAtivos, historicoPedidos,
    refreshOrders, loadReferenceData
  };
}
