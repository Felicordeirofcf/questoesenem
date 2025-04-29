'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  buscarQuestoes,
  buscarAreas,
  type Questao
} from '@/app/lib/supabaseClient';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Estatisticas = {
  totalQuestoes: number;
  totalTemas: number;
  categorias: string[];
  temasFrequentes: { [key: string]: number };
};

export default function EstatisticasPage() {
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas as Categorias');

  // Carregar questões e áreas
  useEffect(() => {
    const fetchData = async () => {
      const questoesDB = await buscarQuestoes();
      const areasDB = await buscarAreas();
      setQuestoes(questoesDB);
      setAreas(areasDB.map(area => area.nome));
    };
    fetchData();
  }, []);

  // Calcular estatísticas com base nas questões
  useEffect(() => {
    const calcularEstatisticas = (questoes: Questao[], filtro: string): Estatisticas => {
      const questoesFiltradas = filtro === 'Todas as Categorias' 
        ? questoes 
        : questoes.filter(q => q.area === filtro);

      const totalQuestoes = questoesFiltradas.length;
      const temas = new Set(questoesFiltradas.map(q => q.assunto));
      const totalTemas = temas.size;

      const temasFrequentes: { [key: string]: number } = {};
      questoesFiltradas.forEach(q => {
        temasFrequentes[q.assunto] = (temasFrequentes[q.assunto] || 0) + 1;
        if (q.assunto2) {
          temasFrequentes[q.assunto2] = (temasFrequentes[q.assunto2] || 0) + 1;
        }
        if (q.assunto3) {
          temasFrequentes[q.assunto3] = (temasFrequentes[q.assunto3] || 0) + 1;
        }
      });

      const sortedTemas = Object.entries(temasFrequentes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      return {
        totalQuestoes,
        totalTemas,
        categorias: areas,
        temasFrequentes: Object.fromEntries(sortedTemas),
      };
    };

    if (questoes.length > 0) {
      setEstatisticas(calcularEstatisticas(questoes, categoriaFiltro));
    }
  }, [questoes, categoriaFiltro, areas]);

  const chartData = {
    labels: estatisticas ? Object.keys(estatisticas.temasFrequentes) : [],
    datasets: [
      {
        label: 'Questões',
        data: estatisticas ? Object.values(estatisticas.temasFrequentes) : [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Top 10 Temas Mais Frequentes' },
    },
    scales: { y: { beginAtZero: true } },
  };

  return (

    <main className="min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <header className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Estatísticas do ENEM</h1>
            <p className="text-xl">Análise de temas recorrentes</p>
          </div>
          <div className="space-x-4">
            <Link href="/questoes" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
              Ver Questões
            </Link>
            <Link href="/" className="bg-white hover:bg-gray-100 text-blue-600 px-4 py-2 rounded-md transition-colors">
              Voltar para Início
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Resumo das Estatísticas */}
        <section className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-100 p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Total de Questões</h3>
            <p className="text-4xl font-bold text-blue-600">{estatisticas?.totalQuestoes ?? '...'}</p>
          </div>
          <div className="bg-green-100 p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Total de Temas</h3>
            <p className="text-4xl font-bold text-green-600">{estatisticas?.totalTemas ?? '...'}</p>
          </div>
          <div className="bg-purple-100 p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">Áreas</h3>
            <p className="text-4xl font-bold text-purple-600">{estatisticas?.categorias.length ?? '...'}</p>
          </div>
        </section>

        {/* Filtro por Categoria (agora Área) */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Filtrar por Área</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoriaFiltro("Todas as Categorias")} // Mantém o estado como "Todas as Categorias" para lógica
              className={`px-4 py-2 rounded-md transition-colors ${categoriaFiltro === "Todas as Categorias" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
            >
              Todas as Áreas
            </button>
            {/* Usar as áreas gerenciadas para os botões de filtro */}
            {estatisticas?.categorias.map(areaNome => (
              <button
                key={areaNome}
                onClick={() => setCategoriaFiltro(areaNome)}
                className={`px-4 py-2 rounded-md transition-colors ${categoriaFiltro === areaNome ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
              >
                {areaNome}
              </button>
            ))}
          </div>
        </section>

        {/* Gráfico de Temas */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Top 10 Temas Mais Frequentes</h2>
          {estatisticas ? (
            <Bar options={chartOptions} data={chartData} />
          ) : (
            <p>Carregando estatísticas...</p>
          )}
        </section>
      </div>
    </main>
  );
}
