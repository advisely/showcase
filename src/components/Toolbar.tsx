import { useRef } from 'react';
import { useStore } from '../store/useStore';
import { PresentationData } from '../types';

interface ToolbarProps {
  onAddMedia: (files: File[]) => void;
}

export default function Toolbar({ onAddMedia }: ToolbarProps) {
  const arrangeCards = useStore((state) => state.arrangeCards);
  const setBackground = useStore((state) => state.setBackground);
  const clearBackground = useStore((state) => state.clearBackground);
  const savePresentation = useStore((state) => state.savePresentation);
  const loadPresentation = useStore((state) => state.loadPresentation);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const bgColorInputRef = useRef<HTMLInputElement>(null);
  const loadInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onAddMedia(files);
      e.target.value = '';
    }
  };

  const handleBgImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackground({ image: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadPresentation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string) as PresentationData;
          loadPresentation(data);
          alert('Presentation loaded successfully!');
        } catch (error) {
          alert('Error loading presentation: ' + (error as Error).message);
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    }
  };

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Showcase
          </h1>
        </div>

        {/* Center Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>📎</span> Add Media
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex gap-2 ml-4">
            <button
              onClick={() => arrangeCards('circle')}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              title="Arrange in Circle"
            >
              <span>⭕</span>
            </button>
            <button
              onClick={() => arrangeCards('curve')}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              title="Arrange in Curve"
            >
              <span>〰️</span>
            </button>
            <button
              onClick={() => arrangeCards('grid')}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              title="Arrange in Grid"
            >
              <span>▦</span>
            </button>
            <button
              onClick={() => arrangeCards('line')}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              title="Arrange in Line"
            >
              <span>━</span>
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => bgColorInputRef.current?.click()}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            title="Background Color"
          >
            <span>🎨</span>
          </button>
          <input
            ref={bgColorInputRef}
            type="color"
            defaultValue="#2c3e50"
            onChange={(e) => setBackground({ color: e.target.value })}
            className="hidden"
          />

          <button
            onClick={() => bgImageInputRef.current?.click()}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            title="Background Image"
          >
            <span>🖼️</span>
          </button>
          <input
            ref={bgImageInputRef}
            type="file"
            accept="image/*"
            onChange={handleBgImageSelect}
            className="hidden"
          />

          <button
            onClick={clearBackground}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            title="Clear Background"
          >
            <span>🗑️</span>
          </button>

          <div className="w-px h-8 bg-slate-700 mx-2" />

          <button
            onClick={savePresentation}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            title="Save Presentation"
          >
            <span>💾</span> Save
          </button>

          <button
            onClick={() => loadInputRef.current?.click()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            title="Load Presentation"
          >
            <span>📂</span> Load
          </button>
          <input
            ref={loadInputRef}
            type="file"
            accept=".json"
            onChange={handleLoadPresentation}
            className="hidden"
          />
        </div>
      </div>
    </header>
  );
}
