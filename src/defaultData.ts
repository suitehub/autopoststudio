/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Template, Project, HistoryItem } from './types';

export const INITIAL_TEMPLATES: Template[] = [
  {
    id: 'tpl-video-minimal',
    name: 'Sleek Reels - Dicas Financeiras',
    type: 'video',
    createdAt: '2026-07-15T10:00:00Z',
    slides: [
      {
        id: 'slide-v1',
        elements: [
          {
            id: 'v-bg',
            name: 'Fundo Escuro',
            type: 'shape',
            x: 0,
            y: 0,
            width: 1080,
            height: 1920,
            rotation: 0,
            opacity: 100,
            content: '#121214',
            fontFamily: 'Inter',
            fontSize: 16,
            color: '',
            shadow: false,
            align: 'center',
            visible: true
          },
          {
            id: 'v-aesthetic-gradient',
            name: 'Gradiente de Fundo',
            type: 'image',
            x: 40,
            y: 100,
            width: 1000,
            height: 1720,
            rotation: 0,
            opacity: 15,
            content: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
            fontFamily: 'Inter',
            fontSize: 16,
            color: '',
            shadow: false,
            align: 'center',
            visible: true
          },
          {
            id: 'v-player-container',
            name: 'Área do Vídeo (Main)',
            type: 'video',
            x: 90,
            y: 450,
            width: 900,
            height: 850,
            rotation: 0,
            opacity: 100,
            content: 'https://assets.mixkit.co/videos/preview/mixkit-wavy-surface-of-purple-liquid-41680-large.mp4',
            fontFamily: 'Inter',
            fontSize: 16,
            color: '',
            borderRadius: 24,
            borderColor: '#3c3c3c',
            borderWidth: 4,
            shadow: true,
            align: 'center',
            visible: true
          },
          {
            id: 'v-logo',
            name: 'Logo do Canal',
            type: 'logo',
            x: 465,
            y: 150,
            width: 150,
            height: 150,
            rotation: 0,
            opacity: 100,
            content: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150',
            fontFamily: 'Inter',
            fontSize: 16,
            color: '',
            borderRadius: 75,
            shadow: true,
            align: 'center',
            visible: true
          },
          {
            id: 'v-title',
            name: 'Texto Superior (Título)',
            type: 'text',
            x: 90,
            y: 330,
            width: 900,
            height: 100,
            rotation: 0,
            opacity: 100,
            content: '{{titulo}}',
            fontFamily: 'Space Grotesk',
            fontSize: 52,
            color: '#ffffff',
            shadow: true,
            align: 'center',
            visible: true
          },
          {
            id: 'v-desc',
            name: 'Texto Inferior (Descrição)',
            type: 'text',
            x: 90,
            y: 1350,
            width: 900,
            height: 180,
            rotation: 0,
            opacity: 100,
            content: '{{descricao}}',
            fontFamily: 'Inter',
            fontSize: 38,
            color: '#e3e3e3',
            shadow: true,
            align: 'center',
            visible: true
          },
          {
            id: 'v-cta',
            name: 'CTA (Botão de Chamada)',
            type: 'button',
            x: 290,
            y: 1600,
            width: 500,
            height: 110,
            rotation: 0,
            opacity: 100,
            content: '{{cta}}',
            fontFamily: 'Inter',
            fontSize: 36,
            color: '#ffffff',
            backgroundColor: '#0c8ce9',
            borderRadius: 16,
            shadow: true,
            align: 'center',
            visible: true
          },
          {
            id: 'v-watermark',
            name: 'Marca D\'água',
            type: 'text',
            x: 90,
            y: 1760,
            width: 900,
            height: 50,
            rotation: 0,
            opacity: 40,
            content: '@autopost.studio',
            fontFamily: 'Fira Code',
            fontSize: 24,
            color: '#ffffff',
            shadow: false,
            align: 'center',
            visible: true
          }
        ]
      }
    ]
  },
  {
    id: 'tpl-carousel-modern',
    name: 'Carrossel Minimalista de Negócios',
    type: 'carousel',
    createdAt: '2026-07-15T10:05:00Z',
    slides: [
      {
        id: 'slide-c1',
        elements: [
          {
            id: 'c1-bg',
            name: 'Fundo Escuro',
            type: 'shape',
            x: 0,
            y: 0,
            width: 1080,
            height: 1080,
            rotation: 0,
            opacity: 100,
            content: '#18181b',
            fontFamily: 'Inter',
            fontSize: 16,
            color: '',
            shadow: false,
            align: 'center',
            visible: true
          },
          {
            id: 'c1-gradient',
            name: 'Acento de Luz',
            type: 'shape',
            x: -200,
            y: -200,
            width: 600,
            height: 600,
            rotation: 0,
            opacity: 15,
            content: 'radial-gradient(circle, #0c8ce9 0%, transparent 70%)',
            fontFamily: 'Inter',
            fontSize: 16,
            color: '',
            borderRadius: 300,
            shadow: false,
            align: 'center',
            visible: true
          },
          {
            id: 'c1-logo',
            name: 'Logo Principal',
            type: 'logo',
            x: 90,
            y: 100,
            width: 100,
            height: 100,
            rotation: 0,
            opacity: 100,
            content: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100',
            fontFamily: 'Inter',
            fontSize: 16,
            color: '',
            borderRadius: 50,
            shadow: false,
            align: 'left',
            visible: true
          },
          {
            id: 'c1-title',
            name: 'Título Principal',
            type: 'text',
            x: 90,
            y: 300,
            width: 900,
            height: 250,
            rotation: 0,
            opacity: 100,
            content: '{{titulo_principal}}',
            fontFamily: 'Space Grotesk',
            fontSize: 68,
            color: '#ffffff',
            shadow: true,
            align: 'left',
            visible: true
          },
          {
            id: 'c1-subtitle',
            name: 'Subtítulo',
            type: 'text',
            x: 90,
            y: 580,
            width: 900,
            height: 180,
            rotation: 0,
            opacity: 100,
            content: '{{subtitulo}}',
            fontFamily: 'Inter',
            fontSize: 38,
            color: '#a1a1aa',
            shadow: false,
            align: 'left',
            visible: true
          },
          {
            id: 'c1-hint',
            name: 'Aviso Arrastar',
            type: 'text',
            x: 90,
            y: 880,
            width: 900,
            height: 80,
            rotation: 0,
            opacity: 70,
            content: 'Deslize para ver o conteúdo ➔',
            fontFamily: 'Inter',
            fontSize: 28,
            color: '#0c8ce9',
            shadow: false,
            align: 'left',
            visible: true
          }
        ]
      },
      {
        id: 'slide-c2',
        elements: [
          {
            id: 'c2-bg',
            name: 'Fundo Escuro',
            type: 'shape',
            x: 0,
            y: 0,
            width: 1080,
            height: 1080,
            rotation: 0,
            opacity: 100,
            content: '#18181b',
            fontFamily: 'Inter',
            fontSize: 16,
            color: '',
            shadow: false,
            align: 'center',
            visible: true
          },
          {
            id: 'c2-step',
            name: 'Passo Indicador',
            type: 'text',
            x: 90,
            y: 100,
            width: 200,
            height: 80,
            rotation: 0,
            opacity: 100,
            content: 'PASSO 01',
            fontFamily: 'Fira Code',
            fontSize: 32,
            color: '#0c8ce9',
            shadow: false,
            align: 'left',
            visible: true
          },
          {
            id: 'c2-title',
            name: 'Título do Passo',
            type: 'text',
            x: 90,
            y: 200,
            width: 900,
            height: 100,
            rotation: 0,
            opacity: 100,
            content: '{{titulo_passo_1}}',
            fontFamily: 'Space Grotesk',
            fontSize: 52,
            color: '#ffffff',
            shadow: false,
            align: 'left',
            visible: true
          },
          {
            id: 'c2-desc',
            name: 'Descrição do Passo',
            type: 'text',
            x: 90,
            y: 330,
            width: 900,
            height: 220,
            rotation: 0,
            opacity: 100,
            content: '{{conteudo_passo_1}}',
            fontFamily: 'Inter',
            fontSize: 36,
            color: '#d4d4d8',
            shadow: false,
            align: 'left',
            visible: true
          },
          {
            id: 'c2-image',
            name: 'Imagem Auxiliar',
            type: 'image',
            x: 90,
            y: 580,
            width: 900,
            height: 400,
            rotation: 0,
            opacity: 100,
            content: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
            fontFamily: 'Inter',
            fontSize: 16,
            color: '',
            borderRadius: 16,
            shadow: true,
            align: 'center',
            visible: true
          }
        ]
      },
      {
        id: 'slide-c3',
        elements: [
          {
            id: 'c3-bg',
            name: 'Fundo Escuro',
            type: 'shape',
            x: 0,
            y: 0,
            width: 1080,
            height: 1080,
            rotation: 0,
            opacity: 100,
            content: '#18181b',
            fontFamily: 'Inter',
            fontSize: 16,
            color: '',
            shadow: false,
            align: 'center',
            visible: true
          },
          {
            id: 'c3-step',
            name: 'Conclusão',
            type: 'text',
            x: 90,
            y: 150,
            width: 900,
            height: 80,
            rotation: 0,
            opacity: 100,
            content: 'PROMOÇÃO ESPECIAL',
            fontFamily: 'Fira Code',
            fontSize: 32,
            color: '#10b981',
            shadow: false,
            align: 'center',
            visible: true
          },
          {
            id: 'c3-title',
            name: 'Título Final (CTA)',
            type: 'text',
            x: 90,
            y: 260,
            width: 900,
            height: 250,
            rotation: 0,
            opacity: 100,
            content: '{{chamada_acao}}',
            fontFamily: 'Space Grotesk',
            fontSize: 62,
            color: '#ffffff',
            shadow: true,
            align: 'center',
            visible: true
          },
          {
            id: 'c3-btn',
            name: 'Botão de Conversão',
            type: 'button',
            x: 240,
            y: 560,
            width: 600,
            height: 130,
            rotation: 0,
            opacity: 100,
            content: '{{texto_botao}}',
            fontFamily: 'Inter',
            fontSize: 42,
            color: '#ffffff',
            backgroundColor: '#0c8ce9',
            borderRadius: 24,
            shadow: true,
            align: 'center',
            visible: true
          },
          {
            id: 'c3-footer',
            name: 'Rodapé Perfil',
            type: 'text',
            x: 90,
            y: 850,
            width: 900,
            height: 100,
            rotation: 0,
            opacity: 50,
            content: 'Salvar para consultar depois | @autopost.studio',
            fontFamily: 'Inter',
            fontSize: 28,
            color: '#a1a1aa',
            shadow: false,
            align: 'center',
            visible: true
          }
        ]
      }
    ]
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Instagram Financeiro - Mass Gen',
    templateId: 'tpl-video-minimal',
    createdAt: '2026-07-15T10:02:00Z',
    lastGenerated: '2026-07-15T10:06:00Z'
  },
  {
    id: 'proj-2',
    name: 'Carrosséis de Dicas de Carreira',
    templateId: 'tpl-carousel-modern',
    createdAt: '2026-07-15T10:07:00Z'
  }
];

export const INITIAL_HISTORY: HistoryItem[] = [
  {
    id: 'hist-1',
    projectName: 'Instagram Financeiro - Mass Gen',
    templateName: 'Sleek Reels - Dicas Financeiras',
    templateType: 'video',
    date: '2026-07-15 10:06',
    count: 10,
    timeSpentSec: 15,
    exportFormat: 'MP4',
    exportQuality: '1080p',
    exportFps: 30,
    outputPath: '/Desktop/AutoPost_Exports/Instagram Financeiro',
    previewUrls: [
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300',
      'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300'
    ]
  }
];

export const MOCK_CSV_DATA = {
  video: [
    {
      titulo: 'Como Juntar R$ 10mil',
      descricao: '1. Guarde 15% da renda\n2. Crie renda extra no final de semana\n3. Invista em CDB liquidez diária',
      cta: 'Clique no Link da Bio'
    },
    {
      titulo: '3 Hábitos que te Empobrecem',
      descricao: '1. Comprar passivos com cartão de crédito\n2. Não anotar os gastos mensais\n3. Zero investimentos mensais',
      cta: 'Siga @financas.sucesso'
    },
    {
      titulo: 'Onde Investir R$ 1.000 Hoje',
      descricao: '50% em Renda Fixa de curto prazo\n30% em Fundos Imobiliários estáveis\n20% em Ações pagadoras de dividendos',
      cta: 'Comente QUERO para ler o Guia'
    },
    {
      titulo: 'Mentalidade Milionária',
      descricao: 'Pare de comprar coisas para impressionar os outros. Invista em conhecimento e ativos reais.',
      cta: 'Inscreva-se no canal'
    },
    {
      titulo: 'Dica de Ouro de Tesouro Direto',
      descricao: 'Prefixado garante a taxa contratada.\nIPCA protege do fantasma da inflação.\nSelic é para reserva emergencial.',
      cta: 'Compartilhe com um amigo'
    }
  ],
  carousel: [
    {
      titulo_principal: '5 Passos para Design de Landing Pages',
      subtitulo: 'Aprenda a estruturar páginas focadas em conversão que vendem sozinhas.',
      titulo_passo_1: '1. Proposta Única de Valor Clara',
      conteudo_passo_1: 'A primeira dobra da página deve responder em menos de 5 segundos o que o seu produto faz.',
      chamada_acao: 'Gostou do passo a passo para Landing Pages?',
      texto_botao: 'Baixe o Checklist PDF'
    },
    {
      titulo_principal: 'Como Negociar um Aumento Salarial',
      subtitulo: 'Guia definitivo com argumentos sólidos para receber o valor que você merece.',
      titulo_passo_1: '1. Documente Seus Resultados',
      conteudo_passo_1: 'Reúna métricas de projetos entregues, economia gerada e feedbacks positivos de clientes antes de agendar.',
      chamada_acao: 'Quer aprender o roteiro de conversa completo?',
      texto_botao: 'Acesse o Roteiro Grátis'
    },
    {
      titulo_principal: '3 Erros Graves no Marketing Digital',
      subtitulo: 'Identifique gargalos no seu funil e aumente sua taxa de conversão agora.',
      titulo_passo_1: '1. Não Definir um Público Alvo',
      conteudo_passo_1: 'Tentar vender para todo mundo faz você gastar verba de anúncio à toa sem falar com quem realmente compra.',
      chamada_acao: 'Descubra os outros 2 erros graves no nosso blog!',
      texto_botao: 'Ler Artigo Completo'
    }
  ]
};
