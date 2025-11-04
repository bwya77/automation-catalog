import { useEffect, useState } from 'react';

interface CustomerFilterProps {
  customers: string[];
}

export default function CustomerFilter({ customers }: CustomerFilterProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');

  useEffect(() => {
    // Get current filter from URL query params
    const params = new URLSearchParams(window.location.search);
    const customerParam = params.get('customer');
    if (customerParam) {
      setSelectedCustomer(customerParam);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    // Update URL with the selected filter
    const url = new URL(window.location.href);
    if (value === 'all') {
      url.searchParams.delete('customer');
    } else {
      url.searchParams.set('customer', value);
    }

    // Navigate to the new URL
    window.location.href = url.toString();
  };

  return (
    <div className="relative inline-block">
      <select
        value={selectedCustomer}
        onChange={handleChange}
        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors cursor-pointer"
      >
        <option value="all">All Customers</option>
        {customers.map((customer) => (
          <option key={customer} value={customer}>
            {customer.charAt(0).toUpperCase() + customer.slice(1)}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-300">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}
