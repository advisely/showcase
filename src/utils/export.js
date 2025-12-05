import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import useStore from '../store/useStore';

// Current file format version
const FILE_VERSION = '2.1';

// Helper function to format date as YYYY-MM-DD-hh-mm-ss
const formatDateForFilename = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
};

// Helper function to sanitize presentation name for filename
const sanitizeForFilename = (name) => {
  if (!name) return '';
  // Replace spaces with hyphens, remove special characters
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 50); // Limit length
};

// Generate filename: showcase-presentationName-YYYY-MM-DD-hh-mm-ss
const generateFilename = (projectName) => {
  const sanitizedName = sanitizeForFilename(projectName);
  const dateStr = formatDateForFilename();
  return sanitizedName
    ? `showcase-${sanitizedName}-${dateStr}`
    : `showcase-${dateStr}`;
};

// Check if File System Access API is supported (Chrome, Edge, Opera)
const isFileSystemAccessSupported = () => 'showSaveFilePicker' in window;

// Build the complete presentation data object with all settings
const buildPresentationData = (options = {}) => {
  const {
    cards = [],
    background = {},
    textFields = [],
    groups = [],
    projectName = '',
    groupSettings = {},
    cardAnimationSpeed = 1,
    cardBackdropOpacity = 0.7,
    zoomLevel = 1,
    panX = 0,
    panY = 0,
    activeLayout = null,
    layoutSettings = {},
    includeMediaSrc = true, // Set to false for video cards in ZIP
  } = options;

  return {
    version: FILE_VERSION,
    timestamp: Date.now(),
    projectName,

    // Canvas settings
    background,
    zoomLevel,
    panX,
    panY,

    // Layout settings
    activeLayout,
    layoutSettings,

    // Animation & appearance settings
    cardAnimationSpeed,
    cardBackdropOpacity,
    groupSettings,

    // Content
    cards: cards.map(card => {
      const cardData = {
        id: card.id,
        orientation: card.orientation,
        position: card.position,
        size: card.size,
        mediaType: card.mediaType,
        groupId: card.groupId,
      };

      if (includeMediaSrc || card.mediaType === 'image') {
        cardData.mediaSrc = card.mediaSrc;
      }

      return cardData;
    }),

    textFields: textFields.map(tf => ({
      id: tf.id,
      text: tf.text,
      position: tf.position,
      style: tf.style
    })),

    groups: groups.map(g => ({
      id: g.id,
      name: g.name,
      order: g.order,
      position: g.position,
      size: g.size,
      style: g.style,
      innerLayout: g.innerLayout,
      collapsed: g.collapsed,
      expanded: g.expanded
    }))
  };
};

// Export presentation as JSON with native file picker
export const exportToJSONNative = async (cards, background, textFields = [], groups = [], suggestedName = null) => {
  // Get all settings from store
  const store = useStore.getState();

  const data = buildPresentationData({
    cards,
    background,
    textFields,
    groups,
    projectName: store.projectName,
    groupSettings: store.groupSettings,
    cardAnimationSpeed: store.cardAnimationSpeed,
    cardBackdropOpacity: store.cardBackdropOpacity,
    zoomLevel: store.zoomLevel,
    panX: store.panX,
    panY: store.panY,
    activeLayout: store.activeLayout,
    layoutSettings: store.layoutSettings,
  });

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const defaultName = suggestedName || generateFilename(store.projectName);

  if (isFileSystemAccessSupported()) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: `${defaultName}.json`,
        types: [{
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] }
        }]
      });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();

      // Extract filename without extension
      const savedName = handle.name.replace(/\.json$/i, '');
      console.log('Presentation saved successfully!');
      return savedName;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Save cancelled by user');
        return null; // User cancelled
      }
      throw err;
    }
  } else {
    // Fallback to file-saver for unsupported browsers
    saveAs(blob, `${defaultName}.json`);
    return defaultName;
  }
};

// Export presentation as ZIP with native file picker
export const exportToZipNative = async (cards, background, videoFiles, textFields = [], groups = [], suggestedName = null) => {
  try {
    const zip = new JSZip();
    const store = useStore.getState();
    const timestamp = Date.now();
    const defaultName = suggestedName || generateFilename(store.projectName);

    // Build presentation data (videos will have external paths)
    const data = {
      ...buildPresentationData({
        cards: [],  // We'll add cards manually below
        background,
        textFields,
        groups,
        projectName: store.projectName,
        groupSettings: store.groupSettings,
        cardAnimationSpeed: store.cardAnimationSpeed,
        cardBackdropOpacity: store.cardBackdropOpacity,
        zoomLevel: store.zoomLevel,
        panX: store.panX,
        panY: store.panY,
        activeLayout: store.activeLayout,
        layoutSettings: store.layoutSettings,
      }),
      // Override cards with hybrid storage
      cards: cards.map(card => {
        const cardData = {
          id: card.id,
          orientation: card.orientation,
          position: card.position,
          size: card.size,
          mediaType: card.mediaType,
          groupId: card.groupId
        };

        // Hybrid: embed images, link videos
        if (card.mediaType === 'image') {
          cardData.mediaSrc = card.mediaSrc;
          cardData.embedded = true;
        } else if (card.mediaType === 'video') {
          cardData.mediaPath = `media/${card.videoFilename}`;
          cardData.embedded = false;
        }

        return cardData;
      })
    };

    // Add JSON to ZIP
    zip.file('presentation.json', JSON.stringify(data, null, 2));

    // Add video files to media folder
    const mediaFolder = zip.folder('media');
    for (const [cardId, videoFile] of videoFiles.entries()) {
      const card = cards.find(c => c.id === cardId);
      if (card && card.videoFilename && videoFile) {
        mediaFolder.file(card.videoFilename, videoFile);
      }
    }

    // Add README
    const readme = `# Showcase Presentation Package
Version: ${FILE_VERSION}
Project: ${store.projectName || 'Untitled Presentation'}

This folder contains your presentation with external media files.

## Structure:
- presentation.json: Configuration file with all settings and embedded images
- media/: Folder containing video files

## To use on another computer:
1. Keep this entire folder together
2. Open Showcase
3. Click "Load" and select presentation.json
4. Make sure the media/ folder is in the same directory

## Saved Settings:
- Canvas position & zoom level
- Group settings (thumbnails, animations, colors)
- Card animation speed
- Card backdrop opacity
- Layout configuration

## Storage Strategy (Hybrid):
- Images: Embedded in JSON (portable, usually small)
- Videos: Stored in media/ folder (keeps JSON file size manageable)

Generated: ${new Date(timestamp).toLocaleString()}
`;
    zip.file('README.txt', readme);

    // Generate ZIP blob
    const content = await zip.generateAsync({ type: 'blob' });

    if (isFileSystemAccessSupported()) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: `${defaultName}.zip`,
          types: [{
            description: 'ZIP Archives',
            accept: { 'application/zip': ['.zip'] }
          }]
        });

        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();

        const savedName = handle.name.replace(/\.zip$/i, '');
        console.log('Presentation exported successfully!');
        return savedName;
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Export cancelled by user');
          return null;
        }
        throw err;
      }
    } else {
      // Fallback to file-saver
      saveAs(content, `${defaultName}.zip`);
      console.log('Presentation exported successfully!');
      return defaultName;
    }
  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed: ' + error.message);
    return null;
  }
};

// Export presentation as JSON (legacy - auto-downloads to Downloads folder)
export const exportToJSON = (cards, background, filename = null) => {
  const store = useStore.getState();

  const data = buildPresentationData({
    cards,
    background,
    textFields: store.textFields,
    groups: store.groups,
    projectName: store.projectName,
    groupSettings: store.groupSettings,
    cardAnimationSpeed: store.cardAnimationSpeed,
    cardBackdropOpacity: store.cardBackdropOpacity,
    zoomLevel: store.zoomLevel,
    panX: store.panX,
    panY: store.panY,
    activeLayout: store.activeLayout,
    layoutSettings: store.layoutSettings,
  });

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });

  // Use custom filename or generate one with new naming convention
  const finalFilename = filename
    ? `${filename}.json`
    : `${generateFilename(store.projectName)}.json`;

  saveAs(blob, finalFilename);
};

// Export presentation as ZIP with external videos (legacy)
export const exportToZip = async (cards, background, videoFiles, filename = null) => {
  try {
    const zip = new JSZip();
    const store = useStore.getState();
    const timestamp = Date.now();

    // Build presentation data
    const data = {
      ...buildPresentationData({
        cards: [],
        background,
        textFields: store.textFields,
        groups: store.groups,
        projectName: store.projectName,
        groupSettings: store.groupSettings,
        cardAnimationSpeed: store.cardAnimationSpeed,
        cardBackdropOpacity: store.cardBackdropOpacity,
        zoomLevel: store.zoomLevel,
        panX: store.panX,
        panY: store.panY,
        activeLayout: store.activeLayout,
        layoutSettings: store.layoutSettings,
      }),
      cards: cards.map(card => {
        const cardData = {
          id: card.id,
          orientation: card.orientation,
          position: card.position,
          size: card.size,
          mediaType: card.mediaType,
          groupId: card.groupId
        };

        // Hybrid: embed images, link videos
        if (card.mediaType === 'image') {
          cardData.mediaSrc = card.mediaSrc;
          cardData.embedded = true;
        } else if (card.mediaType === 'video') {
          cardData.mediaPath = `media/${card.videoFilename}`;
          cardData.embedded = false;
        }

        return cardData;
      })
    };

    // Add JSON to ZIP
    zip.file('presentation.json', JSON.stringify(data, null, 2));

    // Add video files to media folder
    const mediaFolder = zip.folder('media');
    for (const [cardId, videoFile] of videoFiles.entries()) {
      const card = cards.find(c => c.id === cardId);
      if (card && card.videoFilename && videoFile) {
        mediaFolder.file(card.videoFilename, videoFile);
      }
    }

    // Add README
    const readme = `# Showcase Presentation Package
Version: ${FILE_VERSION}
Project: ${store.projectName || 'Untitled Presentation'}

This folder contains your presentation with external media files.

## Structure:
- presentation.json: Configuration file with positions and embedded images
- media/: Folder containing video files

## To use on another computer:
1. Keep this entire folder together
2. Open Showcase
3. Click "Load" and select presentation.json
4. Make sure the media/ folder is in the same directory

## Storage Strategy (Hybrid):
- Images: Embedded in JSON (portable, usually small)
- Videos: Stored in media/ folder (keeps JSON file size manageable)

Generated: ${new Date(timestamp).toLocaleString()}
`;
    zip.file('README.txt', readme);

    // Generate and download ZIP
    const content = await zip.generateAsync({ type: 'blob' });

    // Use custom filename or generate one with new naming convention
    const finalFilename = filename
      ? `${filename}.zip`
      : `${generateFilename(store.projectName)}.zip`;

    saveAs(content, finalFilename);

    console.log('Presentation exported successfully!');
  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed: ' + error.message);
  }
};

// Import presentation from file
export const importFromFile = async (file) => {
  if (!file) return;

  try {
    if (file.name.endsWith('.zip')) {
      await importFromZip(file);
    } else if (file.name.endsWith('.json')) {
      await importFromJSON(file);
    } else {
      alert('Unsupported file format. Please use .json or .zip files.');
    }
  } catch (error) {
    console.error('Import failed:', error);
    alert('Import failed: ' + error.message);
  }
};

// Import from ZIP
const importFromZip = async (zipFile) => {
  const zip = await JSZip.loadAsync(zipFile);

  // Read presentation.json
  const jsonFile = zip.file('presentation.json');
  if (!jsonFile) {
    throw new Error('presentation.json not found in ZIP');
  }

  const jsonText = await jsonFile.async('text');
  const data = JSON.parse(jsonText);

  // Create a map of video files from media folder
  const videoBlobs = new Map();
  const mediaFolder = zip.folder('media');

  if (mediaFolder) {
    const mediaFiles = [];
    mediaFolder.forEach((relativePath, file) => {
      mediaFiles.push({ name: relativePath, file });
    });

    for (const { name, file } of mediaFiles) {
      const blob = await file.async('blob');
      const url = URL.createObjectURL(blob);
      videoBlobs.set(`media/${name}`, url);
    }
  }

  // Load the presentation
  loadPresentationData(data, videoBlobs);
  alert('Presentation loaded from ZIP successfully!');
};

// Import from JSON
const importFromJSON = async (jsonFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        loadPresentationData(data);
        alert('Presentation loaded successfully!');
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsText(jsonFile);
  });
};

// Load presentation data into store
const loadPresentationData = (data, videoBlobs = new Map()) => {
  const store = useStore.getState();

  // Clear current presentation
  store.clearAll();

  // Set project name
  if (data.projectName) {
    store.setProjectName(data.projectName);
  }

  // Set background
  if (data.background) {
    store.setBackground(data.background);
  }

  // Set canvas position and zoom
  if (data.zoomLevel !== undefined) {
    store.setZoomLevel(data.zoomLevel);
  }
  if (data.panX !== undefined && data.panY !== undefined) {
    store.setPan(data.panX, data.panY);
  }

  // Set layout settings
  if (data.activeLayout !== undefined) {
    store.setActiveLayout(data.activeLayout);
  }
  if (data.layoutSettings) {
    store.setLayoutSettings(data.layoutSettings);
  }

  // Set animation and appearance settings
  if (data.cardAnimationSpeed !== undefined) {
    store.setCardAnimationSpeed(data.cardAnimationSpeed);
  }
  if (data.cardBackdropOpacity !== undefined) {
    store.setCardBackdropOpacity(data.cardBackdropOpacity);
  }

  // Set group settings (merge with defaults for backwards compatibility)
  if (data.groupSettings) {
    const defaultGroupSettings = store.groupSettings;
    store.setGroupSettings({ ...defaultGroupSettings, ...data.groupSettings });
  }

  // Load groups
  if (data.groups && data.groups.length > 0) {
    data.groups.forEach(groupData => {
      store.addGroup(groupData);
    });
  }

  // Load text fields
  if (data.textFields && data.textFields.length > 0) {
    data.textFields.forEach(tf => {
      store.addTextField(tf);
    });
  }

  // Load cards
  data.cards.forEach(cardData => {
    let mediaSrc = cardData.mediaSrc;

    // Handle external videos from ZIP
    if (cardData.embedded === false && cardData.mediaPath) {
      mediaSrc = videoBlobs.get(cardData.mediaPath);
      if (!mediaSrc) {
        console.error(`Video not found: ${cardData.mediaPath}`);
        return;
      }
    }

    // Skip videos without media data
    if (cardData.mediaType === 'video' && !mediaSrc) {
      console.warn('Skipping video card without media data');
      return;
    }

    store.addCard({
      ...cardData,
      mediaSrc
    });
  });

  // Save to IndexedDB
  store.saveToStorage();
};
