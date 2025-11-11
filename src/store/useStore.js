import { create } from 'zustand';
import debounce from 'lodash.debounce';
import { savePresentation, loadPresentation } from '../utils/storage';

const useStore = create((set, get) => ({
  // State
  cards: [],
  currentCardId: 0,
  videoFiles: new Map(),
  background: {
    color: '#2c3e50',
    image: null
  },
  zoomLevel: 1,
  panX: 0,
  panY: 0,
  interactionMode: 'cursor', // 'cursor' or 'hand'
  activeLayout: null, // 'circle', 'line', 'curve', 'grid', or null
  selectedOrientation: null,
  pendingFiles: [],
  isModalOpen: false,
  maximizedCard: null,
  isSaving: false,
  lastSaved: null,
  storageError: null,

  // Actions
  addCard: (cardData) => {
    const state = get();
    const newCard = {
      id: `card-${state.currentCardId}`,
      ...cardData,
      timestamp: Date.now()
    };

    set({
      cards: [...state.cards, newCard],
      currentCardId: state.currentCardId + 1
    });

    return newCard;
  },

  updateCard: (cardId, updates) => set((state) => ({
    cards: state.cards.map(card =>
      card.id === cardId ? { ...card, ...updates } : card
    )
  })),

  deleteCard: (cardId) => set((state) => {
    // Clean up video file reference
    const newVideoFiles = new Map(state.videoFiles);
    newVideoFiles.delete(cardId);

    return {
      cards: state.cards.filter(card => card.id !== cardId),
      videoFiles: newVideoFiles
    };
  }),

  setBackground: (background) => set({ background }),

  setZoom: (zoomLevel) => set({
    zoomLevel: Math.max(0.5, Math.min(3, zoomLevel))
  }),

  setPan: (panX, panY) => set({ panX, panY }),

  resetView: () => set({ zoomLevel: 1, panX: 0, panY: 0 }),

  setInteractionMode: (mode) => set({ interactionMode: mode }),

  toggleInteractionMode: () => set((state) => ({
    interactionMode: state.interactionMode === 'cursor' ? 'hand' : 'cursor'
  })),

  setActiveLayout: (layout) => set({ activeLayout: layout }),

  setSelectedOrientation: (orientation) => set({ selectedOrientation: orientation }),

  setPendingFiles: (files) => set({ pendingFiles: files }),

  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),

  setMaximizedCard: (cardId) => set({ maximizedCard: cardId }),

  setVideoFile: (cardId, file) => set((state) => {
    const newVideoFiles = new Map(state.videoFiles);
    newVideoFiles.set(cardId, file);
    return { videoFiles: newVideoFiles };
  }),

  // Layout algorithms
  arrangeInCircle: () => set((state) => {
    if (state.cards.length === 0) return state;

    const centerX = 800; // Approximate playfield center
    const centerY = 400;
    const radius = 300;
    const angleStep = (2 * Math.PI) / state.cards.length;

    const updatedCards = state.cards.map((card, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle) - (card.size?.width || 300) / 2;
      const y = centerY + radius * Math.sin(angle) - (card.size?.height || 200) / 2;

      return {
        ...card,
        position: { x, y }
      };
    });

    return { cards: updatedCards, activeLayout: 'circle' };
  }),

  arrangeInCurve: () => set((state) => {
    if (state.cards.length === 0) return state;

    const width = 1600;
    const height = 800;
    const padding = 100;

    const updatedCards = state.cards.map((card, index) => {
      const t = index / (state.cards.length - 1 || 1);
      const x = padding + (width - 2 * padding) * t;
      const y = height / 2 + Math.sin(t * Math.PI) * (height / 3) - (card.size?.height || 200) / 2;

      return {
        ...card,
        position: { x, y }
      };
    });

    return { cards: updatedCards, activeLayout: 'curve' };
  }),

  arrangeInGrid: () => set((state) => {
    if (state.cards.length === 0) return state;

    const cols = Math.ceil(Math.sqrt(state.cards.length));
    const rows = Math.ceil(state.cards.length / cols);
    const spacing = 50;
    const cardWidth = 300;
    const cardHeight = 200;

    const totalWidth = cols * (cardWidth + spacing);
    const totalHeight = rows * (cardHeight + spacing);
    const startX = (1600 - totalWidth) / 2;
    const startY = (800 - totalHeight) / 2;

    const updatedCards = state.cards.map((card, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardWidth + spacing);
      const y = startY + row * (cardHeight + spacing);

      return {
        ...card,
        position: { x, y }
      };
    });

    return { cards: updatedCards, activeLayout: 'grid' };
  }),

  arrangeInLine: () => set((state) => {
    if (state.cards.length === 0) return state;

    const width = 1600;
    const height = 800;
    const padding = 100;
    const spacing = (width - 2 * padding) / (state.cards.length - 1 || 1);

    const updatedCards = state.cards.map((card, index) => {
      const x = padding + index * spacing;
      const y = height / 2 - (card.size?.height || 200) / 2;

      return {
        ...card,
        position: { x, y }
      };
    });

    return { cards: updatedCards, activeLayout: 'line' };
  }),

  // Save/Load functionality
  saveToStorage: debounce(async () => {
    const state = get();

    set({ isSaving: true, storageError: null });

    try {
      const data = {
        background: state.background,
        cards: state.cards.map(card => ({
          ...card,
          // Don't save video files to storage, only metadata
          mediaSrc: card.mediaType === 'video' ? null : card.mediaSrc
        })),
        zoomLevel: state.zoomLevel,
        panX: state.panX,
        panY: state.panY,
        timestamp: Date.now()
      };

      await savePresentation('current', data);

      set({
        isSaving: false,
        lastSaved: Date.now(),
        storageError: null
      });
    } catch (error) {
      console.error('Save failed:', error);
      set({
        isSaving: false,
        storageError: error.message
      });
    }
  }, 1000), // Debounce for 1 second

  loadFromStorage: async () => {
    try {
      const data = await loadPresentation('current');

      if (data) {
        set({
          cards: data.cards || [],
          background: data.background || { color: '#2c3e50', image: null },
          zoomLevel: data.zoomLevel || 1,
          panX: data.panX || 0,
          panY: data.panY || 0,
          currentCardId: (data.cards?.length || 0)
        });

        return true;
      }
    } catch (error) {
      console.error('Load failed:', error);
      set({ storageError: error.message });
    }

    return false;
  },

  clearAll: () => set({
    cards: [],
    currentCardId: 0,
    videoFiles: new Map(),
    background: { color: '#2c3e50', image: null },
    zoomLevel: 1,
    panX: 0,
    panY: 0,
    maximizedCard: null,
    storageError: null
  })
}));

export default useStore;
