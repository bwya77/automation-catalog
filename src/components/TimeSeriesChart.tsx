import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DataPoint {
  month: string;
  hours: number;
}

interface Props {
  data: DataPoint[];
  title: string;
}

export default function TimeSeriesChart({ data, title }: Props) {
  const [isDark, setIsDark] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const windowSize = 6; // Show 6 months at a time

  useEffect(() => {
    // Check if dark mode is enabled
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    // Watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Initialize to show the most recent months
  useEffect(() => {
    if (data.length > windowSize) {
      setStartIndex(data.length - windowSize);
    }
  }, [data.length]);

  const textColor = isDark ? '#e5e7eb' : '#111827';
  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const tooltipBg = isDark ? '#1f2937' : '#ffffff';
  const tooltipBorder = isDark ? '#374151' : '#e5e7eb';

  const visibleData = data.slice(startIndex, startIndex + windowSize);
  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + windowSize < data.length;

  const handlePrev = () => {
    if (canGoPrev) {
      setStartIndex(Math.max(0, startIndex - 1));
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setStartIndex(Math.min(data.length - windowSize, startIndex + 1));
    }
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous months"
          >
            ←
          </button>
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next months"
          >
            →
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={visibleData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="month" stroke={textColor} />
          <YAxis stroke={textColor} />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              color: textColor
            }}
          />
          <Legend wrapperStyle={{ color: textColor }} />
          <Line
            type="monotone"
            dataKey="hours"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
