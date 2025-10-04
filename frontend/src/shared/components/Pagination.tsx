import React from 'react';
import Button from '../../components/Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const pageRange = 5;
  let startPage = Math.max(1, currentPage - Math.floor(pageRange / 2));
  let endPage = Math.min(totalPages, startPage + pageRange - 1);

  if (endPage === totalPages && totalPages > pageRange) {
    startPage = totalPages - pageRange + 1;
  } else if (endPage < pageRange && totalPages > pageRange) {
    endPage = pageRange;
  }

  if (totalPages <= pageRange) {
    startPage = 1;
    endPage = totalPages;
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    if (i > 0) {
      pageNumbers.push(i);
    }
  }

  return (
    <div className={`flex justify-center items-center mt-8 space-x-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Anterior
      </Button>
      
      {pageNumbers.map((pageNum) => (
        <Button
          key={pageNum}
          variant={pageNum === currentPage ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onPageChange(pageNum)}
          className="w-8 h-8 p-0"
        >
          {pageNum}
        </Button>
      ))}
      
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Siguiente
      </Button>
    </div>
  );
};

export default Pagination;