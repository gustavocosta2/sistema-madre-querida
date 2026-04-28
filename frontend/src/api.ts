import axios from 'axios';

// DICA: Troque 'localhost' pelo IP do seu computador (ex: 192.168.1.5) 
// para conseguir acessar do celular na mesma rede Wi-Fi.
const baseUrl = `http://${window.location.hostname}:8000`;

export const api = {
  // --- SABORES ---
  getSabores: () => axios.get(`${baseUrl}/sabores`),
  patchSabor: (id: number, sabor: any) => 
    axios.patch(`${baseUrl}/sabores/${id}`, sabor),
  deleteSabor: (id: number) => 
    axios.delete(`${baseUrl}/sabores/${id}`),
  postSabor: (sabor: any) => 
    axios.post(`${baseUrl}/sabores`, sabor),

  // --- PEDIDOS ---
  getPedidosAtivos: () => axios.get(`${baseUrl}/pedidos/ativos`),
  getHistoricoPedidos: () => axios.get(`${baseUrl}/pedidos/historico_dia`),
  getPedidoDetalhado: (id: number) => axios.get(`${baseUrl}/pedidos/${id}`),
  patchStatusPedido: (id: number, status: string) => 
    axios.patch(`${baseUrl}/pedidos/${id}/status?novo_status=${status}`),
  patchDespacharPedido: (id: number, cpfMotoboy: string) => 
    axios.patch(`${baseUrl}/pedidos/${id}/despachar?cpf_motoboy=${cpfMotoboy}`),
  postPedido: (payload: any) => axios.post(`${baseUrl}/pedidos`, payload),

  // --- CLIENTES ---
  buscarClientes: (termo: string) => axios.get(`${baseUrl}/clientes/buscar/${termo}`),
  getEnderecosCliente: (cpf: string) => axios.get(`${baseUrl}/clientes/${cpf}/enderecos`),
  getUltimoPedidoCliente: (cpf: string) => axios.get(`${baseUrl}/clientes/${cpf}/ultimo_pedido`),
  postClienteCompleto: (cliente: any) => axios.post(`${baseUrl}/clientes/completo`, cliente),
  postEndereco: (endereco: any) => axios.post(`${baseUrl}/enderecos`, endereco),

  // --- DEMAIS ---
  getTamanhos: () => axios.get(`${baseUrl}/tamanhos`),
  getBordas: () => axios.get(`${baseUrl}/bordas`),
  getPrecos: () => axios.get(`${baseUrl}/precos`),
  getMotoboys: () => axios.get(`${baseUrl}/motoboys`),
  getPromocoes: () => axios.get(`${baseUrl}/promocoes`),
  postPromocao: (payload: any) => axios.post(`${baseUrl}/promocoes`, payload),
  deletePromocao: (id: number) => axios.delete(`${baseUrl}/promocoes/${id}`),
  getBebidas: () => axios.get(`${baseUrl}/bebidas`),
  postBebida: (bebida: any) => 
    axios.post(`${baseUrl}/bebidas`, bebida),
  patchBebida: (id: number, bebida: any) => 
    axios.patch(`${baseUrl}/bebidas/${id}`, bebida),
  getDashboard: () => axios.get(`${baseUrl}/gestao/dashboard`),
  login: (credentials: any) => axios.post(`${baseUrl}/login`, credentials),
};
