import { create } from 'zustand';
import { CardData, BackgroundData, PresentationData } from '../types';

interface StoreState {
  cards: CardData[];
  background: BackgroundData;
  selectedCardId: string | null;
  maximizedCardId: string | null;
  nextCardId: number;

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

  // Layout actions
  arrangeCards: (type: 'circle' | 'curve' | 'grid' | 'line', containerSize: { width: number; height: number }) => void;

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

  arrangeCards: (type, containerSize) => {
    const state = get();
    const cards = [...state.cards];

    switch (type) {
      case 'circle': {
        const centerX = containerSize.width / 2;
        const centerY = containerSize.height / 2;
        const radius = Math.min(centerX, centerY) * 0.6;
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
        cards.forEach((card, index) => {
          const t = index / (cards.length - 1 || 1);
          const x = padding + (containerSize.width - 2 * padding) * t;
          const y = containerSize.height / 2 + Math.sin(t * Math.PI) * (containerSize.height / 3) - card.size.height / 2;
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
        const startX = (containerSize.width - totalWidth) / 2;
        const startY = (containerSize.height - totalHeight) / 2;

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
        const spacing = (containerSize.width - 2 * padding) / (cards.length - 1 || 1);

        cards.forEach((card, index) => {
          const x = padding + index * spacing;
          const y = containerSize.height / 2 - card.size.height / 2;
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
