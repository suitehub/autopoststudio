/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Template, CarouselSlide } from '../types';
import { LayoutTemplate, Plus, FileCode, Sliders, Copy, Trash2, Video, AppWindow, Calendar } from 'lucide-react';

interface TemplatesTabProps {
  templates: Template[];
  onEditTemplate: (templateId: string) => void;
  onCreateTemplate: (name: string, type: 'video' | 'carousel') => void;
  onDeleteTemplate: (templateId: string) => void;
  onDuplicateTemplate: (templateId: string) => void;
}

export default function TemplatesTab({ 
  templates, 
  onEditTemplate, 
  onCreateTemplate,
  onDeleteTemplate,
  onDuplicateTemplate
}: TemplatesTabProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedType, setSelectedType] = useState<'video' | 'carousel'>('video');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    onCreateTemplate(newTemplateName.trim(), selectedType);
    setNewTemplateName('');
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-6" id="templates-tab-panel">
      {/* Tab Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#2d2d30]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <LayoutTemplate className="text-blue-500" size={22} /> Biblioteca de Templates
          </h2>
          <p className="text-xs text-gray-400 mt-1">Crie e edite designs bases no editor integrado. O gerador irá injetar as mídias e textos sobre eles.</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(prev => !prev)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-[0_0_12px_rgba(59,130,246,0.2)]"
        >
          <Plus size={15} /> Novo Template
        </button>
      </div>

      {/* New Template Form Card */}
      {showCreateForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-[#1e1e20] border border-[#2d2d30] rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#2d2d30]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Criar Novo Design</h3>
            <button 
              type="button" 
              onClick={() => setShowCreateForm(false)}
              className="text-[11px] text-gray-500 hover:text-white transition"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono text-gray-400 uppercase">Nome do Template</label>
              <input 
                type="text" 
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="Ex: Reels Promoção de Verão"
                className="w-full bg-[#2a2a2e] border border-[#353538] hover:border-[#404044] focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none mt-1 transition"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-gray-400 uppercase">Tipo de Mídia</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setSelectedType('video')}
                  className={`py-2 text-xs font-semibold rounded-lg border transition ${
                    selectedType === 'video' 
                      ? 'bg-blue-950/40 text-blue-400 border-blue-800' 
                      : 'bg-[#2a2a2e] text-gray-400 border-[#353538] hover:border-[#404044]'
                  }`}
                >
                  Vídeo (9:16)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType('carousel')}
                  className={`py-2 text-xs font-semibold rounded-lg border transition ${
                    selectedType === 'carousel' 
                      ? 'bg-indigo-950/40 text-indigo-400 border-indigo-800' 
                      : 'bg-[#2a2a2e] text-gray-400 border-[#353538] hover:border-[#404044]'
                  }`}
                >
                  Carrossel (1:1)
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Iniciar no Editor
            </button>
          </div>
        </form>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {templates.map(template => {
          const totalElements = template.slides.reduce((acc, slide) => acc + slide.elements.length, 0);
          const totalSlides = template.slides.length;

          return (
            <div 
              key={template.id}
              className="bg-[#1e1e20] border border-[#2d2d30] rounded-xl overflow-hidden hover:border-gray-700 transition flex flex-col justify-between"
            >
              {/* Card visual banner preview based on template type */}
              <div className="h-28 bg-[#171719] relative p-4 flex items-center justify-between border-b border-[#2a2a2d]">
                <div className="space-y-1 z-10">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                    template.type === 'video' 
                      ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-850' 
                      : 'bg-indigo-950/60 text-indigo-400 border border-indigo-850'
                  }`}>
                    {template.type === 'video' ? 'Reels / Shorts' : 'Carrossel Feed'}
                  </span>
                  <h3 className="text-sm font-bold text-white tracking-tight mt-1.5">{template.name}</h3>
                  <p className="text-[10px] text-gray-500 font-mono">ID: {template.id}</p>
                </div>

                {/* Simulated geometric background element */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 shrink-0">
                  {template.type === 'video' ? (
                    <div className="w-12 h-20 bg-cyan-500 rounded-lg border border-cyan-300 flex items-center justify-center font-mono text-[9px] text-white">9:16</div>
                  ) : (
                    <div className="w-16 h-16 bg-indigo-500 rounded-md border border-indigo-300 flex items-center justify-center font-mono text-[9px] text-white">1:1</div>
                  )}
                </div>
              </div>

              {/* Template metrics and details */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#151517] p-2 rounded-lg border border-[#27272a]">
                    <span className="text-[9px] text-gray-500 font-mono block uppercase">Slides</span>
                    <span className="text-xs font-semibold text-white">{template.type === 'carousel' ? totalSlides : 1}</span>
                  </div>
                  <div className="bg-[#151517] p-2 rounded-lg border border-[#27272a]">
                    <span className="text-[9px] text-gray-500 font-mono block uppercase">Camadas</span>
                    <span className="text-xs font-semibold text-white">{totalElements}</span>
                  </div>
                  <div className="bg-[#151517] p-2 rounded-lg border border-[#27272a]">
                    <span className="text-[9px] text-gray-500 font-mono block uppercase">Criado em</span>
                    <span className="text-[10px] font-semibold text-white font-mono truncate block">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Variables found in this template */}
                <div className="bg-[#151517] p-2.5 rounded-lg border border-[#27272a] text-[11px]">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Mapeamento dinâmico (Fórmulas CSV)</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {/* Find variables in template content dynamically */}
                    {template.slides.flatMap(s => s.elements).some(el => el.content.includes('{{')) ? (
                      template.slides
                        .flatMap(s => s.elements)
                        .filter(el => el.content.includes('{{'))
                        .map(el => {
                          const matches = el.content.match(/{{\s*([^}]+)\s*}}/g);
                          return matches ? matches.map(m => m.replace(/{{\s*|\s*}}/g, '')) : [];
                        })
                        .flat()
                        .filter((val, i, arr) => arr.indexOf(val) === i) // unique
                        .map(varName => (
                          <span key={varName} className="px-1.5 py-0.5 font-mono text-[10px] bg-blue-950/40 text-blue-400 border border-blue-900/40 rounded">
                            {varName}
                          </span>
                        ))
                    ) : (
                      <span className="text-gray-600 italic">Nenhuma variável criada. Adicione algo como {"{{titulo}}"} no editor.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#17171a] border-t border-[#2a2a2d]">
                <button
                  onClick={() => onDeleteTemplate(template.id)}
                  className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-950/20 transition"
                  title="Excluir Template"
                >
                  <Trash2 size={14} />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDuplicateTemplate(template.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#2b2b2e] hover:bg-[#343438] text-gray-300 rounded-lg transition"
                  >
                    <Copy size={12} /> Duplicar
                  </button>
                  <button
                    onClick={() => onEditTemplate(template.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#0c8ce9] hover:bg-blue-600 text-white rounded-lg transition"
                  >
                    <Sliders size={12} /> Editar no Canvas
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
