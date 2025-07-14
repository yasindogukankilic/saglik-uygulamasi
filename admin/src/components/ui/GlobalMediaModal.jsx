import React from 'react';
import { Image, Film, Play } from 'lucide-react';
import Button from './Button';

const icons = {
  image: Image,
  video: Film,
  animation: Play
};

export default function GlobalMediaModal({ onApply, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Tüm Sorulara Medya Uygula
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Seçeceğiniz medya tüm sorulara uygulanacaktır.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {['image','video','animation'].map(type => {
            const Icon = icons[type];
            return (
              <label key={type} className="cursor-pointer">
                <input
                  type="file"
                  accept={type === 'animation'
                    ? '.gif,.webp'
                    : `${type}/*`}
                  className="hidden"
                  onChange={e =>
                    e.target.files[0] && onApply(e.target.files[0], type)
                  }
                />
                <div className="border-2 border-dashed border-gray-300
                                rounded-lg p-4 text-center hover:border-blue-400
                                transition-colors">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <span className="text-sm text-gray-600 block">
                    {type === 'image' ? 'Görsel'
                     : type === 'video' ? 'Video' : 'Animasyon'}
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        <Button variant="secondary" onClick={onClose} className="w-full">
          İptal
        </Button>
      </div>
    </div>
  );
}
