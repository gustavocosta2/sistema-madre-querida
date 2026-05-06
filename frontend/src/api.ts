import axios from 'axios';

const baseUrl = `http://${window.location.hostname}:8000`;

const instance = axios.create({
  baseURL: baseUrl,
});

// Interceptador para adicionar o Token em cada requisição
instance.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('madre_user');
  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.access_token) {
      config.headers.Authorization = `Bearer ${user.access_token}`;
    }
  }
  return config;
});

// Interceptador para tratar erros globais (Ex: Token expirado)
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('madre_user');
      window.location.reload(); // Redireciona para o login
    }
    return Promise.reject(error);
  }
);

export const api = {
  // --- SABORES ---
  getSabores: () => instance.get(`/sabores`),
  patchSabor: (id: number, sabor: any) => 
    instance.patch(`/sabores/${id}`, sabor),
  deleteSabor: (id: number) => 
    instance.delete(`/sabores/${id}`),
  postSabor: (sabor: any) => 
    instance.post(`/sabores`, sabor),

  // --- PEDIDOS ---
  getPedidosAtivos: () => instance.get(`/pedidos/ativos`),
  getHistoricoPedidos: () => instance.get(`/pedidos/historico_dia`),
  getPedidoDetalhado: (id: number) => instance.get(`/pedidos/${id}`),
  patchStatusPedido: (id: number, status: string) => 
    instance.patch(`/pedidos/${id}/status?status=${status}`),
  patchDespacharPedido: (id: number, cpfMotoboy: string) => 
    instance.patch(`/pedidos/${id}/despachar?id_motoboy=${cpfMotoboy}`),
  postPedido: (payload: any) => instance.post(`/pedidos`, payload),

  // --- CLIENTES ---
  buscarClientes: (termo: string) => instance.get(`/clientes/buscar/${termo}`),
  getEnderecosCliente: (cpf: string) => instance.get(`/clientes/${cpf}/enderecos`),
  getUltimoPedidoCliente: (cpf: string) => instance.get(`/clientes/${cpf}/ultimo_pedido`),
  postClienteCompleto: (cliente: any) => instance.post(`/clientes/completo`, cliente),
  postEndereco: (endereco: any) => instance.post(`/enderecos`, endereco),
  patchClienteCrm: (cpf: string, payload: any) => instance.patch(`/clientes/${cpf}/crm`, payload),

  // --- DEMAIS ---
  getTamanhos: () => instance.get(`/tamanhos`),
  getBordas: () => instance.get(`/bordas`),
  getPrecos: () => instance.get(`/precos`),
  getMotoboys: () => instance.get(`/gestao/motoboys`),
  getAcertoMotoboys: () => instance.get(`/gestao/acerto_motoboys`),
  getPromocoes: () => instance.get(`/gestao/promocoes`),
  postPromocao: (payload: any) => instance.post(`/gestao/promocoes`, payload),
  deletePromocao: (id: number) => instance.delete(`/gestao/promocoes/${id}`),
  getBebidas: () => instance.get(`/bebidas`),
  postBebida: (bebida: any) => 
    instance.post(`/bebidas`, bebida),
  patchBebida: (id: number, bebida: any) => 
    instance.patch(`/bebidas/${id}`, bebida),
  getDashboard: () => instance.get(`/gestao/dashboard`),
  getHistoricoCaixas: () => instance.get(`/gestao/caixas/historico`),
  getDetalhesCaixa: (id: number) => instance.get(`/gestao/caixas/${id}/detalhes`),
  getFuncionarios: () => instance.get(`/gestao/funcionarios`),
  postFuncionario: (payload: any) => instance.post(`/gestao/funcionarios`, payload),
  putFuncionario: (cpf: string, payload: any) => instance.put(`/gestao/funcionarios/${cpf}`, payload),
  patchFuncionarioStatus: (cpf: string) => instance.patch(`/gestao/funcionarios/${cpf}/status`),
  login: (credentials: any) => instance.post(`/login`, credentials),

  // --- FINANCEIRO ---
  getCaixaStatus: () => instance.get(`/financeiro/caixa/status`),
  postAbrirCaixa: (payload: any) => instance.post(`/financeiro/caixa/abrir`, payload),
  postMovimentacaoCaixa: (mov: any) => instance.post(`/financeiro/caixa/movimentacao`, mov),
  postFecharCaixa: (payload: any) => instance.post(`/financeiro/caixa/fechar`, payload),
};
