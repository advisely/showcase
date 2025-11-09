import { create } from 'zustand';
import { CardData, BackgroundData, PresentationData } from '../types';

interface ViewportInfo {
  scrollLeft: number;
  scrollTop: number;
  width: number;
  height: number;
}

interface StoreState {
  cards: CardData[];
  background: BackgroundData;
  selectedCardId: string | null;
  maximizedCardId: string | null;
  nextCardId: number;
  viewport: ViewportInfo;

  // Card actions
  addCard: (card: Omit<CardData, 'id' | 'zIndex'>) => void;
  updateCard: (id: string, updates: Partial<CardData>) => void;
  deleteCard: (id: string) => void;
  bringToFront: (id: string) => void;

  // Background actions
  setBackground: (background: BackgroundData) => void;
  clearBackground: () => void;

  // Selection actions
  setSelectedCard: (id: string | null) => void;
  setMaximizedCard: (id: string | null) => void;

  // Viewport actions
  setViewport: (viewport: ViewportInfo) => void;

  // Layout actions
  arrangeCards: (type: 'circle' | 'curve' | 'grid' | 'line') => void;

  // Persistence
  savePresentation: () => void;
  loadPresentation: (data: PresentationData) => void;
  clearAll: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  cards: [],
  background: { color: '#2c3e50' },
  selectedCardId: null,
  maximizedCardId: null,
  nextCardId: 0,
  viewport: { scrollLeft: 0, scrollTop: 0, width: 1200, height: 800 },

  addCard: (card) => {
    const state = get();
    const newCard: CardData = {
      ...card,
      id: `card-${state.nextCardId}`,
      zIndex: state.cards.length,
    };
    set({
      cards: [...state.cards, newCard],
      nextCardId: state.nextCardId + 1,
    });
  },

  updateCard: (id, updates) => {
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === id ? { ...card, ...updates } : card
      ),
    }));
  },

  deleteCard: (id) => {
    set((state) => ({
      cards: state.cards.filter((card) => card.id !== id),
      selectedCardId: state.selectedCardId === id ? null : state.selectedCardId,
      maximizedCardId: state.maximizedCardId === id ? null : state.maximizedCardId,
    }));
  },

  bringToFront: (id) => {
    set((state) => {
      const maxZ = Math.max(...state.cards.map((c) => c.zIndex), 0);
      return {
        cards: state.cards.map((card) =>
          card.id === id ? { ...card, zIndex: maxZ + 1 } : card
        ),
      };
    });
  },

  setBackground: (background) => {
    set({ background });
  },

  clearBackground: () => {
    set({ background: { color: '#2c3e50' } });
  },

  setSelectedCard: (id) => {
    set({ selectedCardId: id });
  },

  setMaximizedCard: (id) => {
    set({ maximizedCardId: id });
  },

  setViewport: (viewport) => {
    set({ viewport });
  },

  arrangeCards: (type) => {
    const state = get();
    const cards = [...state.cards];
    const { viewport } = state;

    // Calculate visible viewport center
    const centerX = viewport.scrollLeft + viewport.width / 2;
    const centerY = viewport.scrollTop + viewport.height / 2;

    switch (type) {
      case 'circle': {
        const radius = Math.min(viewport.width, viewport.height) * 0.3;
        const angleStep = (2 * Math.PI) / cards.length;

        cards.forEach((card, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle) - card.size.width / 2;
          const y = centerY + radius * Math.sin(angle) - card.size.height / 2;
          card.position = { x, y };
        });
        break;
      }

      case 'curve': {
        const padding = 100;
        const startX = viewport.scrollLeft + padding;
        const endX = viewport.scrollLeft + viewport.width - padding;

        cards.forEach((card, index) => {
          const t = index / (cards.length - 1 || 1);
          const x = startX + (endX - startX) * t;
          const y = centerY + Math.sin(t * Math.PI) * (viewport.height / 4) - card.size.height / 2;
          card.position = { x, y };
        });
        break;
      }

      case 'grid': {
        const cols = Math.ceil(Math.sqrt(cards.length));
        const rows = Math.ceil(cards.length / cols);
        const spacing = 50;
        const cardWidth = 300;
        const cardHeight = 200;

        const totalWidth = cols * (cardWidth + spacing);
        const totalHeight = rows * (cardHeight + spacing);
        const startX = centerX - totalWidth / 2;
        const startY = centerY - totalHeight / 2;

        cards.forEach((card, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          const x = startX + col * (cardWidth + spacing);
          const y = startY + row * (cardHeight + spacing);
          card.position = { x, y };
        });
        break;
      }

      case 'line': {
        const padding = 100;
        const startX = viewport.scrollLeft + padding;
        const endX = viewport.scrollLeft + viewport.width - padding;
        const spacing = (endX - startX) / (cards.length - 1 || 1);

        cards.forEach((card, index) => {
          const x = startX + index * spacing;
          const y = centerY - card.size.height / 2;
          card.position = { x, y };
        });
        break;
      }
    }

    set({ cards });
  },

  savePresentation: () => {
    const state = get();
    const data: PresentationData = {
      background: state.background,
      cards: state.cards,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `showcase-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  },

  loadPresentation: (data) => {
    set({
      cards: data.cards,
      background: data.background,
      nextCardId: data.cards.length,
    });
  },

  clearAll: () => {
    set({
      cards: [],
      background: { color: '#2c3e50' },
      selectedCardId: null,
      maximizedCardId: null,
      nextCardId: 0,
    });
  },
}));
