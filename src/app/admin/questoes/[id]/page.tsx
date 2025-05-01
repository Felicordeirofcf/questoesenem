'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  buscarQuestaoPorId,
  adicionarQuestao as adicionarQuestaoService,
  atualizarQuestao as atualizarQuestaoService,
  getEdicoesDistintas,
  getAnosDistintos,
  getAssuntosDistintos,
  buscarAreas,
  type Questao,
} from '@/app/lib/supabaseClient';

export default function GerenciarQuestaoPage() {
  const router = useRouter();
  const params = useParams();
  const questaoIdParam = params?.id;
  const isNovaQuestao = questaoIdParam === 'nova';
  const questaoId = isNovaQuestao ? null : parseInt(questaoIdParam as string);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const [edicoes, setEdicoes] = useState<string[]>([]);
  const [anos, setAnos] = useState<number[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [assuntos, setAssuntos] = useState<string[]>([]);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const auth = localStorage.getItem('adminAuthenticated');
      if (auth !== 'true') {
        router.push('/admin');
        return;
      }

      setIsAuthenticated(true);

      const [edicoes, anos, assuntos, areasRaw] = await Promise.all([
        getEdicoesDistintas(),
        getAnosDistintos(),
        getAssuntosDistintos(),
        buscarAreas(),
      ]);

      setEdicoes(edicoes);
      setAnos(anos);
      setAssuntos(assuntos);
      setAreas(areasRaw.map(a => a.nome));

      if (!isNovaQuestao && questaoId) {
        const questaoExistente = await buscarQuestaoPorId(questaoId);
        if (questaoExistente) {
          setQuestao(questaoExistente);
          if (questaoExistente.imagem) {
            setImageBase64(questaoExistente.imagem);
          }
        } else {
          alert('Questão não encontrada!');
          router.push('/admin/dashboard');
        }
      } else {
        setQuestao(prev => ({
          ...prev,
          edicao: edicoes[0] || '',
          area: areasRaw[0]?.nome || '',
        }));
      }

      setIsLoading(false);
    };

    checkAuthAndLoadData();
  }, [router, isNovaQuestao, questaoId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuestao(prev => ({ ...prev, [name]: name === 'ano' ? parseInt(value) : value }));
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

  const handleAlternativaChange = (index: number, value: string) => {
    const novas = [...(questao.alternativas || [])];
    novas[index] = value;
    setQuestao(prev => ({ ...prev, alternativas: novas }));
  };

  const handleGabaritoChange = (index: number) => {
    setQuestao(prev => ({ ...prev, gabarito: index }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questao.edicao || !questao.ano || !questao.area || !questao.assunto || !questao.enunciado || (questao.alternativas || []).some(alt => !alt)) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    if (isNovaQuestao) {
      await adicionarQuestaoService(questao as Omit<Questao, 'id'>);
      alert('Questão salva com sucesso!');
    } else {
      await atualizarQuestaoService({ ...(questao as Questao), id: questaoId! });
      alert('Questão atualizada com sucesso!');
    }

    router.push('/admin/dashboard');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-black">Carregando...</div>;
  if (!isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-gray-200 flex flex-col text-black">
      <header className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">{isNovaQuestao ? 'Adicionar Nova Questão' : 'Editar Questão'}</h1>
          <Link href="/admin/dashboard" className="bg-white hover:bg-gray-100 text-blue-600 px-4 py-2 rounded-md">
            Voltar ao Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-100 rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit}>
            {/* Campos principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[
                { id: 'edicao', label: 'Edição', list: 'edicoes-list', value: questao.edicao },
                { id: 'ano', label: 'Ano', value: questao.ano },
                { id: 'area', label: 'Área', list: 'areas-list', value: questao.area },
                { id: 'assunto', label: 'Assunto Principal', list: 'assuntos-list', value: questao.assunto }
              ].map(({ id, label, list, value }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-sm font-medium mb-1">{label}</label>
                  <input
                    type={id === 'ano' ? 'number' : 'text'}
                    id={id}
                    name={id}
                    list={list}
                    value={value as string | number}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {list && (
                    <datalist id={list}>
                      {(id === 'edicao' ? edicoes : id === 'area' ? areas : assuntos).map((item, i) => (
                        <option key={i} value={item} />
                      ))}
                    </datalist>
                  )}
                </div>
              ))}
            </div>

            {/* Assuntos adicionais */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {['assunto2', 'assunto3'].map(id => (
                <div key={id}>
                  <label htmlFor={id} className="block text-sm font-medium mb-1">{id === 'assunto2' ? 'Assunto 2 (opcional)' : 'Assunto 3 (opcional)'}</label>
                  <input
                    type="text"
                    id={id}
                    name={id}
                    list="assuntos-list"
                    value={(questao as Record<string, any>)[id] || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Upload de imagem */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Imagem (opcional)</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="p-2 border border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {imageBase64 && (
                <div className="mt-2 relative w-full max-w-md">
                  <img src={imageBase64} alt="Imagem" className="rounded-md border max-h-48" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Enunciado */}
            <div className="mb-6">
              <label htmlFor="enunciado" className="block text-sm font-medium mb-1">Enunciado</label>
              <textarea
                id="enunciado"
                name="enunciado"
                rows={6}
                value={questao.enunciado}
                onChange={handleChange}
                className="w-full p-2 border border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Alternativas */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Alternativas (Marque o gabarito correto)</label>
              <div className="space-y-3">
                {(questao.alternativas || []).map((alt, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="gabarito"
                      checked={questao.gabarito === index}
                      onChange={() => handleGabaritoChange(index)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label className="w-6 font-bold">{String.fromCharCode(65 + index)}</label>
                    <input
                      type="text"
                      value={alt}
                      onChange={(e) => handleAlternativaChange(index, e.target.value)}
                      className="flex-grow p-2 border border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Botão */}
            <div className="text-right">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md">
                {isNovaQuestao ? 'Salvar Questão' : 'Atualizar Questão'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
