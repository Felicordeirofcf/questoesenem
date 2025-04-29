import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rpmasbijblaghshlftkh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwbWFzYmlqYmxhZ2hzaGxmdGtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MjkxMjIsImV4cCI6MjA2MTUwNTEyMn0.-bewKzvVvplYCU2Djpbuj4HIxpcrTwxo2yM9YvOrg1A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos (mantidos para referência, mas não são mais o estado do store)
export type Questao = {
  id: number;
  edicao: string;
  ano: number;
  area: string;
  assunto: string;
  assunto2?: string;
  assunto3?: string;
  imagem?: string;
  enunciado: string;
  alternativas: string[];
  gabarito: number;
};

export type Area = {
  id: number;
  nome: string;
};

// Funções de Serviço para interagir com o Supabase

// --- Funções para Questões ---

export const buscarQuestoes = async (filtros?: {
  edicao?: string;
  ano?: number;
  area?: string;
  assunto?: string;
}): Promise<Questao[]> => {
  let query = supabase.from('questoes').select('*');

  if (filtros?.edicao) {
    query = query.eq('edicao', filtros.edicao);
  }
  if (filtros?.ano) {
    query = query.eq('ano', filtros.ano);
  }
  if (filtros?.area) {
    query = query.eq('area', filtros.area);
  }
  if (filtros?.assunto) {
    // Considerar busca em assunto, assunto2, assunto3 se necessário
    query = query.eq('assunto', filtros.assunto);
  }

  const { data, error } = await query.order('id');

  if (error) {
    console.error('Erro ao buscar questões:', error);
    return [];
  }
  return data || [];
};

export const buscarQuestaoPorId = async (id: number): Promise<Questao | null> => {
  const { data, error } = await supabase
    .from('questoes')
    .select('*')
    .eq('id', id)
    .single(); // .single() retorna um objeto ou null

  if (error) {
    console.error('Erro ao buscar questão por ID:', error);
    return null;
  }
  return data;
};

export const adicionarQuestao = async (questao: Omit<Questao, 'id'>): Promise<Questao | null> => {
  const { data, error } = await supabase
    .from('questoes')
    .insert([questao])
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar questão:', error);
    return null;
  }
  return data;
};

export const atualizarQuestao = async (questao: Questao): Promise<Questao | null> => {
  const { id, ...updateData } = questao;
  const { data, error } = await supabase
    .from('questoes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar questão:', error);
    return null;
  }
  return data;
};

export const excluirQuestao = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('questoes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir questão:', error);
    return false;
  }
  return true;
};

export const importarQuestoes = async (questoes: Omit<Questao, 'id'>[]): Promise<Questao[]> => {
  const { data, error } = await supabase
    .from('questoes')
    .insert(questoes)
    .select();

  if (error) {
    console.error('Erro ao importar questões:', error);
    return [];
  }
  return data || [];
};

// --- Funções para Áreas ---

export const buscarAreas = async (): Promise<Area[]> => {
  const { data, error } = await supabase
    .from('areas')
    .select('*')
    .order('nome');

  if (error) {
    console.error('Erro ao buscar áreas:', error);
    return [];
  }
  return data || [];
};

export const adicionarArea = async (nome: string): Promise<Area | null> => {
  const { data, error } = await supabase
    .from('areas')
    .insert([{ nome }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar área:', error);
    // Verificar se o erro é de violação de unicidade
    if (error.code === '23505') { // Código de erro PostgreSQL para unique_violation
      alert('Erro: Já existe uma área com este nome.');
    } else {
      alert('Erro ao adicionar área.');
    }
    return null;
  }
  return data;
};

export const atualizarArea = async (area: Area): Promise<Area | null> => {
  const { id, nome } = area;
  const { data, error } = await supabase
    .from('areas')
    .update({ nome })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar área:', error);
    if (error.code === '23505') {
      alert('Erro: Já existe uma área com este nome.');
    } else {
      alert('Erro ao atualizar área.');
    }
    return null;
  }
  return data;
};

export const excluirArea = async (id: number): Promise<boolean> => {
  // 1. Verificar se a área está sendo usada
  const areaData = await supabase.from('areas').select('nome').eq('id', id).single();
  if (!areaData.data) {
    console.error('Área não encontrada para exclusão');
    return false;
  }
  const areaNome = areaData.data.nome;

  const { data: questoesUsando, error: checkError } = await supabase
    .from('questoes')
    .select('id')
    .eq('area', areaNome)
    .limit(1); // Só precisamos saber se existe pelo menos uma

  if (checkError) {
    console.error('Erro ao verificar uso da área:', checkError);
    alert('Erro ao verificar se a área está em uso.');
    return false;
  }

  if (questoesUsando && questoesUsando.length > 0) {
    alert('Não é possível excluir esta área pois está sendo usada por questões.');
    return false;
  }

  // 2. Excluir a área se não estiver em uso
  const { error: deleteError } = await supabase
    .from('areas')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('Erro ao excluir área:', deleteError);
    alert('Erro ao excluir área.');
    return false;
  }
  return true;
};

// --- Funções Auxiliares (para filtros, etc.) ---

export const getEdicoesDistintas = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('questoes')
    .select('edicao');

  if (error) {
    console.error('Erro ao buscar edições:', error);
    return [];
  }
  const edicoes = new Set((data || []).map(q => q.edicao).filter(Boolean)); // filter(Boolean) remove null/undefined
  return Array.from(edicoes).sort();
};

export const getAnosDistintos = async (): Promise<number[]> => {
  const { data, error } = await supabase
    .from('questoes')
    .select('ano');

  if (error) {
    console.error('Erro ao buscar anos:', error);
    return [];
  }
  const anos = new Set((data || []).map(q => q.ano).filter(Boolean));
  return Array.from(anos).sort((a, b) => b - a);
};

export const getAssuntosDistintos = async (): Promise<string[]> => {
  // Busca assuntos de todas as colunas relevantes
  const { data, error } = await supabase
    .from('questoes')
    .select('assunto, assunto2, assunto3');

  if (error) {
    console.error('Erro ao buscar assuntos:', error);
    return [];
  }
  const assuntos = new Set<string>();
  (data || []).forEach(q => {
    if (q.assunto) assuntos.add(q.assunto);
    if (q.assunto2) assuntos.add(q.assunto2);
    if (q.assunto3) assuntos.add(q.assunto3);
  });
  return Array.from(assuntos).sort();
};

// Nota: As funções getAreas e getAreasGerenciadas foram combinadas em buscarAreas.
// Você pode filtrar o resultado de buscarAreas se precisar apenas dos nomes.

