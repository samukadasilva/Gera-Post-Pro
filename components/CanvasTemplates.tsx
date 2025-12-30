import React from 'react';
import { PostData, ASPECT_RATIOS } from '../types';
import { Instagram, Globe } from 'lucide-react';

interface TemplateRendererProps {
  data: PostData;
  id: string;
}

// --- Helper Functions ---

const isStory = (format: string) => format === 'story-9-16';

const getBgPosition = (pos: string) => {
    switch (pos) {
        case 'left': return 'left center';
        case 'right': return 'right center';
        default: return 'center center';
    }
};

// --- Components ---

const BrandLogo = ({ data }: { data: PostData }) => {
  if (!data.logo.url) return null;
  return (
    <img
      src={data.logo.url}
      alt="Logo"
      crossOrigin="anonymous"
      className="absolute z-30 object-contain pointer-events-none drop-shadow-md select-none"
      style={{
        left: `${data.logo.x}%`,
        top: `${data.logo.y}%`,
        transform: `translate(-50%, -50%) scale(${data.logo.scale})`,
        width: '200px', 
        maxWidth: 'none', 
      }}
    />
  );
};

// CORREÇÃO CRÍTICA: Usando inline-block e impedindo esticamento lateral
const CategoryTag = ({ data, className = "", style = {} }: { data: PostData, className?: string, style?: React.CSSProperties }) => {
  if (!data.showCategory || !data.category) return null;
  return (
    <div className="block w-full text-left clear-both">
      <div 
        className={`category-tag-render relative z-50 px-6 text-white uppercase tracking-widest shadow-md whitespace-nowrap ${className}`}
        style={{ 
          backgroundColor: data.categoryBgColor, 
          height: '56px',
          lineHeight: '56px', // Centraliza verticalmente o texto sem precisar de flex
          display: 'inline-block', // CRUCIAL: impede de esticar 100%
          width: 'auto', // CRUCIAL: ocupa apenas o espaço do texto
          textAlign: 'center',
          ...style 
        }}
      >
        <span className="text-[1.6rem] font-bold" style={{ fontWeight: 800 }}>{data.category}</span>
      </div>
    </div>
  );
};

// CORREÇÃO DO RODAPÉ
const FooterBar = ({ data, theme = 'light', center = false }: { data: PostData, theme?: 'light' | 'dark', center?: boolean }) => {
  const textColorClass = theme === 'dark' ? 'text-white' : 'text-slate-800';
  const iconColor = theme === 'dark' ? '#FFFFFF' : '#1e293b';
  const borderColor = theme === 'dark' ? 'border-white/20' : 'border-slate-300';
  const justifyClass = center ? 'justify-center' : 'justify-between';

  const itemTextStyle: React.CSSProperties = {
    fontWeight: 800,
    fontSize: '22px',
    display: 'inline-flex',
    alignItems: 'center',
    height: '100%',
    lineHeight: '1'
  };

  return (
    <div className={`flex items-center w-full mt-auto border-t-2 h-24 ${borderColor} ${justifyClass}`}>
      {data.showInsta && (
        <div 
          style={itemTextStyle}
          className={`${textColorClass} ${center ? 'mx-8' : ''}`}
          data-footer-item="true"
        >
          <div className="flex items-center justify-center shrink-0" style={{ marginRight: '12px' }}>
             <Instagram size={28} color={iconColor} strokeWidth={3} />
          </div>
          <span className="whitespace-nowrap pt-[2px]">{data.instagram}</span>
        </div>
      )}
      
      {data.showUrl && (
        <div 
          style={itemTextStyle}
          className={`${textColorClass} ${center ? 'mx-8' : 'ml-auto'}`}
          data-footer-item="true"
        >
          <div className="flex items-center justify-center shrink-0" style={{ marginRight: '12px' }}>
             <Globe size={28} color={iconColor} strokeWidth={3} />
          </div>
          <span className="whitespace-nowrap pt-[2px]">{data.siteUrl}</span>
        </div>
      )}
    </div>
  );
};

// --- Templates ---

const Template1 = ({ data }: { data: PostData }) => {
  return (
    <div className="w-full h-full flex flex-col bg-white relative">
      <div className="h-[60%] w-full relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-cover bg-no-repeat" style={{ backgroundImage: `url(${data.imageUrl})`, backgroundPosition: getBgPosition(data.imagePosition) }} />
         <BrandLogo data={data} />
         <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black/50 to-transparent" />
      </div>
      <div className={`flex-1 px-10 flex flex-col relative ${isStory(data.format) ? 'pb-32 pt-6' : 'py-8'}`}>
        <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: data.themeColor }} />
        <div className="mt-6 mb-2">
           <CategoryTag data={data} className="mb-6 rounded-sm" />
           <h1 className="text-[3.2rem] leading-[1.1] font-black text-slate-900 mb-4 tracking-tight break-words">{data.headline}</h1>
           {data.subtitle && <p className="text-[1.7rem] text-slate-500 leading-[1.3] line-clamp-4">{data.subtitle}</p>}
        </div>
        <FooterBar data={data} theme="light" />
      </div>
    </div>
  );
};

const Template2 = ({ data }: { data: PostData }) => {
  return (
    <div className="w-full h-full relative bg-slate-900">
       <div className="absolute inset-0 w-full h-full bg-cover bg-no-repeat" style={{ backgroundImage: `url(${data.imageUrl})`, backgroundPosition: getBgPosition(data.imagePosition) }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-95" />
      <BrandLogo data={data} />
      <div className={`absolute bottom-0 left-0 right-0 p-12 flex flex-col h-full justify-end ${isStory(data.format) ? 'pb-40' : 'pb-12'}`}>
         <div className="mb-auto pt-10 text-left">
            <CategoryTag data={data} className="rounded-full px-8 shadow-xl" />
         </div>
         <div className="relative">
            <div className="w-24 h-3 mb-8" style={{ backgroundColor: data.themeColor }} />
            <h1 className="text-[3.6rem] leading-[1.05] font-black text-white mb-6 drop-shadow-2xl break-words">{data.headline}</h1>
            {data.subtitle && <p className="text-[1.9rem] text-slate-200 font-medium leading-[1.3] mb-10 border-l-[8px] pl-6 border-white/30">{data.subtitle}</p>}
            <FooterBar data={data} theme="dark" />
         </div>
      </div>
    </div>
  );
};

const Template3 = ({ data }: { data: PostData }) => {
  return (
    <div className="w-full h-full relative overflow-hidden">
       <div className="absolute inset-0 w-full h-full bg-cover bg-no-repeat z-0" style={{ backgroundImage: `url(${data.imageUrl})`, backgroundPosition: getBgPosition(data.imagePosition) }} />
      <div className="absolute inset-0 bg-slate-900/40 z-0" />
      <BrandLogo data={data} />
      <div className={`absolute left-8 right-8 top-auto z-20 ${isStory(data.format) ? 'bottom-40' : 'bottom-16'}`}>
        <div className="absolute top-4 left-0 w-full h-full bg-black/40 blur-xl rounded-t-3xl -z-10" />
        <div className="bg-white rounded-t-3xl p-10 pb-8 border-b-[16px] relative" style={{ borderColor: data.themeColor }}>
           <div className="mb-6 text-left">
              <CategoryTag data={data} className="rounded" />
           </div>
           <h1 className="text-[3.1rem] font-bold text-slate-900 leading-tight mb-5 break-words">{data.headline}</h1>
           {data.subtitle && <p className="text-[1.6rem] text-slate-600 leading-[1.3] mb-6">{data.subtitle}</p>}
           <FooterBar data={data} theme="light" />
        </div>
      </div>
    </div>
  );
};

const Template4 = ({ data }: { data: PostData }) => {
  return (
    <div className="w-full h-full relative bg-black">
      <div className="absolute inset-0 w-full h-full bg-cover bg-no-repeat" style={{ backgroundImage: `url(${data.imageUrl})`, backgroundPosition: getBgPosition(data.imagePosition) }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
      <BrandLogo data={data} />
      <div className={`absolute bottom-0 w-full flex flex-col justify-end ${isStory(data.format) ? 'pb-44' : 'pb-16'}`}>
         <div className="px-12 mb-2">
            <div className="mb-8 text-left">
               <CategoryTag data={data} className="rounded-lg" style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.4)' }} />
            </div>
            <h1 className="text-[3.8rem] font-black text-white leading-none mb-8 break-words" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>{data.headline}</h1>
            {data.subtitle && (
               <div className="relative pl-6 mb-8 border-l-4" style={{ borderColor: data.themeColor }}>
                  <p className="text-[1.8rem] text-slate-100 font-medium leading-[1.3]" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>{data.subtitle}</p>
               </div>
            )}
         </div>
         <div className="px-12">
            <FooterBar data={data} theme="dark" />
         </div>
      </div>
    </div>
  );
};

const Template5 = ({ data }: { data: PostData }) => {
  const isSt = isStory(data.format);
  return (
    <div className="w-full h-full flex flex-col bg-white relative">
      <div className={`w-full relative overflow-hidden ${isSt ? 'h-[55%]' : 'h-[60%]'}`}>
        <div className="absolute inset-0 w-full h-full bg-cover bg-no-repeat" style={{ backgroundImage: `url(${data.imageUrl})`, backgroundPosition: getBgPosition(data.imagePosition) }} />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/40 to-transparent" />
        <BrandLogo data={data} />
      </div>
      <div className="flex-1 bg-white relative flex flex-col px-10">
         <div className="absolute -top-7 left-10 z-10 text-left">
            <CategoryTag data={data} className="px-8 shadow-lg" />
         </div>
         <div className={`mt-12 flex flex-col h-full ${isSt ? 'pb-40' : 'pb-10'}`}>
            <h1 className="text-[3.4rem] font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">{data.headline}</h1>
            {data.subtitle && <div className="flex-1 relative"><p className="text-[1.7rem] text-slate-600 leading-[1.3] font-light">{data.subtitle}</p></div>}
            <div className="mt-auto pt-6">
               <FooterBar data={data} theme="light" />
            </div>
         </div>
      </div>
    </div>
  );
};

const Template6 = ({ data }: { data: PostData }) => {
  return (
    <div className="w-full h-full relative bg-slate-900">
      <div className="absolute inset-0 w-full h-full bg-cover bg-no-repeat" style={{ backgroundImage: `url(${data.imageUrl})`, backgroundPosition: getBgPosition(data.imagePosition) }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
      <BrandLogo data={data} />
      <div className={`absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center px-12 text-center ${isStory(data.format) ? 'pb-24' : 'pb-12'}`}>
         <div className="mb-6 flex justify-center w-full">
            <CategoryTag data={data} className="rounded-full px-10 border-2 border-white/20" />
         </div>
         <h1 className="text-[3.8rem] font-black text-white leading-[1.05] mb-8 break-words" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.9)' }}>{data.headline}</h1>
         {data.subtitle && <div className="max-w-[95%] mb-10"><p className="text-[1.9rem] text-slate-200 leading-[1.3] font-medium" style={{ textShadow: '0 2px 15px rgba(0,0,0,0.8)' }}>{data.subtitle}</p></div>}
         <div className="w-24 h-1.5 rounded-full mb-8" style={{ backgroundColor: data.themeColor }}></div>
         <div className="w-full">
            <FooterBar data={data} theme="dark" center={true} />
         </div>
      </div>
    </div>
  );
};

const Template7 = ({ data }: { data: PostData }) => {
  const isSt = isStory(data.format);
  return (
    <div className="w-full h-full relative bg-slate-900 font-sans">
       <div className="absolute inset-0 w-full h-full bg-cover bg-no-repeat" style={{ backgroundImage: `url(${data.imageUrl})`, backgroundPosition: getBgPosition(data.imagePosition) }} />
       <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
       <BrandLogo data={data} />
       <div className={`absolute left-0 w-full flex flex-col px-10 ${isSt ? 'bottom-80' : 'bottom-40'}`}>
          <div className="mb-4 text-left">
             <CategoryTag data={data} className="rounded-sm shadow-lg px-8" />
          </div>
          <h1 className="text-[3.5rem] font-black text-white leading-[1] mb-6 drop-shadow-2xl">{data.headline}</h1>
          {data.subtitle && <div className="pl-6 border-l-4 border-white/40"><p className="text-[1.7rem] text-gray-100 leading-[1.3] font-medium drop-shadow-lg">{data.subtitle}</p></div>}
       </div>
       <div className="absolute bottom-0 w-full z-20">
          <div className="px-10 pb-6 pt-4 bg-gradient-to-t from-black via-black/80 to-transparent">
             <FooterBar data={data} theme="dark" />
          </div>
          <div className="w-full h-6 shadow-2xl" style={{ backgroundColor: data.themeColor }} />
       </div>
    </div>
  );
};

const Template8 = ({ data }: { data: PostData }) => {
  return (
    <div className="w-full h-full relative bg-slate-900 overflow-hidden">
      <div className="absolute inset-0 w-full h-full bg-cover bg-no-repeat z-0" style={{ backgroundImage: `url(${data.imageUrl})`, backgroundPosition: getBgPosition(data.imagePosition) }} />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/70 to-transparent" />
      <BrandLogo data={data} />
      <div className={`absolute bottom-0 left-0 w-full z-20 px-12 flex flex-col ${isStory(data.format) ? 'pb-40' : 'pb-12'}`}>
         <div className="mb-6 flex items-center">
             <div className="w-4 h-4 rounded-full mr-4" style={{backgroundColor: data.themeColor, boxShadow: '0 0 12px rgba(255,255,255,0.8)'}} />
             <span className="text-white text-[1.6rem] font-bold uppercase tracking-[0.2em] whitespace-nowrap">{data.category}</span>
         </div>
         <h1 className="text-[3.6rem] font-black text-white leading-none mb-6 drop-shadow-2xl">{data.headline}</h1>
         {data.subtitle && <div className="border-l-4 pl-6 mb-8" style={{borderColor: data.themeColor}}><p className="text-[1.8rem] text-slate-200 font-medium leading-[1.3] drop-shadow-lg">{data.subtitle}</p></div>}
         <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-lg">
            <FooterBar data={data} theme="dark" />
         </div>
      </div>
    </div>
  );
};

const Template9 = ({ data }: { data: PostData }) => {
  return (
    <div className="w-full h-full relative bg-slate-900">
      <div className="absolute inset-0 w-full h-full bg-cover bg-no-repeat grayscale-[50%]" style={{ backgroundImage: `url(${data.imageUrl})`, backgroundPosition: getBgPosition(data.imagePosition) }} />
      <div className="absolute inset-0 opacity-90 mix-blend-multiply" style={{ background: `linear-gradient(to top, ${data.themeColor}, transparent)` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <BrandLogo data={data} />
      <div className={`absolute bottom-0 left-0 w-full px-12 flex flex-col ${isStory(data.format) ? 'pb-40' : 'pb-12'}`}>
         <div className="mb-8 text-left">
            <CategoryTag data={data} />
         </div>
         <h1 className="text-[4rem] font-black text-white leading-[0.95] mb-8 tracking-tighter">{data.headline}</h1>
         {data.subtitle && <div className="pl-6 border-l-2 border-white/40 mb-10"><p className="text-[1.8rem] text-white/90 font-light leading-[1.3]">{data.subtitle}</p></div>}
         <FooterBar data={data} theme="dark" />
      </div>
    </div>
  );
};

export const CanvasRenderer: React.FC<TemplateRendererProps> = ({ data, id }) => {
  const { width, height } = ASPECT_RATIOS[data.format];
  const renderTemplate = () => {
    switch (data.templateId) {
      case 2: return <Template2 data={data} />;
      case 3: return <Template3 data={data} />;
      case 4: return <Template4 data={data} />;
      case 5: return <Template5 data={data} />;
      case 6: return <Template6 data={data} />;
      case 7: return <Template7 data={data} />;
      case 8: return <Template8 data={data} />;
      case 9: return <Template9 data={data} />;
      default: return <Template1 data={data} />;
    }
  };

  return (
    <div
      id={id}
      className="relative bg-slate-50 overflow-hidden mx-auto antialiased"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        fontFamily: data.fontFamily,
        textRendering: 'geometricPrecision',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      {renderTemplate()}
    </div>
  );
};