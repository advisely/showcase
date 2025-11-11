import { useEffect } from 'react';
import Toolbar from './components/Toolbar';
import Playfield from './components/Playfield';
import VerticalToolbar from './components/VerticalToolbar';
import OrientationModal from './components/OrientationModal';
import MaximizedView from './components/MaximizedView';
import Minimap from './components/Minimap';
import LayoutCustomizationMenu from './components/LayoutCustomizationMenu';
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
    <div className="app-container">
      <Toolbar />

      <div className="playfield-container">
        <VerticalToolbar />
        <Playfield />
      </div>

      <OrientationModal />
      <MaximizedView />
      <Minimap />
      <LayoutCustomizationMenu />
    </div>
  );
}

export default App;
