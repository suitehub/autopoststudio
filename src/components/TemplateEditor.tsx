/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  UploadCloud, 
  Sliders, 
  Play, 
  Settings, 
  Sparkles,
  RefreshCw,
  Video,
  Image as ImageIcon,
  Check,
  Maximize2
} from 'lucide-react';
import { Template, TemplateElement } from '../types';

interface TemplateEditorProps {
  template: Template;
  onSave: (updatedTemplate: Template) => void;
  onBack: () => void;
}

export default function TemplateEditor({ template, onSave, onBack }: TemplateEditorProps) {
  // Local state copy of template
  const [localTemplate, setLocalTemplate] = useState<Template>({ ...template });

  // Extract layers or create defaults if they don't exist
  const getNormalizedLayers = () => {
    const slide = localTemplate.slides[0] || { id: `slide-${Date.now()}`, elements: [] };
    const elements = [...slide.elements];

    let videoEl = elements.find(el => el.type === 'video');
    let imageEl = elements.find(el => el.type === 'image');

    // Default Video Element
    if (!videoEl) {
      videoEl = {
        id: `v-player-${Date.now()}`,
        name: 'Área de Vídeo',
        type: 'video',
        x: 90,
        y: localTemplate.type === 'video' ? 530 : 200,
        width: 900,
        height: localTemplate.type === 'video' ? 850 : 680,
        rotation: 0,
        opacity: 100,
        content: 'https://assets.mixkit.co/videos/preview/mixkit-wavy-surface-of-purple-liquid-41680-large.mp4',
        fontFamily: 'Inter',
        fontSize: 16,
        color: '',
        borderRadius: 16,
        borderColor: '#3c3c3c',
        borderWidth: 4,
        shadow: true,
        align: 'center',
        visible: true
      };
    }

    // Default Template Image Element (e.g. nostalgic dino frame mockup)
    if (!imageEl) {
      imageEl = {
        id: `v-template-img-${Date.now()}`,
        name: 'Template Gráfico Overlay',
        type: 'image',
        x: 0,
        y: 0,
        width: 1080,
        height: localTemplate.type === 'video' ? 1920 : 1080,
        rotation: 0,
        opacity: 100,
        content: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080',
        fontFamily: 'Inter',
        fontSize: 16,
        color: '',
        shadow: false,
        align: 'center',
        visible: true
      };
    }

    // Determine current ordering from the array
    const videoIdx = elements.findIndex(el => el.id === videoEl!.id);
    const imageIdx = elements.findIndex(el => el.id === imageEl!.id);
    
    // If videoIdx < imageIdx, video is rendered FIRST (underneath), so image is on top (PNG Transparent mode)
    const isVideoBehind = videoIdx !== -1 && imageIdx !== -1 ? videoIdx < imageIdx : true;

    return { videoEl, imageEl, isVideoBehind };
  };

  const { videoEl, imageEl, isVideoBehind } = getNormalizedLayers();

  // Selected mode: PNG (video behind) or JPG (video in front)
  const [videoMode, setVideoMode] = useState<'behind' | 'front'>(isVideoBehind ? 'behind' : 'front');

  // Canvas scaling states
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasScale, setCanvasScale] = useState(0.35);

  const CANVAS_WIDTH = 1080;
  const CANVAS_HEIGHT = localTemplate.type === 'video' ? 1920 : 1080;

  // Auto scale canvas preview to fit container
  useEffect(() => {
    function handleResize() {
      if (canvasContainerRef.current) {
        const containerWidth = canvasContainerRef.current.clientWidth - 48;
        const containerHeight = canvasContainerRef.current.clientHeight - 48;
        
        const scaleX = containerWidth / CANVAS_WIDTH;
        const scaleY = containerHeight / CANVAS_HEIGHT;
        const finalScale = Math.min(scaleX, scaleY, 0.75); // Comfort limit
        setCanvasScale(finalScale);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [localTemplate.type]);

  // Sync state back to the Template structure
  const syncAndSave = (updatedVideo: TemplateElement, updatedImage: TemplateElement, mode: 'behind' | 'front') => {
    // Reorder layers depending on the mode
    const elements = mode === 'behind' 
      ? [updatedVideo, updatedImage] // video first, so image renders on top (PNG transparente)
      : [updatedImage, updatedVideo]; // image first, so video renders on top (JPG sólido)

    const updatedTemplate: Template = {
      ...localTemplate,
      slides: [
        {
          id: localTemplate.slides[0]?.id || `slide-${Date.now()}`,
          elements
        }
      ]
    };

    setLocalTemplate(updatedTemplate);
    onSave(updatedTemplate);
  };

  // Adjust properties
  const handleOffsetChange = (newY: number) => {
    const updatedVideo = { ...videoEl, y: newY };
    syncAndSave(updatedVideo, imageEl, videoMode);
  };

  const handleVideoSizeChange = (width: number, height: number) => {
    // Automatically keep centered horizontally: X = (1080 - width) / 2
    const centeredX = Math.round((1080 - width) / 2);
    const updatedVideo = { ...videoEl, width, height, x: centeredX };
    syncAndSave(updatedVideo, imageEl, videoMode);
  };

  const handleVideoXChange = (newX: number) => {
    const updatedVideo = { ...videoEl, x: newX };
    syncAndSave(updatedVideo, imageEl, videoMode);
  };

  const handleVideoBorderRadiusChange = (radius: number) => {
    const updatedVideo = { ...videoEl, borderRadius: radius };
    syncAndSave(updatedVideo, imageEl, videoMode);
  };

  const handleModeChange = (mode: 'behind' | 'front') => {
    setVideoMode(mode);
    syncAndSave(videoEl, imageEl, mode);
  };

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const updatedImage = { ...imageEl, content: dataUrl, name: `Template: ${file.name}` };
        syncAndSave(videoEl, updatedImage, videoMode);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRenameTemplate = (newName: string) => {
    const updatedTemplate = { ...localTemplate, name: newName };
    setLocalTemplate(updatedTemplate);
    onSave(updatedTemplate);
  };

  return (
    <div className="flex flex-col h-full bg-[#08080a] text-[#e4e4e7]" id="template-editor-view">
      {/* Top Header Titlebar */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#0c0c0e] border-b border-[#151519]">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 rounded-lg bg-[#141416] hover:bg-[#1f1f23] text-gray-400 hover:text-white transition-colors border border-gray-800"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-500/20 uppercase tracking-widest">
                {localTemplate.type === 'video' ? 'Vídeo 9:16' : 'Carrossel 1:1'}
              </span>
              <h1 className="text-sm font-bold text-white tracking-wide">Configurar Template</h1>
            </div>
            <p className="text-[10px] font-mono text-gray-500 mt-0.5">Defina a imagem de design base e posicione o contêiner de vídeo</p>
          </div>
        </div>

        <button 
          onClick={onBack}
          className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-[0_0_12px_rgba(59,130,246,0.2)]"
        >
          Concluir Template
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Side: Template Upload and Mode Options */}
        <div className="w-[320px] bg-[#0c0c0e] border-r border-[#151519] flex flex-col overflow-y-auto p-5 space-y-6 select-none">
          
          {/* Template Identity */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Settings size={12} className="text-blue-400" /> Detalhes do Template
            </h3>
            
            <div>
              <label className="text-[9px] font-mono text-gray-500 uppercase">Nome no Sistema</label>
              <input 
                type="text"
                value={localTemplate.name}
                onChange={(e) => handleRenameTemplate(e.target.value)}
                placeholder="Ex: Dino Nostálgico"
                className="w-full bg-[#141416] border border-gray-800 hover:border-gray-700 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none mt-1 transition font-mono"
              />
            </div>
          </div>

          {/* Template Graphic File Upload */}
          <div className="space-y-2.5">
            <h3 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon size={12} className="text-blue-400" /> Imagem de Fundo / Overlay
            </h3>
            
            <div className="relative group border border-dashed border-gray-800 hover:border-blue-500/50 rounded-xl p-5 bg-[#141416]/50 transition text-center cursor-pointer">
              <input 
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleTemplateUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud size={28} className="mx-auto text-gray-500 group-hover:text-blue-400 transition" />
              <p className="text-[11px] font-medium text-gray-300 mt-2">Enviar Imagem Pronta</p>
              <p className="text-[9px] text-gray-500 font-mono mt-1">PNG Transparente ou JPG Sólido</p>
            </div>

            {/* Current filename display */}
            <div className="bg-[#141416] p-2.5 rounded-lg border border-gray-800">
              <span className="text-[9px] font-mono text-gray-500 block uppercase">Arquivo Atual</span>
              <span className="text-xs font-semibold text-gray-300 font-mono truncate block mt-0.5">
                {imageEl.name || 'default_template.png'}
              </span>
            </div>
          </div>

          {/* Rendering Mode Selector */}
          <div className="space-y-2.5">
            <h3 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Maximize2 size={12} className="text-blue-400" /> Modo de Sobreposição do Vídeo
            </h3>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleModeChange('behind')}
                className={`flex items-start gap-3 p-3 text-left rounded-xl border transition ${
                  videoMode === 'behind'
                    ? 'bg-blue-950/30 border-blue-500/40 text-blue-300'
                    : 'bg-[#141416] border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                  videoMode === 'behind' ? 'border-blue-400' : 'border-gray-600'
                }`}>
                  {videoMode === 'behind' && <span className="w-2 h-2 rounded-full bg-blue-400"></span>}
                </div>
                <div>
                  <span className="text-xs font-bold block">Atrás do Template (PNG)</span>
                  <span className="text-[10px] text-gray-500 leading-normal block mt-0.5">O template possui um "furo" transparente e o vídeo toca por trás.</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('front')}
                className={`flex items-start gap-3 p-3 text-left rounded-xl border transition ${
                  videoMode === 'front'
                    ? 'bg-blue-950/30 border-blue-500/40 text-blue-300'
                    : 'bg-[#141416] border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                  videoMode === 'front' ? 'border-blue-400' : 'border-gray-600'
                }`}>
                  {videoMode === 'front' && <span className="w-2 h-2 rounded-full bg-blue-400"></span>}
                </div>
                <div>
                  <span className="text-xs font-bold block">Frente do Template (JPG)</span>
                  <span className="text-[10px] text-gray-500 leading-normal block mt-0.5">O vídeo é renderizado por cima do design como um recorte flutuante.</span>
                </div>
              </button>
            </div>
          </div>

          {/* Advanced Bounding Box adjustment sliders for size */}
          <div className="space-y-3 pt-4 border-t border-gray-900">
            <h4 className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Dimensões Adicionais</h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                  <span>Largura do Vídeo</span>
                  <span className="text-blue-400">{videoEl.width}px</span>
                </div>
                <input 
                  type="range"
                  min="200"
                  max="1080"
                  step="10"
                  value={videoEl.width}
                  onChange={(e) => handleVideoSizeChange(parseInt(e.target.value), videoEl.height)}
                  className="w-full accent-blue-500 bg-gray-800 h-1 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                  <span>Altura do Vídeo</span>
                  <span className="text-blue-400">{videoEl.height}px</span>
                </div>
                <input 
                  type="range"
                  min="200"
                  max="1920"
                  step="10"
                  value={videoEl.height}
                  onChange={(e) => handleVideoSizeChange(videoEl.width, parseInt(e.target.value))}
                  className="w-full accent-blue-500 bg-gray-800 h-1 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                  <span>Cantos Arredondados</span>
                  <span className="text-blue-400">{videoEl.borderRadius || 0}px</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="150"
                  step="4"
                  value={videoEl.borderRadius || 0}
                  onChange={(e) => handleVideoBorderRadiusChange(parseInt(e.target.value))}
                  className="w-full accent-blue-500 bg-gray-800 h-1 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Center Canvas Preview Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#08080a]">
          
          {/* Main Preview Frame */}
          <div 
            ref={canvasContainerRef}
            className="flex-1 bg-[#050507] relative overflow-hidden flex items-center justify-center p-6 select-none"
          >
            {/* Resolution indicator */}
            <div className="absolute top-4 left-4 bg-gray-950/80 text-gray-500 text-[10px] font-mono px-2.5 py-1 rounded-md border border-gray-900 backdrop-blur">
              Resolução Real: {CANVAS_WIDTH} x {CANVAS_HEIGHT} px | Zoom: {Math.round(canvasScale * 100)}%
            </div>

            {/* Live Interactive Scaled Viewport */}
            <div 
              className="relative shadow-2xl transition-all border border-gray-900 bg-black overflow-hidden rounded-lg"
              style={{
                width: `${CANVAS_WIDTH * canvasScale}px`,
                height: `${CANVAS_HEIGHT * canvasScale}px`
              }}
            >
              {/* Image and Video layers positioned exactly according to layer mode */}
              {videoMode === 'behind' ? (
                <>
                  {/* 1. Video behind */}
                  <div 
                    className="absolute border-2 border-dashed border-blue-500 bg-black/40 flex flex-col items-center justify-center transition-all"
                    style={{
                      left: `${videoEl.x * canvasScale}px`,
                      top: `${videoEl.y * canvasScale}px`,
                      width: `${videoEl.width * canvasScale}px`,
                      height: `${videoEl.height * canvasScale}px`,
                      borderRadius: `${(videoEl.borderRadius || 0) * canvasScale}px`,
                      zIndex: 10
                    }}
                  >
                    <div className="text-center p-4">
                      <Play className="text-blue-400 mx-auto animate-pulse mb-2" size={24} />
                      <span className="text-[11px] font-mono font-bold text-blue-300 tracking-wider uppercase block">SEU VÍDEO FICARÁ AQUI</span>
                    </div>
                  </div>

                  {/* 2. Template graphic overlay on top */}
                  <img 
                    src={imageEl.content} 
                    alt="Template Overlay"
                    referrerPolicy="no-referrer"
                    className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
                    style={{ zIndex: 20, opacity: imageEl.opacity / 100 }}
                  />
                </>
              ) : (
                <>
                  {/* 1. Template background underneath */}
                  <img 
                    src={imageEl.content} 
                    alt="Template Background"
                    referrerPolicy="no-referrer"
                    className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
                    style={{ zIndex: 10, opacity: imageEl.opacity / 100 }}
                  />

                  {/* 2. Video on top */}
                  <div 
                    className="absolute border-2 border-dashed border-emerald-500 bg-black/70 flex flex-col items-center justify-center transition-all"
                    style={{
                      left: `${videoEl.x * canvasScale}px`,
                      top: `${videoEl.y * canvasScale}px`,
                      width: `${videoEl.width * canvasScale}px`,
                      height: `${videoEl.height * canvasScale}px`,
                      borderRadius: `${(videoEl.borderRadius || 0) * canvasScale}px`,
                      zIndex: 20
                    }}
                  >
                    <div className="text-center p-4">
                      <Play className="text-emerald-400 mx-auto animate-pulse mb-2" size={24} />
                      <span className="text-[11px] font-mono font-bold text-emerald-300 tracking-wider uppercase block">SEU VÍDEO FICARÁ AQUI</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom Control Bar: Positioning & Y-Offset Slider - EXACTLY AS SCREENSHOT */}
          <div className="p-6 bg-[#0c0c0e] border-t border-[#151519] space-y-4">
            
            {/* Positioning Title Section */}
            <div className="flex items-center gap-2">
              <span className="text-blue-500 font-bold font-mono text-sm">$</span>
              <h3 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-[0.2em]">POSICIONAMENTO</h3>
            </div>

            {/* Slider Row */}
            <div className="flex items-center gap-5">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase w-16 shrink-0">OFFSET</label>
              
              {/* Slider Input */}
              <div className="flex-1 flex items-center gap-4">
                <input 
                  type="range"
                  min="0"
                  max={CANVAS_HEIGHT - 100}
                  step="1"
                  value={videoEl.y}
                  onChange={(e) => handleOffsetChange(parseInt(e.target.value))}
                  className="w-full accent-blue-500 bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />

                {/* Display Boxes matching the screenshot: "[617] [617]" editable text inputs for extreme precision */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative">
                    <input 
                      type="number" 
                      value={videoEl.y}
                      onChange={(e) => handleOffsetChange(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-[70px] bg-[#141416] border border-blue-500/30 text-blue-400 font-mono text-xs font-bold rounded px-2 py-1.5 text-center focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="relative">
                    <input 
                      type="number" 
                      value={videoEl.y}
                      onChange={(e) => handleOffsetChange(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-[70px] bg-[#141416] border border-gray-800 text-gray-400 font-mono text-xs font-bold rounded px-2 py-1.5 text-center focus:outline-none"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Additional details row */}
            <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 pt-1 border-t border-gray-900/40">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 
                Posição Horizontal: {videoEl.x}px (Auto Centralizado)
              </span>
              <span>
                Fórmula de Escala Ativa (1.0x)
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
