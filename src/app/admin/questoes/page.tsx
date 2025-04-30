'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  buscarQuestoes,
  excluirQuestao as excluirQuestaoService,
  type Questao,
} from '@/app/lib/supabaseClient';

export default function GerenciarQuestoesPage() {
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const auth = localStorage.getItem('adminAuthenticated');
      if (auth !== 'true') {
        router.push('/admin');
      } else {
        setIsAuthenticated(true);
        const questoesCarregadas = await buscarQuestoes();
        setQuestoes(questoesCarregadas);
      }
      setIsLoading(false);
    };

    checkAuthAndLoad();
  }, [router]);

  const handleExcluirQuestao = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta questão?')) {
      const sucesso = await excluirQuestaoService(id);
      if (sucesso) {
        setQuestoes(prev => prev.filter(q => q.id !== id));
      } else {
        alert('Erro ao excluir a questão.');
      }
    }
  };

  const questoesFiltradas = questoes.filter(q =>
    filtro === '' ||
    q.edicao.toLowerCase().includes(filtro.toLowerCase()) ||
    q.area.toLowerCase().includes(filtro.toLowerCase()) ||
    q.assunto.toLowerCase().includes(filtro.toLowerCase()) ||
    q.enunciado.toLowerCase().includes(filtro.toLowerCase())
  );

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-black">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-200 flex flex-col text-black">
      {/* Cabeçalho */}
      <header className="bg-blue-600 text-white py-6 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gerenciar Questões</h1>
          <Link
            href="/admin/dashboard"
            className="bg-white hover:bg-gray-100 text-blue-600 px-4 py-2 rounded-md transition-colors"
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-100 rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Lista de Questões</h2>
            <div className="flex gap-4">
              <Link href="/admin/questoes/nova" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors">
                Adicionar Nova Questão
              </Link>
              <Link href="/admin/importar" className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors">
                Importar Excel
              </Link>
            </div>
          </div>

          {/* Filtro */}
          <div className="mb-6">
            <label htmlFor="filtro" className="block text-sm font-medium mb-1">Filtrar questões:</label>
            <input
              type="text"
              id="filtro"
              placeholder="Digite para filtrar por edição, área, assunto ou conteúdo..."
              className="w-full p-3 border border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto rounded-md">
            <table className="min-w-full bg-white text-sm text-black border border-gray-200">
              <thead className="bg-gray-100 text-left text-gray-700">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Edição</th>
                  <th className="py-3 px-4">Ano</th>
                  <th className="py-3 px-4">Área</th>
                  <th className="py-3 px-4">Assunto</th>
                  <th className="py-3 px-4">Enunciado</th>
                  <th className="py-3 px-4">Gabarito</th>
                  <th className="py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {questoesFiltradas.length > 0 ? (
                  questoesFiltradas.map((questao) => (
                    <tr key={questao.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{questao.id}</td>
                      <td className="py-3 px-4">{questao.edicao}</td>
                      <td className="py-3 px-4">{questao.ano}</td>
                      <td className="py-3 px-4">{questao.area}</td>
                      <td className="py-3 px-4">{questao.assunto}</td>
                      <td className="py-3 px-4">{questao.enunciado.substring(0, 50)}...</td>
                      <td className="py-3 px-4">{String.fromCharCode(65 + questao.gabarito)}</td>
                      <td className="py-3 px-4 flex gap-2">
                        <Link
                          href={`/admin/questoes/${questao.id}`}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleExcluirQuestao(questao.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-4 px-4 text-center text-gray-600">
                      Nenhuma questão encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
