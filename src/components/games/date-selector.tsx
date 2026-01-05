'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface DateSelectorProps {
  selectedDate: Date;
}

export function DateSelector({ selectedDate }: DateSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);

    const params = new URLSearchParams(searchParams.toString());
    params.set('date', newDate.toISOString().split('T')[0]);
    router.push(`/nfl?${params.toString()}`);
  };

  const goToToday = () => {
    router.push('/nfl');
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={() => changeDate(-1)}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        ← Previous Day
      </button>

      <div className="flex items-center space-x-3">
        <div className="text-lg font-semibold text-gray-900">
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
        {!isToday && (
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
          >
            Today
          </button>
        )}
      </div>

      <button
        onClick={() => changeDate(1)}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        Next Day →
      </button>
    </div>
  );
}
