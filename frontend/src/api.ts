import axios from 'axios';

const baseUrl = 'http://localhost:8000';

export const api = {
  // --- SABORES ---
  getSabores: () => axios.get(`${baseUrl}/sabores`),
  patchSaborDisponibilidade: (id: number, disponivel: boolean) => 
    axios.patch(`${baseUrl}/sabores/${id}/disponibilidade?disponivel=${disponivel}`),
  postSabor: (sabor: { nome_sabor: string; ingredientes: string }) => 
    axios.post(`${baseUrl}/sabores`, sabor),

  // --- PEDIDOS ---
  getPedidosAtivos: () => axios.get(`${baseUrl}/pedidos/ativos`),
  getHistoricoPedidos: () => axios.get(`${baseUrl}/pedidos/historico_dia`),
  patchStatusPedido: (id: number, status: string) => 
    axios.patch(`${baseUrl}/pedidos/${id}/status?novo_status=${status}`),
  patchDespacharPedido: (id: number, cpfMotoboy: string) => 
    axios.patch(`${baseUrl}/pedidos/${id}/despachar?cpf_motoboy=${cpfMotoboy}`),
  postPedido: (payload: any) => axios.post(`${baseUrl}/pedidos`, payload),

  // --- CLIENTES ---
  buscarClientes: (termo: string) => axios.get(`${baseUrl}/clientes/buscar/${termo}`),
  getEnderecosCliente: (cpf: string) => axios.get(`${baseUrl}/clientes/${cpf}/enderecos`),
  postClienteCompleto: (cliente: any) => axios.post(`${baseUrl}/clientes/completo`, cliente),
  postEndereco: (endereco: any) => axios.post(`${baseUrl}/enderecos`, endereco),

  // --- DEMAIS ---
  getTamanhos: () => axios.get(`${baseUrl}/tamanhos`),
  getBordas: () => axios.get(`${baseUrl}/bordas`),
  getPrecos: () => axios.get(`${baseUrl}/precos`),
  getMotoboys: () => axios.get(`${baseUrl}/motoboys`),
  getBebidas: () => axios.get(`${baseUrl}/bebidas`),
  login: (credentials: any) => axios.post(`${baseUrl}/login`, credentials),
};
