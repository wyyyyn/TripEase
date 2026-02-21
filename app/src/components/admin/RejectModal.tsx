import { useState, useRef } from 'react';

interface RejectModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export default function RejectModal({ open, onClose, onConfirm }: RejectModalProps) {
  const [reason, setReason] = useState('');
  const prevOpenRef = useRef(false);

  // Reset reason on open edge (false → true)
  if (open && !prevOpenRef.current) {
    setReason('');
  }
  prevOpenRef.current = open;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 w-full max-w-md relative z-10">
        <h3 className="text-lg font-bold text-dark mb-4">拒绝审核</h3>
        <div className="mb-5">
          <label className="block text-sm font-medium text-dark mb-1.5">拒绝原因</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50/50 focus:border-accent focus:outline-none transition-colors"
            rows={4}
            placeholder="请输入拒绝原因..."
          />
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="border border-gray-200 text-dark font-bold py-2.5 px-5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            取消
          </button>
          <button
            onClick={() => {
              onConfirm(reason);
              setReason('');
            }}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-5 rounded-xl transition-colors text-sm"
          >
            确认拒绝
          </button>
        </div>
      </div>
    </div>
  );
}
