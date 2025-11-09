export interface CardData {
  id: string;
  orientation: 'landscape' | 'portrait';
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  mediaType: 'image' | 'video';
  mediaSrc: string;
  zIndex: number;
}

export interface BackgroundData {
  color?: string;
  image?: string;
}

export interface PresentationData {
  background: BackgroundData;
  cards: CardData[];
}

export type LayoutType = 'circle' | 'curve' | 'grid' | 'line';
