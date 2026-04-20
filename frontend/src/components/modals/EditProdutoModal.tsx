import { X, Save, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../api';

interface EditProdutoModalProps {
  item: any;
  tipo: 'pizza' | 'bebida';
  onClose: () => void;
  onConfirm: (dados: any) => void;
  onDelete?: () => void;
}

export function EditProdutoModal({ item, tipo, onClose, onConfirm, onDelete }: EditProdutoModalProps) {
  const [dados, setDados] = useState({
    nome: tipo === 'pizza' ? item.nome_sabor : item.nome,
    ingredientes: item.ingredientes || '',
    preco: item.preco || 0,
    preco_pontos: item.preco_pontos || 0,
    precos_por_tamanho: {} as Record<number, number>
  });
  const [tamanhos, setTamanhos] = useState<any[]>([]);

  useEffect(() => {
    if (tipo === 'pizza') {
      api.getTamanhos().then(res => setTamanhos(res.data));
      api.getPrecos().then(res => {
        const precosItem = res.data.filter((p: any) => p.id_sabor === item.id_sabor);
        const map: Record<number, number> = {};
        precosItem.forEach((p: any) => map[p.id_tamanho] = parseFloat(p.preco_base));
        setDados(prev => ({ ...prev, precos_por_tamanho: map }));
      });
    }
  }, [item.id_sabor, tipo]);

  return (
    <div className="fixed inset-0 bg-gray-950/95 flex items-center justify-center p-6 z-[120] backdrop-blur-3xl">
      <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl space-y-8 border-8 border-gray-100 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center border-b-2 border-gray-100 pb-4">
          <h2 className="text-xl font-black uppercase italic">Editar {tipo === 'pizza' ? 'Pizza' : 'Bebida'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-600"><X size={24}/></button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Nome do Produto</label>
            <input 
              value={dados.nome} 
              onChange={e => setDados({...dados, nome: e.target.value})}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-black outline-none focus:border-black"
            />
          </div>

          {tipo === 'pizza' && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Ingredientes</label>
                <textarea 
                  value={dados.ingredientes} 
                  onChange={e => setDados({...dados, ingredientes: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-sm h-24 outline-none focus:border-black"
                />
              </div>
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black text-gray-900 uppercase ml-4">Preços por Tamanho</label>
                <div className="grid grid-cols-2 gap-3">
                  {tamanhos.map(t => (
                    <div key={t.id_tamanho} className="flex items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-100">
                      <span className="text-[9px] font-black uppercase text-gray-400 flex-1">{t.nome_tamanho}</span>
                      <input 
                        type="number"
                        value={dados.precos_por_tamanho[t.id_tamanho] || 0}
                        onChange={e => setDados({...dados, precos_por_tamanho: {...dados.precos_por_tamanho, [t.id_tamanho]: parseFloat(e.target.value)}})}
                        className="w-16 bg-transparent text-right font-black text-xs text-green-700 outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            {tipo === 'bebida' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Preço (R$)</label>
                <input 
                  type="number"
                  value={dados.preco} 
                  onChange={e => setDados({...dados, preco: parseFloat(e.target.value)})}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-black outline-none focus:border-black"
                />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Resgate (Pts)</label>
              <input 
                type="number"
                value={dados.preco_pontos} 
                onChange={e => setDados({...dados, preco_pontos: parseInt(e.target.value)})}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-black outline-none focus:border-black text-amber-600"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          {onDelete && (
            <button 
              onClick={() => { if(confirm("Deseja realmente excluir?")) onDelete(); }}
              className="p-5 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all"
            >
              <Trash2 size={20}/>
            </button>
          )}
          <button 
            onClick={() => onConfirm(dados)}
            className="flex-1 bg-black text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-xl"
          >
            <Save size={18}/> Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
