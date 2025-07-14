import React, { useRef } from 'react';
import { Trash2, Image, Film, Play } from 'lucide-react';
import Button from './Button';
import Input  from './Input';

const icons = { image: Image, video: Film, animation: Play };

export default function QuestionItem({
  index, data, total, onChange, onRemove
}) {
  const fileInput = useRef(null);
  const setField  = (field, val) => onChange(index, { [field]: val });

  const handleFile = (file, type) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange(index, {
      _file: file,
      mediaURL: url,
      media: url,
      mediaType: type
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      {/* başlık + sil */}
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-medium text-gray-700">Soru {index + 1}</h5>
        {total > 1 && (
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => onRemove(index)}
            className="text-red-600"
          >
            Sil
          </Button>
        )}
      </div>

      {/* soru */}
      <Input
        label="Soru Metni"
        value={data.question}
        onChange={e => setField('question', e.target.value)}
        placeholder="Sorunuzu yazın…"
        required
      />

      {/* seçenekler */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {data.options.map((opt, i) => (
          <Input
            key={i}
            label={`Seçenek ${String.fromCharCode(65 + i)}`}
            value={opt}
            onChange={e => {
              const copy = [...data.options];
              copy[i] = e.target.value;
              setField('options', copy);
            }}
            required
          />
        ))}
      </div>

      {/* doğru cevap */}
      <div className="mt-4">
        <Input.Select
          label="Doğru Cevap"
          value={data.correctAnswer}
          onChange={e => setField('correctAnswer', +e.target.value)}
          options={[0,1,2,3].map(i => ({
            value: i, label: String.fromCharCode(65 + i)
          }))}
          required
        />
      </div>

      {/* medya */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Medya (Opsiyonel)
        </label>

        {data.media ? (
          /* mevcut medya ön-izleme */
          <div className="border rounded p-3 bg-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {React.createElement(icons[data.mediaType] || Image, { size: 18 })}
                <span className="text-sm text-gray-600">
                  {data.mediaType === 'image'
                    ? 'Görsel yüklendi'
                    : data.mediaType === 'video'
                      ? 'Video yüklendi'
                      : 'Animasyon yüklendi'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={() => setField('media', null)}
                className="text-red-600"
              >
                Kaldır
              </Button>
            </div>
            {data.mediaType === 'image' && (
              <img
                src={data.media}
                alt="Preview"
                className="mt-2 w-full h-32 object-cover rounded"
              />
            )}
          </div>
        ) : (
          /* yükleme butonları */
          <div className="grid grid-cols-3 gap-2">
            {['image','video','animation'].map(type => {
              const Icon = icons[type];
              return (
                <label key={type} className="cursor-pointer">
                  <input
                    type="file"
                    accept={
                      type === 'animation' ? '.gif,.webp' : `${type}/*`
                    }
                    className="hidden"
                    onChange={e => handleFile(e.target.files[0], type)}
                  />
                  <div className="border-2 border-dashed border-gray-300
                                  rounded-lg p-4 text-center hover:border-blue-400
                                  transition-colors">
                    <Icon className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                    <span className="text-xs text-gray-600">
                      {type === 'image' ? 'Görsel'
                       : type === 'video' ? 'Video' : 'Animasyon'}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* gizli file input (mobilde kamera açmak için gerekebilir) */}
      <input ref={fileInput} type="file" className="hidden" />
    </div>
  );
}
