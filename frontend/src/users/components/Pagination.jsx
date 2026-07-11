import React, { useState } from 'react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const [goToPage, setGoToPage] = useState('');

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (end - start < 4) {
      if (start === 1) {
        end = Math.min(totalPages, 5);
      } else if (end === totalPages) {
        start = Math.max(1, totalPages - 4);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleGoTo = (e) => {
    if (e.key === 'Enter') {
      let page = parseInt(goToPage, 10);
      if (page >= 1 && page <= totalPages) {
        onPageChange(page);
      }
      setGoToPage('');
    }
  };

  return (
    <nav className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full" aria-label="Page navigation">
      <ul className="flex items-center -space-x-px h-10 text-sm">
        <li>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-on-surface-variant bg-surface-container border border-e-0 border-outline rounded-s-lg hover:bg-surface-variant hover:text-on-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
        </li>
        {getPageNumbers().map(pageNum => (
          <li key={pageNum}>
            <button
              onClick={() => onPageChange(pageNum)}
              className={`flex items-center justify-center px-4 h-10 leading-tight border transition-colors ${
                currentPage === pageNum
                  ? 'text-primary bg-surface-variant border-outline'
                  : 'text-on-surface-variant bg-surface-container border-outline hover:bg-surface-variant hover:text-on-surface'
              }`}
            >
              {pageNum}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center px-4 h-10 leading-tight text-on-surface-variant bg-surface-container border border-outline rounded-e-lg hover:bg-surface-variant hover:text-on-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </li>
      </ul>

      <div className="flex items-center gap-2 text-sm text-on-surface-variant sm:ml-4">
        <span>Go to</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={goToPage}
          onChange={(e) => setGoToPage(e.target.value)}
          onKeyDown={handleGoTo}
          className="w-16 h-10 px-2 py-1 text-center bg-surface-container border border-outline rounded-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-on-surface-variant/50"
        />
        <span>page</span>
      </div>
    </nav>
  );
}
