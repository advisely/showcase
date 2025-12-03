import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { exportToJSON, exportToZip, importFromFile } from '../utils/export';
import SaveDialog from './SaveDialog';
import SaveMenu from './SaveMenu';
import SettingsMenu from './SettingsMenu';
import CardSettings from './CardSettings';
import ExpressionMenu from './ExpressionMenu';

const Toolbar = () => {
  const fileInputRef = useRef(null);
  const loadInputRef = useRef(null);
  const bgColorPickerRef = useRef(null);
  const bgImageInputRef = useRef(null);
  const saveButtonRef = useRef(null);
  const settingsButtonRef = useRef(null);
  const elementsButtonRef = useRef(null);
  const expressionButtonRef = useRef(null);

  const [isSaveMenuOpen, setIsSaveMenuOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveDialogMode, setSaveDialogMode] = useState('json'); // 'json' or 'zip'
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isCardSettingsOpen, setIsCardSettingsOpen] = useState(false);
  const [isElementsMenuOpen, setIsElementsMenuOpen] = useState(false);
  const [isExpressionMenuOpen, setIsExpressionMenuOpen] = useState(false);

  const setModalOpen = useStore(state => state.setModalOpen);
  const editingTextField = useStore(state => state.editingTextField);
  const setEditingTextField = useStore(state => state.setEditingTextField);
  const setPendingFiles = useStore(state => state.setPendingFiles);
  const setBackground = useStore(state => state.setBackground);
  const background = useStore(state => state.background);
  const arrangeInCircle = useStore(state => state.arrangeInCircle);
  const arrangeInCurve = useStore(state => state.arrangeInCurve);
  const arrangeInGrid = useStore(state => state.arrangeInGrid);
  const arrangeInLine = useStore(state => state.arrangeInLine);
  const arrangeInSnake = useStore(state => state.arrangeInSnake);
  const saveToStorage = useStore(state => state.saveToStorage);
  const setGroupsPanelOpen = useStore(state => state.setGroupsPanelOpen);
  const setActiveLayout = useStore(state => state.setActiveLayout);
  const setNotification = useStore(state => state.setNotification);
  const cards = useStore(state => state.cards);
  const videoFiles = useStore(state => state.videoFiles);
  const isSaving = useStore(state => state.isSaving);
  const lastSaved = useStore(state => state.lastSaved);
  const lastSavedFileName = useStore(state => state.lastSavedFileName);
  const storageError = useStore(state => state.storageError);
  const projectName = useStore(state => state.projectName);
  const setProjectName = useStore(state => state.setProjectName);
  const setBackgroundMenuOpen = useStore(state => state.setBackgroundMenuOpen);

  // Handle file selection for media upload
  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setPendingFiles(files);
      setModalOpen(true);
    }
    e.target.value = ''; // Reset input
  };

  // Handle background color change
  const handleBgColorChange = (e) => {
    setBackground({ ...background, color: e.target.value, mode: 'color' });
    saveToStorage();
  };

  // Handle background image upload
  const handleBgImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setBackground({
        ...background,
        image: event.target.result,
        mode: 'image',
        opacity: background.opacity ?? 0.3 // Ensure opacity is set
      });
      saveToStorage();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Clear background
  const handleClearBg = () => {
    setBackground({ color: '#2c3e50', image: null, mode: 'color' });
    saveToStorage();
  };

  // Layout handlers
  const handleLayout = (layoutFn) => {
    layoutFn();
    saveToStorage();
  };

  // Groups mode handler - clears layout and enables free positioning
  const handleGroupsMode = () => {
    setActiveLayout(null); // Clear any active layout
    setGroupsPanelOpen(true); // Open groups panel
    setNotification({ message: 'Groups mode: Create groups and drag cards into them', type: 'info' });
  };

  // Save handlers
  const handleSaveButtonClick = () => {
    setIsSaveMenuOpen(!isSaveMenuOpen);
  };

  const handleQuickSave = () => {
    // Save with default timestamp-based name
    const fileName = `showcase_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
    saveToStorage(fileName);
    exportToJSON(cards, background, null);
  };

  const handleSaveAs = () => {
    setSaveDialogMode('json');
    setIsSaveDialogOpen(true);
  };

  const handleExport = () => {
    setSaveDialogMode('zip');
    setIsSaveDialogOpen(true);
  };

  const handleSaveConfirm = (name) => {
    setProjectName(name);
    saveToStorage(name);

    if (saveDialogMode === 'json') {
      exportToJSON(cards, background, name);
    } else {
      exportToZip(cards, background, videoFiles, name);
    }
  };

  // Settings handlers
  const handleSettingsButtonClick = () => {
    setIsSettingsMenuOpen(!isSettingsMenuOpen);
  };

  const handleBackgroundSettings = () => {
    setBackgroundMenuOpen(true);
  };

  const handleCardSettings = () => {
    setIsCardSettingsOpen(true);
  };

  // Listen for custom event to open expression menu
  useEffect(() => {
    const handleOpenExpressionMenu = () => {
      setIsExpressionMenuOpen(true);
    };

    window.addEventListener('openExpressionMenu', handleOpenExpressionMenu);

    return () => {
      window.removeEventListener('openExpressionMenu', handleOpenExpressionMenu);
    };
  }, []);

  return (
    <motion.header
      className="toolbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="toolbar-left">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <h1 style={{ margin: 0, lineHeight: '1' }}>Showcase</h1>
          <span style={{ fontSize: '11px', color: '#888', fontWeight: '400' }}>by Yassine Boumiza</span>
        </div>
        {storageError && (
          <span className="storage-error" title={storageError}>
            ⚠️ Storage Issue
          </span>
        )}
        {isSaving && (
          <span className="saving-indicator">💾 Saving...</span>
        )}
        {lastSaved && !isSaving && (
          <span className="last-saved" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span>✓ Saved {new Date(lastSaved).toLocaleTimeString()}</span>
            {lastSavedFileName && (
              <span style={{ fontSize: '10px', color: '#888' }}>
                {lastSavedFileName}
              </span>
            )}
          </span>
        )}
      </div>

      <div className="toolbar-center">
        <motion.button
          className="btn btn-primary"
          onClick={() => fileInputRef.current?.click()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>📎</span> Add Media
        </motion.button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileSelection}
        />

        <div style={{ position: 'relative' }}>
          <motion.button
            ref={elementsButtonRef}
            className="btn btn-secondary"
            onClick={() => setIsElementsMenuOpen(!isElementsMenuOpen)}
            title="Arrange Elements"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>✨</span> Elements
          </motion.button>

          {isElementsMenuOpen && (
            <motion.div
              className="elements-submenu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="btn-group">
                <motion.button
                  className="btn btn-secondary"
                  onClick={() => {
                    handleLayout(arrangeInCircle);
                    setIsElementsMenuOpen(false);
                  }}
                  title="Arrange in Circle"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>⭕</span> Circle
                </motion.button>
                <motion.button
                  className="btn btn-secondary"
                  onClick={() => {
                    handleLayout(arrangeInCurve);
                    setIsElementsMenuOpen(false);
                  }}
                  title="Arrange in Curve"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>〰️</span> Curve
                </motion.button>
                <motion.button
                  className="btn btn-secondary"
                  onClick={() => {
                    handleLayout(arrangeInGrid);
                    setIsElementsMenuOpen(false);
                  }}
                  title="Arrange in Grid"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>▦</span> Grid
                </motion.button>
                <motion.button
                  className="btn btn-secondary"
                  onClick={() => {
                    handleLayout(arrangeInLine);
                    setIsElementsMenuOpen(false);
                  }}
                  title="Arrange in Line"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>━</span> Line
                </motion.button>
                <motion.button
                  className="btn btn-secondary"
                  onClick={() => {
                    handleLayout(arrangeInSnake);
                    setIsElementsMenuOpen(false);
                  }}
                  title="Arrange in Snake"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>〰</span> Snake
                </motion.button>
              </div>
              <div style={{ borderTop: '1px solid #444', margin: '8px 0', paddingTop: '8px' }}>
                <motion.button
                  className="btn btn-secondary"
                  onClick={() => {
                    handleGroupsMode();
                    setIsElementsMenuOpen(false);
                  }}
                  title="Organize cards into groups (Parts, Chapters, Sections)"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ width: '100%' }}
                >
                  <span>📑</span> Groups
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <motion.button
            ref={expressionButtonRef}
            className="btn btn-secondary"
            onClick={() => setIsExpressionMenuOpen(!isExpressionMenuOpen)}
            title="Add Text"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>✍️</span> Expression
          </motion.button>

          <ExpressionMenu
            isOpen={isExpressionMenuOpen}
            buttonRef={expressionButtonRef}
            onClose={() => {
              setIsExpressionMenuOpen(false);
              setEditingTextField(null);
            }}
            editingTextField={editingTextField}
          />
        </div>
      </div>

      <div className="toolbar-right">
        <div style={{ position: 'relative' }}>
          <motion.button
            ref={settingsButtonRef}
            className="btn btn-secondary"
            onClick={handleSettingsButtonClick}
            title="Settings"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>⚙️</span> Settings
          </motion.button>
          <SettingsMenu
            isOpen={isSettingsMenuOpen}
            onClose={() => setIsSettingsMenuOpen(false)}
            onBackgroundSettings={handleBackgroundSettings}
            onCardSettings={handleCardSettings}
            buttonRef={settingsButtonRef}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <motion.button
            ref={saveButtonRef}
            className="btn btn-success"
            onClick={handleSaveButtonClick}
            title="Save Presentation"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>💾</span> Save
          </motion.button>
          <SaveMenu
            isOpen={isSaveMenuOpen}
            onClose={() => setIsSaveMenuOpen(false)}
            onSave={handleQuickSave}
            onSaveAs={handleSaveAs}
            buttonRef={saveButtonRef}
          />
        </div>

        <motion.button
          className="btn btn-success"
          onClick={handleExport}
          title="Export with External Media (ZIP)"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>📦</span> Export
        </motion.button>

        <motion.button
          className="btn btn-success"
          onClick={() => loadInputRef.current?.click()}
          title="Load Presentation"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>📂</span> Load
        </motion.button>
        <input
          ref={loadInputRef}
          type="file"
          accept=".json,.zip"
          style={{ display: 'none' }}
          onChange={(e) => importFromFile(e.target.files[0])}
        />
      </div>

      <SaveDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={handleSaveConfirm}
        currentName={projectName}
        title={saveDialogMode === 'json' ? 'Save Presentation' : 'Export Presentation'}
      />

      <CardSettings
        isOpen={isCardSettingsOpen}
        onClose={() => setIsCardSettingsOpen(false)}
      />
    </motion.header>
  );
};

export default Toolbar;
