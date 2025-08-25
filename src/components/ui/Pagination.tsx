import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisiblePages = 5,
  className
}: PaginationProps) {
  const getVisiblePages = () => {
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - halfVisible);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  const showStartEllipsis = visiblePages[0] > 2;
  const showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1;

  const buttonClass = (active = false, disabled = false) => clsx(
    'px-3 py-2 text-sm font-medium rounded-md transition-colors',
    active 
      ? 'bg-primary-600 text-white' 
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
    disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent'
  );

  if (totalPages <= 1) return null;

  return (
    <nav className={clsx('flex items-center justify-center space-x-1', className)}>
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={buttonClass(false, currentPage === 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* First page */}
      {showFirstLast && visiblePages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className={buttonClass(currentPage === 1)}
          >
            1
          </button>
          {showStartEllipsis && (
            <span className="px-2 text-gray-500">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          )}
        </>
      )}

      {/* Visible pages */}
      {visiblePages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={buttonClass(currentPage === page)}
        >
          {page}
        </button>
      ))}

      {/* Last page */}
      {showFirstLast && visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {showEndEllipsis && (
            <span className="px-2 text-gray-500">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className={buttonClass(currentPage === totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={buttonClass(false, currentPage === totalPages)}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}