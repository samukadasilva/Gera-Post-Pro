import { PostData } from './types';

export const INITIAL_POST_DATA: PostData = {
  headline: 'Manchete da notícia aparece aqui em destaque principal',
  subtitle: 'O subtítulo ou lide da matéria jornalística complementar aparece aqui para dar mais contexto ao leitor sobre o fato ocorrido.',
  category: 'Geral',
  imageUrl: 'https://picsum.photos/1080/1350',
  imagePosition: 'center', // Padrão
  siteUrl: 'www.noticiascolombia.com.br',
  instagram: '@noticiascolombia',
  themeColor: '#ea580c', // Default Orange accent
  categoryBgColor: '#000000', // Default Black for category
  fontFamily: 'Montserrat', // Default font
  showUrl: true,
  showInsta: true,
  showCategory: true,
  templateId: 1,
  format: 'feed-4-5',
  logo: {
    url: null,
    x: 50,
    y: 10, 
    scale: 1,
  }
};

export const MOCK_NEWS_DATA = {
  headline: "Governo anuncia novos investimentos para o setor de tecnologia em 2024",
  subtitle: "Medida visa acelerar a transformação digital e gerar milhares de novos empregos na região.",
  imageUrl: "https://picsum.photos/seed/tech/1080/1350",
  category: "Economia"
};