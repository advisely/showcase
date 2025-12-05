import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { exportToJSON, exportToZip, exportToJSONNative, exportToZipNative, importFromFile } from '../utils/export';
import SaveDialog from './SaveDialog';
import FileMenu from './FileMenu';
import SettingsMenu from './SettingsMenu';
import CardSettings from './CardSettings';
import GroupSettings from './GroupSettings';
import ExpressionMenu from './ExpressionMenu';

const Toolbar = () => {
  const fileInputRef = useRef(null);
  const loadInputRef = useRef(null);
  const bgColorPickerRef = useRef(null);
  const bgImageInputRef = useRef(null);
  const fileButtonRef = useRef(null);
  const settingsButtonRef = useRef(null);
  const elementsButtonRef = useRef(null);
  const expressionButtonRef = useRef(null);
  const nameInputRef = useRef(null);

  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveDialogMode, setSaveDialogMode] = useState('json'); // 'json' or 'zip'
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isCardSettingsOpen, setIsCardSettingsOpen] = useState(false);
  const [isGroupSettingsOpen, setIsGroupSettingsOpen] = useState(false);
  const [isElementsMenuOpen, setIsElementsMenuOpen] = useState(false);
  const [isExpressionMenuOpen, setIsExpressionMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingName, setEditingName] = useState('');

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
  const textFields = useStore(state => state.textFields);
  const groups = useStore(state => state.groups);
  const videoFiles = useStore(state => state.videoFiles);
  const isSaving = useStore(state => state.isSaving);
  const lastSaved = useStore(state => state.lastSaved);
  const lastSavedFileName = useStore(state => state.lastSavedFileName);
  const storageError = useStore(state => state.storageError);
  const projectName = useStore(state => state.projectName);
  const setProjectName = useStore(state => state.setProjectName);
  const setBackgroundMenuOpen = useStore(state => state.setBackgroundMenuOpen);
  const newPresentation = useStore(state => state.newPresentation);

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

  // File menu handlers
  const handleFileButtonClick = () => {
    setIsFileMenuOpen(!isFileMenuOpen);
  };

  const handleNew = () => {
    // Confirm before clearing
    if (cards.length > 0 || textFields.length > 0 || groups.length > 0) {
      if (window.confirm('Start a new presentation? All unsaved changes will be lost.')) {
        newPresentation();
        saveToStorage();
        setNotification({ message: 'New presentation created', type: 'success' });
      }
    } else {
      newPresentation();
      setNotification({ message: 'New presentation created', type: 'success' });
    }
  };

  const handleLoad = () => {
    loadInputRef.current?.click();
  };

  const handleQuickSave = () => {
    // Save with default timestamp-based name
    const fileName = `showcase_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
    saveToStorage(fileName);
    exportToJSON(cards, background, null);
  };

  const handleSaveAs = async () => {
    // Use native file picker (shows Windows Save As dialog)
    const savedName = await exportToJSONNative(cards, background, textFields, groups, projectName);
    if (savedName) {
      setProjectName(savedName);
      saveToStorage(savedName);
      setNotification({ message: `Saved as "${savedName}.json"`, type: 'success' });
    }
  };

  const handleExport = async () => {
    // Use native file picker for ZIP export
    const savedName = await exportToZipNative(cards, background, videoFiles, textFields, groups, projectName);
    if (savedName) {
      setProjectName(savedName);
      saveToStorage(savedName);
      setNotification({ message: `Exported as "${savedName}.zip"`, type: 'success' });
    }
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

  const handleGroupSettings = () => {
    setIsGroupSettingsOpen(true);
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

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcuts for file operations
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      // Ctrl+N - New presentation
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        handleNew();
      }
      // Ctrl+O - Open/Load
      else if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        handleLoad();
      }
      // Ctrl+Shift+S - Save As
      else if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        handleSaveAs();
      }
      // Ctrl+S - Quick Save
      else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleQuickSave();
      }
      // Ctrl+E - Export ZIP
      else if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        handleExport();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [cards, textFields, groups, projectName]);

  // Initialize editing name when project name changes
  useEffect(() => {
    setEditingName(projectName || '');
  }, [projectName]);

  // Handle name input focus
  const handleNameFocus = () => {
    setEditingName(projectName || '');
  };

  // Handle name input blur - save the name
  const handleNameBlur = () => {
    if (editingName.trim() !== projectName) {
      setProjectName(editingName.trim() || 'Untitled Presentation');
      saveToStorage();
    }
  };

  // Handle name input key down
  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nameInputRef.current?.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingName(projectName || '');
      nameInputRef.current?.blur();
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <motion.header
      className="toolbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isFullscreen ? (
        // Fullscreen mode: Only show centered exit button
        <>
          <div className="toolbar-left" style={{ visibility: 'hidden', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h1 style={{ margin: 0, lineHeight: '1' }}>Showcase</h1>
            </div>
          </div>

          <div className="toolbar-center" style={{ flex: 0 }}>
            <motion.button
              className="btn btn-secondary"
              onClick={toggleFullscreen}
              title="Exit Full Screen"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>🖥️</span>
            </motion.button>
          </div>

          <div className="toolbar-right" style={{ visibility: 'hidden', flex: 1 }}>
            <span>placeholder</span>
          </div>
        </>
      ) : (
        // Normal mode: Show all controls
        <>
          <div className="toolbar-left">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h1 style={{ margin: 0, lineHeight: '1' }}>Showcase</h1>
              <span style={{ fontSize: '11px', color: '#888', fontWeight: '400' }}>by Yassine Boumiza</span>
            </div>
            {storageError && (
              <span className="storage-error" title={storageError}>
                Storage Issue
              </span>
            )}
            {isSaving && (
              <span className="saving-indicator">Saving...</span>
            )}
            {lastSaved && !isSaving && (
              <span className="last-saved" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
                {lastSavedFileName && (
                  <span style={{ fontSize: '10px', color: '#888' }}>
                    {lastSavedFileName}
                  </span>
                )}
              </span>
            )}

            {/* Presentation Name Field - Dynamic Width */}
            <div className="toolbar-name">
              <input
                ref={nameInputRef}
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onFocus={handleNameFocus}
                onBlur={handleNameBlur}
                onKeyDown={handleNameKeyDown}
                placeholder="Untitled Presentation"
                style={{ width: `${Math.min(Math.max((editingName || 'Untitled Presentation').length * 10 + 30, 120), 350)}px` }}
              />
            </div>
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
                    <motion.button
                      className="btn btn-secondary"
                      onClick={() => {
                        handleGroupsMode();
                        setIsElementsMenuOpen(false);
                      }}
                      title="Organize cards into groups (Parts, Chapters, Sections)"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
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

            <motion.button
              className="btn btn-secondary"
              onClick={toggleFullscreen}
              title="Full Screen Mode"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>🖥️</span>
            </motion.button>
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
                onGroupSettings={handleGroupSettings}
                buttonRef={settingsButtonRef}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <motion.button
                ref={fileButtonRef}
                className="btn btn-success"
                onClick={handleFileButtonClick}
                title="File Menu"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>📁</span> File
              </motion.button>
              <FileMenu
                isOpen={isFileMenuOpen}
                onClose={() => setIsFileMenuOpen(false)}
                onNew={handleNew}
                onLoad={handleLoad}
                onSave={handleQuickSave}
                onSaveAs={handleSaveAs}
                onExport={handleExport}
                buttonRef={fileButtonRef}
              />
            </div>
            <input
              ref={loadInputRef}
              type="file"
              accept=".json,.zip"
              style={{ display: 'none' }}
              onChange={(e) => importFromFile(e.target.files[0])}
            />
          </div>
        </>
      )}

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

      <GroupSettings
        isOpen={isGroupSettingsOpen}
        onClose={() => setIsGroupSettingsOpen(false)}
      />
    </motion.header>
  );
};

export default Toolbar;
