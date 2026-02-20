import { useState, useEffect } from 'react';

interface GuestModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (rooms: number, adults: number, children: number) => void;
  initialRooms?: number;
  initialAdults?: number;
  initialChildren?: number;
}

interface CounterRowProps {
  label: string;
  sublabel?: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

function CounterRow({ label, sublabel, value, min, max, onChange }: CounterRowProps) {
  return (
    <div className="flex items-center justify-between py-5">
      <div>
        <p className="text-base font-semibold text-dark">{label}</p>
        {sublabel && (
          <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          aria-label={`减少${label}`}
          className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-colors ${
            value <= min
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-dark hover:border-accent hover:text-accent active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined text-xl">remove</span>
        </button>
        <span className="text-lg font-display font-bold text-dark w-6 text-center">
          {value}
        </span>
        <button
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          aria-label={`增加${label}`}
          className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-colors ${
            value >= max
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-dark hover:border-accent hover:text-accent active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined text-xl">add</span>
        </button>
      </div>
    </div>
  );
}

export default function GuestModal({
  open,
  onClose,
  onConfirm,
  initialRooms = 1,
  initialAdults = 2,
  initialChildren = 0,
}: GuestModalProps) {
  const [rooms, setRooms] = useState(initialRooms);
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setRooms(initialRooms);
      setAdults(initialAdults);
      setChildren(initialChildren);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open, initialRooms, initialAdults, initialChildren]);

  const handleConfirm = () => {
    onConfirm(rooms, adults, children);
  };

  const handleBackdropClick = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
      />

      {/* Panel */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] transition-transform duration-300 ease-out ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex justify-center pt-3">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <button
            onClick={handleBackdropClick}
            className="p-3 rounded-full hover:bg-black/5 transition-colors text-dark"
            aria-label="关闭"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
          <h2 className="text-lg font-display font-bold text-dark">
            选择客房和入住人数
          </h2>
          <div className="w-10" />
        </div>

        {/* Counter Rows */}
        <div className="px-6 divide-y divide-gray-100">
          <CounterRow
            label="间数"
            sublabel="客房数量"
            value={rooms}
            min={1}
            max={10}
            onChange={setRooms}
          />
          <CounterRow
            label="成人"
            sublabel="18岁及以上"
            value={adults}
            min={1}
            max={20}
            onChange={setAdults}
          />
          <CounterRow
            label="儿童"
            sublabel="0-17岁"
            value={children}
            min={0}
            max={10}
            onChange={setChildren}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 pb-safe-bottom">
          <button
            onClick={handleConfirm}
            className="w-full bg-dark text-white py-4 rounded-2xl text-lg font-bold shadow-lg hover:bg-dark-hover transition-all active:scale-[0.98]"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
