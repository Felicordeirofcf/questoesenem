'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type Area,
  buscarAreas,
  adicionarArea as adicionarAreaService,
  atualizarArea as atualizarAreaService,
  excluirArea as excluirAreaService,
} from '@/app/lib/supabaseClient';

export default function GerenciarAreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [novaAreaNome, setNovaAreaNome] = useState('');
  const [editandoArea, setEditandoArea] = useState<Area | null>(null);
  const [nomeEditado, setNomeEditado] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const auth = localStorage.getItem('adminAuthenticated');
      if (auth !== 'true') {
        router.push('/admin');
      } else {
        setIsAuthenticated(true);
        const resultado = await buscarAreas();
        setAreas(resultado);
      }
      setIsLoading(false);
    };

    checkAuthAndLoad();
  }, [router]);

  const handleAdicionarArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaAreaNome.trim() === '') {
      alert('O nome da área não pode estar vazio.');
      return;
    }
    await adicionarAreaService(novaAreaNome.trim());
    setNovaAreaNome('');
    const atualizadas = await buscarAreas();
    setAreas(atualizadas);
  };

  const handleExcluirArea = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta área?')) {
      await excluirAreaService(id);
      const atualizadas = await buscarAreas();
      setAreas(atualizadas);
    }
  };

  const iniciarEdicao = (area: Area) => {
    setEditandoArea(area);
    setNomeEditado(area.nome);
  };

  const salvarEdicao = async () => {
    if (editandoArea && nomeEditado.trim() !== '') {
      await atualizarAreaService({ ...editandoArea, nome: nomeEditado.trim() });
      setEditandoArea(null);
      setNomeEditado('');
      const atualizadas = await buscarAreas();
      setAreas(atualizadas);
    } else {
      alert('O nome da área não pode estar vazio.');
    }
  };

  const cancelarEdicao = () => {
    setEditandoArea(null);
    setNomeEditado('');
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-black">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-200 flex flex-col text-black">
      <header className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gerenciar Áreas</h1>
          <Link href="/admin/dashboard" className="bg-white hover:bg-gray-100 text-blue-600 px-4 py-2 rounded-md transition-colors">
            Voltar ao Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-100 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Adicionar Nova Área</h2>
          <form onSubmit={handleAdicionarArea} className="flex gap-4 flex-col sm:flex-row">
            <input
              type="text"
              value={novaAreaNome}
              onChange={(e) => setNovaAreaNome(e.target.value)}
              placeholder="Nome da nova área"
              className="flex-grow p-3 border border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Adicionar
            </button>
          </form>
        </div>

        <div className="bg-gray-100 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Áreas Existentes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-black rounded-md">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Nome</th>
                  <th className="py-3 px-4 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {areas.map((area) => (
                  <tr key={area.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{area.id}</td>
                    <td className="py-3 px-4">
                      {editandoArea?.id === area.id ? (
                        <input
                          type="text"
                          value={nomeEditado}
                          onChange={(e) => setNomeEditado(e.target.value)}
                          className="w-full p-2 border border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        area.nome
                      )}
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      {editandoArea?.id === area.id ? (
                        <>
                          <button
                            onClick={salvarEdicao}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={cancelarEdicao}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => iniciarEdicao(area)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleExcluirArea(area.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
                          >
                            Excluir
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
