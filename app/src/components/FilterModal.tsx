import { useState, useEffect, useRef } from 'react';

interface FilterState {
  priceRange: string | null;
  starLevel: string | null;
}

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

const priceRanges = [
  { label: '¥250以下', value: '0-250' },
  { label: '¥250-500', value: '250-500' },
  { label: '¥500-800', value: '500-800' },
  { label: '¥800-1200', value: '800-1200' },
  { label: '¥1200以上', value: '1200-99999' },
];

const starLevels = [
  { label: '经济型', sub: '2星', value: '2' },
  { label: '舒适型', sub: '3星', value: '3' },
  { label: '高档型', sub: '4星', value: '4' },
  { label: '豪华型', sub: '5星', value: '5' },
];

export default function FilterModal({ open, onClose, onApply, initialFilters }: FilterModalProps) {
  const [priceRange, setPriceRange] = useState<string | null>(initialFilters?.priceRange ?? null);
  const [starLevel, setStarLevel] = useState<string | null>(initialFilters?.starLevel ?? null);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const prevOpenRef = useRef(false);

  // Sync state on open edge (false → true)
  if (open && !prevOpenRef.current) {
    setPriceRange(initialFilters?.priceRange ?? null);
    setStarLevel(initialFilters?.starLevel ?? null);
  }
  prevOpenRef.current = open;

  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
    } else {
      setAnimating(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleClear = () => {
    setPriceRange(null);
    setStarLevel(null);
  };

  const handleApply = () => {
    onApply({ priceRange, starLevel });
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: animating ? 1 : 0 }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-[430px] bg-white rounded-t-[24px] shadow-2xl transition-transform duration-300 ease-out"
        style={{ transform: animating ? 'translateY(0)' : 'translateY(100%)' }}
      >
        <div className="flex justify-center pt-3">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="关闭"
          >
            <span className="material-symbols-outlined text-dark text-xl">close</span>
          </button>
          <h2 className="text-lg font-bold text-dark">筛选</h2>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-8 max-h-[60vh] overflow-y-auto">
          {/* Price Range */}
          <div>
            <h3 className="text-base font-bold text-dark mb-4">价格区间</h3>
            <div className="grid grid-cols-3 gap-3">
              {priceRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setPriceRange(priceRange === range.value ? null : range.value)}
                  aria-pressed={priceRange === range.value}
                  className={`px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    priceRange === range.value
                      ? 'bg-accent/20 border-2 border-accent text-dark'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Star Level */}
          <div>
            <h3 className="text-base font-bold text-dark mb-4">酒店星级</h3>
            <div className="grid grid-cols-2 gap-3">
              {starLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setStarLevel(starLevel === level.value ? null : level.value)}
                  aria-pressed={starLevel === level.value}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    starLevel === level.value
                      ? 'bg-accent/20 border-2 border-accent text-dark'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span>{level.label}</span>
                  <span className="text-xs text-gray-500">({level.sub})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-6 pt-4 pb-safe-bottom border-t border-gray-100">
          <button
            onClick={handleClear}
            className="flex-1 py-3.5 rounded-2xl text-sm font-bold border border-gray-200 text-dark hover:bg-gray-50 transition-colors"
          >
            清空
          </button>
          <button
            onClick={handleApply}
            className="flex-[2] py-3.5 rounded-2xl text-sm font-bold bg-dark text-white hover:bg-dark-hover transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}

export type { FilterState };
