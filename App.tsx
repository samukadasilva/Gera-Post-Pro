import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { CanvasRenderer } from './components/CanvasTemplates';
import { PostData, ASPECT_RATIOS } from './types';
import { INITIAL_POST_DATA } from './constants';
import { 
  Monitor, 
  PanelLeftClose, 
  PanelLeftOpen, 
  User, 
  Crown, 
  Lock, 
  Facebook, 
  LogOut, 
  CreditCard, 
  Settings,
  X,
  Loader2,
  Cloud, 
  CloudOff,
  Mail,
  ArrowRight,
  Star
} from 'lucide-react';
import { auth, googleProvider, facebookProvider, db } from './firebase';
import { 
  signInWithPopup, 
  signOut, 
  updateProfile, 
  User as FirebaseUser, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

declare const html2canvas: any;

// --- User Profile Modal ---
interface UserProfileModalProps {
  user: FirebaseUser;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, isOpen, onClose, onLogout }) => {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setDisplayName(user.displayName || '');
  }, [user]);

  if (!isOpen) return null;

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      await updateProfile(user, { displayName });
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error("Erro ao atualizar", error);
      alert('Erro ao atualizar perfil.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleManageSubscription = () => {
    alert("Redirecionando para o portal de pagamentos...");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <User size={20} /> Minha Conta
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center -mt-12 mb-4">
             <div className="w-20 h-20 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-lg">
               {user.photoURL ? (
                 <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-slate-700 text-white text-2xl font-bold">
                   {displayName.charAt(0).toUpperCase()}
                 </div>
               )}
             </div>
             <span className="text-xs text-slate-500 mt-2 font-mono">{user.uid.slice(0, 8)}...</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Nome Completo</label>
              <input 
                type="text" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">E-mail (Login)</label>
              <input 
                type="email" 
                value={user.email || ''} 
                disabled 
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
             <div>
               <p className="text-xs text-green-800 font-bold uppercase tracking-wide">Status da Assinatura</p>
               <p className="text-green-700 font-semibold flex items-center gap-1">
                 <Crown size={14} /> Ativo - Plano Pro
               </p>
             </div>
             <button 
               onClick={handleManageSubscription}
               className="text-xs bg-white border border-green-200 text-green-700 px-3 py-1.5 rounded-md hover:bg-green-100 font-medium flex items-center gap-1 shadow-sm transition-colors"
             >
               <CreditCard size={12} /> Gerenciar
             </button>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
             <button 
               onClick={handleUpdateProfile}
               disabled={isUpdating}
               className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-70"
             >
               {isUpdating ? <Loader2 className="animate-spin" size={16} /> : <Settings size={16} />} 
               Salvar Alterações
             </button>
             
             <button 
               onClick={onLogout}
               className="w-full bg-red-50 text-red-600 font-bold py-2.5 rounded-lg hover:bg-red-100 transition-all flex items-center justify-center gap-2"
             >
               <LogOut size={16} /> Sair da Conta
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Auth Component ---
const AuthOverlay = ({ 
  onLoginGoogle, 
  onLoginFacebook,
  onGuestAccess
}: { 
  onLoginGoogle: () => void, 
  onLoginFacebook: () => void,
  onGuestAccess: () => void
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleEmailAuth = async () => {
    if (!email || !password) {
      alert("Preencha e-mail e senha.");
      return;
    }

    setLoadingEmail(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error("Auth Error", error);
      let msg = "Erro na autenticação.";
      alert(msg);
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm animate-in fade-in duration-500 overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-white/10 relative mb-8">
          <div className="bg-gradient-to-br from-slate-800 to-black p-8 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Crown size={100} /></div>
            <div className="inline-flex items-center justify-center p-3 bg-orange-500 rounded-full mb-3 shadow-lg ring-4 ring-orange-500/30"><Lock size={24} strokeWidth={2.5} /></div>
            <h1 className="text-2xl font-black mb-1 tracking-tight">Gera Post Pro</h1>
            <p className="opacity-90 text-sm font-medium text-slate-300">Acesse para desbloquear recursos</p>
          </div>
          <div className="p-6">
            <div className="space-y-2 mb-6">
              <button onClick={onLoginFacebook} className="w-full bg-[#1877F2] text-white font-bold py-2.5 rounded-lg hover:bg-[#166fe5] transition-all flex items-center justify-center gap-2 shadow-md text-sm"><Facebook size={18} fill="currentColor" />Entrar com Facebook</button>
              <button onClick={onLoginGoogle} className="w-full bg-white text-slate-700 border border-slate-300 font-bold py-2.5 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm text-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Entrar com Google
              </button>
            </div>
            <div className="relative mb-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Ou use seu e-mail</span></div></div>
            <div className="space-y-3">
                <div><input type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 outline-none" /></div>
                <div><input type="password" placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 outline-none" /></div>
                <button onClick={handleEmailAuth} disabled={loadingEmail} className="w-full bg-slate-800 text-white font-bold py-2.5 rounded-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-sm text-sm">{loadingEmail ? <Loader2 className="animate-spin" size={16} /> : <Mail size={16} />}{isRegistering ? 'Cadastrar Conta' : 'Entrar com E-mail'}</button>
                <div className="text-center"><button onClick={() => setIsRegistering(!isRegistering)} className="text-xs text-slate-500 hover:text-orange-600 underline">{isRegistering ? 'Já tenho conta? Fazer login' : 'Não tem conta? Cadastre-se grátis'}</button></div>
            </div>
            <div className="mt-6 p-3 bg-orange-50 border border-orange-200 rounded-xl flex flex-col items-center justify-center text-center"><div className="flex items-center gap-1.5 text-orange-800 font-bold text-xs uppercase tracking-wider mb-0.5"><Star size={12} fill="currentColor" /> Oferta Especial</div><div className="text-slate-900 font-medium text-sm">Tenha o <span className="font-black text-orange-600">Plano Pro</span> por apenas</div><div className="text-2xl font-black text-slate-800 tracking-tight">R$ 15,00</div></div>
            <div className="mt-4 pt-4 border-t border-dashed border-gray-200 text-center"><button onClick={onGuestAccess} className="text-sm font-bold text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 mx-auto transition-colors group">Entrar sem login (Modo Teste) <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></button></div>
          </div>
        </div>
        <div className="text-gray-500 text-[11px] font-medium flex items-center gap-1 opacity-70 mt-2"><span>&copy; {currentYear}</span><span>Programa desenvolvido pela empresa</span><strong className="text-gray-300">NC Assessoria & Marketing</strong></div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [postData, setPostData] = useState<PostData>(INITIAL_POST_DATA);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDownloadCanvas, setShowDownloadCanvas] = useState(false); 
  const [previewScale, setPreviewScale] = useState(0.4);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);

  const previewWrapperRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsGuestMode(false);
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setPostData(prev => ({ ...prev, ...docSnap.data().postData }));
          }
        } catch (error) { console.error("Error fetching", error); }
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateData = useCallback((partial: Partial<PostData>) => {
    setPostData(prev => {
      const newData = { ...prev, ...partial };
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        if (auth.currentUser) {
           setIsSaving(true);
           try { await setDoc(doc(db, "users", auth.currentUser.uid), { postData: newData }, { merge: true }); } 
           catch (err) { console.error(err); } 
           finally { setIsSaving(false); }
        }
      }, 1500);
      return newData;
    });
  }, []);

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
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [postData.format, isSidebarOpen]);

  const handleDownload = async () => {
    setIsDownloading(true);
    setShowDownloadCanvas(true);
    try {
      // Pequeno delay maior para garantir renderização total do canvas oculto
      await new Promise(resolve => setTimeout(resolve, 4000)); 
      const element = document.getElementById('final-canvas-export'); 
      if (!element) throw new Error("Elemento não encontrado");

      const { width, height } = ASPECT_RATIOS[postData.format];

      const canvas = await html2canvas(element, {
        scale: 2,
        width: width,
        height: height,
        useCORS: true, 
        allowTaint: true, 
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: width,
        windowHeight: height,
        onclone: (clonedDoc: Document) => {
            const el = clonedDoc.getElementById('final-canvas-export');
            if(el) {
                // CORREÇÃO: FORÇAR LARGURA AUTO EM TODAS AS RETRANCAS NO DOWNLOAD
                const tags = el.querySelectorAll('.category-tag-render');
                tags.forEach((t: any) => {
                   t.style.setProperty('display', 'inline-block', 'important');
                   t.style.setProperty('width', 'auto', 'important');
                   t.style.setProperty('min-width', '0', 'important');
                   t.style.setProperty('max-width', 'none', 'important');
                   t.style.setProperty('visibility', 'visible', 'important');
                   t.style.setProperty('opacity', '1', 'important');
                   
                   const span = t.querySelector('span');
                   if(span) span.style.fontWeight = '800';
                });

                // FORÇAR NEGRITO E TAMANHO NO RODAPÉ
                const footerItems = el.querySelectorAll('[data-footer-item="true"]');
                footerItems.forEach((item: any) => {
                    item.style.fontWeight = '800';
                    item.style.fontSize = '22px';
                    item.style.display = 'inline-flex';
                    item.style.alignItems = 'center';
                    item.style.width = 'auto';
                    
                    const svg = item.querySelector('svg');
                    if(svg) {
                       svg.setAttribute('width', '28');
                       svg.setAttribute('height', '28');
                       svg.style.width = '28px';
                       svg.style.height = '28px';
                       svg.style.marginRight = '12px';
                    }
                });
            }
        },
      });

      const link = document.createElement('a');
      link.download = `gera-post-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) { console.error(error); alert("Erro ao baixar."); } 
    finally { setShowDownloadCanvas(false); setIsDownloading(false); }
  };

  if (loadingAuth) return <div className="h-screen w-full flex items-center justify-center bg-slate-100"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-gray-100">
      {!user && !isGuestMode && <AuthOverlay onLoginGoogle={() => signInWithPopup(auth, googleProvider)} onLoginFacebook={() => signInWithPopup(auth, facebookProvider)} onGuestAccess={() => setIsGuestMode(true)} />}
      {user && <UserProfileModal user={user} isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} onLogout={async () => { await signOut(auth); setPostData(INITIAL_POST_DATA); }} />}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden flex flex-col border-r border-gray-300 shadow-xl z-20 bg-white shrink-0 ${isSidebarOpen ? 'w-full md:w-[320px] lg:w-[400px]' : 'w-0'}`}>
        <ControlPanel data={postData} updateData={handleUpdateData} onDownload={handleDownload} isDownloading={isDownloading} />
      </div>
      <div className="flex-1 flex flex-col h-full relative bg-gray-800 transition-all duration-300 overflow-hidden">
        <div className="bg-gray-900 border-b border-gray-700 py-2 px-4 flex items-center justify-between shadow-md z-10 shrink-0 h-14">
           <div className="flex items-center gap-4 text-white">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-gray-700 rounded-full transition-colors"><PanelLeftClose size={20} /></button>
              <div className="flex items-center gap-2"><Monitor size={18} className="text-green-500"/><span className="font-bold text-xs uppercase tracking-wide">Visualizador</span></div>
           </div>
           {user && <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 pr-3 pl-1 py-1 rounded-full border border-slate-600 transition-colors"><div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">{user.photoURL ? <img src={user.photoURL} alt="User" /> : 'U'}</div><span className="text-xs text-gray-200">{user.displayName || 'Usuário'}</span></button>}
        </div>
        <div ref={previewWrapperRef} className="flex-1 relative flex items-center justify-center p-4 overflow-hidden bg-gray-800" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          <div className="origin-center shadow-[0_20px_60px_rgba(0,0,0,0.6)]" style={{ transform: `scale(${previewScale})`, width: ASPECT_RATIOS[postData.format].width, height: ASPECT_RATIOS[postData.format].height }}><CanvasRenderer data={postData} id="canvas-preview" /></div>
        </div>
        {isDownloading && <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-in fade-in"><Loader2 className="animate-spin w-12 h-12 text-orange-500 mb-4" /><p className="font-bold text-lg animate-pulse">Gerando imagem HD...</p></div>}
        {showDownloadCanvas && <div style={{ position: 'fixed', left: '-10000px', top: 0, overflow: 'hidden' }}><CanvasRenderer data={postData} id="final-canvas-export" /></div>}
      </div>
    </div>
  );
};

export default App;