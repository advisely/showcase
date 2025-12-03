import { useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Toolbar from './components/Toolbar';
import Playfield from './components/Playfield';
import VerticalToolbar from './components/VerticalToolbar';
import OrientationModal from './components/OrientationModal';
import MaximizedView from './components/MaximizedView';
import Minimap from './components/Minimap';
import LayoutCustomizationMenu from './components/LayoutCustomizationMenu';
import BackgroundMenu from './components/BackgroundMenu';
import Toast from './components/Toast';
import useStore from './store/useStore';
import { migrateFromLocalStorage } from './utils/storage';
import './App.css';

function App() {
  const loadFromStorage = useStore(state => state.loadFromStorage);

  useEffect(() => {
    const initializeApp = async () => {
      // Try to migrate old localStorage data
      await migrateFromLocalStorage();

      // Load from IndexedDB
      await loadFromStorage();
    };

    initializeApp();
  }, [loadFromStorage]);

  return (
    <ErrorBoundary>
      <div className="app-container">
        <Toolbar />

        <div style={{ flex: 1, position: 'relative', overflow: 'visible' }}>
          <VerticalToolbar />
          <Playfield />
        </div>

        <OrientationModal />
        <MaximizedView />
        <Minimap />
        <LayoutCustomizationMenu />
        <BackgroundMenu />
        <Toast />
      </div>
    </ErrorBoundary>
  );
}

export default App;
