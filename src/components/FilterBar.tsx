import { useState } from 'react';

interface FilterBarProps {
  departments: string[];
  tags: string[];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  department: string;
  tag: string;
}

export default function FilterBar({ departments, tags, onFilterChange }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    department: '',
    tag: '',
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { search: '', department: '', tag: '' };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = filters.search || filters.department || filters.tag;

  return (
    <div className="card p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search automations..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Department Filter */}
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            id="department"
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Tag Filter */}
        <div>
          <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">
            Tag
          </label>
          <select
            id="tag"
            value={filters.tag}
            onChange={(e) => handleFilterChange('tag', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Button */}
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className={`w-full px-4 py-2 rounded-md transition-colors ${
              hasActiveFilters
                ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
