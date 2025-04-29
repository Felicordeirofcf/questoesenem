'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tipos
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

// Interface do estado
interface QuestoesState {
  questoes: Questao[];
  areas: Area[];
  proximoId: number;
  proximoAreaId: number;
  adicionarQuestao: (questao: Omit<Questao, 'id'>) => void;
  atualizarQuestao: (questao: Questao) => void;
  excluirQuestao: (id: number) => void;
  importarQuestoes: (questoes: Omit<Questao, 'id'>[]) => void;
  adicionarArea: (nome: string) => void;
  atualizarArea: (area: Area) => void;
  excluirArea: (id: number) => void;
  getEdicoes: () => string[];
  getAnos: () => number[];
  getAreas: () => string[];
  getAreasGerenciadas: () => Area[];
  getAssuntos: () => string[];
}

// Dados iniciais
const areasIniciais: Area[] = [
  { id: 1, nome: 'Linguagens' },
  { id: 2, nome: 'Ciências Humanas' },
  { id: 3, nome: 'Matemática' },
  { id: 4, nome: 'Ciências da Natureza' }, // Adicionando uma área comum
];

const questoesIniciais: Questao[] = [
  {
    id: 1,
    edicao: 'Enem Regular',
    ano: 2022,
    area: 'Linguagens',
    assunto: 'Interpretação de Texto',
    enunciado: 'A língua tupi no Brasil\n\nA língua mais falada e conhecida entre os povos indígenas brasileiros é o tupi, também chamado de tupinambá, tupiniquim ou língua geral. Ela começou a ser usada pelos jesuítas, que aqui chegaram com os primeiros portugueses, para catequizar os índios. Nessa época, o tupi passou a ser tão difundido que era considerado a segunda língua do Brasil, depois do português. Hoje, o tupi é uma língua morta, isto é, não é mais falada por nenhum povo, embora seja estudada para compreensão de documentos históricos. Apesar disso, ela deixou muitas marcas no português falado no Brasil, principalmente nos nomes de lugares, plantas, animais e alimentos.\n\nANDRADE, M. M. Textos para ler, ver e ouvir. São Paulo: Atual, 2000.',
    alternativas: [
      'não é mais falado por nenhum povo, embora seja estudado para compreensão de documentos históricos.',
      'foi substituído pelo português como língua oficial do Brasil.',
      'deixou marcas no português falado no Brasil, principalmente em nomes de lugares.',
      'começou a ser usado pelos jesuítas para catequizar os índios.',
      'era considerado a segunda língua do Brasil, depois do português.'
    ],
    gabarito: 0
  },
  {
    id: 2,
    edicao: 'Enem Digital',
    ano: 2021,
    area: 'Ciências Humanas',
    assunto: 'Sociologia',
    enunciado: 'O conceito de "sociedade em rede" refere-se a uma estrutura social baseada em redes operadas por tecnologias de comunicação e informação fundamentadas na microeletrônica e em redes digitais de computadores que geram, processam e distribuem informação a partir de conhecimento acumulado nos nós dessas redes.\n\nCASTELLS, M. A sociedade em rede. São Paulo: Paz e Terra, 1999 (adaptado).\n\nSegundo o texto, a sociedade em rede caracteriza-se por:',
    alternativas: [
      'Centralização das informações em instituições governamentais.',
      'Utilização de tecnologias digitais para comunicação e processamento de dados.',
      'Restrição do acesso ao conhecimento para grupos sociais privilegiados.',
      'Substituição completa das relações sociais presenciais por virtuais.',
      'Diminuição da importância do conhecimento na era da informação.'
    ],
    gabarito: 1
  },
  {
    id: 3,
    edicao: 'Enem PPL',
    ano: 2020,
    area: 'Matemática',
    assunto: 'Estatística',
    enunciado: 'Um professor aplicou uma prova de matemática em sua turma. Após corrigir as provas, ele construiu um gráfico de barras representando a distribuição das notas obtidas, conforme figura abaixo:\n\n[Gráfico mostrando distribuição de notas: 3 alunos com nota 4, 5 alunos com nota 5, 8 alunos com nota 6, 10 alunos com nota 7, 6 alunos com nota 8, 4 alunos com nota 9, 2 alunos com nota 10]\n\nCom base nesse gráfico, a média das notas da turma é aproximadamente:',
    alternativas: [
      '5,5',
      '6,0',
      '6,5',
      '7,0',
      '7,5'
    ],
    gabarito: 3
  }
];

// Criação do store com persistência
export const useQuestoesStore = create<QuestoesState>()(
  persist(
    (set, get) => ({
      questoes: questoesIniciais,
      areas: areasIniciais,
      proximoId: questoesIniciais.length + 1,
      proximoAreaId: areasIniciais.length + 1,
      
      adicionarQuestao: (questao) => set((state) => {
        const novaQuestao = { ...questao, id: state.proximoId };
        return {
          questoes: [...state.questoes, novaQuestao],
          proximoId: state.proximoId + 1
        };
      }),
      
      atualizarQuestao: (questao) => set((state) => ({
        questoes: state.questoes.map(q => q.id === questao.id ? questao : q)
      })),
      
      excluirQuestao: (id) => set((state) => ({
        questoes: state.questoes.filter(q => q.id !== id)
      })),
      
      importarQuestoes: (questoes) => set((state) => {
        let proximoId = state.proximoId;
        const novasQuestoes = questoes.map(q => {
          const novaQuestao = { ...q, id: proximoId++ };
          return novaQuestao;
        });
        
        return {
          questoes: [...state.questoes, ...novasQuestoes],
          proximoId
        };
      }),
      
      adicionarArea: (nome) => set((state) => {
        const novaArea = { id: state.proximoAreaId, nome };
        return {
          areas: [...state.areas, novaArea],
          proximoAreaId: state.proximoAreaId + 1
        };
      }),
      
      atualizarArea: (area) => set((state) => ({
        areas: state.areas.map(a => a.id === area.id ? area : a)
      })),
      
      excluirArea: (id) => set((state) => {
        // Verificar se a área está sendo usada por alguma questão
        const areaEmUso = state.questoes.some(q => {
          const areaNome = state.areas.find(a => a.id === id)?.nome;
          return q.area === areaNome;
        });
        
        if (areaEmUso) {
          alert('Não é possível excluir esta área pois está sendo usada por questões.');
          return state;
        }
        
        return {
          areas: state.areas.filter(a => a.id !== id)
        };
      }),
      
      getEdicoes: () => {
        const edicoes = new Set(get().questoes.map(q => q.edicao));
        return Array.from(edicoes).sort();
      },
      
      getAnos: () => {
        const anos = new Set(get().questoes.map(q => q.ano));
        return Array.from(anos).sort((a, b) => b - a); // Ordem decrescente
      },
      
      getAreas: () => {
        // Retorna apenas os nomes das áreas para compatibilidade com o código existente
        return get().areas.map(a => a.nome).sort();
      },
      
      getAreasGerenciadas: () => {
        return get().areas;
      },
      
      getAssuntos: () => {
        const assuntos = new Set(get().questoes.map(q => q.assunto));
        return Array.from(assuntos).sort();
      }
    }),
    {
      name: 'questoes-enem-storage',
      skipHydration: typeof window === 'undefined'
    }
  )
);
