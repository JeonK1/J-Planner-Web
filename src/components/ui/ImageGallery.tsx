import { useState } from 'react'
import { Modal } from './Modal'

interface ImageGalleryProps {
  images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (images.length === 0) return null

  return (
    <>
      <div className="mt-3 flex flex-wrap gap-2">
        {images.map((src, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelectedImage(src)}
            className="overflow-hidden rounded-lg border border-gray-200 transition-opacity hover:opacity-80"
          >
            <img
              src={src}
              alt={`이미지 ${index + 1}`}
              className="h-20 w-20 object-cover"
            />
          </button>
        ))}
      </div>
      <Modal
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        className="max-w-2xl"
      >
        {selectedImage && (
          <img
            src={selectedImage}
            alt="확대 이미지"
            className="w-full rounded-lg"
          />
        )}
      </Modal>
    </>
  )
}
