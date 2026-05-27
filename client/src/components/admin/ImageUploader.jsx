import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import uploadApi from '../../api/uploadApi';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

export default function ImageUploader({ value = [], onChange, productName = 'product', cleanupOnRemove = false }) {
  const [uploading, setUploading] = useState({});

  async function uploadFile(file, index) {
    setUploading((current) => ({ ...current, [file.name]: 'uploading' }));
    const base64 = await fileToBase64(file);

    try {
      const image = await uploadApi.uploadSingle(base64, `${productName}-${Date.now()}-${index}`);
      setUploading((current) => ({ ...current, [file.name]: 'done' }));
      return image;
    } catch (error) {
      setUploading((current) => ({ ...current, [file.name]: 'error' }));
      toast.error(error.message || `Failed to upload ${file.name}`);
      throw error;
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const validFiles = acceptedFiles.filter((file) => file.type.startsWith('image/'));
      const results = await Promise.allSettled(
        validFiles.map((file, index) => uploadFile(file, index)),
      );
      const uploaded = results
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);

      if (uploaded.length) {
        onChange([...value, ...uploaded]);
        toast.success(`${uploaded.length} image(s) uploaded successfully`);
      }
    },
    [onChange, productName, value],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    multiple: true,
  });

  async function removeImage(index) {
    const next = [...value];
    const [removed] = next.splice(index, 1);
    onChange(next);
    if (cleanupOnRemove && removed?.deleteUrl) {
      try {
        await uploadApi.remove(removed);
        toast.success('Image deleted from storage');
      } catch (error) {
        toast.error(error.message || 'Image removed here, but storage cleanup failed');
      }
    }
  }

  function moveImage(index, targetIndex) {
    if (targetIndex < 0 || targetIndex >= value.length || targetIndex === index) {
      return;
    }

    const next = [...value];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    onChange(next);
  }

  function makePrimary(index) {
    moveImage(index, 0);
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
          isDragActive ? 'border-gold bg-amber-50' : 'border-borderwarm hover:border-gold'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-3 text-muted" size={32} />
        <p className="font-body font-medium text-body">
          {isDragActive ? 'Drop images here...' : 'Drag and drop images, or click to browse'}
        </p>
        <p className="mt-1 text-sm text-muted">
          JPG, PNG, WebP. Full quality preserved with ImgBB.
        </p>
      </div>

      {Object.entries(uploading).length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(uploading).map(([fileName, state]) => (
            <div
              key={fileName}
              className="flex items-center gap-2 rounded-2xl border border-borderwarm bg-white px-4 py-3 text-sm text-body"
            >
              {state === 'uploading' ? (
                <Loader className="animate-spin text-gold" size={16} />
              ) : state === 'done' ? (
                <CheckCircle className="text-emerald-600" size={16} />
              ) : (
                <X className="text-maroon" size={16} />
              )}
              <span className="line-clamp-1">{fileName}</span>
            </div>
          ))}
        </div>
      ) : null}

      {value.length ? (
        <div>
          <p className="mb-3 text-sm text-muted">
            All uploaded images are shown below. The first image is used as the primary product
            image.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {value.map((image, index) => (
              <motion.div
                key={image.url || image.displayUrl || `${index}`}
                whileHover={{ y: -2 }}
                className="overflow-hidden rounded-[1.25rem] border border-borderwarm bg-white shadow-sm"
              >
                <div className="relative aspect-square overflow-hidden bg-cream">
                  <img
                    src={image.url || image.displayUrl || image.thumbnail}
                    alt=""
                    className="h-full w-full object-contain object-center"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute left-2 top-2">
                    {index === 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                        <Star size={10} className="fill-white" />
                        Primary
                      </span>
                    ) : (
                      <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-maroon shadow transition hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 bg-black/55 px-3 py-2 text-center text-[10px] font-medium tracking-[0.16em] text-white">
                    {image.width}x{image.height}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-borderwarm px-3 py-2 text-primary transition hover:border-gold hover:text-gold disabled:opacity-30"
                    onClick={() => moveImage(index, index - 1)}
                    disabled={index === 0}
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-borderwarm px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition hover:border-gold hover:text-gold disabled:opacity-50"
                    onClick={() => makePrimary(index)}
                    disabled={index === 0}
                  >
                    First
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-borderwarm px-3 py-2 text-primary transition hover:border-gold hover:text-gold disabled:opacity-30"
                    onClick={() => moveImage(index, index + 1)}
                    disabled={index === value.length - 1}
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
