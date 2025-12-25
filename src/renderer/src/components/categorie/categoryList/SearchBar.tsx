import React from 'react';
import { SearchBarProps } from './types';

export const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="mb-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher une catégorie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 sm:py-3 pl-10 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm sm:text-base focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-150"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/30 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
};
