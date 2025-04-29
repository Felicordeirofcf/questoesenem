'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  buscarQuestoes,
  getEdicoesDistintas,
  getAnosDistintos,
  getAssuntosDistintos,
  buscarAreas,
  type Questao
} from '@/app/lib/supabaseClient';

export default function QuestoesPage() {
  // Estados
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [filteredQuestoes, setFilteredQuestoes] = useState<Questao[]>([]);
  const [edicaoFiltro, setEdicaoFiltro] = useState('Todas as Edições');
  const [anoFiltro, setAnoFiltro] = useState('Todos os Anos');
  const [areaFiltro, setAreaFiltro] = useState('Todas as Áreas');
  const [assuntoFiltro, setAssuntoFiltro] = useState('Todos os Assuntos');
  const [mostrarSociologia, setMostrarSociologia] = useState(false);
  const [respostasUsuario, setRespostasUsuario] = useState<{ [key: number]: number }>({});
  const [mostrarGabaritos, setMostrarGabaritos] = useState(false);

  // Listas de opções para os filtros
  const [edicoes, setEdicoes] = useState<string[]>([]);
  const [anos, setAnos] = useState<number[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [assuntos, setAssuntos] = useState<string[]>([]);

  // Carregar dados iniciais
  useEffect(() => {
    async function carregarDados() {
      const [questoesData, edicoesData, anosData, assuntosData, areasData] = await Promise.all([
        buscarQuestoes(),
        getEdicoesDistintas(),
        getAnosDistintos(),
        getAssuntosDistintos(),
        buscarAreas()
      ]);

      setQuestoes(questoesData);
      setEdicoes(edicoesData);
      setAnos(anosData);
      setAssuntos(assuntosData);
      setAreas(areasData.map(area => area.nome)); // Corrige para extrair só o nome
    }

    carregarDados();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let result = [...questoes];

    if (edicaoFiltro !== 'Todas as Edições') {
      result = result.filter(q => q.edicao === edicaoFiltro);
    }
    if (anoFiltro !== 'Todos os Anos') {
      result = result.filter(q => q.ano === parseInt(anoFiltro));
    }
    if (areaFiltro !== 'Todas as Áreas') {
      result = result.filter(q => q.area === areaFiltro);
    }
    if (assuntoFiltro !== 'Todos os Assuntos') {
      result = result.filter(q => q.assunto === assuntoFiltro);
    }
    if (mostrarSociologia) {
      result = result.filter(q => q.assunto === 'Sociologia');
    }

    setFilteredQuestoes(result);
  }, [questoes, edicaoFiltro, anoFiltro, areaFiltro, assuntoFiltro, mostrarSociologia]);

  // Limpar filtros
  const limparFiltros = () => {
    setEdicaoFiltro('Todas as Edições');
    setAnoFiltro('Todos os Anos');
    setAreaFiltro('Todas as Áreas');
    setAssuntoFiltro('Todos os Assuntos');
    setMostrarSociologia(false);
  };

  // Mostrar todos os gabaritos
  const mostrarTodosGabaritos = () => {
    setMostrarGabaritos(true);
  };

  // Limpar respostas
  const limparRespostas = () => {
    setRespostasUsuario({});
    setMostrarGabaritos(false);
  };

  // Selecionar resposta
  const selecionarResposta = (questaoId: number, alternativaIndex: number) => {
    setRespostasUsuario(prev => ({
      ...prev,
      [questaoId]: alternativaIndex
    }));
  };

  return (
    
    <main className="min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <header className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Questões do ENEM</h1>
          <div className="space-x-4">
            <Link href="/estatisticas" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors">
              Ver Estatísticas
            </Link>
            <Link href="/" className="bg-white hover:bg-gray-100 text-blue-600 px-4 py-2 rounded-md transition-colors">
              Voltar para Início
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Filtrar Questões</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Filtro de Edição */}
            <div>
              <label htmlFor="edicao" className="block text-sm font-medium text-gray-700 mb-1">Edição</label>
              <select
                id="edicao"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={edicaoFiltro}
                onChange={(e) => setEdicaoFiltro(e.target.value)}
              >
                <option>Todas as Edições</option>
                {edicoes.map((edicao, index) => (
                  <option key={index}>{edicao}</option>
                ))}
              </select>
            </div>

            {/* Filtro de Ano */}
            <div>
              <label htmlFor="ano" className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
              <select
                id="ano"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={anoFiltro}
                onChange={(e) => setAnoFiltro(e.target.value)}
              >
                <option>Todos os Anos</option>
                {anos.map((ano, index) => (
                  <option key={index}>{ano}</option>
                ))}
              </select>
            </div>

            {/* Filtro de Área */}
            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">Área</label>
              <select
                id="area"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={areaFiltro}
                onChange={(e) => setAreaFiltro(e.target.value)}
              >
                <option>Todas as Áreas</option>
                {areas.map((area, index) => (
                  <option key={index}>{area}</option>
                ))}
              </select>
            </div>

            {/* Filtro de Assunto */}
            <div>
              <label htmlFor="assunto" className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
              <select
                id="assunto"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={assuntoFiltro}
                onChange={(e) => setAssuntoFiltro(e.target.value)}
              >
                <option>Todos os Assuntos</option>
                {assuntos.map((assunto, index) => (
                  <option key={index}>{assunto}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Checkbox para Sociologia */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 rounded"
                checked={mostrarSociologia}
                onChange={(e) => setMostrarSociologia(e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-700">Mostrar apenas questões de Sociologia</span>
            </label>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={limparFiltros}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Limpar Filtros
            </button>
            <button
              onClick={mostrarTodosGabaritos}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Mostrar Todos os Gabaritos
            </button>
            <button
              onClick={limparRespostas}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Limpar Todas as Respostas
            </button>
          </div>
        </section>

        {/* Contador de questões */}
        <p className="mb-4 text-gray-700">{filteredQuestoes.length} questões encontradas</p>

        {/* Lista de Questões */}
        <div className="space-y-8">
          {filteredQuestoes.map((questao) => (
            <div key={questao.id} className="bg-white rounded-lg shadow-md p-6">
              {/* Metadados da questão */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">{questao.edicao}</span>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">{questao.ano}</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">{questao.area}</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm">{questao.assunto}</span>
                {questao.assunto2 && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm">{questao.assunto2}</span>
                )}
                {questao.assunto3 && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm">{questao.assunto3}</span>
                )}
              </div>

              {/* Imagem (se existir) */}
              {questao.imagem && (
                <div className="mb-4">
                  <img 
                    src={questao.imagem} 
                    alt="Imagem da questão" 
                    className="max-w-full h-auto rounded-md border border-gray-200"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              )}

              {/* Enunciado */}
              <div className="mb-6">
                <p className="whitespace-pre-line text-gray-800">{questao.enunciado}</p>
              </div>

              {/* Alternativas */}
              <div className="space-y-3">
                {questao.alternativas.map((alternativa, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-md cursor-pointer border ${
                      respostasUsuario[questao.id] === index 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    } ${
                      mostrarGabaritos && questao.gabarito === index
                        ? 'border-green-500 bg-green-50'
                        : ''
                    } ${
                      mostrarGabaritos && respostasUsuario[questao.id] === index && questao.gabarito !== index
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                    onClick={() => selecionarResposta(questao.id, index)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6">
                        <span className="font-bold">{String.fromCharCode(65 + index)})</span>
                      </div>
                      <div className="ml-2">{alternativa}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Gabarito */}
              {(mostrarGabaritos || respostasUsuario[questao.id] !== undefined) && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="font-bold text-gray-700">
                    Gabarito: {String.fromCharCode(65 + questao.gabarito)}
                  </p>
                  {respostasUsuario[questao.id] !== undefined && (
                    <p className={`font-bold ${respostasUsuario[questao.id] === questao.gabarito ? 'text-green-600' : 'text-red-600'}`}>
                      {respostasUsuario[questao.id] === questao.gabarito ? 'Resposta correta!' : 'Resposta incorreta!'}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
