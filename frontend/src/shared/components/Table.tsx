import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Column<T> {
  header: string;
  accessor?: keyof T;
  sortKey?: string;
  isSortable?: boolean;
  renderCell?: (item: T) => React.ReactNode;
  cellClassName?: string;
  headerClassName?: string;
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKeyExtractor: (item: T) => string | number;
  currentSortConfig?: SortConfig;
  onSort?: (sortKey: string) => void;
  renderMobileCard?: (item: T) => React.ReactNode;
  mobileBreakpoint?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

function Table<T>({
  columns,
  data,
  rowKeyExtractor,
  currentSortConfig,
  onSort,
  renderMobileCard,
  mobileBreakpoint = 'lg',
  className,
}: TableProps<T>) {
  const breakpointClass = {
    sm: 'sm:hidden',
    md: 'md:hidden', 
    lg: 'lg:hidden',
    xl: 'xl:hidden',
  }[mobileBreakpoint];

  const desktopBreakpoint = {
    sm: 'hidden sm:block',
    md: 'hidden md:block',
    lg: 'hidden lg:block', 
    xl: 'hidden xl:block',
  }[mobileBreakpoint];

  const renderSortIcon = (column: Column<T>) => {
    if (!column.isSortable || !onSort) return null;
    
    const sortKey = column.sortKey || String(column.accessor);
    const isActive = currentSortConfig?.field === sortKey;
    
    return (
      <button
        onClick={() => onSort(sortKey)}
        className="ml-1 inline-flex items-center"
      >
        {isActive ? (
          currentSortConfig?.direction === 'asc' ? (
            <ChevronUp size={14} className="text-primary-600" />
          ) : (
            <ChevronDown size={14} className="text-primary-600" />
          )
        ) : (
          <ChevronUp size={14} className="text-gray-400" />
        )}
      </button>
    );
  };

  const getCellValue = (item: T, column: Column<T>) => {
    if (column.renderCell) {
      return column.renderCell(item);
    }
    if (column.accessor) {
      return item[column.accessor] as React.ReactNode;
    }
    return null;
  };

  return (
    <div className={cn('overflow-hidden', className)}>
      {/* Desktop Table */}
      <div className={cn('overflow-x-auto', desktopBreakpoint)}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.headerClassName,
                    column.isSortable && 'cursor-pointer hover:bg-gray-100'
                  )}
                >
                  <div className="flex items-center">
                    {column.header}
                    {renderSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr 
                key={rowKeyExtractor(item)} 
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((column, index) => (
                  <td
                    key={index}
                    className={cn(
                      'px-6 py-4 whitespace-nowrap',
                      column.cellClassName
                    )}
                  >
                    {getCellValue(item, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      {renderMobileCard && (
        <div className={cn('space-y-4', breakpointClass)}>
          {data.map((item) => (
            <div key={rowKeyExtractor(item)}>
              {renderMobileCard(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Table;