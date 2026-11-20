import React, { useState } from 'react';
import { GalleryItem } from '../../types';
import { Image, Maximize2, X, Eye } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface HistoricalImageGalleryProps {
  items?: GalleryItem[];
  primaryImageUrl?: string;
  primaryImageCaption?: string;
  primaryEra?: string;
}

export const HistoricalImageGallery: React.FC<HistoricalImageGalleryProps> = ({
  items = [],
  primaryImageUrl,
  primaryImageCaption,
  primaryEra,
}) => {
  const [activePreview, setActivePreview] = useState<GalleryItem | null>(null);

  // Combine primary and extra items
  const allItems: GalleryItem[] = [];
  if (primaryImageUrl) {
    allItems.push({
      imageUrl: primaryImageUrl,
      caption: primaryImageCaption || 'Historical Illustration',
      era: primaryEra,
    });
  }
  if (items && items.length > 0) {
    items.forEach((item) => {
      if (item.imageUrl !== primaryImageUrl) {
        allItems.push(item);
      }
    });
  }

  if (allItems.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {allItems.map((item, idx) => (
          <div
            key={idx}
            onClick={() => setActivePreview(item)}
            className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/70 hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg aspect-video flex flex-col justify-end"
          >
            {/* Background Image with Fallback Pattern */}
            <img
              src={item.imageUrl}
              alt={item.caption}
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
              onError={(e) => {
                // Fallback to high quality music gradient if remote image fails
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1520523839898-507127053c37?auto=format&fit=crop&w=800&q=80';
              }}
            />

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

            {/* Top Right Zoom Icon Badge */}
            <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md">
              <Maximize2 size={14} />
            </div>

            {/* Bottom Caption Overlay */}
            <div className="relative z-10 p-3 sm:p-4">
              {item.era && (
                <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-black/70 px-2 py-0.5 rounded-md mb-1 border border-amber-400/20">
                  {item.era}
                </span>
              )}
              <p className="text-xs text-slate-200 font-medium line-clamp-2 leading-relaxed">
                {item.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Preview Modal */}
      {activePreview && (
        <Modal
          isOpen={!!activePreview}
          onClose={() => setActivePreview(null)}
          title={activePreview.era ? `Historical Plate • ${activePreview.era}` : 'Historical Plate'}
          size="xl"
        >
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[50dvh] sm:max-h-[60dvh]">
              <img
                src={activePreview.imageUrl}
                alt={activePreview.caption}
                className="w-full h-auto max-h-[50dvh] sm:max-h-[60dvh] object-contain"
              />
            </div>
            <p className="text-sm text-slate-300 text-center font-medium leading-relaxed px-4">
              {activePreview.caption}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
