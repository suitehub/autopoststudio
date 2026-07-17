/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutTemplate, 
  Cpu, 
  History, 
  Settings, 
  Sparkles, 
  Cpu as GpuIcon, 
  Monitor, 
  Info,
  CircleAlert,
  LogIn,
  LogOut,
  ShieldCheck,
  Database,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Template, HistoryItem } from './types';
import { INITIAL_TEMPLATES, INITIAL_HISTORY } from './defaultData';

// Modular Tab Components
import TemplatesTab from './components/TemplatesTab';
import GeneratorTab from './components/GeneratorTab';
import HistoryTab from './components/HistoryTab';
import SettingsTab from './components/SettingsTab';
import TemplateEditor from './components/TemplateEditor';

// Firebase imports
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { auth, db, loginWithGoogle, logout, loginAnonymously, handleFirestoreError, OperationType } from './firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState<'templates' | 'generator' | 'history' | 'settings'>('templates');
  
  // Immersive Editor mode state
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Global Lists states loaded from localstorage or Firebase
  const [templates, setTemplates] = useState<Template[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Selected template state for generator auto-link
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // User auth states
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // PWA installation states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    setIsInIframe(window.self !== window.top);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  // Load and sync user data from Firestore
  const loadUserData = async (currentUser: User) => {
    setIsSyncing(true);
    try {
      // 1. Fetch templates from Firestore
      const templatesPath = 'templates';
      const qTemplates = query(collection(db, templatesPath), where('ownerId', '==', currentUser.uid));
      const tSnapshot = await getDocs(qTemplates).catch((err) => {
        handleFirestoreError(err, OperationType.LIST, templatesPath);
        throw err;
      });
      
      let fetchedTemplates: Template[] = [];
      tSnapshot.forEach((doc) => {
        fetchedTemplates.push(doc.data() as Template);
      });

      // 2. Fetch history from Firestore
      const historyPath = 'history';
      const qHistory = query(collection(db, historyPath), where('ownerId', '==', currentUser.uid));
      const hSnapshot = await getDocs(qHistory).catch((err) => {
        handleFirestoreError(err, OperationType.LIST, historyPath);
        throw err;
      });

      let fetchedHistory: HistoryItem[] = [];
      hSnapshot.forEach((doc) => {
        fetchedHistory.push(doc.data() as HistoryItem);
      });

      // Local storage fallback data checks
      const localTemplatesRaw = localStorage.getItem('autopost_templates');
      const localHistoryRaw = localStorage.getItem('autopost_history');
      const localTemplates = localTemplatesRaw ? JSON.parse(localTemplatesRaw) : INITIAL_TEMPLATES;
      const localHistory = localHistoryRaw ? JSON.parse(localHistoryRaw) : INITIAL_HISTORY;

      // 3. First-time login migration from local storage to cloud Firestore
      if (fetchedTemplates.length === 0 && localTemplates.length > 0) {
        for (const t of localTemplates) {
          const path = `templates/${t.id}`;
          await setDoc(doc(db, 'templates', t.id), {
            ...t,
            ownerId: currentUser.uid
          }).catch((err) => {
            handleFirestoreError(err, OperationType.CREATE, path);
          });
        }
        fetchedTemplates = localTemplates.map((t: Template) => ({ ...t, ownerId: currentUser.uid }));
      }

      if (fetchedHistory.length === 0 && localHistory.length > 0) {
        for (const h of localHistory) {
          const path = `history/${h.id}`;
          await setDoc(doc(db, 'history', h.id), {
            ...h,
            ownerId: currentUser.uid
          }).catch((err) => {
            handleFirestoreError(err, OperationType.CREATE, path);
          });
        }
        fetchedHistory = localHistory.map((h: HistoryItem) => ({ ...h, ownerId: currentUser.uid }));
      }

      setTemplates(fetchedTemplates);
      setHistory(fetchedHistory);
      
      localStorage.setItem('autopost_templates', JSON.stringify(fetchedTemplates));
      localStorage.setItem('autopost_history', JSON.stringify(fetchedHistory));
    } catch (error) {
      console.error('Error loading/migrating user data:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(true);
      if (currentUser) {
        await loadUserData(currentUser);
      } else {
        // Fallback to local storage
        const localTemplates = localStorage.getItem('autopost_templates');
        const localHistory = localStorage.getItem('autopost_history');

        if (localTemplates) {
          setTemplates(JSON.parse(localTemplates));
        } else {
          setTemplates(INITIAL_TEMPLATES);
          localStorage.setItem('autopost_templates', JSON.stringify(INITIAL_TEMPLATES));
        }

        if (localHistory) {
          setHistory(JSON.parse(localHistory));
        } else {
          setHistory(INITIAL_HISTORY);
          localStorage.setItem('autopost_history', JSON.stringify(INITIAL_HISTORY));
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync state functions
  const saveTemplates = async (newTemplates: Template[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('autopost_templates', JSON.stringify(newTemplates));
  };

  const saveHistory = async (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('autopost_history', JSON.stringify(newHistory));
  };

  // Add Template
  const handleCreateTemplate = async (name: string, type: 'video' | 'carousel') => {
    const newTemplate: Template = {
      id: `tpl-${Date.now()}`,
      name,
      type,
      createdAt: new Date().toISOString(),
      slides: [
        {
          id: `slide-${Date.now()}`,
          elements: [
            {
              id: `v-player-${Date.now()}`,
              name: 'Área de Vídeo',
              type: 'video',
              x: 90,
              y: type === 'video' ? 530 : 200,
              width: 900,
              height: type === 'video' ? 850 : 680,
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
            },
            {
              id: `v-template-img-${Date.now()}`,
              name: 'Template Gráfico Overlay',
              type: 'image',
              x: 0,
              y: 0,
              width: 1080,
              height: type === 'video' ? 1920 : 1080,
              rotation: 0,
              opacity: 100,
              content: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080',
              fontFamily: 'Inter',
              fontSize: 16,
              color: '',
              shadow: false,
              align: 'center',
              visible: true
            }
          ]
        }
      ]
    };

    if (user) {
      const path = `templates/${newTemplate.id}`;
      const templateWithAuth = { ...newTemplate, ownerId: user.uid };
      await setDoc(doc(db, 'templates', newTemplate.id), templateWithAuth).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, path);
      });
      const updated = [templateWithAuth, ...templates];
      setTemplates(updated);
      localStorage.setItem('autopost_templates', JSON.stringify(updated));
    } else {
      const updated = [newTemplate, ...templates];
      saveTemplates(updated);
    }
    // Automatically open the immersive editor for the newly created template
    setEditingTemplateId(newTemplate.id);
  };

  // Delete Template
  const handleDeleteTemplate = async (templateId: string) => {
    if (user) {
      const path = `templates/${templateId}`;
      await deleteDoc(doc(db, 'templates', templateId)).catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, path);
      });
    }
    const updated = templates.filter(t => t.id !== templateId);
    saveTemplates(updated);
    if (selectedTemplateId === templateId) setSelectedTemplateId(null);
  };

  // Duplicate Template
  const handleDuplicateTemplate = async (templateId: string) => {
    const original = templates.find(t => t.id === templateId);
    if (!original) return;

    const copy: Template = {
      ...original,
      id: `tpl-copy-${Date.now()}`,
      name: `${original.name} (Cópia)`,
      createdAt: new Date().toISOString()
    };

    if (user) {
      const path = `templates/${copy.id}`;
      const copyWithAuth = { ...copy, ownerId: user.uid };
      await setDoc(doc(db, 'templates', copy.id), copyWithAuth).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, path);
      });
      const updated = [copyWithAuth, ...templates];
      setTemplates(updated);
      localStorage.setItem('autopost_templates', JSON.stringify(updated));
    } else {
      const updated = [copy, ...templates];
      saveTemplates(updated);
    }
  };

  // Save template edits from canvas editor
  const handleSaveTemplateEdits = async (updatedTemplate: Template) => {
    if (user) {
      const path = `templates/${updatedTemplate.id}`;
      const templateWithAuth = { ...updatedTemplate, ownerId: user.uid };
      await setDoc(doc(db, 'templates', updatedTemplate.id), templateWithAuth).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, path);
      });
      const updated = templates.map(t => t.id === updatedTemplate.id ? templateWithAuth : t);
      setTemplates(updated);
      localStorage.setItem('autopost_templates', JSON.stringify(updated));
    } else {
      const updated = templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t);
      saveTemplates(updated);
    }
  };

  // Add mass-gen history log item
  const handleAddHistory = async (item: HistoryItem) => {
    if (user) {
      const path = `history/${item.id}`;
      const itemWithAuth = { ...item, ownerId: user.uid };
      await setDoc(doc(db, 'history', item.id), itemWithAuth).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, path);
      });
      const updated = [itemWithAuth, ...history];
      setHistory(updated);
      localStorage.setItem('autopost_history', JSON.stringify(updated));
    } else {
      const updated = [item, ...history];
      saveHistory(updated);
    }
  };

  // Clear all history logs
  const handleClearHistory = async () => {
    if (user) {
      for (const h of history) {
        const path = `history/${h.id}`;
        await deleteDoc(doc(db, 'history', h.id)).catch((err) => {
          handleFirestoreError(err, OperationType.DELETE, path);
        });
      }
    }
    saveHistory([]);
  };


  // Toggle directly to editor layout if an ID is active
  if (editingTemplateId) {
    const templateToEdit = templates.find(t => t.id === editingTemplateId);
    if (templateToEdit) {
      return (
        <TemplateEditor 
          template={templateToEdit}
          onSave={handleSaveTemplateEdits}
          onBack={() => setEditingTemplateId(null)}
        />
      );
    }
  }

  return (
    <div className="flex h-screen bg-[#08080a] text-[#e4e4e7] overflow-hidden font-sans" id="autopost-studio-app">
      {/* Immersive PC App Left Navigation Sidebar */}
      <div className="w-[240px] bg-[#0c0c0e] border-r border-[#151519] flex flex-col justify-between select-none shrink-0">
        
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="px-5 py-5 flex flex-col gap-1 border-b border-[#151519]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]"></span>
              <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">AutoPost Studio v2.1</span>
            </div>
            <div className="mt-1">
              <h1 className="text-sm font-bold tracking-wider text-blue-500 font-mono uppercase">Autopost Studio</h1>
              <span className="text-[9px] font-mono font-semibold text-gray-400">SISTEMA INTEGRADO</span>
            </div>
          </div>

          {/* Tab buttons */}
          <nav className="p-3.5 space-y-2">
            <button
              onClick={() => { setActiveTab('templates'); setSelectedTemplateId(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'templates' 
                  ? 'bg-[#1e293b]/50 text-blue-400 border-l-2 border-blue-500 font-bold shadow-[inset_0_0_8px_rgba(59,130,246,0.1)]' 
                  : 'text-gray-400 hover:text-blue-400 hover:bg-[#111114]'
              }`}
            >
              <LayoutTemplate size={15} className={activeTab === 'templates' ? 'text-blue-400' : ''} />
              <span>Templates</span>
            </button>

            <button
              onClick={() => setActiveTab('generator')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'generator' 
                  ? 'bg-[#1e293b]/50 text-blue-400 border-l-2 border-blue-500 font-bold shadow-[inset_0_0_8px_rgba(59,130,246,0.1)]' 
                  : 'text-gray-400 hover:text-blue-400 hover:bg-[#111114]'
              }`}
            >
              <Cpu size={15} className={activeTab === 'generator' ? 'text-blue-400' : ''} />
              <span>Gerador de Vídeos</span>
            </button>

            <button
              onClick={() => { setActiveTab('history'); setSelectedTemplateId(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'history' 
                  ? 'bg-[#1e293b]/50 text-blue-400 border-l-2 border-blue-500 font-bold shadow-[inset_0_0_8px_rgba(59,130,246,0.1)]' 
                  : 'text-gray-400 hover:text-blue-400 hover:bg-[#111114]'
              }`}
            >
              <History size={15} className={activeTab === 'history' ? 'text-blue-400' : ''} />
              <span>Histórico</span>
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setSelectedTemplateId(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'settings' 
                  ? 'bg-[#1e293b]/50 text-blue-400 border-l-2 border-blue-500 font-bold shadow-[inset_0_0_8px_rgba(59,130,246,0.1)]' 
                  : 'text-gray-400 hover:text-blue-400 hover:bg-[#111114]'
              }`}
            >
              <Settings size={15} className={activeTab === 'settings' ? 'text-blue-400' : ''} />
              <span>Configurações</span>
            </button>

            <div className="h-[1px] bg-[#151519] my-2" />

            <button
              onClick={handleInstallClick}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/10 hover:shadow-[inset_0_0_8px_rgba(16,185,129,0.05)] border border-transparent hover:border-emerald-500/20 cursor-pointer"
            >
              <Download size={15} className="text-emerald-400 animate-bounce" style={{ animationDuration: '3s' }} />
              <span>Instalar Aplicativo</span>
            </button>
          </nav>
        </div>

        {/* Firebase Authentication Status & Action Footer */}
        <div className="p-3 border-t border-[#151519] bg-[#09090b]">
          {authLoading ? (
            <div className="flex items-center justify-center py-2 text-xs text-gray-500 gap-2 font-mono">
              <Database size={12} className="animate-pulse text-blue-500" />
              <span>Conectando...</span>
            </div>
          ) : user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-2 py-1">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full border border-gray-700" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold uppercase border border-blue-500/30">
                    {user.displayName?.[0] || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-gray-300 truncate leading-tight">
                    {user.displayName || 'Usuário'}
                  </p>
                  <p className="text-[9px] text-emerald-400 font-semibold font-mono flex items-center gap-1">
                    <ShieldCheck size={9} />
                    <span>Nuvem Ativa</span>
                  </p>
                </div>
              </div>

              <button
                onClick={async () => {
                  await logout();
                  // Reset state to local storage data on logout
                  const localTemplates = localStorage.getItem('autopost_templates');
                  const localHistory = localStorage.getItem('autopost_history');
                  if (localTemplates) setTemplates(JSON.parse(localTemplates));
                  if (localHistory) setHistory(JSON.parse(localHistory));
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded bg-red-950/20 hover:bg-red-950/50 text-red-400 border border-red-900/30 text-[10px] font-mono transition-all cursor-pointer"
              >
                <LogOut size={11} />
                <span>Desconectar</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] text-gray-400 text-center leading-normal px-1">
                Salve seus templates e histórico na nuvem de forma segura.
              </p>
              <button
                onClick={async () => {
                  try {
                    const loggedInUser = await loginWithGoogle();
                    if (loggedInUser) {
                      setUser(loggedInUser);
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[10px] transition-all cursor-pointer shadow-[0_0_8px_rgba(59,130,246,0.3)]"
              >
                <LogIn size={11} />
                <span>Salvar na Nuvem</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main workspace container */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#08080a] overflow-hidden">
        
        {/* Top PC Window Titlebar */}
        <header className="bg-[#0c0c0e] border-b border-[#151519] flex flex-col select-none shrink-0">
          <div className="h-14 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <Monitor size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold text-gray-500 font-mono tracking-wider uppercase">Console de Gerenciamento</span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#121216] rounded border border-gray-800 text-gray-400 font-medium">
                <Sparkles size={12} className="text-blue-400 shrink-0" />
                <span className="text-[11px] font-mono">AUTOMAÇÃO DE TEMPLATES ATIVA</span>
              </div>


            </div>
          </div>
        </header>

        {/* Dynamic Workspace Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#08080a]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {activeTab === 'templates' && (
                <TemplatesTab 
                  templates={templates}
                  onEditTemplate={(id) => setEditingTemplateId(id)}
                  onCreateTemplate={handleCreateTemplate}
                  onDeleteTemplate={handleDeleteTemplate}
                  onDuplicateTemplate={handleDuplicateTemplate}
                />
              )}

              {activeTab === 'generator' && (
                <GeneratorTab 
                  templates={templates}
                  selectedTemplateId={selectedTemplateId}
                  onSelectTemplate={(id) => setSelectedTemplateId(id)}
                  onAddHistory={handleAddHistory}
                />
              )}

              {activeTab === 'history' && (
                <HistoryTab 
                  history={history}
                  onClearHistory={handleClearHistory}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsTab />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* PWA Installation Instructions Modal */}
      <AnimatePresence>
        {showInstallModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0e0e11] border border-gray-800 rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-[#09090c]">
                <div className="flex items-center gap-2">
                  <Download className="text-emerald-400" size={18} />
                  <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider font-mono">Como instalar o aplicativo</h3>
                </div>
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="text-gray-500 hover:text-gray-300 transition-colors text-xs font-mono px-2 py-1 rounded bg-gray-900 border border-gray-800 cursor-pointer"
                >
                  FECHAR
                </button>
              </div>

              <div className="p-6 space-y-5">
                {isInIframe && (
                  <div className="p-4 bg-amber-950/20 rounded-lg border border-amber-500/20 flex flex-col gap-3">
                    <div className="flex gap-3">
                      <CircleAlert size={18} className="text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                      <div className="text-xs text-gray-300 leading-relaxed">
                        <p className="font-bold text-amber-400 mb-1">Visualizador do AI Studio Ativo</p>
                        Como você está rodando o aplicativo dentro do visualizador do AI Studio (iframe), o navegador bloqueia a detecção de PWA por segurança. Para poder instalar no PC ou celular, você só precisa abrir o aplicativo em uma aba independente!
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(window.location.href, '_blank')}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold font-mono rounded transition-colors uppercase cursor-pointer text-center"
                    >
                      Abrir em Nova Aba Independente
                    </button>
                  </div>
                )}

                <div className="p-4 bg-emerald-950/20 rounded-lg border border-emerald-500/20 flex gap-3">
                  <Sparkles size={18} className="text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                  <div className="text-xs text-gray-300 leading-relaxed">
                    <p className="font-bold text-emerald-400 mb-1">Tecnologia PWA Ativa!</p>
                    O AutoPost Studio é um aplicativo web progressivo. Você pode instalá-lo no seu computador ou celular para ter acesso instantâneo rápido, desempenho otimizado e visualização em tela cheia sem barras de navegação do navegador!
                  </div>
                </div>

                <div className="space-y-4">
                  {/* PC / Desktop Instructions */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide font-mono flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      No Computador (PC / Mac)
                    </p>
                    <div className="text-xs text-gray-400 leading-relaxed pl-3.5 space-y-2">
                      <p>
                        1. Certifique-se de estar usando o <strong className="text-white">Google Chrome, Microsoft Edge ou Brave</strong> fora do visualizador do AI Studio (clique no botão laranja acima para abrir em nova aba).
                      </p>
                      <p>
                        2. Procure o ícone de <strong className="text-white">Instalação (computador com uma seta para baixo)</strong> na barra de endereços, ao lado da estrela de favoritos.
                      </p>
                      <div className="p-3 bg-blue-950/20 border border-blue-500/20 rounded text-[11px] text-gray-300">
                        <strong className="text-blue-400">Dica se o ícone não aparecer:</strong> Se o ícone não estiver visível na barra de endereços, você pode instalar manualmente pelo menu do navegador:
                        <ul className="list-disc list-inside mt-1.5 space-y-1 pl-1 text-gray-400">
                          <li>No <strong className="text-white">Chrome</strong>: Clique no menu de <strong className="text-white">Três Pontos (canto superior direito) → Salvar e compartilhar → Instalar página / Instalar AutoPost</strong>.</li>
                          <li>No <strong className="text-white">Edge</strong>: Clique no menu de <strong className="text-white">Três Pontos → Aplicativos → Instalar este site como aplicativo</strong>.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Android Instructions */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide font-mono flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      No Celular (Android)
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed pl-3.5">
                      Abra o aplicativo no Chrome do celular, toque no menu de três pontos no canto superior direito e escolha a opção <strong className="text-white">"Instalar aplicativo"</strong> ou <strong className="text-white">"Adicionar à tela inicial"</strong>.
                    </p>
                  </div>

                  {/* iOS/Safari Instructions */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide font-mono flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      No iPhone (iOS / Safari)
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed pl-3.5">
                      Abra o aplicativo no navegador <strong className="text-white">Safari</strong>, toque no botão de <strong className="text-white">Compartilhar</strong> (ícone de quadrado com uma seta para cima), role para baixo e toque em <strong className="text-white">"Adicionar à Tela de Início"</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#09090c] border-t border-gray-800 flex justify-end">
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="px-4 py-2 text-xs font-mono font-bold bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors cursor-pointer"
                >
                  ENTENDI
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
