"use client";

import { useState } from "react";

type PropertyGalleryProps = {
  images: string[];
  title: string;
};

export default function PropertyGallery({
  images,
  title,
}: PropertyGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(
    images[0] || ""
  );

  if (images.length === 0) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-3xl flex items-center justify-center">
        <p className="text-gray-500">
          Fotografia nie je k dispozícii
        </p>
      </div>
    );
  }

  return (
    <section>
      <div className="relative">
        <img
          src={selectedImage}
          alt={title}
          className="w-full h-[500px] object-cover"
        />

        <span className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-xl text-sm">
          {images.indexOf(selectedImage) + 1} / {images.length}
        </span>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
          {images.map((imageUrl, index) => {
            const isSelected =
              selectedImage === imageUrl;

            return (
              <button
                key={`${imageUrl}-${index}`}
                type="button"
                onClick={() =>
                  setSelectedImage(imageUrl)
                }
                className={`overflow-hidden rounded-xl border-4 transition ${
                  isSelected
                    ? "border-yellow-500"
                    : "border-transparent hover:border-gray-300"
                }`}
                aria-label={`Zobraziť fotografiu ${
                  index + 1
                }`}
              >
                <img
                  src={imageUrl}
                  alt={`${title} ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}