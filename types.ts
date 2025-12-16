export type FormatType = 'feed-4-5' | 'story-9-16';
export type ImagePosition = 'left' | 'center' | 'right';

export interface LogoSettings {
  url: string | null;
  x: number;
  y: number;
  scale: number;
}

export interface PostData {
  headline: string;
  subtitle: string;
  category: string; // "Retranca" or "Editoria"
  imageUrl: string;
  imagePosition: ImagePosition; // Nova propriedade para alinhar a imagem
  siteUrl: string;
  instagram: string;
  themeColor: string; // Accents
  categoryBgColor: string; // Specific background for category
  fontFamily: string; // New font selection
  showUrl: boolean;
  showInsta: boolean;
  showCategory: boolean;
  templateId: number;
  format: FormatType;
  logo: LogoSettings;
}

export interface TemplateProps {
  data: PostData;
  scale?: number;
}

export const ASPECT_RATIOS = {
  'feed-4-5': { width: 1080, height: 1350, label: 'Feed (4:5) - Retrato' },
  'story-9-16': { width: 1080, height: 1920, label: 'Stories (9:16) - Tela Cheia' },
};