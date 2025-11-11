import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import useStore from '../store/useStore';

// Export presentation as JSON
export const exportToJSON = (cards, background) => {
  const data = {
    version: '2.0',
    timestamp: Date.now(),
    background,
    cards: cards.map(card => ({
      id: card.id,
      orientation: card.orientation,
      position: card.position,
      size: card.size,
      mediaType: card.mediaType,
      mediaSrc: card.mediaSrc
    }))
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, `showcase-${Date.now()}.json`);
};

// Export presentation as ZIP with external videos
export const exportToZip = async (cards, background, videoFiles) => {
  try {
    const zip = new JSZip();
    const timestamp = Date.now();

    // Create presentation data with hybrid storage
    const data = {
      version: '2.0',
      timestamp,
      background,
      cards: cards.map(card => {
        const cardData = {
          id: card.id,
          orientation: card.orientation,
          position: card.position,
          size: card.size,
          mediaType: card.mediaType
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
    saveAs(content, `showcase-${timestamp}.zip`);

    console.log('✅ Presentation exported successfully!');
  } catch (error) {
    console.error('Export failed:', error);
    alert('❌ Export failed: ' + error.message);
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
    alert('❌ Import failed: ' + error.message);
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
  alert('✅ Presentation loaded from ZIP successfully!');
};

// Import from JSON
const importFromJSON = async (jsonFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        loadPresentationData(data);
        alert('✅ Presentation loaded successfully!');
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

  // Set background
  if (data.background) {
    store.setBackground(data.background);
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
