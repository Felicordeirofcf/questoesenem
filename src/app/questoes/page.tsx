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
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [filteredQuestoes, setFilteredQuestoes] = useState<Questao[]>([]);
  const [edicaoFiltro, setEdicaoFiltro] = useState('Todas as Edições');
  const [anoFiltro, setAnoFiltro] = useState('Todos os Anos');
  const [areaFiltro, setAreaFiltro] = useState('Todas as Áreas');
  const [assuntoFiltro, setAssuntoFiltro] = useState('Todos os Assuntos');
  const [mostrarSociologia, setMostrarSociologia] = useState(false);
  const [respostasUsuario, setRespostasUsuario] = useState<{ [key: number]: number }>({});
  const [mostrarGabaritos, setMostrarGabaritos] = useState(false);

  const [edicoes, setEdicoes] = useState<string[]>([]);
  const [anos, setAnos] = useState<number[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [assuntos, setAssuntos] = useState<string[]>([]);

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
      setAreas(areasData.map(area => area.nome));
    }

    carregarDados();
  }, []);

  useEffect(() => {
    let result = [...questoes];

    if (edicaoFiltro !== 'Todas as Edições') result = result.filter(q => q.edicao === edicaoFiltro);
    if (anoFiltro !== 'Todos os Anos') result = result.filter(q => q.ano === parseInt(anoFiltro));
    if (areaFiltro !== 'Todas as Áreas') result = result.filter(q => q.area === areaFiltro);
    if (assuntoFiltro !== 'Todos os Assuntos') result = result.filter(q => q.assunto === assuntoFiltro);
    if (mostrarSociologia) result = result.filter(q => q.area === 'Sociologia');

    setFilteredQuestoes(result);
  }, [questoes, edicaoFiltro, anoFiltro, areaFiltro, assuntoFiltro, mostrarSociologia]);

  const limparFiltros = () => {
    setEdicaoFiltro('Todas as Edições');
    setAnoFiltro('Todos os Anos');
    setAreaFiltro('Todas as Áreas');
    setAssuntoFiltro('Todos os Assuntos');
    setMostrarSociologia(false);
  };

  const mostrarTodosGabaritos = () => setMostrarGabaritos(true);
  const limparRespostas = () => {
    setRespostasUsuario({});
    setMostrarGabaritos(false);
  };

  const selecionarResposta = (questaoId: number, alternativaIndex: number) => {
    setRespostasUsuario(prev => ({ ...prev, [questaoId]: alternativaIndex }));
  };

  return (
    <main className="min-h-screen bg-gray-200 text-black">
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

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Filtrar Questões</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {[{
              label: 'Edição',
              value: edicaoFiltro,
              set: setEdicaoFiltro,
              options: ['Todas as Edições', ...edicoes]
            }, {
              label: 'Ano',
              value: anoFiltro,
              set: setAnoFiltro,
              options: ['Todos os Anos', ...anos.map(a => a.toString())]
            }, {
              label: 'Área',
              value: areaFiltro,
              set: setAreaFiltro,
              options: ['Todas as Áreas', ...areas]
            }, {
              label: 'Assunto',
              value: assuntoFiltro,
              set: setAssuntoFiltro,
              options: ['Todos os Assuntos', ...assuntos]
            }].map(({ label, value, set, options }, i) => (
              <div key={i}>
                <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>
                <select
                  className="w-full p-2 border border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                >
                  {options.map((opt, i) => <option key={i}>{opt}</option>)}
                </select>
              </div>
            ))}
          </div>

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

          <div className="flex flex-wrap gap-4">
            <button onClick={limparFiltros} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors">Limpar Filtros</button>
            <button onClick={mostrarTodosGabaritos} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors">Mostrar Todos os Gabaritos</button>
            <button onClick={limparRespostas} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors">Limpar Todas as Respostas</button>
          </div>
        </section>

        {/* Contador */}
        <p className="mb-4 text-gray-700">{filteredQuestoes.length} questões encontradas</p>

        {/* Questões */}
        <div className="space-y-8">
          {filteredQuestoes.map((q) => (
            <div key={q.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">{q.edicao}</span>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">{q.ano}</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">{q.area}</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm">{q.assunto}</span>
                {q.assunto2 && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm">{q.assunto2}</span>}
                {q.assunto3 && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm">{q.assunto3}</span>}
              </div>

              {q.imagem && (
                <div className="mb-4">
                  <img src={q.imagem} alt="Imagem da questão" className="max-w-full h-auto rounded-md border border-gray-200" style={{ maxHeight: '300px' }} />
                </div>
              )}

              <p className="whitespace-pre-line text-gray-800 mb-6">{q.enunciado}</p>

              <div className="space-y-3">
                {q.alternativas.map((alt, index) => {
                  const isSelected = respostasUsuario[q.id] === index;
                  const isCorrect = q.gabarito === index;
                  const isWrong = isSelected && !isCorrect;

                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-md cursor-pointer border transition-all ${
                        isCorrect && mostrarGabaritos ? 'border-green-500 bg-green-50' :
                        isWrong && mostrarGabaritos ? 'border-red-500 bg-red-50' :
                        isSelected ? 'border-blue-500 bg-blue-50' :
                        'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => selecionarResposta(q.id, index)}
                    >
                      <div className="flex items-start">
                        <div className="w-6 font-bold">{String.fromCharCode(65 + index)})</div>
                        <div className="ml-2">{alt}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {(mostrarGabaritos || respostasUsuario[q.id] !== undefined) && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="font-bold text-gray-700">Gabarito: {String.fromCharCode(65 + q.gabarito)}</p>
                  {respostasUsuario[q.id] !== undefined && (
                    <p className={`font-bold ${respostasUsuario[q.id] === q.gabarito ? 'text-green-600' : 'text-red-600'}`}>
                      {respostasUsuario[q.id] === q.gabarito ? 'Resposta correta!' : 'Resposta incorreta!'}
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
