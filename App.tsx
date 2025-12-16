import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { CanvasRenderer } from './components/CanvasTemplates';
import { PostData, ASPECT_RATIOS } from './types';
import { INITIAL_POST_DATA } from './constants';
import { Monitor, PanelLeftClose, PanelLeftOpen, Check, User, Crown, Lock, Facebook } from 'lucide-react';

declare const html2canvas: any;

// --- Mock Auth Component ---
const AuthOverlay = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-white/10">
        <div className="bg-gradient-to-br from-slate-800 to-black p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Crown size={120} />
          </div>
          <div className="inline-flex items-center justify-center p-3 bg-orange-500 rounded-full mb-4 shadow-lg ring-4 ring-orange-500/30">
             <Lock size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black mb-2 tracking-tight">Gera Post Pro</h1>
          <p className="opacity-90 font-medium text-slate-300">Acesso exclusivo para assinantes</p>
        </div>
        
        <div className="p-8">
           <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 text-slate-700">
                <div className="bg-green-100 p-1.5 rounded-full text-green-600 mt-0.5"><Check size={16} strokeWidth={4} /></div>
                <div>
                  <span className="font-bold block text-slate-900">Salvar Configurações</span>
                  <span className="text-xs text-slate-500">Sua logo, cores e fontes ficam salvas para o próximo acesso.</span>
                </div>
              </div>
              <div className="flex items-start gap-4 text-slate-700">
                <div className="bg-green-100 p-1.5 rounded-full text-green-600 mt-0.5"><Check size={16} strokeWidth={4} /></div>
                <div>
                   <span className="font-bold block text-slate-900">Modelos Premium</span>
                   <span className="text-xs text-slate-500">Acesso ilimitado aos modelos 7, 8 e 9 e atualizações.</span>
                </div>
              </div>
           </div>

           <div className="space-y-3">
             <button 
               onClick={onLogin}
               className="w-full bg-[#1877F2] text-white font-bold py-3 rounded-lg hover:bg-[#166fe5] transition-all flex items-center justify-center gap-3 shadow-md"
             >
               <Facebook size={20} fill="currentColor" />
               Continuar com Facebook
             </button>

             <button 
               onClick={onLogin}
               className="w-full bg-white text-slate-700 border border-slate-300 font-bold py-3 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm"
             >
               {/* Google SVG Icon */}
               <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
               </svg>
               Continuar com Google
             </button>

             <button 
               onClick={onLogin}
               className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-md"
             >
               <User size={20} />
               Entrar com E-mail
             </button>
           </div>
           
           <div className="text-center pt-4 mt-2">
             <p className="text-xs text-slate-400 mb-2">Plano Mensal - R$ 29,90/mês</p>
             <a href="#" className="text-orange-600 font-bold hover:underline text-sm">Criar nova assinatura</a>
           </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [postData, setPostData] = useState<PostData>(INITIAL_POST_DATA);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.4);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const previewWrapperRef = useRef<HTMLDivElement>(null);

  // --- Persistence Logic ---
  useEffect(() => {
    // 1. Check Auth
    const wasLoggedIn = localStorage.getItem('geraPostIsLoggedIn');
    if (wasLoggedIn === 'true') {
       setIsAuthenticated(true);
    }

    // 2. Load Data (Logo, Colors, etc)
    const savedData = localStorage.getItem('geraPostData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Merge saved data with initial structure to ensure new fields are present
        setPostData(prev => ({
           ...prev,
           ...parsed,
           // Ensure logo object is merged correctly if schema changed
           logo: { ...prev.logo, ...parsed.logo }
        }));
      } catch (e) {
        console.error("Error loading saved data", e);
      }
    }
  }, []);

  const handleLogin = () => {
    // Simulate login
    setIsAuthenticated(true);
    localStorage.setItem('geraPostIsLoggedIn', 'true');
  };

  const handleUpdateData = useCallback((partial: Partial<PostData>) => {
    setPostData(prev => {
      const newData = { ...prev, ...partial };
      // Save on every change
      localStorage.setItem('geraPostData', JSON.stringify(newData));
      return newData;
    });
  }, []);

  // Auto-fit preview logic
  useEffect(() => {
    const handleResize = () => {
      if (!previewWrapperRef.current) return;
      
      const containerH = previewWrapperRef.current.clientHeight;
      const containerW = previewWrapperRef.current.clientWidth;
      const canvasH = ASPECT_RATIOS[postData.format].height;
      const canvasW = ASPECT_RATIOS[postData.format].width;

      const padding = 60; 
      const scaleH = (containerH - padding) / canvasH;
      const scaleW = (containerW - padding) / canvasW;
      const maxScale = isSidebarOpen ? 0.6 : 0.9; 

      setPreviewScale(Math.min(scaleH, scaleW, maxScale));
    };

    const timeout = setTimeout(handleResize, 350);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, [postData.format, isSidebarOpen]);

  const handleDownload = async () => {
    const element = document.getElementById('ghost-canvas-download'); 
    
    if (!element || typeof html2canvas === 'undefined') {
      console.error("Ghost Canvas element not found");
      return;
    }

    setIsDownloading(true);

    try {
      const canvas = await html2canvas(element, {
        scale: 1, 
        useCORS: true, 
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      const link = document.createElement('a');
      const categorySlug = postData.category ? postData.category.toLowerCase().replace(/\s/g, '-') : 'arte';
      const filename = `gera-post-${categorySlug}-${Date.now()}.png`;
      link.download = filename;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Erro ao gerar imagem. Verifique se a imagem de fundo permite acesso externo (CORS).");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-gray-100 font-sans">
      
      {!isAuthenticated && <AuthOverlay onLogin={handleLogin} />}

      {/* Left: Tabbed Control Panel (Collapsible) */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden flex flex-col border-r border-gray-300 shadow-xl z-20 bg-white shrink-0 ${
          isSidebarOpen ? 'w-full md:w-[320px] lg:w-[400px] opacity-100' : 'w-0 opacity-0 md:w-0'
        }`}
      >
        <ControlPanel 
          data={postData} 
          updateData={handleUpdateData}
          onDownload={handleDownload}
          isDownloading={isDownloading}
        />
      </div>

      {/* Right: Preview Area */}
      <div className="flex-1 flex flex-col h-full relative bg-gray-800 transition-all duration-300 overflow-hidden">
        
        {/* Preview Header */}
        <div className="bg-gray-900 border-b border-gray-700 py-2 px-4 flex items-center justify-between shadow-md z-10 shrink-0 h-14">
           <div className="flex items-center gap-4 text-white">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 hover:bg-gray-700 rounded-full transition-colors text-gray-300 hover:text-white"
                title={isSidebarOpen ? "Recolher Painel" : "Expandir Painel"}
              >
                {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
              </button>
              
              <div className="flex items-center gap-2">
                <Monitor size={18} className="text-green-500"/>
                <span className="font-bold text-xs uppercase tracking-wide hidden sm:inline">
                  {isSidebarOpen ? 'Visualizador' : 'Modo Visualização Ampliada'}
                </span>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              {isAuthenticated && (
                <div className="hidden sm:flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 shadow-inner">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  <span className="text-[10px] text-gray-300 font-medium">Assinante Pro</span>
                </div>
              )}
              <div className="text-[10px] bg-gray-800 px-2 py-1 rounded text-gray-300 font-mono border border-gray-600">
                  {ASPECT_RATIOS[postData.format].width} x {ASPECT_RATIOS[postData.format].height} px
              </div>
           </div>
        </div>

        {/* Canvas Workspace */}
        <div 
          ref={previewWrapperRef}
          className="flex-1 relative flex items-center justify-center p-4 overflow-hidden bg-gray-800"
          style={{
             backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)',
             backgroundSize: '20px 20px'
          }}
        >
          {/* Visual Canvas Container (Scaled for viewing) */}
          <div 
             className="origin-center shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-all duration-300 ease-out bg-white ring-1 ring-white/10"
             style={{ 
               transform: `scale(${previewScale})`,
               width: ASPECT_RATIOS[postData.format].width,
               height: ASPECT_RATIOS[postData.format].height,
             }}
          >
             <CanvasRenderer data={postData} id="canvas-preview" />
          </div>
        </div>

        {/* Ghost Renderer for Download */}
        <div 
          style={{ 
            position: 'fixed', 
            left: '-10000px', 
            top: '0', 
            width: ASPECT_RATIOS[postData.format].width, 
            height: ASPECT_RATIOS[postData.format].height,
            overflow: 'hidden',
            visibility: 'visible',
            zIndex: -50
          }}
        >
          <CanvasRenderer data={postData} id="ghost-canvas-download" />
        </div>

        {/* Info Footer */}
        <div className="bg-gray-900 text-gray-500 text-[9px] py-1 px-4 text-center w-full z-20 shrink-0 border-t border-gray-700">
           Programa desenvolvido pela empresa <strong className="text-gray-300">NC Assessoria & Marketing</strong>
        </div>
      </div>

    </div>
  );
};

export default App;