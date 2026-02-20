import { useState, useEffect, useCallback } from 'react';

interface CalendarModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (checkIn: Date, checkOut: Date) => void;
  initialCheckIn?: Date | null;
  initialCheckOut?: Date | null;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBeforeDay(a: Date, b: Date) {
  const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return aa < bb;
}

function isBetween(date: Date, start: Date, end: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return d > s && d < e;
}

function diffDays(start: Date, end: Date) {
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarModal({
  open,
  onClose,
  onConfirm,
  initialCheckIn,
  initialCheckOut,
}: CalendarModalProps) {
  const [checkIn, setCheckIn] = useState<Date | null>(initialCheckIn ?? null);
  const [checkOut, setCheckOut] = useState<Date | null>(initialCheckOut ?? null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setCheckIn(initialCheckIn ?? null);
      setCheckOut(initialCheckOut ?? null);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open, initialCheckIn, initialCheckOut]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const months: { year: number; month: number }[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  const handleDateClick = useCallback(
    (date: Date) => {
      if (isBeforeDay(date, today)) return;
      if (!checkIn || (checkIn && checkOut)) {
        setCheckIn(date);
        setCheckOut(null);
      } else {
        if (isBeforeDay(date, checkIn) || isSameDay(date, checkIn)) {
          setCheckIn(date);
          setCheckOut(null);
        } else {
          setCheckOut(date);
        }
      }
    },
    [checkIn, checkOut, today]
  );

  const handleConfirm = () => {
    if (checkIn && checkOut) {
      onConfirm(checkIn, checkOut);
    }
  };

  const handleBackdropClick = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const nights = checkIn && checkOut ? diffDays(checkIn, checkOut) : 0;

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
        className={`absolute bottom-0 left-0 right-0 bg-cream rounded-t-[24px] max-h-[85dvh] flex flex-col transition-transform duration-300 ease-out ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex justify-center pt-3">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <button
            onClick={handleBackdropClick}
            className="p-3 rounded-full hover:bg-black/5 transition-colors text-dark"
            aria-label="关闭"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
          <h2 className="text-lg font-display font-bold text-dark">选择日期</h2>
          <div className="w-10" />
        </div>

        {/* Weekday Header */}
        <div className="grid grid-cols-7 px-4 pb-2 border-b border-gray-100">
          {WEEKDAYS.map((d, i) => (
            <div
              key={d}
              className={`text-center text-xs font-semibold py-2 ${
                i === 0 || i === 6 ? 'text-red-400' : 'text-gray-400'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {months.map(({ year, month }) => {
            const daysInMonth = getDaysInMonth(year, month);
            const firstDay = getFirstDayOfWeek(year, month);
            const cells: (number | null)[] = [];
            for (let i = 0; i < firstDay; i++) cells.push(null);
            for (let d = 1; d <= daysInMonth; d++) cells.push(d);

            return (
              <div key={`${year}-${month}`} className="mt-6">
                <h3 className="text-base font-display font-bold text-dark mb-3 px-1">
                  {year}年{month + 1}月
                </h3>
                <div className="grid grid-cols-7">
                  {cells.map((day, idx) => {
                    if (day === null) {
                      return <div key={`empty-${idx}`} className="h-12" />;
                    }

                    const date = new Date(year, month, day);
                    const isPast = isBeforeDay(date, today);
                    const isCheckIn = checkIn && isSameDay(date, checkIn);
                    const isCheckOut = checkOut && isSameDay(date, checkOut);
                    const isInRange =
                      checkIn && checkOut && isBetween(date, checkIn, checkOut);
                    const dayOfWeek = date.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                    let bgClass = '';
                    let textClass = isPast
                      ? 'text-gray-400'
                      : isWeekend
                        ? 'text-red-400'
                        : 'text-dark';
                    let label = '';
                    let roundedClass = '';

                    if (isCheckIn) {
                      bgClass = 'bg-accent';
                      textClass = 'text-dark';
                      label = '入住';
                      roundedClass = checkOut
                        ? 'rounded-l-xl'
                        : 'rounded-xl';
                    } else if (isCheckOut) {
                      bgClass = 'bg-accent';
                      textClass = 'text-dark';
                      label = '离店';
                      roundedClass = 'rounded-r-xl';
                    } else if (isInRange) {
                      bgClass = 'bg-accent/10';
                    }

                    return (
                      <button
                        type="button"
                        key={day}
                        className={`h-12 flex flex-col items-center justify-center relative ${bgClass} ${roundedClass}`}
                        onClick={() => !isPast && handleDateClick(date)}
                        aria-label={`${month + 1}月${day}日`}
                        aria-disabled={isPast ? "true" : undefined}
                      >
                        <span
                          className={`text-sm font-medium ${textClass} ${
                            !isPast && !isCheckIn && !isCheckOut && !isInRange
                              ? 'hover:text-accent'
                              : ''
                          }`}
                        >
                          {day}
                        </span>
                        {label && (
                          <span className="text-[9px] font-bold text-dark/70 leading-none mt-0.5">
                            {label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 pb-safe-bottom border-t border-gray-100 bg-white">
          <button
            onClick={handleConfirm}
            disabled={!checkIn || !checkOut}
            className={`w-full py-4 rounded-2xl text-lg font-bold transition-all active:scale-[0.98] ${
              checkIn && checkOut
                ? 'bg-dark text-white shadow-lg'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {checkIn && checkOut ? `完成 (${nights}晚)` : '请选择日期'}
          </button>
        </div>
      </div>
    </div>
  );
}
