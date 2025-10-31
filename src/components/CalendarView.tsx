import { useState, useEffect } from 'react';

interface ApiKeyExpiration {
  key: string;
  system: string;
  expiration: Date;
  automationId: string;
  automationName: string;
  notes?: string;
  daysUntil: number;
  isExpired: boolean;
  isUrgent: boolean;
  isWarning: boolean;
}

interface CalendarViewProps {
  apiKeys: Array<{
    key: string;
    system: string;
    expiration: string;
    automationId: string;
    automationName: string;
    notes?: string;
  }>;
}

export default function CalendarView({ apiKeys }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDaysUntilExpiration = (date: Date) => {
    return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const processedKeys: ApiKeyExpiration[] = apiKeys.map(key => {
    const expiration = new Date(key.expiration);
    const daysUntil = getDaysUntilExpiration(expiration);
    const isExpired = daysUntil < 0;
    const isUrgent = daysUntil > 0 && daysUntil <= 30;
    const isWarning = daysUntil > 30 && daysUntil <= 90;

    return {
      ...key,
      expiration,
      daysUntil,
      isExpired,
      isUrgent,
      isWarning,
    };
  });

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  // Get keys for a specific day
  const getKeysForDay = (date: Date) => {
    return processedKeys.filter(key => {
      const expDate = key.expiration;
      return (
        expDate.getDate() === date.getDate() &&
        expDate.getMonth() === date.getMonth() &&
        expDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const selectedDayKeys = selectedDate ? getKeysForDay(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>

          <button
            onClick={() => changeMonth(1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Next month"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-l border-t border-gray-200 dark:border-gray-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide py-2 border-r border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 border-l border-t border-gray-200 dark:border-gray-700">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="min-h-[100px] border-r border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50" />;
            }

            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const keysForDay = getKeysForDay(date);
            const hasKeys = keysForDay.length > 0;
            const hasExpired = keysForDay.some(k => k.isExpired);
            const hasUrgent = keysForDay.some(k => k.isUrgent);
            const hasWarning = keysForDay.some(k => k.isWarning);

            const isToday =
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear();

            const isSelected = selectedDate &&
              date.getDate() === selectedDate.getDate() &&
              date.getMonth() === selectedDate.getMonth() &&
              date.getFullYear() === selectedDate.getFullYear();

            const maxKeysToShow = 3;
            const visibleKeys = keysForDay.slice(0, maxKeysToShow);
            const remainingCount = keysForDay.length - maxKeysToShow;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(hasKeys ? date : null)}
                className={`
                  min-h-[100px] p-1.5 transition-all relative border-r border-b border-gray-200 dark:border-gray-700
                  ${hasKeys ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : 'cursor-default bg-white dark:bg-gray-900'}
                  ${isToday ? 'ring-2 ring-inset ring-primary-500 dark:ring-primary-400 bg-primary-50 dark:bg-primary-950' : ''}
                  ${isSelected ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-inset ring-primary-600' : ''}
                `}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-semibold ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {day}
                  </span>
                </div>

                {hasKeys && (
                  <div className="space-y-0.5 mt-1">
                    {visibleKeys.map((key, idx) => {
                      const bgClass = key.isExpired
                        ? 'bg-red-600 text-white'
                        : key.isUrgent
                        ? 'bg-red-500 text-white'
                        : key.isWarning
                        ? 'bg-yellow-500 text-gray-900'
                        : 'bg-green-500 text-white';

                      return (
                        <div
                          key={idx}
                          className={`text-[10px] px-1 py-0.5 rounded truncate font-medium ${bgClass}`}
                          title={key.key}
                        >
                          {key.key}
                        </div>
                      );
                    })}
                    {remainingCount > 0 && (
                      <div className="text-[10px] px-1 py-0.5 rounded bg-gray-400 dark:bg-gray-600 text-white font-medium">
                        +{remainingCount} more
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day details */}
      {selectedDate && selectedDayKeys.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formatDate(selectedDate)}
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedDayKeys.length} key(s) expiring
            </span>
          </div>

          <div className="space-y-3">
            {selectedDayKeys.map((key, index) => {
              const borderClass = key.isExpired
                ? 'border-red-700'
                : key.isUrgent
                ? 'border-red-500'
                : key.isWarning
                ? 'border-yellow-500'
                : 'border-green-500';

              const badgeClass = key.isExpired
                ? 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-200'
                : key.isUrgent
                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                : key.isWarning
                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';

              return (
                <div key={index} className={`pl-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-r-lg border-l-4 ${borderClass}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">{key.key}</h4>
                        <span className={`badge text-xs px-2 py-0.5 ${badgeClass}`}>
                          {key.daysUntil < 0 ? 'EXPIRED' : `${key.daysUntil} days`}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span className="font-medium">System:</span> {key.system}
                      </p>
                      <a
                        href={`/automations/${key.automationId}`}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {key.automationName} →
                      </a>
                      {key.notes && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                          {key.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Color Legend</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Keys are shown on their expiration date and color-coded by urgency:</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-red-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Expired (overdue)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-red-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Urgent (expires in ≤30 days)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-yellow-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Warning (expires in 31-90 days)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Good (expires in &gt;90 days)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
