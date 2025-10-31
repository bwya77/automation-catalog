import { useState } from 'react';

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
  automations: Array<{
    id: string;
    name: string;
    closed?: string;
  }>;
}

type ViewMode = 'calendar' | 'list';

interface CompletedAutomation {
  id: string;
  name: string;
  closed: Date;
}

export default function CalendarView({ apiKeys, automations }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDaysUntilExpiration = (date: Date) => {
    return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  // Helper to parse date string and create local date (ignoring timezone)
  const parseLocalDate = (dateInput: string | Date): Date => {
    // If already a Date object, extract components and create local date
    if (dateInput instanceof Date) {
      return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
    }

    // Parse YYYY-MM-DD format directly without timezone conversion
    const [year, month, day] = dateInput.split('T')[0].split('-').map(Number);
    // Month is 0-indexed in JavaScript Date
    return new Date(year, month - 1, day);
  };

  const processedKeys: ApiKeyExpiration[] = apiKeys.map(key => {
    const expiration = parseLocalDate(key.expiration);
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

  // Process completed automations
  const completedAutomations: CompletedAutomation[] = automations
    .filter(a => a.closed)
    .map(a => ({
      id: a.id,
      name: a.name,
      closed: parseLocalDate(a.closed!),
    }));

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

  // Get completed automations for a specific day
  const getCompletedAutomationsForDay = (date: Date) => {
    return completedAutomations.filter(automation => {
      const closedDate = automation.closed;
      return (
        closedDate.getDate() === date.getDate() &&
        closedDate.getMonth() === date.getMonth() &&
        closedDate.getFullYear() === date.getFullYear()
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

  const goToToday = () => {
    setCurrentDate(new Date());
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
  const selectedDayCompleted = selectedDate ? getCompletedAutomationsForDay(selectedDate) : [];

  // Group keys by month for list view
  const keysByMonth = processedKeys.reduce((acc, key) => {
    const monthKey = key.expiration.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(key);
    return acc;
  }, {} as Record<string, ApiKeyExpiration[]>);

  const sortedMonths = Object.entries(keysByMonth).sort(([, keysA], [, keysB]) => {
    return keysA[0].expiration.getTime() - keysB[0].expiration.getTime();
  });

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">View Options</h2>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendar
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                List
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
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

          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
            >
              Today
            </button>
          </div>

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
            const completedForDay = getCompletedAutomationsForDay(date);
            const hasKeys = keysForDay.length > 0;
            const hasCompleted = completedForDay.length > 0;
            const hasAnyEvents = hasKeys || hasCompleted;

            const isToday =
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear();

            const isSelected = selectedDate &&
              date.getDate() === selectedDate.getDate() &&
              date.getMonth() === selectedDate.getMonth() &&
              date.getFullYear() === selectedDate.getFullYear();

            const maxEventsToShow = 3;
            const allEvents = [
              ...keysForDay.map(k => ({ type: 'key' as const, data: k })),
              ...completedForDay.map(c => ({ type: 'completed' as const, data: c }))
            ];
            const visibleEvents = allEvents.slice(0, maxEventsToShow);
            const remainingCount = allEvents.length - maxEventsToShow;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(hasAnyEvents ? date : null)}
                className={`
                  min-h-[100px] p-1.5 transition-all relative border-r border-b border-gray-200 dark:border-gray-700
                  ${hasAnyEvents ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : 'cursor-default bg-white dark:bg-gray-900'}
                  ${isToday ? 'ring-2 ring-inset ring-primary-500 dark:ring-primary-400 bg-primary-50 dark:bg-primary-950' : ''}
                  ${isSelected ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-inset ring-primary-600' : ''}
                `}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-semibold ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {day}
                  </span>
                </div>

                {hasAnyEvents && (
                  <div className="space-y-0.5 mt-1">
                    {visibleEvents.map((event, idx) => {
                      if (event.type === 'key') {
                        const key = event.data;
                        const bgClass = key.isExpired
                          ? 'bg-red-600 text-white'
                          : key.isUrgent
                          ? 'bg-red-500 text-white'
                          : key.isWarning
                          ? 'bg-yellow-500 text-gray-900'
                          : 'bg-green-500 text-white';

                        return (
                          <div
                            key={`key-${idx}`}
                            className={`text-[10px] px-1 py-0.5 rounded truncate font-medium ${bgClass}`}
                            title={key.key}
                          >
                            🔑 {key.key}
                          </div>
                        );
                      } else {
                        const automation = event.data;
                        return (
                          <div
                            key={`completed-${idx}`}
                            className="text-[10px] px-1 py-0.5 rounded truncate font-medium bg-blue-500 text-white"
                            title={automation.name}
                          >
                            ✓ {automation.name}
                          </div>
                        );
                      }
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
      )}

      {/* Selected day details */}
      {viewMode === 'calendar' && selectedDate && (selectedDayKeys.length > 0 || selectedDayCompleted.length > 0) && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formatDate(selectedDate)}
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedDayKeys.length > 0 && `${selectedDayKeys.length} key(s) expiring`}
              {selectedDayKeys.length > 0 && selectedDayCompleted.length > 0 && ' • '}
              {selectedDayCompleted.length > 0 && `${selectedDayCompleted.length} automation(s) completed`}
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

            {selectedDayCompleted.map((automation, index) => (
              <div key={`completed-${index}`} className="pl-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-r-lg border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">{automation.name}</h4>
                      <span className="badge text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                        ✓ Completed
                      </span>
                    </div>
                    <a
                      href={`/automations/${automation.id}`}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      View automation →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      {viewMode === 'calendar' && (
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Color Legend</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Events shown on the calendar:</p>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">🔑 Expiring Keys (by urgency):</p>
            <div className="flex flex-wrap gap-4 ml-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded bg-red-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Expired (overdue)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded bg-red-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Urgent (≤30 days)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded bg-yellow-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Warning (31-90 days)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded bg-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Good (&gt;90 days)</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">✓ Automations:</p>
            <div className="flex items-center gap-2 ml-4">
              <div className="w-4 h-3 rounded bg-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Completed on this date</span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {sortedMonths.map(([month, keys]) => {
            const hasUrgent = keys.some(k => k.isUrgent || k.isExpired);

            return (
              <div key={month} className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{month}</h2>
                  {hasUrgent && (
                    <span className="badge bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm px-3 py-1">
                      ⚠️ Urgent
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {keys.map((key, index) => {
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
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-gray-900 dark:text-gray-100">{key.key}</h3>
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
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {formatDate(key.expiration)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
