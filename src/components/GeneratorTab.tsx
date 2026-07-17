/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Template, ExportConfig, HistoryItem } from '../types';
import { renderElementsToCanvas, downloadDataUrl, drawVideoCover } from '../utils/renderer';
import JSZip from 'jszip';
import { 
  Sparkles, 
  Cpu, 
  FileVideo, 
  Play, 
  Loader2, 
  Download, 
  UploadCloud,
  Layers,
  Thermometer,
  CloudSun,
  Video,
  CheckCircle,
  AlertCircle,
  Archive,
  Trash2,
  List,
  Grid
} from 'lucide-react';

interface GeneratorTabProps {
  templates: Template[];
  selectedTemplateId: string | null;
  onSelectTemplate: (id: string) => void;
  onAddHistory: (item: HistoryItem) => void;
}

// Built-in Premium high-quality background videos list to make it easy
const STOCK_VIDEOS = [
  {
    id: 'vid-lofi',
    name: '🌊 Abstrato Líquido Lofi',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-wavy-surface-of-purple-liquid-41680-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150'
  },
  {
    id: 'vid-cyberpunk',
    name: '🏙️ Metrópole Cyber Neon',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-urban-traffic-at-night-with-light-trails-34283-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?w=150'
  },
  {
    id: 'vid-nature',
    name: '🍃 Cachoeira Cinematic',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-forest-2213-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=150'
  },
  {
    id: 'vid-space',
    name: '🌌 Universo Profundo',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150'
  }
];

export default function GeneratorTab({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onAddHistory
}: GeneratorTabProps) {
  // 1. Select template
  const [activeTemplateId, setActiveTemplateId] = useState<string>('');
  
  useEffect(() => {
    if (selectedTemplateId) {
      setActiveTemplateId(selectedTemplateId);
    } else if (templates.length > 0 && !activeTemplateId) {
      setActiveTemplateId(templates[0].id);
    }
  }, [selectedTemplateId, templates]);

  const activeTemplate = templates.find(t => t.id === activeTemplateId);

  // 2. Select Video State
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>(STOCK_VIDEOS[0].url);
  const [selectedVideoName, setSelectedVideoName] = useState<string>(STOCK_VIDEOS[0].name);
  const [customVideoFile, setCustomVideoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Video Fit Adjustments State (Zoom and Pan)
  const [selectedVideoZoom, setSelectedVideoZoom] = useState<number>(1.0);
  const [selectedVideoOffsetX, setSelectedVideoOffsetX] = useState<number>(0);
  const [selectedVideoOffsetY, setSelectedVideoOffsetY] = useState<number>(0);

  // 3. Customize template texts & variables state
  const [variables, setVariables] = useState<Record<string, string>>({
    titulo: 'VÍDEO DE IMPACTO',
    descricao: 'Aprenda a criar designs cinematográficos e dinâmicos para suas redes sociais em massa.',
    cta: 'ACESSE O LINK NA BIO'
  });

  // 4. Batch/Lote Mode States
  const [generationMode, setGenerationMode] = useState<'single' | 'batch'>('single');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [batchFiles, setBatchFiles] = useState<{
    id: string;
    name: string;
    url: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    compiledUrl?: string;
    posterUrl?: string;
    zoom?: number;
    offsetX?: number;
    offsetY?: number;
    errorReason?: string;
  }[]>([]);
  const batchFileInputRef = useRef<HTMLInputElement>(null);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);

  // Handler for custom local MP4 file upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedVideoUrl(url);
      setSelectedVideoName(`📹 Upload: ${file.name}`);
      setCustomVideoFile(file);
      addTerminalLog(`[UPLOAD] >> Arquivo de vídeo selecionado: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
    }
  };

  // Handler for custom local MP4 files batch upload
  const handleBatchVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files) as File[];
      const newItems = fileList.map((file, idx) => {
        const url = URL.createObjectURL(file);
        return {
          id: `batch-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          url: url,
          status: 'pending' as const,
          progress: 0,
          zoom: 1.0,
          offsetX: 0,
          offsetY: 0
        };
      });
      setBatchFiles(prev => {
        const updated = [...prev, ...newItems];
        // Auto-select first item if none is currently selected
        if (!selectedBatchId && updated.length > 0) {
          const first = updated[0];
          setSelectedBatchId(first.id);
          setSelectedVideoUrl(first.url);
          setSelectedVideoName(`Lote: ${first.name}`);
          setSelectedVideoZoom(first.zoom || 1.0);
          setSelectedVideoOffsetX(first.offsetX || 0);
          setSelectedVideoOffsetY(first.offsetY || 0);
        }
        return updated;
      });
      addTerminalLog(`[LOTE] >> Adicionados ${files.length} vídeos para a fila de renderização em lote.`);
    }
  };

  // Handler for selecting an individual batch item to preview and adjust crop/zoom
  const handleSelectBatchItem = (item: typeof batchFiles[0]) => {
    setSelectedBatchId(item.id);
    setSelectedVideoUrl(item.url);
    setSelectedVideoName(`Lote: ${item.name}`);
    setSelectedVideoZoom(item.zoom || 1.0);
    setSelectedVideoOffsetX(item.offsetX || 0);
    setSelectedVideoOffsetY(item.offsetY || 0);
    addTerminalLog(`[PREVIEW] >> Selecionado item do lote: "${item.name}" para prévia.`);
  };

  // Live J.A.R.V.I.S operation logs
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[SISTEMA] >> Render de vídeo em tempo real ativado.',
    '[J.A.R.V.I.S.] >> Aguardando seleção de template e vídeo de entrada...',
    '[PRONTO] >> Selecione ou envie o vídeo para mesclar no frame.'
  ]);

  const addTerminalLog = (log: string) => {
    setTerminalLogs(prev => [...prev.slice(-12), log]);
  };

  // Mass render / compilation simulation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [finalVideoOutput, setFinalVideoOutput] = useState<string | null>(null);
  const [finalOverlayOutput, setFinalOverlayOutput] = useState<string | null>(null);
  const [finalPosterOutput, setFinalPosterOutput] = useState<string | null>(null);
  const [exportExtension, setExportExtension] = useState<string>('mp4');
  const [timeSpent, setTimeSpent] = useState<number>(0);

  // Canvas ref for exporting high-quality poster frame
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);

  // Validator to test if generated video is playable and consistent
  const validateVideoBlob = async (blob: Blob, originalDuration: number): Promise<{ isValid: boolean; reason?: string }> => {
    if (blob.size < 20000) {
      return { isValid: false, reason: `Arquivo muito pequeno (${Math.round(blob.size / 1024)}KB). Possível falha na gravação.` };
    }
    
    return new Promise((resolve) => {
      const testVideo = document.createElement('video');
      testVideo.src = URL.createObjectURL(blob);
      testVideo.preload = 'auto';
      testVideo.muted = true;
      testVideo.playsInline = true;
      
      let isChecked = false;
      const timeoutId = setTimeout(() => {
        if (!isChecked) {
          isChecked = true;
          resolve({ isValid: true, reason: "Validação rápida expirou." });
        }
      }, 4000);
      
      testVideo.onloadedmetadata = () => {
        if (isChecked) return;
        isChecked = true;
        clearTimeout(timeoutId);
        
        const duration = testVideo.duration;
        if (isNaN(duration) || !isFinite(duration) || duration <= 0.1) {
          resolve({ isValid: false, reason: "Falha ao decodificar a duração do vídeo gerado." });
        } else if (Math.abs(duration - originalDuration) > 5.0 && originalDuration > 1) {
          resolve({ isValid: false, reason: `Duração incorreta (${duration.toFixed(1)}s vs original ${originalDuration.toFixed(1)}s).` });
        } else {
          resolve({ isValid: true });
        }
        try {
          URL.revokeObjectURL(testVideo.src);
        } catch (e) {}
      };
      
      testVideo.onerror = () => {
        if (isChecked) return;
        isChecked = true;
        clearTimeout(timeoutId);
        resolve({ isValid: false, reason: "Navegador reportou erro de decodificação de mídia." });
        try {
          URL.revokeObjectURL(testVideo.src);
        } catch (e) {}
      };
    });
  };

  // Reusable core compilation engine that processes any video URL with the selected template and variables
  const compileVideoSource = async (
    videoUrl: string,
    videoName: string,
    onProgress: (p: number) => void,
    zoom: number = 1.0,
    offsetX: number = 0,
    offsetY: number = 0
  ): Promise<{ 
    compiledUrl: string; 
    posterUrl: string; 
    actualExt: string; 
    errorDetected?: boolean; 
    validationMessage?: string;
    originalSize?: number;
    generatedSize?: number;
  }> => {
    if (!activeTemplate) throw new Error("Nenhum template selecionado.");

    const canvas = exportCanvasRef.current;
    if (!canvas) throw new Error("Canvas de exportação não inicializado.");

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Contexto 2D do Canvas indisponível.");

    const width = 1080;
    const height = activeTemplate.type === 'video' ? 1920 : 1080;
    canvas.width = width;
    canvas.height = height;

    // 1. Fetch input video as safe, same-origin Blob to prevent canvas tainting completely and get original size
    let localVideoUrl = videoUrl;
    let originalSize = 0;
    try {
      const response = await fetch(videoUrl);
      const fileBlob = await response.blob();
      originalSize = fileBlob.size;
      localVideoUrl = URL.createObjectURL(fileBlob);
    } catch (err) {
      console.warn("Could not pre-fetch video as blob, falling back to direct URL:", err);
    }

    // 2. Pre-render template layers into high-fidelity offscreen canvases
    const elements = activeTemplate.slides[0].elements;
    const videoElIndex = elements.findIndex(el => el.type === 'video' && el.visible);

    const lowerCanvas = document.createElement('canvas');
    lowerCanvas.width = width;
    lowerCanvas.height = height;
    const lowerCtx = lowerCanvas.getContext('2d');

    const upperCanvas = document.createElement('canvas');
    upperCanvas.width = width;
    upperCanvas.height = height;
    const upperCtx = upperCanvas.getContext('2d');

    if (lowerCtx && upperCtx) {
      if (videoElIndex !== -1) {
        // Elements underneath the video
        const lowerElements = elements.slice(0, videoElIndex);
        // Elements on top of the video
        const upperElements = elements.slice(videoElIndex + 1);

        await renderElementsToCanvas(lowerCtx, lowerElements, width, height, variables, undefined, false);
        await renderElementsToCanvas(upperCtx, upperElements, width, height, variables, undefined, true);
      } else {
        // No explicit video element, render all on top
        await renderElementsToCanvas(upperCtx, elements, width, height, variables, undefined, true);
      }
    }

    // Prepare a temporary off-screen video player to render frames
    const tempVideo = document.createElement('video');
    tempVideo.src = localVideoUrl;
    tempVideo.crossOrigin = 'anonymous';
    tempVideo.muted = false; // Capture audio track
    tempVideo.playsInline = true;
    tempVideo.loop = false;
    tempVideo.autoplay = true;
    tempVideo.preload = 'auto';

    // Crucial: Append video to DOM so browsers force hardware rendering and frame decoding
    // even when the canvas or tab is in background / iframe
    tempVideo.style.position = 'fixed';
    tempVideo.style.left = '-9999px';
    tempVideo.style.top = '-9999px';
    tempVideo.style.width = '100px';
    tempVideo.style.height = '100px';
    tempVideo.style.opacity = '0.001';
    tempVideo.style.pointerEvents = 'none';
    document.body.appendChild(tempVideo);

    await new Promise<void>((resolve) => {
      const checkReady = () => {
        if (tempVideo.readyState >= 1 && !isNaN(tempVideo.duration) && isFinite(tempVideo.duration)) {
          resolve();
        }
      };
      tempVideo.onloadedmetadata = checkReady;
      tempVideo.oncanplay = checkReady;
      tempVideo.onloadeddata = checkReady;
      tempVideo.oncanplaythrough = checkReady;
      tempVideo.onerror = () => resolve();
      // Start checking immediately
      checkReady();
      // Fallback
      setTimeout(resolve, 3000);
    });

    // Detect exact duration with high accuracy
    let durationMs = 15000; // default backup to 15 seconds
    if (tempVideo.duration && !isNaN(tempVideo.duration) && isFinite(tempVideo.duration)) {
      durationMs = Math.round(tempVideo.duration * 1000);
    }
    // Set a very generous cap of 10 minutes (600,000 ms) instead of 30 seconds
    durationMs = Math.min(600000, Math.max(1500, durationMs));

    try {
      tempVideo.currentTime = 0;
      await tempVideo.play();
    } catch (e) {
      console.warn("Could not autoplay video programmatically, retrying muted:", e);
      try {
        tempVideo.muted = true;
        await tempVideo.play();
      } catch (e2) {
        console.error("Failed to play video:", e2);
      }
    }

    let mediaRecorder: MediaRecorder | null = null;
    const recordedChunks: Blob[] = [];
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let audioDest: MediaStreamAudioDestinationNode | null = null;
    let audioSource: MediaElementAudioSourceNode | null = null;

    try {
      if ((canvas as any).captureStream) {
        stream = (canvas as any).captureStream(30);
      } else if ((canvas as any).mozCaptureStream) {
        stream = (canvas as any).mozCaptureStream(30);
      }
      
      if (stream) {
        let audioTrackAdded = false;
        // Method A: Capture audio directly from the video stream if supported
        try {
          const tempVideoStr = (tempVideo as any).captureStream ? (tempVideo as any).captureStream() : ((tempVideo as any).mozCaptureStream ? (tempVideo as any).mozCaptureStream() : null);
          if (tempVideoStr) {
            const audioTracks = tempVideoStr.getAudioTracks();
            if (audioTracks && audioTracks.length > 0) {
              stream.addTrack(audioTracks[0]);
              audioTrackAdded = true;
              console.log("Captured audio track directly from media stream.");
            }
          }
        } catch (e) {
          console.warn("Direct stream audio capture failed, using Web Audio:", e);
        }

        // Method B: Capture audio using Web Audio API (with explicit context resume)
        if (!audioTrackAdded) {
          try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              audioContext = new AudioContextClass();
              if (audioContext.state === 'suspended') {
                await audioContext.resume();
              }
              audioDest = audioContext.createMediaStreamDestination();
              audioSource = audioContext.createMediaElementSource(tempVideo);
              audioSource.connect(audioDest);
              
              const audioTracks = audioDest.stream.getAudioTracks();
              if (audioTracks.length > 0) {
                stream.addTrack(audioTracks[0]);
              }
            }
          } catch (audioErr) {
            console.warn("Could not setup audio context capture:", audioErr);
          }
        }

        let options = { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 8000000 };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: 'video/webm;codecs=vp8', videoBitsPerSecond: 8000000 };
        }
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: 'video/webm', videoBitsPerSecond: 8000000 };
        }
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: 'video/mp4', videoBitsPerSecond: 8000000 };
        }
        
        mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunks.push(event.data);
          }
        };
        mediaRecorder.start();
      }
    } catch (err) {
      console.warn("Could not initialize MediaRecorder stream capture:", err);
    }

    const videoElConfig = videoElIndex !== -1 ? elements[videoElIndex] : null;

    await new Promise<void>((resolve) => {
      let frameTimer: any = null;
      let rafId: number | null = null;
      let rvfcId: number | null = null;
      let isFinished = false;

      const finalizeRecording = () => {
        if (isFinished) return;
        isFinished = true;

        if (frameTimer) {
          clearTimeout(frameTimer);
          frameTimer = null;
        }
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        if (rvfcId && 'cancelVideoFrameCallback' in tempVideo) {
          (tempVideo as any).cancelVideoFrameCallback(rvfcId);
          rvfcId = null;
        }

        try {
          if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        } catch (err) {}
        try {
          tempVideo.pause();
        } catch (err) {}
        try {
          if (tempVideo.parentNode) {
            tempVideo.parentNode.removeChild(tempVideo);
          }
        } catch (err) {}
        try {
          if (audioContext) {
            audioContext.close();
          }
        } catch (err) {}
        resolve();
      };

      // Ensure recording stops precisely when the video reaches its natural end
      tempVideo.onended = () => {
        finalizeRecording();
      };

      const renderFrame = () => {
        if (isFinished) return;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        if (videoElConfig && videoElConfig.visible) {
          ctx.drawImage(lowerCanvas, 0, 0);
          try {
            drawVideoCover(ctx, tempVideo, videoElConfig.x, videoElConfig.y, videoElConfig.width, videoElConfig.height, zoom, offsetX, offsetY);
          } catch (err) {}
          ctx.drawImage(upperCanvas, 0, 0);
        } else {
          try {
            drawVideoCover(ctx, tempVideo, 0, 0, width, height, zoom, offsetX, offsetY);
          } catch (err) {}
          ctx.drawImage(upperCanvas, 0, 0);
        }

        // Calculate progress dynamically based on current playback time of the video
        const currentVideoTime = tempVideo.currentTime || 0;
        const totalVideoDuration = tempVideo.duration || (durationMs / 1000);
        const progressPercent = Math.min(99, Math.round((currentVideoTime / totalVideoDuration) * 100));
        onProgress(progressPercent);

        if (tempVideo.ended || (currentVideoTime >= totalVideoDuration - 0.05 && currentVideoTime > 0.5)) {
          finalizeRecording();
          return;
        }
      };

      // 1. requestVideoFrameCallback: Best standard for video rendering frame by frame, even backgrounded
      if ('requestVideoFrameCallback' in tempVideo) {
        const updateOnFrame = () => {
          if (isFinished) return;
          renderFrame();
          rvfcId = (tempVideo as any).requestVideoFrameCallback(updateOnFrame);
        };
        rvfcId = (tempVideo as any).requestVideoFrameCallback(updateOnFrame);
      }

      // 2. requestAnimationFrame: High performance visual sync
      const animationLoop = () => {
        if (isFinished) return;
        renderFrame();
        rafId = requestAnimationFrame(animationLoop);
      };
      rafId = requestAnimationFrame(animationLoop);

      // 3. timeupdate event: Absolute bulletproof fallback whenever video advances its playhead
      tempVideo.ontimeupdate = () => {
        renderFrame();
      };

      // 4. setTimeout interval (30fps fallback): Avoid background throttling
      const startTimeoutLoop = () => {
        if (isFinished) return;
        renderFrame();
        frameTimer = setTimeout(startTimeoutLoop, 33);
      };
      startTimeoutLoop();

      // Absolute fallback timer (generous ceiling to prevent hanging loops)
      setTimeout(() => {
        if (!isFinished) {
          finalizeRecording();
        }
      }, durationMs * 1.5 + 10000);
    });

    // Small delay to allow recorder to finalize chunks
    await new Promise(resolve => setTimeout(resolve, 300));

    let posterUrl = '';
    try {
      posterUrl = canvas.toDataURL('image/jpeg', 0.95);
    } catch (err) {}

    let compiledUrl = '';
    let actualExt = 'mp4';
    let generatedSize = 0;
    let errorDetected = false;
    let validationMessage = '';

    if (recordedChunks.length > 0) {
      const mime = mediaRecorder?.mimeType || 'video/webm';
      const videoBlob = new Blob(recordedChunks, { type: mime });
      generatedSize = videoBlob.size;
      compiledUrl = URL.createObjectURL(videoBlob);

      // Perform validation check on output blob
      const validation = await validateVideoBlob(videoBlob, durationMs / 1000);
      if (!validation.isValid) {
        errorDetected = true;
        validationMessage = validation.reason || 'Vídeo gerado inconsistente';
      } else if (originalSize > 0) {
        const sizeRatio = generatedSize / originalSize;
        if (sizeRatio < 0.015 && durationMs > 2000) {
          errorDetected = true;
          validationMessage = `Tamanho reduzido: ${Math.round(generatedSize/1024)}KB vs original ${Math.round(originalSize/1024)}KB.`;
        }
      }
    } else {
      errorDetected = true;
      validationMessage = 'Nenhum frame ou áudio pôde ser capturado.';
      if (posterUrl) {
        compiledUrl = posterUrl;
        actualExt = 'jpg';
      }
    }

    return { 
      compiledUrl, 
      posterUrl, 
      actualExt, 
      errorDetected, 
      validationMessage,
      originalSize,
      generatedSize
    };
  };

  // Perform dynamic single video export compilation
  const handleGenerateCompiledVideo = async () => {
    if (!activeTemplate) return;

    setIsGenerating(true);
    setProgress(0);
    setFinalVideoOutput(null);
    setFinalOverlayOutput(null);
    setFinalPosterOutput(null);
    addTerminalLog(`[COMPILE] >> Inicializando renderizador de vídeo...`);
    addTerminalLog(`[COMPILE] >> Buscando frame estático do template: ${activeTemplate.name}`);
    addTerminalLog(`[COMPILE] >> Encaixando vídeo de entrada: ${selectedVideoName}`);

    const startTime = Date.now();

    try {
      const result = await compileVideoSource(
        selectedVideoUrl, 
        selectedVideoName, 
        (p) => {
          setProgress(p);
        },
        selectedVideoZoom,
        selectedVideoOffsetX,
        selectedVideoOffsetY
      );

      if (result.errorDetected) {
        setProgress(0);
        addTerminalLog(`[ERRO] >> Erro de validação de vídeo: ${result.validationMessage}`);
        setIsGenerating(false);
        return;
      }

      const duration = Math.round((Date.now() - startTime) / 1000);
      setTimeSpent(duration);
      setFinalPosterOutput(result.posterUrl);
      setExportExtension(result.actualExt);
      setFinalVideoOutput(result.compiledUrl);
      setProgress(100);

      // Save to global history
      const historyItem: HistoryItem = {
        id: `hist-${Date.now()}`,
        projectName: 'AutoPost Render',
        templateName: activeTemplate.name,
        templateType: activeTemplate.type,
        date: new Date().toLocaleString(),
        count: 1,
        timeSpentSec: duration,
        exportFormat: 'MP4',
        exportQuality: '1080p',
        exportFps: 30,
        outputPath: `/Downloads/AutoPost_Exports/${activeTemplate.name}`,
        previewUrls: [result.posterUrl || '']
      };
      onAddHistory(historyItem);
      addTerminalLog(`[SUCESSO] >> Vídeo compilado com sucesso em ${duration}s.`);
    } catch (err: any) {
      addTerminalLog(`[ERRO] >> Falha ao compilar: ${err.message || err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Perform sequential batch video export compilation
  const handleGenerateBatch = async () => {
    if (batchFiles.length === 0 || !activeTemplate) return;

    setIsBatchGenerating(true);
    addTerminalLog(`[LOTE] >> Iniciando compilação em lote de ${batchFiles.length} vídeos...`);
    const startTime = Date.now();

    // Reset status of all batch files except completed
    setBatchFiles(prev => prev.map(item => ({ 
      ...item, 
      status: item.status === 'completed' ? 'completed' : 'pending', 
      progress: item.status === 'completed' ? 100 : 0 
    })));

    let completedCount = 0;

    for (let i = 0; i < batchFiles.length; i++) {
      const currentItem = batchFiles[i];
      if (currentItem.status === 'completed') {
        completedCount++;
        continue; // Skip already completed files if any
      }

      setBatchFiles(prev => prev.map(item => item.id === currentItem.id ? { ...item, status: 'processing' } : item));
      addTerminalLog(`[LOTE] >> Renderizando vídeo ${i + 1} de ${batchFiles.length}: ${currentItem.name}`);

      try {
        const result = await compileVideoSource(
          currentItem.url, 
          currentItem.name, 
          (itemProgress) => {
            setBatchFiles(prev => prev.map(item => item.id === currentItem.id ? { ...item, progress: itemProgress } : item));
          },
          currentItem.zoom || 1.0,
          currentItem.offsetX || 0,
          currentItem.offsetY || 0
        );

        if (result.errorDetected) {
          setBatchFiles(prev => prev.map(item => item.id === currentItem.id ? { 
            ...item, 
            status: 'failed', 
            progress: 0, 
            errorReason: result.validationMessage || 'Divergência de tamanho/duração' 
          } : item));
          addTerminalLog(`[ALERTA] >> Vídeo ${i + 1}/${batchFiles.length} descartado: ${result.validationMessage}`);
        } else {
          setBatchFiles(prev => prev.map(item => item.id === currentItem.id ? { 
            ...item, 
            status: 'completed', 
            progress: 100,
            compiledUrl: result.compiledUrl,
            posterUrl: result.posterUrl,
            errorReason: undefined
          } : item));
          completedCount++;
          addTerminalLog(`[SUCESSO] >> Vídeo ${i + 1}/${batchFiles.length} concluído: ${currentItem.name}`);
        }
      } catch (err: any) {
        console.error("Error rendering batch item:", err);
        setBatchFiles(prev => prev.map(item => item.id === currentItem.id ? { ...item, status: 'failed', errorReason: err.message || 'Erro inesperado' } : item));
        addTerminalLog(`[ERRO] >> Falha ao compilar vídeo: ${currentItem.name}`);
      }
    }

    const durationSec = Math.round((Date.now() - startTime) / 1000);
    setIsBatchGenerating(false);
    addTerminalLog(`[SUCESSO] >> Compilação em lote finalizada. ${completedCount} de ${batchFiles.length} vídeos prontos.`);

    // Save batch to global history
    const historyItem: HistoryItem = {
      id: `hist-batch-${Date.now()}`,
      projectName: 'AutoPost Lote Render',
      templateName: activeTemplate.name,
      templateType: activeTemplate.type,
      date: new Date().toLocaleString(),
      count: completedCount,
      timeSpentSec: durationSec,
      exportFormat: 'MP4',
      exportQuality: '1080p',
      exportFps: 30,
      outputPath: `/Downloads/AutoPost_Exports/${activeTemplate.name}`,
      previewUrls: batchFiles.map(b => b.posterUrl || '').filter(Boolean).slice(0, 4)
    };
    onAddHistory(historyItem);
  };

  // Re-compilar a single failed batch video
  const handleRecompileItem = async (itemId: string) => {
    const item = batchFiles.find(b => b.id === itemId);
    if (!item || !activeTemplate) return;

    setBatchFiles(prev => prev.map(b => b.id === itemId ? { ...b, status: 'processing', progress: 0 } : b));
    addTerminalLog(`[RE-COMPILAR] >> Reiniciando renderização de ${item.name}...`);

    try {
      const result = await compileVideoSource(
        item.url,
        item.name,
        (progressPercent) => {
          setBatchFiles(prev => prev.map(b => b.id === itemId ? { ...b, progress: progressPercent } : b));
        },
        item.zoom || 1.0,
        item.offsetX || 0,
        item.offsetY || 0
      );

      if (result.errorDetected) {
        setBatchFiles(prev => prev.map(b => b.id === itemId ? { 
          ...b, 
          status: 'failed', 
          progress: 0, 
          errorReason: result.validationMessage || 'Tamanho/Duração inválida' 
        } : b));
        addTerminalLog(`[ERRO] >> Re-compilação falhou: ${result.validationMessage}`);
      } else {
        setBatchFiles(prev => prev.map(b => b.id === itemId ? { 
          ...b, 
          status: 'completed', 
          progress: 100,
          compiledUrl: result.compiledUrl,
          posterUrl: result.posterUrl,
          errorReason: undefined
        } : b));
        addTerminalLog(`[SUCESSO] >> Vídeo re-compilado e pronto: ${item.name}`);
      }
    } catch (err: any) {
      console.error("Error re-compiling batch item:", err);
      setBatchFiles(prev => prev.map(b => b.id === itemId ? { ...b, status: 'failed', errorReason: err.message || 'Erro inesperado' } : b));
      addTerminalLog(`[ERRO] >> Erro ao re-compilar: ${err.message || err}`);
    }
  };

  // ZIP Download Generator
  const handleDownloadAllZip = async () => {
    addTerminalLog(`[LOTE] >> Preparando empacotamento ZIP de todos os vídeos...`);
    const zip = new JSZip();
    
    let addedCount = 0;
    for (let i = 0; i < batchFiles.length; i++) {
      const item = batchFiles[i];
      if (item.compiledUrl && item.status === 'completed') {
        try {
          const response = await fetch(item.compiledUrl);
          const blob = await response.blob();
          
          // Clean filename
          const extension = item.compiledUrl.startsWith('data:image') ? 'jpg' : 'mp4';
          const cleanName = item.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          const finalFilename = cleanName.endsWith('.mp4') ? cleanName : `${cleanName}.${extension}`;
          
          zip.file(`AutoPost_${String(i+1).padStart(2, '0')}_${finalFilename}`, blob);
          addedCount++;
        } catch (err) {
          console.error("Error adding file to zip:", err);
        }
      }
    }

    if (addedCount === 0) {
      addTerminalLog(`[ERRO] >> Nenhum arquivo compilado encontrado para empacotar.`);
      return;
    }

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `Lote_AutoPost_${activeTemplate?.name || 'Videos'}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addTerminalLog(`[SUCESSO] >> Download do arquivo .ZIP iniciado com sucesso.`);
    } catch (err) {
      console.error("Error generating zip:", err);
      addTerminalLog(`[ERRO] >> Falha ao gerar arquivo ZIP.`);
    }
  };

  const handleSaveAdjustments = () => {
    if (generationMode === 'batch' && selectedBatchId) {
      setBatchFiles(prev => prev.map(item => {
        if (item.id === selectedBatchId) {
          addTerminalLog(`[AJUSTE] >> Ajustes salvos para "${item.name}" (Zoom: ${selectedVideoZoom.toFixed(2)}x, X: ${selectedVideoOffsetX}px, Y: ${selectedVideoOffsetY}px)`);
          return {
            ...item,
            zoom: selectedVideoZoom,
            offsetX: selectedVideoOffsetX,
            offsetY: selectedVideoOffsetY
          };
        }
        return item;
      }));
    } else {
      addTerminalLog(`[AJUSTE] >> Ajustes locais de exibição salvos (Zoom: ${selectedVideoZoom.toFixed(2)}x, X: ${selectedVideoOffsetX}px, Y: ${selectedVideoOffsetY}px).`);
    }
  };

  return (
    <div className="space-y-6 font-sans text-gray-200" id="generator-tab">
      {/* Hidden high-res canvas */}
      <canvas ref={exportCanvasRef} className="hidden" />

      {/* Title */}
      <div className="border-b border-gray-800 pb-4">
        <h2 className="text-xl font-bold tracking-[0.1em] text-white flex items-center gap-2 font-mono">
          <span className="text-blue-500 animate-pulse">⚡</span> GERADOR DE VÍDEOS DE INSTAGRAM/TIKTOK
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Selecione o seu template pronto, escolha o vídeo desejado para encaixar na área fixa e gere o vídeo MP4 final.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Steps and Selectors (7cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* STEP 1: Selecionar o Template */}
          <div className="p-5 bg-[#0c0c0f] border border-gray-800 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-950 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-mono font-bold">1</span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">SELECIONE O TEMPLATE ATIVO</h3>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-400 uppercase block font-semibold">Qual template você deseja preencher?</label>
              <select
                value={activeTemplateId}
                onChange={(e) => {
                  setActiveTemplateId(e.target.value);
                  onSelectTemplate(e.target.value);
                  addTerminalLog(`[SISTEMA] >> Template alterado para: ${templates.find(t => t.id === e.target.value)?.name}`);
                }}
                className="w-full bg-[#121216] border border-gray-800 rounded-lg p-3 text-xs text-white font-mono focus:border-blue-500/50 outline-none"
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.type === 'video' ? 'Vídeo Vertical 9:16' : 'Carrossel Quadrado'})</option>
                ))}
              </select>
            </div>
          </div>

          {/* STEP 2: Selecionar o Vídeo de Entrada */}
          <div className="p-5 bg-[#0c0c0f] border border-gray-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-950 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-mono font-bold">2</span>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">VINCULAR VÍDEO AO TEMPLATE</h3>
              </div>
              <span className="text-[9px] bg-blue-950 text-blue-400 border border-blue-500/30 font-mono px-2 py-0.5 rounded">
                ENCAIXE DE VÍDEO ADAPTÁVEL
              </span>
            </div>

            {/* Segmented control for Generation Mode */}
            <div className="flex bg-[#121216] p-1 rounded-lg border border-gray-800">
              <button
                type="button"
                onClick={() => setGenerationMode('single')}
                className={`flex-1 py-2 text-xs font-mono font-bold uppercase rounded-md transition-all flex items-center justify-center gap-2 ${
                  generationMode === 'single'
                    ? 'bg-blue-600 text-white shadow-[0_2px_8px_rgba(59,130,246,0.3)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Video size={14} /> Individual (1 Vídeo)
              </button>
              <button
                type="button"
                onClick={() => setGenerationMode('batch')}
                className={`flex-1 py-2 text-xs font-mono font-bold uppercase rounded-md transition-all flex items-center justify-center gap-2 ${
                  generationMode === 'batch'
                    ? 'bg-blue-600 text-white shadow-[0_2px_8px_rgba(59,130,246,0.3)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Layers size={14} /> Gerador em Lote (Vários)
              </button>
            </div>

            {generationMode === 'single' ? (
              <>
                {/* Custom file selector directly at top */}
                <div className="border-2 border-dashed border-blue-500/30 hover:border-blue-500/60 bg-[#121216] rounded-xl p-6 text-center cursor-pointer transition-all space-y-2"
                     onClick={() => fileInputRef.current?.click()}>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="video/mp4" 
                    onChange={handleVideoUpload} 
                    className="hidden" 
                  />
                  <div className="w-10 h-10 bg-blue-950/40 text-blue-400 flex items-center justify-center rounded-lg mx-auto border border-blue-500/20">
                    <UploadCloud size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white font-mono uppercase">FAZER UPLOAD DO SEU PRÓPRIO VÍDEO (.MP4)</p>
                    <p className="text-[10px] text-gray-500 font-mono mt-1">Arraste ou clique para selecionar o arquivo MP4 local de sua preferência.</p>
                  </div>
                </div>

                {/* Select from built-in high-quality template stock backgrounds */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block font-bold">OU ESCOLHA DA NOSSA BIBLIOTECA PREMIUM:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {STOCK_VIDEOS.map(video => (
                      <button
                        key={video.id}
                        onClick={() => {
                          setSelectedVideoUrl(video.url);
                          setSelectedVideoName(video.name);
                          setCustomVideoFile(null);
                          addTerminalLog(`[VÍDEO] >> Selecionado vídeo da biblioteca: ${video.name}`);
                        }}
                        className={`p-2 bg-[#121216] rounded-lg border text-left transition-all space-y-1.5 flex flex-col justify-between ${
                          selectedVideoUrl === video.url && !customVideoFile
                            ? 'border-blue-500 bg-blue-950/20 shadow-[0_0_8px_rgba(59,130,246,0.15)]'
                            : 'border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <div className="w-full aspect-video rounded overflow-hidden relative">
                          <img src={video.thumbnail} className="w-full h-full object-cover opacity-60" alt={video.name} referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play size={14} className="text-white drop-shadow-md" />
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-gray-300 font-bold leading-tight block truncate w-full">
                          {video.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confirming Selection banner */}
                <div className="flex items-center gap-2 p-3 bg-blue-950/30 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-mono">
                  <CheckCircle size={16} className="shrink-0" />
                  <div>
                    <span>Vídeo Ativo: </span>
                    <strong className="text-white font-bold">{selectedVideoName}</strong>
                  </div>
                </div>
              </>
            ) : (
              // BATCH MODE INTERFACE!
              <div className="space-y-4 font-mono">
                {/* Batch File Input */}
                <div className="border-2 border-dashed border-blue-500/30 hover:border-blue-500/60 bg-[#121216] rounded-xl p-6 text-center cursor-pointer transition-all space-y-2"
                     onClick={() => batchFileInputRef.current?.click()}>
                  <input 
                    type="file" 
                    ref={batchFileInputRef} 
                    accept="video/mp4" 
                    multiple
                    onChange={handleBatchVideoUpload} 
                    className="hidden" 
                  />
                  <div className="w-10 h-10 bg-blue-950/40 text-blue-400 flex items-center justify-center rounded-lg mx-auto border border-blue-500/20 animate-pulse">
                    <UploadCloud size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white font-mono uppercase">FAZER UPLOAD DE VÁRIOS VÍDEOS EM LOTE (.MP4)</p>
                    <p className="text-[10px] text-gray-500 font-mono mt-1">Arraste ou selecione múltiplos vídeos MP4 locais de uma vez só.</p>
                  </div>
                </div>

                {/* Batch List & Progress showing 50/50 library style */}
                {batchFiles.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Fila de Compilação</span>
                        <p className="text-[10px] text-gray-400">
                          {batchFiles.filter(b => b.status === 'completed').length} de {batchFiles.length} compilados
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {batchFiles.some(b => b.status === 'completed') && (
                          <button
                            onClick={handleDownloadAllZip}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold uppercase flex items-center gap-1 transition-all"
                          >
                            <Archive size={12} /> Baixar ZIP
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setBatchFiles([]);
                            addTerminalLog(`[LOTE] >> Fila limpa com sucesso.`);
                          }}
                          className="p-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-red-500/50 hover:text-red-400 text-gray-400 rounded transition-all"
                          title="Limpar Fila"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Overall Lote Dynamic Counter library style */}
                    <div className="p-3 bg-[#121216] border border-gray-800 rounded-lg space-y-2">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-gray-400 uppercase">Progresso Geral</span>
                        <span className="text-blue-400">
                          {batchFiles.filter(b => b.status === 'completed').length}/{batchFiles.length} ({Math.round((batchFiles.filter(b => b.status === 'completed').length / batchFiles.length) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden border border-gray-800">
                        <div 
                          className="bg-blue-500 h-full transition-all duration-500"
                          style={{ width: `${(batchFiles.filter(b => b.status === 'completed').length / (batchFiles.length || 1)) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Batch Items Grid/Library Display */}
                    <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                      {batchFiles.map((item, index) => {
                        const isSelected = selectedBatchId === item.id;
                        return (
                          <div 
                            key={item.id} 
                            onClick={() => handleSelectBatchItem(item)}
                            className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 text-xs transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-950/30 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.25)] ring-1 ring-blue-500/30'
                                : item.status === 'processing'
                                ? 'bg-blue-950/10 border-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.1)] animate-pulse'
                                : item.status === 'completed'
                                ? 'bg-[#0d1f14] border-emerald-500/30 hover:border-emerald-500/50'
                                : 'bg-[#121216] border-gray-800 hover:border-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              {/* Index number */}
                              <span className="text-[10px] text-gray-500 font-bold">
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              
                              {/* Small thumb preview if compiled */}
                              <div className="w-8 h-8 rounded bg-gray-900 border border-gray-800 shrink-0 overflow-hidden relative">
                                {item.posterUrl ? (
                                  <img src={item.posterUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-600">
                                    📹
                                  </div>
                                )}
                                {item.status === 'processing' && (
                                  <div className="absolute inset-0 bg-blue-600/20 animate-pulse" />
                                )}
                              </div>
 
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <span className="text-[11px] font-bold text-gray-200 block truncate" title={item.name}>
                                  {item.name}
                                </span>
                                {item.status === 'processing' && (
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-16 bg-gray-900 rounded-full h-1 overflow-hidden">
                                      <div className="bg-blue-500 h-full" style={{ width: `${item.progress}%` }} />
                                    </div>
                                    <span className="text-[9px] text-blue-400 font-bold">{item.progress}%</span>
                                  </div>
                                )}
                                {item.status === 'completed' && (
                                  <span className="text-[9px] text-emerald-400 font-bold uppercase">Pronto</span>
                                )}
                                {item.status === 'pending' && (
                                  <span className="text-[9px] text-gray-500 uppercase">Aguardando</span>
                                )}
                                {item.status === 'failed' && (
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[9px] text-red-400 font-bold uppercase">Falha</span>
                                    {item.errorReason && (
                                      <span className="text-[8px] text-red-300 font-normal normal-case leading-tight block">
                                        {item.errorReason}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
 
                            <div className="shrink-0 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              {item.status === 'failed' && (
                                <button
                                  onClick={() => handleRecompileItem(item.id)}
                                  className="px-2 py-1 bg-yellow-600/20 hover:bg-yellow-600 hover:text-black border border-yellow-500/30 rounded text-[9px] font-bold uppercase transition-all"
                                  title="Re-compilar este vídeo especificamente"
                                >
                                  Re-compilar
                                </button>
                              )}

                              {item.compiledUrl && (
                                <button
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = item.compiledUrl!;
                                    const ext = item.compiledUrl!.startsWith('data:image') ? 'jpg' : 'mp4';
                                    link.download = `AutoPost_${String(index+1).padStart(2, '0')}_${item.name.replace(/\.[^/.]+$/, "")}.${ext}`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                  className="p-1.5 bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white rounded transition-all"
                                  title="Baixar este vídeo"
                                >
                                  <Download size={11} />
                                </button>
                              )}
                              
                              <button
                                disabled={isBatchGenerating}
                                onClick={() => {
                                  setBatchFiles(prev => {
                                    const filtered = prev.filter(b => b.id !== item.id);
                                    if (selectedBatchId === item.id) {
                                      if (filtered.length > 0) {
                                        handleSelectBatchItem(filtered[0]);
                                      } else {
                                        setSelectedBatchId(null);
                                      }
                                    }
                                    return filtered;
                                  });
                                  addTerminalLog(`[LOTE] >> Removido da fila: ${item.name}`);
                                }}
                                className="p-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-red-400 hover:border-red-500/30 rounded transition-all disabled:opacity-30"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border border-gray-800/40 bg-gray-950/20 rounded-xl space-y-1">
                    <span className="text-xl">📥</span>
                    <h5 className="text-xs font-bold text-gray-400">NENHUM VÍDEO SELECIONADO</h5>
                    <p className="text-[10px] text-gray-500 max-w-[250px] mx-auto leading-relaxed">
                      Faça o upload de vários vídeos MP4 acima para preencher sua biblioteca de lote.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 3: Customize variables */}
          <div className="p-5 bg-[#0c0c0f] border border-gray-800 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-950 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-mono font-bold">3</span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">EDITAR TEXTOS DO TEMPLATE</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 font-mono">
                <label className="text-[10px] text-gray-400 uppercase font-semibold">Título Principal</label>
                <input 
                  type="text" 
                  value={variables.titulo}
                  onChange={(e) => setVariables(prev => ({ ...prev, titulo: e.target.value }))}
                  className="w-full bg-[#121216] border border-gray-800 rounded p-2.5 text-xs text-white focus:border-blue-500/50 outline-none"
                  placeholder="Insira o título"
                />
              </div>

              <div className="space-y-1.5 font-mono">
                <label className="text-[10px] text-gray-400 uppercase font-semibold">Texto de Chamada (CTA)</label>
                <input 
                  type="text" 
                  value={variables.cta}
                  onChange={(e) => setVariables(prev => ({ ...prev, cta: e.target.value }))}
                  className="w-full bg-[#121216] border border-gray-800 rounded p-2.5 text-xs text-white focus:border-blue-500/50 outline-none"
                  placeholder="Ex: LINK NA BIO"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2 font-mono">
                <label className="text-[10px] text-gray-400 uppercase font-semibold">Descrição do Conteúdo</label>
                <textarea 
                  value={variables.descricao}
                  onChange={(e) => setVariables(prev => ({ ...prev, descricao: e.target.value }))}
                  rows={2}
                  className="w-full bg-[#121216] border border-gray-800 rounded p-2.5 text-xs text-white focus:border-blue-500/50 outline-none resize-none"
                  placeholder="Insira a legenda ou descrição"
                />
              </div>
            </div>
          </div>

          {/* System status log consola */}
          <div className="p-4 bg-[#070709] border border-gray-900 rounded-xl space-y-2 font-mono">
            <div className="flex items-center justify-between border-b border-gray-900 pb-1.5">
              <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                <span>📟</span> CONSOLE DE COMPILAÇÃO J.A.R.V.I.S.
              </span>
              <span className="text-[8px] text-gray-600">SYSTEM V2.1 ACTIVE</span>
            </div>

            <div className="max-h-24 overflow-y-auto space-y-1 text-[10px] text-blue-400/80 pr-1 select-text">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="flex gap-1.5">
                  <span className="text-gray-600 shrink-0">[{idx + 1}]</span>
                  <span className={log.includes('[SUCESSO]') ? 'text-blue-400' : log.includes('[PROCESSO]') ? 'text-cyan-400' : 'text-gray-400'}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Realtime Live Preview & Render Output Showcase (5cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live Mobile Frame Preview */}
          <div className="p-5 bg-[#0c0c0f] border border-gray-800 rounded-xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-gray-900 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>📹</span> PRÉVIA DO VÍDEO FINAL
              </span>
              <span className="text-[9px] text-blue-500 bg-blue-950/40 border border-blue-500/20 px-2 py-0.5 rounded uppercase font-bold">
                Ao Vivo
              </span>
            </div>

            {/* Simulated smartphone framing player */}
            <div 
              className="relative bg-black rounded-3xl border-4 border-gray-800 overflow-hidden shadow-2xl mx-auto shrink-0"
              style={{
                width: '280px',
                height: activeTemplate?.type === 'video' ? '498px' : '280px',
              }}
            >
              
              {/* Instagram mock header */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 select-none pointer-events-none">
                <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#0c8ce9] border border-white/20" />
                  <span className="text-[8px] font-bold text-white">autopost.studio</span>
                </div>
                <span className="text-[8px] bg-black/60 px-1.5 py-0.5 rounded text-gray-300">Reels</span>
              </div>

              {/* VIDEO UNDERLAY - Playing the selected video as a background if no specific video element is active/visible in template */}
              {!(activeTemplate?.slides[0]?.elements || []).some(el => el.type === 'video' && el.visible) && (
                <div className="absolute inset-0 z-0 overflow-hidden bg-black">
                  <video 
                    key={`${selectedVideoUrl}-${selectedBatchId}`}
                    src={selectedVideoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain font-sans"
                    style={{
                      transform: `translate(${selectedVideoOffsetX}px, ${selectedVideoOffsetY}px) scale(${selectedVideoZoom})`,
                      transformOrigin: 'center center',
                    }}
                  />
                </div>
              )}

              {/* DYNAMIC ELEMENTS OVERLAY LAYER */}
              {(activeTemplate?.slides[0]?.elements || []).map((el) => {
                if (!el.visible) return null;

                const scale = 280 / 1080;
                const left = el.x * scale;
                const top = el.y * scale;
                const width = el.width * scale;
                const height = el.height * scale;
                const zIndex = (activeTemplate?.slides[0]?.elements || []).indexOf(el) + 1;

                // Dynamic variable resolution
                const getElementContent = (element: typeof el) => {
                  let content = element.content || '';
                  const nameLower = element.name.toLowerCase();

                  if (nameLower.includes('título') || nameLower.includes('titulo')) {
                    content = variables.titulo || content;
                  } else if (nameLower.includes('descri') || nameLower.includes('legenda')) {
                    content = variables.descricao || content;
                  } else if (nameLower.includes('cta') || nameLower.includes('chamada') || nameLower.includes('botão') || nameLower.includes('botao')) {
                    content = variables.cta || content;
                  }

                  Object.entries(variables).forEach(([key, val]) => {
                    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
                    content = content.replace(regex, String(val));
                  });

                  return content;
                };

                return (
                  <div
                    key={el.id}
                    className="absolute overflow-hidden select-none pointer-events-none flex items-center justify-center text-center"
                    style={{
                      left: `${left}px`,
                      top: `${top}px`,
                      width: `${width}px`,
                      height: `${height}px`,
                      transform: `rotate(${el.rotation || 0}deg)`,
                      opacity: el.opacity / 100,
                      zIndex: zIndex,
                      backgroundColor: el.type === 'video' ? '#000000' : 'transparent',
                    }}
                  >
                    {el.type === 'shape' && (
                      <div 
                        className="w-full h-full"
                        style={{
                          background: el.content.startsWith('#') || el.content.startsWith('rgb') || el.content.startsWith('radial')
                            ? el.content 
                            : '#ffffff',
                          borderRadius: el.borderRadius ? `${el.borderRadius * scale}px` : '0',
                          border: el.borderWidth ? `${el.borderWidth * scale}px solid ${el.borderColor || '#3c3c3c'}` : 'none'
                        }}
                      />
                    )}

                    {el.type === 'text' && (
                      <div 
                        className={`w-full text-white break-words ${el.shadow ? 'drop-shadow-lg' : ''}`}
                        style={{
                          fontFamily: el.fontFamily === 'Space Grotesk' ? '"Space Grotesk", sans-serif' : el.fontFamily === 'Fira Code' ? '"Fira Code", monospace' : '"Inter", sans-serif',
                          fontSize: `${el.fontSize * scale}px`,
                          color: el.color,
                          textAlign: el.align as any,
                          fontWeight: 500,
                          lineHeight: 1.2
                        }}
                      >
                        {getElementContent(el)}
                      </div>
                    )}

                    {el.type === 'button' && (
                      <div
                        className="w-full h-full flex items-center justify-center font-bold px-2 text-center"
                        style={{
                          background: el.backgroundColor || '#0c8ce9',
                          borderRadius: el.borderRadius ? `${el.borderRadius * scale}px` : '6px',
                          color: el.color || '#ffffff',
                          fontSize: `${el.fontSize * scale}px`,
                          fontFamily: '"Inter", sans-serif',
                          border: el.borderWidth ? `${el.borderWidth * scale}px solid ${el.borderColor || '#3c3c3c'}` : 'none',
                          boxShadow: el.shadow ? '0 4px 6px -1px rgba(0,0,0,0.4)' : 'none'
                        }}
                      >
                        {getElementContent(el)}
                      </div>
                    )}

                    {el.type === 'image' && (
                      <img 
                        src={el.content} 
                        alt={el.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        style={{
                          borderRadius: el.borderRadius ? `${el.borderRadius * scale}px` : '0'
                        }}
                      />
                    )}

                    {el.type === 'logo' && (
                      <img 
                        src={el.content} 
                        alt={el.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover animate-pulse"
                        style={{
                          borderRadius: el.borderRadius ? `${el.borderRadius * scale}px` : '50%'
                        }}
                      />
                    )}

                    {el.type === 'video' && (
                      <video 
                        key={`${selectedVideoUrl}-${selectedBatchId}`}
                        src={selectedVideoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-contain font-sans"
                        style={{
                          transform: `translate(${selectedVideoOffsetX * scale}px, ${selectedVideoOffsetY * scale}px) scale(${selectedVideoZoom})`,
                          transformOrigin: 'center center',
                          borderRadius: el.borderRadius ? `${el.borderRadius * scale}px` : '0',
                          border: el.borderWidth ? `${el.borderWidth * scale}px solid ${el.borderColor || '#3c3c3c'}` : 'none'
                        }}
                      />
                    )}
                  </div>
                );
              })}

              {/* Dynamic compiling overlay to block flickering and show high-fidelity feedback */}
              {(isGenerating || isBatchGenerating) && (
                <div className="absolute inset-0 bg-[#0c0c0f]/95 z-40 flex flex-col items-center justify-center p-4 backdrop-blur-sm pointer-events-none">
                  <div className="relative flex items-center justify-center mb-4">
                    {/* Pulsing neon radial glow */}
                    <div className="absolute w-20 h-20 rounded-full bg-blue-500/10 animate-ping" />
                    {/* Ring spinner */}
                    <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                    <span className="absolute text-[10px] font-mono font-bold text-blue-400">
                      {isBatchGenerating 
                        ? `${batchFiles.filter(b => b.status === 'completed').length}/${batchFiles.length}`
                        : `${progress}%`
                      }
                    </span>
                  </div>
                  
                  <h5 className="text-[11px] font-bold tracking-wider uppercase text-white mb-1 animate-pulse font-sans">
                    {isBatchGenerating ? 'Compilando Lote' : 'Compilando Vídeo'}
                  </h5>
                  <p className="text-[9px] text-gray-400 font-mono text-center max-w-[200px] leading-relaxed">
                    {isBatchGenerating 
                      ? `Processando vídeo ${batchFiles.filter(b => b.status === 'completed').length + 1} de ${batchFiles.length}...`
                      : 'Renderizando trilhas e combinando camadas de texto em alta fidelidade...'
                    }
                  </p>
                </div>
              )}

              {/* Bottom dynamic video overlay gloss */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none z-10" />
            </div>

            {/* Video Crop & Position Adjustments Controls */}
            <div className="p-4 bg-[#121216] border border-gray-800 rounded-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-300 uppercase flex items-center gap-1.5 font-mono">
                  <span>⚙️</span> AJUSTAR VÍDEO NO REELS
                </span>
                {generationMode === 'batch' && selectedBatchId && (
                  <span className="text-[9px] text-blue-400 bg-blue-950/20 px-2 py-0.5 rounded border border-blue-500/20 font-mono font-bold">
                    Item #{batchFiles.findIndex(b => b.id === selectedBatchId) + 1}
                  </span>
                )}
              </div>
              
              <div className="space-y-3 font-mono">
                {/* Zoom Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">Zoom / Escala</span>
                    <span className="text-blue-400 font-bold">{selectedVideoZoom.toFixed(2)}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="4.0" 
                    step="0.05"
                    value={selectedVideoZoom} 
                    onChange={(e) => setSelectedVideoZoom(parseFloat(e.target.value))}
                    className="w-full accent-blue-500 bg-gray-900 h-1 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Offset Y (Vertical) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">Posição Vertical (Cima/Baixo)</span>
                    <span className="text-blue-400 font-bold">{selectedVideoOffsetY > 0 ? `+${selectedVideoOffsetY}` : selectedVideoOffsetY}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="-400" 
                    max="400" 
                    step="1"
                    value={selectedVideoOffsetY} 
                    onChange={(e) => setSelectedVideoOffsetY(parseInt(e.target.value))}
                    className="w-full accent-blue-500 bg-gray-900 h-1 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Offset X (Horizontal) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">Posição Horizontal (Esquerda/Direita)</span>
                    <span className="text-blue-400 font-bold">{selectedVideoOffsetX > 0 ? `+${selectedVideoOffsetX}` : selectedVideoOffsetX}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="-400" 
                    max="400" 
                    step="1"
                    value={selectedVideoOffsetX} 
                    onChange={(e) => setSelectedVideoOffsetX(parseInt(e.target.value))}
                    className="w-full accent-blue-500 bg-gray-900 h-1 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons for Crop adjustments */}
              <div className="flex gap-2 font-mono pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVideoZoom(1.0);
                    setSelectedVideoOffsetX(0);
                    setSelectedVideoOffsetY(0);
                    addTerminalLog(`[AJUSTE] >> Redefinido zoom e posições para o padrão.`);
                  }}
                  className="flex-1 py-2 bg-gray-950 hover:bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-lg text-[10px] font-bold uppercase transition-all"
                >
                  Resetar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAdjustments}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition-all shadow-[0_2px_8px_rgba(59,130,246,0.2)]"
                >
                  💾 SALVAR AJUSTES
                </button>
              </div>
            </div>

            {/* Compilation Action Button */}
            <div className="space-y-3 pt-2">
              {generationMode === 'single' ? (
                <>
                  <button
                    disabled={isGenerating}
                    onClick={handleGenerateCompiledVideo}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-800 disabled:text-gray-500 rounded-xl text-xs font-bold font-mono tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="animate-spin text-white" size={16} /> COMPILANDO VÍDEO {progress}%...
                      </>
                    ) : (
                      <>
                        <Cpu size={15} /> COMPILAR VÍDEO FINAL (MP4)
                      </>
                    )}
                  </button>

                  {/* Live Render Progress */}
                  {isGenerating && (
                    <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full transition-all duration-300 shadow-[0_0_10px_#3b82f6]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    disabled={isBatchGenerating || batchFiles.length === 0}
                    onClick={handleGenerateBatch}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-800 disabled:text-gray-500 rounded-xl text-xs font-bold font-mono tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  >
                    {isBatchGenerating ? (
                      <>
                        <Loader2 className="animate-spin text-white" size={16} /> COMPILANDO LOTE {batchFiles.filter(b => b.status === 'completed').length}/${batchFiles.length}...
                      </>
                    ) : (
                      <>
                        <Cpu size={15} /> COMPILAR LOTE ({batchFiles.length} VÍDEOS)
                      </>
                    )}
                  </button>

                  {/* Overall batch progress bar */}
                  {isBatchGenerating && (
                    <div className="space-y-1">
                      <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full transition-all duration-300 shadow-[0_0_10px_#3b82f6]"
                          style={{ width: `${(batchFiles.filter(b => b.status === 'completed').length / batchFiles.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-gray-400 block text-center uppercase font-mono">
                        Vídeo atual: {batchFiles.find(b => b.status === 'processing')?.name || 'Iniciando...'} ({batchFiles.find(b => b.status === 'processing')?.progress || 0}%)
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>

          {/* Render success showcase with single download format */}
          {finalVideoOutput && generationMode === 'single' && (
            <div className="p-5 bg-slate-950/40 border-2 border-emerald-500/40 rounded-2xl space-y-4 font-mono animate-fade-in shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle size={18} className="animate-bounce" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400">VÍDEO COMPILADO COM SUCESSO</h4>
              </div>

              <p className="text-[11px] text-gray-300 leading-relaxed">
                A renderização com o template <strong>{activeTemplate?.name}</strong> foi finalizada! Seu vídeo completo foi emoldurado e está pronto para uso.
              </p>

              <div className="p-3 bg-slate-900/40 rounded-xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-emerald-400 block uppercase tracking-wider">Formato de Exportação</span>
                  <span className="text-[9px] text-gray-400 block">Vídeo de alta fidelidade compactado (.MP4)</span>
                </div>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = finalVideoOutput;
                    link.download = `AutoPost_${activeTemplate?.name || 'Video'}.mp4`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    addTerminalLog(`[DOWNLOAD] >> Baixando vídeo compilado (.mp4)`);
                  }}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all self-end sm:self-auto shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download size={14} /> BAIXAR VÍDEO COMPILADO (.MP4)
                </button>
              </div>
            </div>
          )}

          {/* Render success showcase for batch mode */}
          {batchFiles.some(b => b.status === 'completed') && generationMode === 'batch' && (
            <div className="p-5 bg-slate-950/40 border-2 border-emerald-500/40 rounded-2xl space-y-4 font-mono animate-fade-in shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle size={18} className="animate-bounce" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400">LOTE COMPILADO COM SUCESSO</h4>
              </div>

              <p className="text-[11px] text-gray-300 leading-relaxed">
                A renderização em lote do template <strong>{activeTemplate?.name}</strong> foi finalizada! {batchFiles.filter(b => b.status === 'completed').length} de {batchFiles.length} vídeos foram compilados e estão prontos na sua biblioteca para download.
              </p>

              <div className="p-3 bg-slate-900/40 rounded-xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-emerald-400 block uppercase tracking-wider">Biblioteca de Exportação</span>
                  <span className="text-[9px] text-gray-400 block">{batchFiles.filter(b => b.status === 'completed').length} arquivos compactados em lote</span>
                </div>
                <button
                  onClick={handleDownloadAllZip}
                  className="px-5 py-3 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all self-end sm:self-auto shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Archive size={14} /> BAIXAR TODOS EM ZIP (.ZIP)
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
