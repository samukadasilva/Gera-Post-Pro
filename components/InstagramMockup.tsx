import React from 'react';
import { PostData } from '../types';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal, 
  X,
  MoreVertical
} from 'lucide-react';

interface InstagramMockupProps {
  data: PostData;
  children: React.ReactNode;
}

export const InstagramMockup: React.FC<InstagramMockupProps> = ({ data, children }) => {
  const isStory = data.format === 'story-9-16';
  
  // Extrai o nome de usuário (remove o @ se tiver)
  const username = data.instagram.replace('@', '') || 'seu_usuario';
  
  // Avatar fictício ou a logo se tiver
  const Avatar = () => (
    <div className="rounded-full overflow-hidden border border-gray-200 shrink-0 bg-gray-100 flex items-center justify-center relative">
       {data.logo.url ? (
         <img src={data.logo.url} className="w-full h-full object-cover" alt="user" />
       ) : (
         <div className="w-full h-full bg-gradient-to-tr from-yellow-400 to-orange-600" />
       )}
    </div>
  );

  if (isStory) {
    return (
      <div 
        className="relative bg-black overflow-hidden shadow-2xl"
        style={{ width: 1080, height: 1920, borderRadius: '40px' }} // Bordas arredondadas simulando celular
      >
        {/* Camada da Arte */}
        <div className="absolute inset-0 z-0">
          {children}
        </div>

        {/* UI do Story (Sobreposta) */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none p-8">
            
            {/* Topo: Barras de Progresso e User */}
            <div className="pt-4">
               {/* Barras de Progresso */}
               <div className="flex gap-2 mb-6">
                  <div className="h-1.5 flex-1 bg-white/40 rounded-full overflow-hidden">
                    <div className="h-full w-[70%] bg-white rounded-full"></div>
                  </div>
                  <div className="h-1.5 flex-1 bg-white/40 rounded-full"></div>
               </div>

               {/* Header User */}
               <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16"><Avatar /></div>
                     <div className="flex flex-col">
                        <span className="font-semibold text-2xl flex items-center gap-2">
                            {username} 
                            <span className="opacity-60 font-normal text-xl">14 h</span>
                        </span>
                     </div>
                  </div>
                  <div className="flex items-center gap-6">
                     <MoreHorizontal size={32} />
                     <X size={36} />
                  </div>
               </div>
            </div>

            {/* Rodapé: Input e Ações */}
            <div className="pb-8 flex items-center gap-6">
                <div className="flex-1 h-20 rounded-full border-2 border-white/30 flex items-center px-6">
                   <span className="text-white text-2xl font-medium opacity-80">Enviar mensagem...</span>
                </div>
                <Heart size={48} className="text-white" />
                <Send size={48} className="text-white" />
            </div>
        </div>
      </div>
    );
  }

  // Layout FEED (4:5)
  return (
    <div 
      className="bg-white text-black shadow-2xl overflow-hidden flex flex-col border border-gray-200"
      style={{ width: 1080, maxWidth: 1080 }} // Largura fixa do canvas
    >
      {/* Header do Feed */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 h-28 shrink-0">
         <div className="flex items-center gap-4">
            <div className="w-16 h-16 p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
               <div className="w-full h-full bg-white rounded-full p-[2px] overflow-hidden">
                  <Avatar />
               </div>
            </div>
            <div className="flex flex-col justify-center">
               <span className="font-bold text-2xl leading-none mb-1">{username}</span>
               <span className="text-lg text-gray-500 leading-none">Original Audio</span>
            </div>
         </div>
         <MoreVertical size={32} className="text-gray-700" />
      </div>

      {/* A Arte (Canvas) */}
      <div className="relative bg-gray-100">
        {children}
      </div>

      {/* Rodapé do Feed */}
      <div className="p-6 bg-white">
         {/* Ícones de Ação */}
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
               <Heart size={42} className="text-black hover:text-red-500 transition-colors" />
               <MessageCircle size={42} className="text-black -rotate-90" />
               <Send size={42} className="text-black" />
            </div>
            <Bookmark size={42} className="text-black" />
         </div>

         {/* Curtidas */}
         <div className="mb-3">
            <span className="font-bold text-2xl text-black">1.243 curtidas</span>
         </div>

         {/* Legenda Simulada */}
         <div className="text-2xl leading-snug">
            <span className="font-bold mr-2">{username}</span>
            <span>{data.headline.length > 80 ? data.headline.substring(0, 80) + '...' : data.headline}</span>
            <span className="text-gray-500 ml-2 cursor-pointer">mais</span>
         </div>

         {/* Comentários e Data */}
         <div className="mt-3 text-gray-500 text-xl">
            <p className="mb-1">Ver todos os 45 comentários</p>
            <p className="uppercase text-base tracking-wide">HÁ 2 HORAS</p>
         </div>
      </div>
    </div>
  );
};