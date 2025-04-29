'use client';

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Tipos ---
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

// --- Funções para Questões ---

export const buscarQuestoes = async (filtros?: {
  edicao?: string;
  ano?: number;
  area?: string;
  assunto?: string;
}): Promise<Questao[]> => {
  let query = supabase.from('questoes').select('*');

  if (filtros?.edicao) query = query.eq('edicao', filtros.edicao);
  if (filtros?.ano) query = query.eq('ano', filtros.ano);
  if (filtros?.area) query = query.eq('area', filtros.area);
  if (filtros?.assunto) query = query.eq('assunto', filtros.assunto);

  const { data, error } = await query.order('id');

  if (error) {
    console.error('Erro ao buscar questões:', error.message);
    return [];
  }
  return data || [];
};

export const buscarQuestaoPorId = async (id: number): Promise<Questao | null> => {
  const { data, error } = await supabase.from('questoes').select('*').eq('id', id).single();
  if (error) {
    console.error('Erro ao buscar questão por ID:', error.message);
    return null;
  }
  return data;
};

export const adicionarQuestao = async (questao: Omit<Questao, 'id'>): Promise<Questao | null> => {
  const { data, error } = await supabase.from('questoes').insert([questao]).select().single();
  if (error) {
    console.error('Erro ao adicionar questão:', error.message);
    return null;
  }
  return data;
};

export const atualizarQuestao = async (questao: Questao): Promise<Questao | null> => {
  const { id, ...updateData } = questao;
  const { data, error } = await supabase.from('questoes').update(updateData).eq('id', id).select().single();
  if (error) {
    console.error('Erro ao atualizar questão:', error.message);
    return null;
  }
  return data;
};

export const excluirQuestao = async (id: number): Promise<boolean> => {
  const { error } = await supabase.from('questoes').delete().eq('id', id);
  if (error) {
    console.error('Erro ao excluir questão:', error.message);
    return false;
  }
  return true;
};

export const importarQuestoes = async (questoes: Omit<Questao, 'id'>[]): Promise<Questao[]> => {
  const { data, error } = await supabase.from('questoes').insert(questoes).select();
  if (error) {
    console.error('Erro ao importar questões:', error.message);
    return [];
  }
  return data || [];
};

// --- Funções para Áreas ---

export const buscarAreas = async (): Promise<Area[]> => {
  const { data, error } = await supabase.from('areas').select('*').order('nome');
  if (error) {
    console.error('Erro ao buscar áreas:', error.message);
    return [];
  }
  return data || [];
};

export const adicionarArea = async (nome: string): Promise<Area | null> => {
  const { data, error } = await supabase.from('areas').insert([{ nome }]).select().single();
  if (error) {
    console.error('Erro ao adicionar área:', error.message);
    return null;
  }
  return data;
};

export const atualizarArea = async (area: Area): Promise<Area | null> => {
  const { id, nome } = area;
  const { data, error } = await supabase.from('areas').update({ nome }).eq('id', id).select().single();
  if (error) {
    console.error('Erro ao atualizar área:', error.message);
    return null;
  }
  return data;
};

export const excluirArea = async (id: number): Promise<boolean> => {
  const { error: deleteError } = await supabase.from('areas').delete().eq('id', id);
  if (deleteError) {
    console.error('Erro ao excluir área:', deleteError.message);
    return false;
  }
  return true;
};

// --- Funções para Distintos (Filtros) ---

export const getEdicoesDistintas = async (): Promise<string[]> => {
  const { data, error } = await supabase.from('questoes').select('edicao');
  if (error) {
    console.error('Erro ao buscar edições:', error.message);
    return [];
  }
  const edicoes = new Set(data?.map(q => q.edicao).filter(Boolean));
  return Array.from(edicoes).sort();
};

export const getAnosDistintos = async (): Promise<number[]> => {
  const { data, error } = await supabase.from('questoes').select('ano');
  if (error) {
    console.error('Erro ao buscar anos:', error.message);
    return [];
  }
  const anos = new Set(data?.map(q => q.ano).filter(Boolean));
  return Array.from(anos).sort((a, b) => b - a);
};

export const getAssuntosDistintos = async (): Promise<string[]> => {
  const { data, error } = await supabase.from('questoes').select('assunto, assunto2, assunto3');
  if (error) {
    console.error('Erro ao buscar assuntos:', error.message);
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
