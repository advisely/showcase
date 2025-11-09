import { useState } from 'react';
import { useStore } from './store/useStore';
import Toolbar from './components/Toolbar';
import Playfield from './components/Playfield';
import OrientationModal from './components/OrientationModal';
import MaximizedView from './components/MaximizedView';

function App() {
  const addCard = useStore((state) => state.addCard);
  const viewport = useStore((state) => state.viewport);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showOrientationModal, setShowOrientationModal] = useState(false);

  const handleAddMedia = (files: File[]) => {
    setPendingFiles(files);
    setShowOrientationModal(true);
  };

  const handleOrientationSelect = (orientation: 'landscape' | 'portrait') => {
    pendingFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const mediaSrc = e.target?.result as string;
        const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

        // Size based on orientation
        const size = orientation === 'landscape'
          ? { width: 300, height: 200 }
          : { width: 200, height: 300 };

        // Spawn in visible viewport with slight offset for multiple cards
        const padding = 50;
        const offsetX = (index * 30) % (viewport.width - size.width - padding * 2);
        const offsetY = (index * 30) % (viewport.height - size.height - padding * 2);

        const x = viewport.scrollLeft + padding + offsetX;
        const y = viewport.scrollTop + padding + offsetY;

        addCard({
          orientation,
          position: { x, y },
          size,
          mediaType,
          mediaSrc,
        });
      };
      reader.readAsDataURL(file);
    });

    setPendingFiles([]);
    setShowOrientationModal(false);
  };

  const handleOrientationCancel = () => {
    setPendingFiles([]);
    setShowOrientationModal(false);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white">
      <Toolbar onAddMedia={handleAddMedia} />
      <Playfield />
      <OrientationModal
        isOpen={showOrientationModal}
        onSelect={handleOrientationSelect}
        onCancel={handleOrientationCancel}
      />
      <MaximizedView />
    </div>
  );
}

export default App;
