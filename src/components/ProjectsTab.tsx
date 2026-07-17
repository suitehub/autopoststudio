/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project, Template } from '../types';
import { FolderKanban, Plus, Calendar, Settings2, Video, AppWindow, ArrowRight, Play, Trash2 } from 'lucide-react';

interface ProjectsTabProps {
  projects: Project[];
  templates: Template[];
  onSelectProjectForGenerator: (projectId: string) => void;
  onCreateProject: (name: string, templateId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export default function ProjectsTab({ 
  projects, 
  templates, 
  onSelectProjectForGenerator, 
  onCreateProject,
  onDeleteProject
}: ProjectsTabProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !selectedTemplateId) return;
    onCreateProject(newProjectName.trim(), selectedTemplateId);
    setNewProjectName('');
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-6" id="projects-tab-panel">
      {/* Tab Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#2d2d30]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderKanban className="text-blue-400" size={22} /> Projetos de Conteúdo
          </h2>
          <p className="text-xs text-gray-400 mt-1">Crie projetos e mapeie fontes de dados para geração em massa automatizada.</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(prev => !prev)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#0c8ce9] hover:bg-blue-600 text-white rounded-lg transition"
        >
          <Plus size={15} /> Novo Projeto
        </button>
      </div>

      {/* New Project Form Card */}
      {showCreateForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-[#1e1e20] border border-[#2d2d30] rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#2d2d30]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Criar Novo Projeto</h3>
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
              <label className="text-[10px] font-mono text-gray-400 uppercase">Nome do Projeto</label>
              <input 
                type="text" 
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Ex: Reels Dicas de Investimento"
                className="w-full bg-[#2a2a2e] border border-[#353538] hover:border-[#404044] focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none mt-1 transition"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-gray-400 uppercase">Template Vinculado</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full bg-[#2a2a2e] border border-[#353538] focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none mt-1 transition"
              >
                {templates.map(tpl => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name} ({tpl.type === 'video' ? 'Vídeo' : 'Carrossel'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-[#10b981] hover:bg-emerald-600 text-white rounded-lg transition"
            >
              Confirmar e Criar
            </button>
          </div>
        </form>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12 bg-[#18181b]/50 border border-dashed border-gray-800 rounded-2xl">
          <FolderKanban size={36} className="text-gray-600 mx-auto mb-3" />
          <p className="text-xs font-semibold text-gray-300">Nenhum projeto ativo</p>
          <p className="text-[11px] text-gray-500 mt-1 max-w-[280px] mx-auto">Crie seu primeiro projeto acima para começar a mapear planilhas e renderizar carrosséis ou vídeos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(project => {
            const linkedTemplate = templates.find(t => t.id === project.templateId);
            return (
              <div 
                key={project.id}
                className="p-4 bg-[#1e1e20] border border-[#2d2d30] rounded-xl hover:border-gray-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-tight">{project.name}</h3>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">ID: {project.id}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${
                      linkedTemplate?.type === 'video' 
                        ? 'bg-cyan-950 text-cyan-400' 
                        : 'bg-indigo-950 text-indigo-400'
                    }`}>
                      {linkedTemplate?.type === 'video' ? <Video size={10} /> : <AppWindow size={10} />}
                      {linkedTemplate?.type === 'video' ? 'Vídeo' : 'Carrossel'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-gray-400 bg-[#161619] p-2.5 rounded-lg border border-[#27272a]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-gray-500 uppercase">Template Vinculado</span>
                      <span className="font-semibold text-white truncate max-w-[150px]" title={linkedTemplate?.name || 'Não encontrado'}>
                        {linkedTemplate?.name || 'Nenhum'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-gray-500 uppercase">Criado em</span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Calendar size={11} /> {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {project.lastGenerated && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-gray-500 uppercase">Último Lote</span>
                        <span className="text-emerald-400 font-mono text-[11px]">
                          {new Date(project.lastGenerated).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#2d2d30]">
                  <button
                    onClick={() => onDeleteProject(project.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-950/20 transition"
                    title="Excluir Projeto"
                  >
                    <Trash2 size={14} />
                  </button>
                  
                  <button
                    onClick={() => onSelectProjectForGenerator(project.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#2b2b2e] hover:bg-[#0c8ce9] text-gray-300 hover:text-white rounded-lg transition"
                  >
                    <Play size={11} /> Ir para o Gerador <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
