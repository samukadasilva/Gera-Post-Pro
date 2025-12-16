import React, { useRef, useState, useEffect } from 'react';
import { PostData, ASPECT_RATIOS, ImagePosition } from '../types';
import { scrapeNewsData } from '../utils';
import { CanvasRenderer } from './CanvasTemplates';
import { 
  Download, 
  Upload, 
  RefreshCw,
  CheckCircle,
  Edit3,
  ArrowUpRight,
  AlignCenter,
  Save,
  Type,
  AlignLeft,
  AlignRight
} from 'lucide-react';

interface ControlPanelProps {
  data: PostData;
  updateData: (partial: Partial<PostData>) => void;
  onDownload: () => void;
  isDownloading: boolean;
}

type Tab = 'layout-post' | 'layout-storie' | 'logomarca' | 'configuracoes';

const FONTS = [
  { name: 'Montserrat', value: 'Montserrat' },
  { name: 'Inter', value: 'Inter' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Merriweather', value: 'Merriweather' },
  { name: 'Oswald', value: 'Oswald' },
  { name: 'Playfair', value: 'Playfair Display' },
];

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">{children}</h2>
);

const TemplateCard: React.FC<{ 
  id: number; 
  data: PostData; 
  updateData: (partial: Partial<PostData>) => void; 
  onCustomize: () => void;
}> = ({ id, data, updateData, onCustomize }) => {
  const isSelected = data.templateId === id;
  const isStory = data.format === 'story-9-16';
  
  // Smaller scale for compact view
  const scale = 0.09; 
  const containerWidth = 1080 * scale;
  const containerHeight = (isStory ? 1920 : 1350) * scale;

  const handleSelect = () => {
    if (isSelected) {
      onCustomize();
    } else {
      updateData({ templateId: id });
    }
  };

  return (
    <div 
      className={`bg-white rounded border overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer ${isSelected ? 'ring-2 ring-orange-500 border-transparent' : 'border-gray-200'}`} 
      onClick={handleSelect}
    >
      <div className="p-2 bg-gray-50 border-b border-gray-100 flex justify-center items-center">
           <div 
             className="relative overflow-hidden bg-white shadow-sm ring-1 ring-black/5"
             style={{ 
               width: `${containerWidth}px`, 
               height: `${containerHeight}px` 
             }}
           >
              <div 
                className="absolute inset-0 origin-top-left pointer-events-none"
                style={{ transform: `scale(${scale})` }}
              >
                <CanvasRenderer data={{...data, templateId: id}} id={`thumb-${id}`} />
              </div>
           </div>
      </div>
      <div className="p-1.5 flex flex-col items-center">
         <button
           className={`w-full py-0.5 px-1 rounded font-bold text-[9px] uppercase tracking-wide flex items-center justify-center gap-1 transition-colors ${
             isSelected 
               ? 'text-orange-600' 
               : 'text-gray-400 hover:text-gray-600'
           }`}
         >
           {isSelected ? (
             <><Edit3 size={10} /> Editar</>
           ) : (
             <><CheckCircle size={10} /> Escolher</>
           )}
         </button>
      </div>
    </div>
  );
};

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  data, 
  updateData, 
  onDownload, 
  isDownloading 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('layout-post');
  const [isLoadingScrape, setIsLoadingScrape] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // Persistence logic moved to App.tsx to avoid conflicts

  // Handler for format switching based on tab
  useEffect(() => {
    if (activeTab === 'layout-post') {
      updateData({ format: 'feed-4-5' });
    } else if (activeTab === 'layout-storie') {
      updateData({ format: 'story-9-16' });
    }
  }, [activeTab, updateData]);

  const handleRealFetch = async () => {
    const url = urlInputRef.current?.value;
    if(!url) {
      alert("Por favor, cole um link válido.");
      return;
    }

    setIsLoadingScrape(true);
    try {
      const scraped = await scrapeNewsData(url);
      updateData({
        headline: scraped.headline || data.headline,
        subtitle: scraped.subtitle || data.subtitle,
        imageUrl: scraped.imageUrl || data.imageUrl,
        siteUrl: scraped.siteUrl || data.siteUrl
      });
      alert("Conteúdo extraído com sucesso!");
    } catch (error) {
      alert("Não foi possível extrair automaticamente. Tente preencher manualmente.");
    } finally {
      setIsLoadingScrape(false);
    }
  };

  // --- CRITICAL FIX: Convert image to Base64 to avoid CORS/Distortion in Vercel ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'bg') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onloadend = () => {
         const base64String = reader.result as string;
         if (field === 'logo') {
           updateData({ logo: { ...data.logo, url: base64String } });
         } else {
           updateData({ imageUrl: base64String });
         }
      };

      reader.readAsDataURL(file);
    }
  };

  const setLogoPosition = (pos: 'tl' | 'tr' | 'bl' | 'br' | 'c') => {
    let x = 50, y = 50;
    if (pos === 'tl') { x = 15; y = 10; }
    if (pos === 'tr') { x = 85; y = 10; }
    if (pos === 'bl') { x = 15; y = 90; }
    if (pos === 'br') { x = 85; y = 90; }
    updateData({ logo: { ...data.logo, x, y }});
  };

  const handleSaveDraft = () => {
    // This is just a manual trigger, App.tsx saves automatically on change
    alert("Configurações salvas no navegador!");
  };

  const goToConfig = () => setActiveTab('configuracoes');

  // --- UI Components ---

  const TabButton = ({ id, label }: { id: Tab, label: string }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`flex-1 py-2 text-[10px] sm:text-xs font-bold text-white transition-colors uppercase whitespace-nowrap border-r border-white/10 last:border-0 ${
          isActive ? 'bg-orange-500' : 'bg-gray-600 hover:bg-gray-500'
        }`}
      >
        {label}
      </button>
    );
  };

  const ImageAlignButton = ({ pos, icon: Icon }: { pos: ImagePosition, icon: any }) => (
    <button 
      onClick={() => updateData({ imagePosition: pos })}
      className={`p-1.5 rounded border transition-colors ${data.imagePosition === pos ? 'bg-orange-100 border-orange-500 text-orange-700' : 'bg-gray-50 border-gray-300 text-gray-500 hover:bg-gray-100'}`}
      title={`Alinhar Imagem: ${pos === 'left' ? 'Esquerda' : pos === 'right' ? 'Direita' : 'Centro'}`}
    >
      <Icon size={14} />
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-white w-full font-sans">
      
      {/* Top Tabs - Compact */}
      <div className="flex bg-gray-600 shrink-0">
        <TabButton id="layout-post" label="Feed" />
        <TabButton id="layout-storie" label="Story" />
        <TabButton id="logomarca" label="Logo" />
        <TabButton id="configuracoes" label="Editar" />
      </div>

      {/* Main Scrollable Area - Compact Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-3 scrollbar-thin">
        
        {/* Layout Tabs Content - 3 Column Grid for Compactness */}
        {(activeTab === 'layout-post' || activeTab === 'layout-storie') && (
          <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
            <SectionTitle>Escolha o Modelo</SectionTitle>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((id) => (
                <TemplateCard key={id} id={id} data={data} updateData={updateData} onCustomize={goToConfig} />
              ))}
            </div>
          </div>
        )}

        {/* Logomarca Content - Compacted */}
        {activeTab === 'logomarca' && (
           <div className="space-y-3">
              <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                 <SectionTitle>Upload</SectionTitle>
                 <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center rounded overflow-hidden shrink-0">
                        {data.logo.url ? (
                          <img src={data.logo.url} alt="Logo" className="max-w-full max-h-full p-1 object-contain" />
                        ) : (
                          <Upload size={16} className="text-gray-400" />
                        )}
                    </div>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 bg-blue-600 text-white py-2 rounded text-xs hover:bg-blue-700 font-bold"
                    >
                      Selecionar Imagem
                    </button>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                 </div>
              </div>

              {data.logo.url && (
                <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                  <SectionTitle>Ajustes</SectionTitle>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">Posição Rápida</label>
                      <div className="flex gap-1">
                          {['tl', 'tr', 'c', 'bl', 'br'].map((pos) => (
                             <button key={pos} onClick={() => setLogoPosition(pos as any)} className="flex-1 py-1 bg-gray-50 border rounded hover:bg-orange-100 text-gray-600 flex justify-center">
                               {pos === 'c' ? <AlignCenter size={14}/> : <ArrowUpRight size={14} className={pos.includes('l') ? '-scale-x-100' : ''} style={{ transform: pos.includes('b') ? (pos.includes('l') ? 'scaleX(-1) rotate(180deg)' : 'rotate(180deg)') : undefined }} />}
                             </button>
                          ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <div>
                         <label className="text-[10px] font-bold text-gray-500 block mb-1">Tamanho</label>
                         <input type="range" min="0.2" max="3" step="0.1" value={data.logo.scale} onChange={(e) => updateData({ logo: { ...data.logo, scale: Number(e.target.value) }})} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"/>
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-gray-500 block mb-1">Posição X</label>
                          <input type="range" min="0" max="100" value={data.logo.x} onChange={(e) => updateData({ logo: { ...data.logo, x: Number(e.target.value) }})} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"/>
                       </div>
                       <div className="col-span-2">
                          <label className="text-[10px] font-bold text-gray-500 block mb-1">Posição Y</label>
                          <input type="range" min="0" max="100" value={data.logo.y} onChange={(e) => updateData({ logo: { ...data.logo, y: Number(e.target.value) }})} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"/>
                       </div>
                    </div>
                  </div>
                </div>
              )}
           </div>
        )}

        {/* Configurações Content - Ultra Compact */}
        {activeTab === 'configuracoes' && (
           <div className="space-y-3">
             
             {/* Content Section */}
             <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                <SectionTitle>Texto e Imagem</SectionTitle>
                
                {/* URL Import - Single Line */}
                <div className="flex gap-1 mb-3">
                  <input ref={urlInputRef} type="text" placeholder="Link da matéria..." className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:border-orange-500 outline-none h-7" />
                  <button onClick={handleRealFetch} disabled={isLoadingScrape} className="bg-blue-600 text-white px-3 rounded text-xs hover:bg-blue-700 disabled:opacity-50 h-7 flex items-center">
                    {isLoadingScrape ? <RefreshCw className="animate-spin" size={12}/> : "Extrair"}
                  </button>
                </div>

                <div className="space-y-2">
                   <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Manchete</label>
                      <textarea
                        value={data.headline}
                        onChange={(e) => updateData({ headline: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:border-orange-500 outline-none h-14 text-xs font-sans resize-none leading-snug"
                        style={{ fontFamily: data.fontFamily }}
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Subtítulo</label>
                      <textarea
                        value={data.subtitle}
                        onChange={(e) => updateData({ subtitle: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:border-orange-500 outline-none h-12 text-xs font-sans resize-none leading-snug"
                        style={{ fontFamily: data.fontFamily }}
                      />
                   </div>
                   <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[10px] font-bold text-gray-500">Imagem Fundo</label>
                        <div className="flex gap-1">
                          <ImageAlignButton pos="left" icon={AlignLeft} />
                          <ImageAlignButton pos="center" icon={AlignCenter} />
                          <ImageAlignButton pos="right" icon={AlignRight} />
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <input type="text" value={data.imageUrl} onChange={(e) => updateData({ imageUrl: e.target.value })} className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded outline-none h-7" />
                         <button onClick={() => bgInputRef.current?.click()} className="bg-gray-200 px-2 rounded hover:bg-gray-300 h-7 flex items-center justify-center w-8" title="Upload"><Upload size={14}/></button>
                         <input ref={bgInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'bg')} />
                      </div>
                   </div>
                </div>
             </div>

             {/* Style Settings - Grid Layout */}
             <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                <SectionTitle>Estilo</SectionTitle>
                
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                   <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-bold text-gray-500 mb-0.5 flex items-center gap-1">
                        <Type size={10} /> Fonte
                      </label>
                      <select value={data.fontFamily} onChange={(e) => updateData({ fontFamily: e.target.value })} className="w-full px-2 py-1 border border-gray-300 rounded outline-none text-xs bg-white h-7">
                         {FONTS.map(f => (<option key={f.value} value={f.value}>{f.name}</option>))}
                      </select>
                   </div>

                   <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Retranca (Nome)</label>
                      <input type="text" value={data.category} onChange={(e) => updateData({ category: e.target.value })} className="w-full px-2 py-1 border border-gray-300 rounded outline-none text-xs h-7" />
                   </div>

                   {/* Compact Colors Row */}
                   <div className="col-span-2 flex gap-4 bg-gray-50 p-2 rounded border border-gray-100">
                      <div className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Cor Tema</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={data.themeColor} onChange={(e) => updateData({ themeColor: e.target.value })} className="h-6 w-8 p-0 border rounded cursor-pointer" />
                            <span className="text-[10px] text-gray-400 font-mono">{data.themeColor}</span>
                          </div>
                      </div>
                      <div className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Cor Retranca</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={data.categoryBgColor} onChange={(e) => updateData({ categoryBgColor: e.target.value })} className="h-6 w-8 p-0 border rounded cursor-pointer" />
                            <span className="text-[10px] text-gray-400 font-mono">{data.categoryBgColor}</span>
                          </div>
                      </div>
                   </div>

                   {/* Socials - Condensed */}
                   <div className="col-span-2 space-y-2 mt-1">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={data.showInsta} onChange={(e) => updateData({ showInsta: e.target.checked })} className="h-3 w-3 accent-orange-500" />
                        <label className="text-[10px] font-bold text-gray-500 w-12">Instagram</label>
                        <input type="text" value={data.instagram} onChange={(e) => updateData({ instagram: e.target.value })} className="flex-1 px-2 py-0.5 border border-gray-300 rounded outline-none text-xs h-6" disabled={!data.showInsta}/>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={data.showUrl} onChange={(e) => updateData({ showUrl: e.target.checked })} className="h-3 w-3 accent-orange-500" />
                        <label className="text-[10px] font-bold text-gray-500 w-12">Site URL</label>
                        <input type="text" value={data.siteUrl} onChange={(e) => updateData({ siteUrl: e.target.value })} className="flex-1 px-2 py-0.5 border border-gray-300 rounded outline-none text-xs h-6" disabled={!data.showUrl}/>
                      </div>
                   </div>

                </div>
             </div>

           </div>
        )}
      </div>

      {/* Footer Action - Smaller */}
      <div className="p-3 bg-white border-t border-gray-200 flex gap-2 shrink-0">
         <button onClick={handleSaveDraft} className="flex-1 bg-slate-700 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded text-xs flex items-center justify-center gap-1">
            <Save size={14} /> Salvar
          </button>
         <button onClick={onDownload} disabled={isDownloading} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-3 rounded text-xs uppercase flex items-center justify-center gap-1 disabled:opacity-50">
            {isDownloading ? <RefreshCw className="animate-spin" size={14} /> : <Download size={14} />} Baixar
          </button>
      </div>

    </div>
  );
};