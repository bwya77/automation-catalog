import { useState, useEffect, useCallback } from 'react';
import TimeSeriesChart from './TimeSeriesChart';

interface Automation {
  id: string;
  name: string;
  description: string;
  author: string;
  department: string;
  customer?: string;
  status: 'live' | 'development' | 'backlog';
  tags: string[];
  time_saved_hours_per_month: number;
  annual_value_usd: number;
  closed?: string;
}

interface Props {
  automations: Automation[];
  title?: string;
}

interface DataPoint {
  month: string;
  hours: number;
  value: number;
}

export default function FilterableTimeSeriesChart({ automations, title = "Automation Impact Trend" }: Props) {
  const [timeSeriesData, setTimeSeriesData] = useState<DataPoint[]>([]);
  const [hasVisibleData, setHasVisibleData] = useState(true);

  const generateTimeSeriesData = useCallback((filteredAutomations: Automation[]): DataPoint[] => {
    // Filter to only live automations with a closed date
    const liveAutomations = filteredAutomations.filter(a => a.status === 'live' && a.closed);

    if (liveAutomations.length === 0) {
      return [];
    }

    // Get the last 12 months
    const months: { month: string; date: Date; hours: number; value: number }[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const compareDate = i === 0 ? now : endOfMonth;

      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        date: compareDate,
        hours: 0,
        value: 0
      });
    }

    // Calculate cumulative time saved and value for each month
    months.forEach((monthData) => {
      const automationsUpToThisMonth = liveAutomations.filter(a => {
        const closedDate = new Date(a.closed!);
        return closedDate <= monthData.date;
      });

      monthData.hours = automationsUpToThisMonth.reduce((sum, a) => sum + a.time_saved_hours_per_month, 0);
      monthData.value = Math.round(automationsUpToThisMonth.reduce((sum, a) => sum + (a.annual_value_usd / 12), 0));
    });

    return months.map(m => ({ month: m.month, hours: m.hours, value: m.value }));
  }, []);

  const applyFilters = useCallback(() => {
    // Get filter values from DOM
    const searchInput = document.getElementById('search') as HTMLInputElement | null;
    const departmentSelect = document.getElementById('department') as HTMLSelectElement | null;
    const tagSelect = document.getElementById('tag') as HTMLSelectElement | null;
    const authorSelect = document.getElementById('author') as HTMLSelectElement | null;
    const statusSelect = document.getElementById('status') as HTMLSelectElement | null;

    const searchTerm = searchInput?.value.toLowerCase() || '';
    const selectedDept = departmentSelect?.value || '';
    const selectedTag = tagSelect?.value || '';
    const selectedAuthor = authorSelect?.value || '';
    const selectedStatus = statusSelect?.value || '';

    // Get customer filter from URL
    const params = new URLSearchParams(window.location.search);
    const customerFilter = params.get('customer');

    // Filter automations
    const filtered = automations.filter(automation => {
      const name = automation.name.toLowerCase();
      const description = automation.description.toLowerCase();
      const department = automation.department;
      const tags = automation.tags;
      const author = automation.author;
      const status = automation.status;
      const customer = automation.customer || '';

      const matchesSearch = !searchTerm || name.includes(searchTerm) || description.includes(searchTerm);
      const matchesDept = !selectedDept || department === selectedDept;
      const matchesTag = !selectedTag || tags.includes(selectedTag);
      const matchesAuthor = !selectedAuthor || author === selectedAuthor;
      const matchesStatus = !selectedStatus || status === selectedStatus;
      const matchesCustomer = !customerFilter || customerFilter === 'all' || customer === customerFilter;

      return matchesSearch && matchesDept && matchesTag && matchesAuthor && matchesStatus && matchesCustomer;
    });

    const data = generateTimeSeriesData(filtered);
    setTimeSeriesData(data);
    setHasVisibleData(data.length > 0 && data.some(d => d.hours > 0 || d.value > 0));
  }, [automations, generateTimeSeriesData]);

  useEffect(() => {
    // Initial calculation
    applyFilters();

    // Get filter elements
    const searchInput = document.getElementById('search');
    const departmentSelect = document.getElementById('department');
    const tagSelect = document.getElementById('tag');
    const authorSelect = document.getElementById('author');
    const statusSelect = document.getElementById('status');

    // Add event listeners
    const handleFilterChange = () => applyFilters();

    searchInput?.addEventListener('input', handleFilterChange);
    departmentSelect?.addEventListener('change', handleFilterChange);
    tagSelect?.addEventListener('change', handleFilterChange);
    authorSelect?.addEventListener('change', handleFilterChange);
    statusSelect?.addEventListener('change', handleFilterChange);

    // Listen for clear filters button
    const clearButton = document.getElementById('clearFilters');
    clearButton?.addEventListener('click', () => {
      // Small delay to let the clear action complete
      setTimeout(handleFilterChange, 10);
    });

    // Cleanup
    return () => {
      searchInput?.removeEventListener('input', handleFilterChange);
      departmentSelect?.removeEventListener('change', handleFilterChange);
      tagSelect?.removeEventListener('change', handleFilterChange);
      authorSelect?.removeEventListener('change', handleFilterChange);
      statusSelect?.removeEventListener('change', handleFilterChange);
      clearButton?.removeEventListener('click', handleFilterChange);
    };
  }, [applyFilters]);

  if (!hasVisibleData) {
    return (
      <div className="card p-8 text-center mb-8">
        <p className="text-gray-600 dark:text-gray-400">
          No impact data available for the current filter selection. Only live automations with a completion date contribute to the trend.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <TimeSeriesChart data={timeSeriesData} title={title} />
    </div>
  );
}
