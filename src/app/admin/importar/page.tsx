'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import {
  importarQuestoes as importarQuestoesService,
  type Questao,
} from '@/app/lib/supabaseClient';

export default function ImportarExcelPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [questoesImportadas, setQuestoesImportadas] = useState<Omit<Questao, 'id'>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('adminAuthenticated');
    if (auth !== 'true') {
      router.push('/admin');
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setQuestoesImportadas([]);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const processarExcel = () => {
    if (!file) {
      setError('Nenhum arquivo selecionado.');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        const questoesProcessadas = json.map((row, index) => {
          if (!row['Edicao'] || !row['Ano'] || !row['Area'] || !row['Assunto'] || !row['Enunciado'] || !row['Alternativa A'] || !row['Alternativa B'] || !row['Alternativa C'] || !row['Alternativa D'] || !row['Alternativa E'] || !row['Gabarito']) {
            throw new Error(`Erro na linha ${index + 2}: Colunas obrigatórias ausentes ou nomeadas incorretamente.`);
          }

          const alternativas = [
            String(row['Alternativa A']),
            String(row['Alternativa B']),
            String(row['Alternativa C']),
            String(row['Alternativa D']),
            String(row['Alternativa E']),
          ];

          const gabaritoChar = String(row['Gabarito']).toUpperCase();
          const gabaritoIndex = gabaritoChar.charCodeAt(0) - 65;

          if (gabaritoIndex < 0 || gabaritoIndex > 4) {
            throw new Error(`Erro na linha ${index + 2}: Gabarito inválido ('${row['Gabarito']}'). Use A, B, C, D ou E.`);
          }

          const ano = parseInt(row['Ano']);
          if (isNaN(ano)) {
            throw new Error(`Erro na linha ${index + 2}: Ano inválido ('${row['Ano']}'). Deve ser um número.`);
          }

          return {
            edicao: String(row['Edicao']),
            ano: ano,
            area: String(row['Area']),
            assunto: String(row['Assunto']),
            enunciado: String(row['Enunciado']),
            alternativas: alternativas,
            gabarito: gabaritoIndex,
          };
        });

        setQuestoesImportadas(questoesProcessadas);
        setSuccessMessage(`${questoesProcessadas.length} questões prontas para importação.`);
      } catch (err: any) {
        console.error("Erro ao processar Excel:", err);
        setError(`Erro ao processar o arquivo: ${err.message}`);
        setQuestoesImportadas([]);
      }
    };

    reader.onerror = () => {
      setError('Erro ao ler o arquivo selecionado.');
      setQuestoesImportadas([]);
    };

    reader.readAsBinaryString(file);
  };

  const handleImportarQuestoes = async () => {
    if (questoesImportadas.length === 0) {
      setError('Nenhuma questão processada para importar.');
      return;
    }
    try {
      await importarQuestoesService(questoesImportadas);
      setSuccessMessage('Importação concluída com sucesso!');
      setQuestoesImportadas([]);
      setFile(null);
      setError(null);
    } catch (err: any) {
      console.error("Erro ao importar questões:", err);
      setError(`Erro ao importar questões: ${err.message}`);
      setSuccessMessage(null);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-black">Carregando...</div>;
  if (!isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-gray-200 flex flex-col text-black">
      <header className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Importar Questões via Excel</h1>
          <Link href="/admin/dashboard" className="bg-white hover:bg-gray-100 text-blue-600 px-4 py-2 rounded-md">
            Voltar ao Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-100 rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Importar de Arquivo Excel (.xlsx)</h2>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-lg font-semibold mb-2 text-blue-800">Instruções</h3>
            <p className="mb-2">Prepare um arquivo com as colunas:</p>
            <code className="block bg-gray-100 p-2 rounded text-sm mb-2">
              Edicao | Ano | Area | Assunto | Enunciado | Alternativa A | B | C | D | E | Gabarito
            </code>
            <p>- A coluna <strong>Gabarito</strong> deve conter apenas A, B, C, D ou E.</p>
          </div>

          <div className="mb-4">
            <label htmlFor="excelFile" className="block text-sm font-medium mb-1">Selecione o arquivo Excel:</label>
            <input
              type="file"
              id="excelFile"
              accept=".xlsx"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-md bg-white"
            />
          </div>

          {file && (
            <button
              onClick={processarExcel}
              disabled={questoesImportadas.length > 0}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mb-4 transition-colors"
            >
              Processar Arquivo
            </button>
          )}

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
          {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{successMessage}</div>}

          {questoesImportadas.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Pré-visualização ({questoesImportadas.length} questões)</h3>
              <div className="overflow-x-auto max-h-96 border rounded-md mb-4">
                <table className="min-w-full bg-white text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="py-2 px-3 text-left">Edição</th>
                      <th className="py-2 px-3 text-left">Ano</th>
                      <th className="py-2 px-3 text-left">Área</th>
                      <th className="py-2 px-3 text-left">Assunto</th>
                      <th className="py-2 px-3 text-left">Enunciado</th>
                      <th className="py-2 px-3 text-left">Gabarito</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questoesImportadas.slice(0, 10).map((q, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">{q.edicao}</td>
                        <td className="py-2 px-3">{q.ano}</td>
                        <td className="py-2 px-3">{q.area}</td>
                        <td className="py-2 px-3">{q.assunto}</td>
                        <td className="py-2 px-3">{q.enunciado?.substring(0, 50)}...</td>
                        <td className="py-2 px-3">{String.fromCharCode(65 + (q.gabarito ?? 0))}</td>
                      </tr>
                    ))}
                    {questoesImportadas.length > 10 && (
                      <tr><td colSpan={6} className="py-2 px-3 text-center text-gray-500">... e mais {questoesImportadas.length - 10} questões.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <button
                onClick={handleImportarQuestoes}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
              >
                Confirmar Importação
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
