
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuestoesStore, type Area } from '@/app/lib/store';

export default function GerenciarAreasPage() {
  const {
    areas,
    adicionarArea,
    atualizarArea,
    excluirArea,
    getAreasGerenciadas,
  } = useQuestoesStore();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [novaAreaNome, setNovaAreaNome] = useState('');
  const [editandoArea, setEditandoArea] = useState<Area | null>(null);
  const [nomeEditado, setNomeEditado] = useState('');
  const router = useRouter();

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('adminAuthenticated');
      if (auth !== 'true') {
        router.push('/admin');
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleAdicionarArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (novaAreaNome.trim() === '') {
      alert('O nome da área não pode estar vazio.');
      return;
    }
    adicionarArea(novaAreaNome.trim());
    setNovaAreaNome('');
  };

  const handleExcluirArea = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta área? Questões associadas a esta área podem precisar ser atualizadas.')) {
      excluirArea(id);
    }
  };

  const iniciarEdicao = (area: Area) => {
    setEditandoArea(area);
    setNomeEditado(area.nome);
  };

  const salvarEdicao = () => {
    if (editandoArea && nomeEditado.trim() !== '') {
      atualizarArea({ ...editandoArea, nome: nomeEditado.trim() });
      setEditandoArea(null);
      setNomeEditado('');
    } else {
      alert('O nome da área não pode estar vazio.');
    }
  };

  const cancelarEdicao = () => {
    setEditandoArea(null);
    setNomeEditado('');
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return null; // Redirecionamento já foi feito no useEffect
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Cabeçalho */}
      <header className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gerenciar Áreas</h1>
          <div className="space-x-4">
            <Link href="/admin/dashboard" className="bg-white hover:bg-gray-100 text-blue-600 px-4 py-2 rounded-md transition-colors">
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Adicionar Nova Área */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Adicionar Nova Área</h2>
          <form onSubmit={handleAdicionarArea} className="flex gap-4">
            <input
              type="text"
              value={novaAreaNome}
              onChange={(e) => setNovaAreaNome(e.target.value)}
              placeholder="Nome da nova área"
              className="flex-grow p-2 border border-gray-300 rounded-md"
              required
            />
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Adicionar
            </button>
          </form>
        </div>

        {/* Lista de Áreas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Áreas Existentes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Nome</th>
                  <th className="py-3 px-4 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {getAreasGerenciadas().map((area) => (
                  <tr key={area.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{area.id}</td>
                    <td className="py-3 px-4">
                      {editandoArea?.id === area.id ? (
                        <input
                          type="text"
                          value={nomeEditado}
                          onChange={(e) => setNomeEditado(e.target.value)}
                          className="p-1 border border-gray-300 rounded-md"
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
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
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

