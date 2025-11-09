import { useState } from 'react';
import { useStore } from './store/useStore';
import Toolbar from './components/Toolbar';
import Playfield from './components/Playfield';
import OrientationModal from './components/OrientationModal';
import MaximizedView from './components/MaximizedView';

function App() {
  const addCard = useStore((state) => state.addCard);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showOrientationModal, setShowOrientationModal] = useState(false);

  const handleAddMedia = (files: File[]) => {
    setPendingFiles(files);
    setShowOrientationModal(true);
  };

  const handleOrientationSelect = (orientation: 'landscape' | 'portrait') => {
    pendingFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const mediaSrc = e.target?.result as string;
        const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

        // Random position
        const x = Math.random() * 1000 + 500;
        const y = Math.random() * 1000 + 500;

        // Size based on orientation
        const size = orientation === 'landscape'
          ? { width: 300, height: 200 }
          : { width: 200, height: 300 };

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
