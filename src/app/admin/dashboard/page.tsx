
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuestoesStore, type Questao } from '@/app/lib/store';

export default function AdminDashboardPage() {
  const { questoes, excluirQuestao, getAreas, getAssuntos } = useQuestoesStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  // Função para fazer logout
  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    router.push('/admin');
  };

  // Função para excluir questão
  const handleExcluirQuestao = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta questão?')) {
      excluirQuestao(id);
    }
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
          <h1 className="text-3xl font-bold">Painel de Administração</h1>
          <div className="space-x-4">
            <Link href="/" className="bg-white hover:bg-gray-100 text-blue-600 px-4 py-2 rounded-md transition-colors">
              Ver Site
            </Link>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Menu de Navegação */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <Link href="/admin/dashboard" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/questoes" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors">
              Gerenciar Questões
            </Link>
            <Link href="/admin/areas" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors">
              Gerenciar Áreas
            </Link>
            <Link href="/admin/importar" className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors">
              Importar Excel
            </Link>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-100 p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Total de Questões</h3>
            <p className="text-4xl font-bold text-blue-600">{questoes.length}</p>
          </div>
          <div className="bg-green-100 p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Áreas</h3>
            <p className="text-4xl font-bold text-green-600">
              {getAreas().length}
            </p>
          </div>
          <div className="bg-purple-100 p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">Assuntos</h3>
            <p className="text-4xl font-bold text-purple-600">
              {getAssuntos().length}
            </p>
          </div>
        </div>

        {/* Lista de Questões Recentes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Questões Recentes</h2>
            <Link href="/admin/questoes/nova" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors">
              Adicionar Nova Questão
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Edição</th>
                  <th className="py-3 px-4 text-left">Ano</th>
                  <th className="py-3 px-4 text-left">Área</th>
                  <th className="py-3 px-4 text-left">Assunto</th>
                  <th className="py-3 px-4 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {questoes.slice(-5).reverse().map((questao) => ( // Mostra as 5 mais recentes
                  <tr key={questao.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{questao.id}</td>
                    <td className="py-3 px-4">{questao.edicao}</td>
                    <td className="py-3 px-4">{questao.ano}</td>
                    <td className="py-3 px-4">{questao.area}</td>
                    <td className="py-3 px-4">{questao.assunto}</td>
                    <td className="py-3 px-4 flex gap-2">
                      <Link href={`/admin/questoes/${questao.id}`} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors">
                        Editar
                      </Link>
                      <button 
                        onClick={() => handleExcluirQuestao(questao.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
                      >
                        Excluir
                      </button>
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
