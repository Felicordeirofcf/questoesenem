'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-200 text-black">
      {/* Cabeçalho */}
      <header className="bg-blue-600 text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Questões do ENEM</h1>
          <p className="text-xl">Banco de questões para estudos</p>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Boas-vindas */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Bem-vindo ao Banco de Questões do ENEM</h2>
          <p className="mb-6 text-gray-700">
            Este site foi desenvolvido para ajudar estudantes a se prepararem para o Exame Nacional do Ensino Médio (ENEM).
            Aqui você encontrará questões de diferentes edições, organizadas por área de conhecimento e assunto.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/questoes" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
              Ver Todas as Questões
            </Link>
            <Link href="/estatisticas" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors">
              Estatísticas de Temas
            </Link>
          </div>
        </section>

        {/* Seções principais */}
        <div className="grid md:grid-cols-2 gap-8">
          <section className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold mb-4">Pratique com Questões</h2>
            <p className="mb-4 text-gray-700">
              Acesse nossa base de questões do ENEM, filtre por edição, ano, área e assunto.
              Responda às questões e verifique suas respostas com o gabarito.
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Questões de múltipla escolha</li>
              <li>Filtros avançados</li>
              <li>Feedback imediato</li>
            </ul>
            <Link href="/questoes" className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors">
              Acessar questões
            </Link>
          </section>

          <section className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <h2 className="text-2xl font-bold mb-4">Analise Estatísticas</h2>
            <p className="mb-4 text-gray-700">
              Descubra quais são os temas mais recorrentes nas provas do ENEM.
              Visualize gráficos e tabelas com estatísticas detalhadas para orientar seus estudos.
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Gráficos interativos</li>
              <li>Filtros por categoria</li>
              <li>Dados detalhados</li>
            </ul>
            <Link href="/estatisticas" className="inline-block bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors">
              Ver estatísticas
            </Link>
          </section>
        </div>

        {/* Passos de uso */}
        <section className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-2xl font-bold mb-6">Como Utilizar</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                titulo: 'Explore as Questões',
                texto: 'Acesse a página de questões e utilize os filtros para encontrar questões específicas por edição, ano, área ou assunto.'
              },
              {
                titulo: 'Responda às Questões',
                texto: 'Selecione a alternativa que você considera correta para cada questão e verifique sua resposta revelando o gabarito.'
              },
              {
                titulo: 'Analise as Estatísticas',
                texto: 'Consulte a página de estatísticas para identificar os temas mais recorrentes e direcionar seus estudos.'
              }
            ].map((passo, index) => (
              <div className="relative" key={index}>
                <div className="absolute -left-4 -top-4 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div className="bg-blue-50 p-6 rounded-lg h-full">
                  <h3 className="text-xl font-bold mb-2">{passo.titulo}</h3>
                  <p className="text-gray-700">{passo.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Área admin */}
        <div className="mt-8 text-center">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 underline">
            Área de Administração
          </Link>
        </div>
      </div>
    </main>
  );
}
