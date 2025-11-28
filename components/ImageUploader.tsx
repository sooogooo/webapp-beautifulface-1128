import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  selectedImage: string | null;
  onClear: () => void;
  onError?: (msg: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, selectedImage, onClear, onError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = ''; // Reset input to allow re-selection
  };

  const processFile = (file: File) => {
    setToastMessage(null);

    // Type validation
    if (!file.type.startsWith('image/')) {
        setToastMessage("请上传有效的图片文件 (JPG, PNG, WebP)");
        return;
    }

    // Size validation (10MB Limit)
    if (file.size > 10 * 1024 * 1024) {
        setToastMessage("图片大小不能超过 10MB");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onImageSelected(base64);
    };
    reader.onerror = () => {
        setToastMessage("图片读取失败，请重试");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full max-w-md mx-auto mb-10 relative">
      {!selectedImage ? (
        <div
          className={`relative border border-dashed rounded-2xl p-10 transition-all duration-500 flex flex-col items-center justify-center h-72 bg-white/60 backdrop-blur-sm cursor-pointer group
            ${isDragOver ? 'border-brand-rose bg-brand-rose/5' : 'border-sys-text-light/20 hover:border-brand-rose/50 hover:shadow-soft'}
          `}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex gap-6 mb-6 relative">
             {/* Decorative background circle */}
             <div className="absolute inset-0 bg-brand-accent/20 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
             
             <div className="flex flex-col items-center relative z-10">
                <div className="w-16 h-16 rounded-full bg-white border border-white shadow-sm flex items-center justify-center mb-4 text-brand-rose group-hover:scale-110 transition-transform duration-300">
                  <Upload strokeWidth={1.5} size={28} />
                </div>
                <span className="text-base tracking-widest text-sys-text-main group-hover:text-brand-rose transition-colors">上传照片</span>
             </div>
          </div>
          <p className="text-xs text-sys-text-light tracking-wide text-center leading-relaxed">
            点击上传或将照片拖拽至此处<br/>
            <span className="opacity-70">支持高清人像自拍或写真</span>
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative w-full rounded-2xl overflow-hidden shadow-soft group border border-white">
          <img src={selectedImage} alt="预览" className="w-full h-auto object-cover max-h-[450px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <button
            onClick={onClear}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 border border-white/30"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 bg-sys-text-main/90 backdrop-blur-md text-white rounded-full shadow-lg animate-fade-in-up">
           <AlertCircle size={18} className="text-brand-rose shrink-0" />
           <span className="text-sm font-medium tracking-wide whitespace-nowrap">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;