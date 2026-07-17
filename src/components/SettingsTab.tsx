/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, 
  Sparkles, 
  Instagram, 
  CalendarClock, 
  FolderSync, 
  HelpCircle, 
  Terminal, 
  Eye, 
  CheckCircle2, 
  Send 
} from 'lucide-react';

export default function SettingsTab() {
  const [outputPath, setOutputPath] = useState('C:/Users/User/Documents/AutoPost_Studio');
  const [renderSpeed, setRenderSpeed] = useState(80); // percentage speed multiplier
  const [geminiApiKey, setGeminiApiKey] = useState('••••••••••••••••••••••••••••');
  
  // Future toggle states
  const [enableIgDirect, setEnableIgDirect] = useState(false);
  const [autoSchedule, setAutoSchedule] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('18:00');

  // AI Generator Simulator
  const [aiPrompt, setAiPrompt] = useState('Gere 3 dicas de produtividade focada em empreendedores digitais');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<string>('');

  const runAiSimulation = () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setAiResult('');

    setTimeout(() => {
      setAiGenerating(false);
      setAiResult(
        `titulo_principal | subtitulo | titulo_passo_1 | conteudo_passo_1 | chamada_acao | texto_botao\n` +
        `Foque no que dá Retorno | Como maximizar o ROI do seu tempo eliminando distrações improdutivas. | 1. Regra de Pareto (80/20) | Identifique os 20% das ações que geram 80% do faturamento da sua startup e delegue o restante. | Pronto para otimizar seus resultados? | Acessar Treinamento\n` +
        `Rotina Matinal de Sucesso | Hábitos comprovados de milionários para começar o dia com clareza mental. | 1. Planejamento Noturno | Escreva suas 3 tarefas prioritárias do dia seguinte antes de dormir para acordar focado. | Quer mais dicas de alta performance? | Baixar Checklist\n` +
        `A Magia da Delegação | Pare de centralizar tudo e aprenda a liderar de verdade escalando processos. | 1. Crie Manuais Claros | Desenvolva POPs simples antes de contratar o primeiro assistente virtual para seu projeto. | Comece a escalar hoje mesmo | Ler Artigo`
      );
    }, 1800);
  };

  return (
    <div className="space-y-6" id="settings-tab-panel">
      {/* Tab Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#2d2d30]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="text-purple-400" size={22} /> Configurações do Sistema
          </h2>
          <p className="text-xs text-gray-400 mt-1">Ajuste caminhos do PC, simulador de hardware e prepare conexões para módulos futuros.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Core Settings Column */}
        <div className="lg:col-span-6 space-y-5">
          {/* Output path setup */}
          <div className="p-4 bg-[#1e1e20] border border-[#2d2d30] rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FolderSync size={13} className="text-blue-400" /> Diretórios de Exportação (PC)
            </h3>
            
            <div>
              <label className="text-[10px] font-mono text-gray-400 uppercase">Pasta de Destino das Mídias</label>
              <input 
                type="text" 
                value={outputPath}
                onChange={(e) => setOutputPath(e.target.value)}
                className="w-full bg-[#2a2a2e] border border-[#353538] focus:border-blue-500 rounded-lg px-2.5 py-2 text-xs text-white mt-1 focus:outline-none font-mono"
              />
              <p className="text-[9px] text-gray-500 mt-1">O AutoPost Studio criará subpastas com o nome do projeto automaticamente ao gerar.</p>
            </div>

            <div>
              <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 uppercase">
                <span>Velocidade de Renderização (Simulador)</span>
                <span className="text-blue-400">{renderSpeed}%</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={renderSpeed}
                onChange={(e) => setRenderSpeed(parseInt(e.target.value))}
                className="w-full accent-blue-500 bg-gray-800 h-1 rounded-lg cursor-pointer mt-2"
              />
              <div className="flex justify-between text-[9px] text-gray-500 mt-1 font-mono">
                <span>Leve (Economia de CPU)</span>
                <span>Máxima (GPU Multithread)</span>
              </div>
            </div>
          </div>

          {/* Prepared Connections: Instagram & Scheduling */}
          <div className="p-4 bg-[#1e1e20] border border-[#2d2d30] rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Instagram size={13} className="text-pink-400" /> Integração com Redes (Módulo Futuro)
            </h3>
            <p className="text-[10px] text-gray-500 leading-normal">
              Arquitetura preparada para disparar posts automáticos diretamente para as contas vinculadas via API Oficial do Instagram Graph.
            </p>

            <div className="space-y-3 pt-1">
              <label className="flex items-center justify-between p-2.5 bg-[#151518] rounded-lg border border-gray-900 cursor-pointer select-none">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-white block">Postagem Direta Automática</span>
                  <span className="text-[9px] text-gray-500 block">Enviar para rascunhos do Instagram após renderizar.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={enableIgDirect}
                  onChange={(e) => setEnableIgDirect(e.target.checked)}
                  className="rounded border-[#353538] text-pink-500 focus:ring-0 bg-[#2a2a2e] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-[#151518] rounded-lg border border-gray-900 cursor-pointer select-none">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-white block">Agendamento de Postagens</span>
                  <span className="text-[9px] text-gray-500 block">Fila inteligente com distribuição em horários de pico.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={autoSchedule}
                  onChange={(e) => setAutoSchedule(e.target.checked)}
                  className="rounded border-[#353538] text-pink-500 focus:ring-0 bg-[#2a2a2e] w-4 h-4"
                />
              </label>

              {autoSchedule && (
                <div className="p-3 bg-[#2a2d35]/30 rounded-lg border border-blue-900/20 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 uppercase block">Horário de Pico do Perfil</span>
                    <input 
                      type="time" 
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="bg-[#1e1e20] border border-[#353538] rounded p-1 text-xs text-white mt-1 w-full"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 uppercase block">Frequência Semanal</span>
                    <select className="bg-[#1e1e20] border border-[#353538] rounded p-1 text-xs text-white mt-1 w-full">
                      <option>Todo dia</option>
                      <option>Segunda, Quarta e Sexta</option>
                      <option>Apenas Finais de Semana</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI & Future features Column */}
        <div className="lg:col-span-6 space-y-5">
          {/* AI content expansion */}
          <div className="p-4 bg-[#1e1e20] border border-purple-950/40 rounded-xl space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} className="text-purple-400" /> Redação Inteligente (IA Gemini SDK)
              </h3>
              <span className="text-[9px] bg-purple-500/10 text-purple-400 font-mono px-1.5 py-0.5 rounded-full">
                Pronto para uso
              </span>
            </div>

            <p className="text-[10px] text-gray-500 leading-normal">
              Conecte sua chave de API do Gemini para gerar instantaneamente dezenas de ideias, títulos e copies diretamente no formato do AutoPost Studio.
            </p>

            <div>
              <label className="text-[10px] font-mono text-gray-400 uppercase">Gemini API Token Key</label>
              <input 
                type="password" 
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="w-full bg-[#2a2a2e] border border-[#353538] focus:border-blue-500 rounded-lg px-2.5 py-2 text-xs text-white mt-1 focus:outline-none font-mono"
              />
              <p className="text-[9px] text-gray-500 mt-1">Sua chave é salva apenas localmente no PC para segurança do app.</p>
            </div>

            {/* AI Playground Box */}
            <div className="bg-[#151518] border border-gray-950 p-3 rounded-lg space-y-3">
              <span className="text-[9px] font-mono text-purple-400 uppercase block">Playground: Gerador de Ideias em Lote</span>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ex: 5 dicas de finanças para jovens"
                  className="flex-1 bg-[#1e1e20] border border-[#313134] focus:border-purple-500 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  disabled={aiGenerating}
                  onClick={runAiSimulation}
                  className="px-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 rounded text-xs text-white font-bold flex items-center justify-center transition"
                >
                  {aiGenerating ? 'Gerando...' : <Send size={12} />}
                </button>
              </div>

              {aiResult && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-gray-500 uppercase block">Saída Copiável para o Gerador (Formato | ):</span>
                  <textarea 
                    value={aiResult}
                    readOnly
                    rows={4}
                    className="w-full bg-[#1e1e20] border border-gray-900 rounded p-2 text-[10px] text-gray-300 font-mono focus:outline-none"
                  />
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    <span>Pronto! Copie este bloco e cole na aba Gerador.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick instructions / Help */}
          <div className="p-4 bg-[#1e1e20] border border-[#2d2d30] rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle size={13} className="text-amber-400" /> FAQ e Arquitetura do App
            </h3>
            
            <div className="space-y-2.5 text-xs text-gray-400 leading-relaxed">
              <div>
                <p className="font-semibold text-white">Como funciona o renderizador local?</p>
                <p className="text-[11px] mt-0.5">O app utiliza vetorização nativa do Canvas do HTML5 para renderizar cada frame e slide em 1080px sem depender de servidores externos, garantindo privacidade e velocidade de centenas de mídias por minuto.</p>
              </div>
              <div>
                <p className="font-semibold text-white">Como adicionar novas fontes?</p>
                <p className="text-[11px] mt-0.5">Adicione os arquivos de fontes TTF ou OTF na pasta de recursos local do software. O arquivo de estilo as importará automaticamente para a interface do Figma.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
