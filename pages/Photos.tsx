
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';

const Photos: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial mock data
  const MOCK_PHOTOS = [
    'https://picsum.photos/seed/const1/400/400',
    'https://picsum.photos/seed/const2/400/400',
    'https://picsum.photos/seed/const3/400/400',
    'https://picsum.photos/seed/const4/400/400',
    'https://picsum.photos/seed/const5/400/400',
  ];

  const [photos, setPhotos] = useState<string[]>(() => {
    const saved = localStorage.getItem('gallery_photos');
    return saved ? JSON.parse(saved) : MOCK_PHOTOS;
  });
  const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);

  // Save to localStorage whenever photos change
  React.useEffect(() => {
    localStorage.setItem('gallery_photos', JSON.stringify(photos));
  }, [photos]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setPhotos(prev => [base64String, ...prev]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full active:bg-gray-200 dark:active:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h1 className="text-lg font-bold text-center flex-1">Galeria da Obra</h1>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center w-10 h-10 -mr-2 rounded-full active:bg-gray-200 dark:active:bg-white/10 transition-colors text-primary"
          >
            <span className="material-symbols-outlined text-[28px]">add_a_photo</span>
          </button>
        </div>
      </header>

      {/* Grid */}
      <main className="flex-1 p-1">
        <div className="grid grid-cols-3 gap-1">
          {/* Upload Trigger Logic is in Header, but we can also add a tile */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square bg-gray-100 dark:bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-3xl text-gray-400">add</span>
            <span className="text-xs font-medium text-gray-500 mt-1">Adicionar</span>
          </div>

          {photos.map((photo, index) => (
            <div key={index} className="aspect-square relative group overflow-hidden bg-gray-200 dark:bg-white/5">
              <img
                src={photo}
                alt={`Foto ${index}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                <button
                  className="text-white hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoToDelete(index);
                  }}
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <ConfirmModal
        isOpen={photoToDelete !== null}
        title="Excluir Foto"
        message="Tem certeza que deseja excluir esta foto da galeria?"
        onConfirm={() => {
          if (photoToDelete !== null) {
            setPhotos(photos.filter((_, i) => i !== photoToDelete));
            setPhotoToDelete(null);
          }
        }}
        onCancel={() => setPhotoToDelete(null)}
        confirmText="Excluir"
      />
      <input
        type="file"
        multiple
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handlePhotoUpload}
      />
    </div>
  );
};

export default Photos;
