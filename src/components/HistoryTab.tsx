/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HistoryItem } from '../types';
import { History, Calendar, HardDrive, Download, ChevronRight, Video, AppWindow, Clock, Sparkles } from 'lucide-react';

interface HistoryTabProps {
  history: HistoryItem[];
  onClearHistory: () => void;
}

export default function HistoryTab({ history, onClearHistory }: HistoryTabProps) {
  return (
    <div className="space-y-6" id="history-tab-panel">
      {/* Tab Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#2d2d30]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="text-blue-400" size={22} /> Histórico de Exportações
          </h2>
          <p className="text-xs text-gray-400 mt-1">Veja os lotes de mídia gerados localmente e seus respectivos caminhos no PC.</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={onClearHistory}
            className="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-red-400 bg-[#232326] hover:bg-red-950/20 border border-[#2d2d30] rounded-lg transition"
          >
            Limpar Histórico
          </button>
        )}
      </div>

      {/* History Grid List */}
      {history.length === 0 ? (
        <div className="text-center py-16 bg-[#18181b]/50 border border-dashed border-gray-800 rounded-2xl">
          <History size={36} className="text-gray-600 mx-auto mb-3" />
          <p className="text-xs font-semibold text-gray-300">Nenhuma exportação realizada ainda</p>
          <p className="text-[11px] text-gray-500 mt-1 max-w-[280px] mx-auto">Vá para a guia do Gerador para rodar suas primeiras planilhas e ver o progresso aqui.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div 
              key={item.id}
              className="p-4 bg-[#1e1e20] border border-[#2d2d30] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Column: Project Metadata */}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-white tracking-tight">{item.projectName}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium flex items-center gap-1 ${
                    item.templateType === 'video' 
                      ? 'bg-cyan-950 text-cyan-400' 
                      : 'bg-indigo-950 text-indigo-400'
                  }`}>
                    {item.templateType === 'video' ? <Video size={10} /> : <AppWindow size={10} />}
                    {item.templateType === 'video' ? 'Vídeo' : 'Carrossel'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Calendar size={11} className="text-gray-500" /> {item.date}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Clock size={11} className="text-gray-500" /> {item.timeSpentSec}s gastos
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400 font-semibold">
                    {item.count} mídias geradas
                  </span>
                  <span className="font-mono text-[10px] text-gray-500">
                    {item.exportFormat} | {item.exportQuality} | {item.exportFps}fps
                  </span>
                </div>

                {/* Simulated Local File Path */}
                <div className="flex items-center gap-1.5 pt-1">
                  <HardDrive size={11} className="text-blue-500" />
                  <span className="text-[10px] font-mono text-gray-500 truncate max-w-[320px]" title={item.outputPath}>
                    Local PC: {item.outputPath}
                  </span>
                </div>
              </div>

              {/* Middle Column: Rendered thumbnails list */}
              {item.previewUrls && item.previewUrls.length > 0 && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.previewUrls.map((url, i) => (
                    <div key={i} className="w-12 h-12 bg-black border border-gray-850 rounded overflow-hidden shadow">
                      <img src={url} alt="Thumbnail" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {item.count > 3 && (
                    <div className="w-8 h-12 bg-[#2a2a2e] border border-gray-850 rounded flex items-center justify-center font-mono text-[10px] text-gray-400 font-semibold">
                      +{item.count - 3}
                    </div>
                  )}
                </div>
              )}

              {/* Right Column: CTA */}
              <div className="shrink-0 flex items-center gap-2">
                <button
                  onClick={() => {
                    // Triggers sequential download of whatever thumbnails are saved
                    item.previewUrls.forEach((url, index) => {
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `ReDownload_${item.projectName.replace(/\s+/g, '_')}_${index + 1}.jpg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    });
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#2a2a2e] hover:bg-[#343438] text-gray-300 rounded-lg transition border border-[#353538]"
                >
                  <Download size={12} /> Redownload Lote
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
