'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useQuestoesStore, type Questao } from '@/app/lib/store';

export default function GerenciarQuestaoPage() {
  const router = useRouter();
  const params = useParams();
  const questaoIdParam = params?.id;
  const isNovaQuestao = questaoIdParam === 'nova';
  const questaoId = isNovaQuestao ? null : parseInt(questaoIdParam as string);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    questoes,
    adicionarQuestao,
    atualizarQuestao,
    getEdicoes,
    getAnos,
    getAreas,
    getAssuntos,
  } = useQuestoesStore();

  const [questao, setQuestao] = useState<Partial<Questao>>({
    edicao: '',
    ano: new Date().getFullYear(),
    area: '',
    assunto: '',
    assunto2: '',
    assunto3: '',
    imagem: undefined,
    enunciado: '',
    alternativas: ['', '', '', '', ''],
    gabarito: 0,
  });
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Listas de opções para os filtros (para sugestões ou validação, se necessário)
  const [edicoes, setEdicoes] = useState<string[]>([]);
  const [anos, setAnos] = useState<number[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [assuntos, setAssuntos] = useState<string[]>([]);

  // Verificar autenticação e carregar dados da questão (se editando)
  useEffect(() => {
    const checkAuthAndLoadData = () => {
      const auth = localStorage.getItem('adminAuthenticated');
      if (auth !== 'true') {
        router.push('/admin');
      } else {
        setIsAuthenticated(true);
        // Carregar opções existentes
        const currentEdicoes = getEdicoes();
        const currentAnos = getAnos();
        const currentAreas = getAreas();
        const currentAssuntos = getAssuntos();
        setEdicoes(currentEdicoes);
        setAnos(currentAnos);
        setAreas(currentAreas);
        setAssuntos(currentAssuntos);

        if (!isNovaQuestao && questaoId) {
          const questaoExistente = questoes.find(q => q.id === questaoId);
          if (questaoExistente) {
            setQuestao(questaoExistente);
            if (questaoExistente.imagem) {
              setImageBase64(questaoExistente.imagem);
            }
          } else {
            // Questão não encontrada, redirecionar ou mostrar erro
            alert('Questão não encontrada!');
            router.push('/admin/dashboard');
          }
        } else {
          // Definir valores padrão para nova questão com base nas opções existentes, se houver
          setQuestao(prev => ({
            ...prev,
            edicao: currentEdicoes[0] || '',
            area: currentAreas[0] || '',
          }));
        }
      }
      setIsLoading(false);
    };

    checkAuthAndLoadData();
  }, [router, questaoId, isNovaQuestao, questoes, getEdicoes, getAnos, getAreas, getAssuntos]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuestao(prev => ({ ...prev, [name]: name === 'ano' ? parseInt(value) : value }));
  };

  const handleAlternativaChange = (index: number, value: string) => {
    const novasAlternativas = [...(questao.alternativas || [])];
    novasAlternativas[index] = value;
    setQuestao(prev => ({ ...prev, alternativas: novasAlternativas }));
  };

  const handleGabaritoChange = (index: number) => {
    setQuestao(prev => ({ ...prev, gabarito: index }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageBase64(base64String);
        setQuestao(prev => ({ ...prev, imagem: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageBase64(null);
    setQuestao(prev => ({ ...prev, imagem: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validar dados (simplificado)
    if (!questao.edicao || !questao.ano || !questao.area || !questao.assunto || !questao.enunciado || (questao.alternativas || []).some(alt => !alt)) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const questaoCompleta = questao as Omit<Questao, 'id'>;

    if (isNovaQuestao) {
      adicionarQuestao(questaoCompleta);
      alert('Questão salva com sucesso!');
    } else {
      atualizarQuestao({ ...questaoCompleta, id: questaoId as number });
      alert('Questão atualizada com sucesso!');
    }
    router.push('/admin/dashboard');
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
          <h1 className="text-3xl font-bold">
            {isNovaQuestao ? 'Adicionar Nova Questão' : 'Editar Questão'}
          </h1>
          <Link href="/admin/dashboard" className="bg-white hover:bg-gray-100 text-blue-600 px-4 py-2 rounded-md transition-colors">
            Voltar ao Dashboard
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit}>
            {/* Edição, Ano, Área, Assunto */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div>
                <label htmlFor="edicao" className="block text-sm font-medium text-gray-700 mb-1">Edição</label>
                <input
                  type="text"
                  id="edicao"
                  name="edicao"
                  list="edicoes-list"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={questao.edicao}
                  onChange={handleChange}
                  required
                />
                <datalist id="edicoes-list">
                  {edicoes.map((e, i) => <option key={i} value={e} />)}
                </datalist>
              </div>
              <div>
                <label htmlFor="ano" className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                <input
                  type="number"
                  id="ano"
                  name="ano"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={questao.ano}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                <input
                  type="text"
                  id="area"
                  name="area"
                  list="areas-list"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={questao.area}
                  onChange={handleChange}
                  required
                />
                 <datalist id="areas-list">
                  {areas.map((a, i) => <option key={i} value={a} />)}
                </datalist>
              </div>
              <div>
                <label htmlFor="assunto" className="block text-sm font-medium text-gray-700 mb-1">Assunto Principal</label>
                <input
                  type="text"
                  id="assunto"
                  name="assunto"
                  list="assuntos-list"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={questao.assunto}
                  onChange={handleChange}
                  required
                />
                 <datalist id="assuntos-list">
                  {assuntos.map((a, i) => <option key={i} value={a} />)}
                </datalist>
              </div>
            </div>

            {/* Assuntos adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="assunto2" className="block text-sm font-medium text-gray-700 mb-1">Assunto 2 (opcional)</label>
                <input
                  type="text"
                  id="assunto2"
                  name="assunto2"
                  list="assuntos-list"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={questao.assunto2 || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="assunto3" className="block text-sm font-medium text-gray-700 mb-1">Assunto 3 (opcional)</label>
                <input
                  type="text"
                  id="assunto3"
                  name="assunto3"
                  list="assuntos-list"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={questao.assunto3 || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Upload de imagem */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagem (opcional)</label>
              <div className="flex flex-col space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="p-2 border border-gray-300 rounded-md"
                />
                {imageBase64 && (
                  <div className="mt-2">
                    <div className="relative w-full max-w-md">
                      <img 
                        src={imageBase64} 
                        alt="Imagem da questão" 
                        className="max-w-full h-auto border rounded-md"
                        style={{ maxHeight: '200px' }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enunciado */}
            <div className="mb-6">
              <label htmlFor="enunciado" className="block text-sm font-medium text-gray-700 mb-1">Enunciado</label>
              <textarea
                id="enunciado"
                name="enunciado"
                rows={6}
                className="w-full p-2 border border-gray-300 rounded-md"
                value={questao.enunciado}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            {/* Alternativas e Gabarito */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Alternativas (Marque o gabarito correto)</label>
              <div className="space-y-3">
                {(questao.alternativas || []).map((alt, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="gabarito"
                      id={`gabarito-${index}`}
                      checked={questao.gabarito === index}
                      onChange={() => handleGabaritoChange(index)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor={`alternativa-${index}`} className="w-6 font-bold">{String.fromCharCode(65 + index)}</label>
                    <input
                      type="text"
                      id={`alternativa-${index}`}
                      name={`alternativa-${index}`}
                      className="flex-grow p-2 border border-gray-300 rounded-md"
                      value={alt}
                      onChange={(e) => handleAlternativaChange(index, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Botão Salvar */}
            <div className="text-right">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
              >
                {isNovaQuestao ? 'Salvar Questão' : 'Atualizar Questão'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
