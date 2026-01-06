import { useState, useEffect } from 'react';

export default function SearchBar({ onSearch, onTimeFilterChange, activeTimeFilter, searchResults }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== undefined) {
        setIsSearching(true);
        onSearch(searchQuery);
        setTimeout(() => setIsSearching(false), 300);
      }
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, onSearch]);

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className="search-container">
      {/* Search Input */}
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Search expenses (e.g., food, travel...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button 
            onClick={handleClearSearch}
            className="search-clear-btn"
            type="button"
          >
            ✕
          </button>
        )}
        {isSearching && (
          <div className="search-loading">🔍</div>
        )}
      </div>

      {/* Time Filter Buttons */}
      <div className="time-filter-container">
        {['today', 'week', 'month', 'year', 'all'].map(filter => (
          <button
            key={filter}
            onClick={() => onTimeFilterChange(filter)}
            className={`time-filter-btn ${activeTimeFilter === filter ? 'active' : ''}`}
            type="button"
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Search Results Summary */}
      {searchQuery && searchResults && (
        <div className="search-results-summary">
          <div className="search-stats">
            <span className="search-count">
              {searchResults.count} result{searchResults.count !== 1 ? 's' : ''}
            </span>
            <span className="search-total">
              Total: ₹{searchResults.total.toFixed(2)}
            </span>
          </div>
          <div className="search-query">
            Showing results for "{searchQuery}" in {activeTimeFilter === 'all' ? 'all time' : `last ${activeTimeFilter}`}
          </div>
        </div>
      )}
    </div>
  );
}