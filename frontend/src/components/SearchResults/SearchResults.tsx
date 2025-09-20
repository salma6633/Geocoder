import React, { useEffect, useRef } from 'react';
import { SearchResultItem, useSearchNavigation } from '../../services/searchService';
import './SearchResults.scss';

// Icons for categories
const PageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="currentColor"/>
  </svg>
);

const WidgetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 13V21H21V13H13ZM3 21H11V13H3V21ZM3 11H11V3H3V11ZM13 3V11H21V3H13Z" fill="currentColor"/>
  </svg>
);

const KeyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 19H16V15H14.2C13.35 17.2 11.1 18.6 8.7 18.6C5.3 18.6 2.6 15.9 2.6 12.5C2.6 9.1 5.3 6.4 8.7 6.4C11.1 6.4 13.35 7.8 14.2 10H22V19ZM9 13C9.83 13 10.5 12.33 10.5 11.5C10.5 10.67 9.83 10 9 10C8.17 10 7.5 10.67 7.5 11.5C7.5 12.33 8.17 13 9 13Z" fill="currentColor"/>
  </svg>
);

const UsageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="currentColor"/>
  </svg>
);

interface SearchResultsProps {
  results: SearchResultItem[];
  query: string;
  isVisible: boolean;
  onClose: () => void;
  onResultClick: (result: SearchResultItem) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  query, 
  isVisible, 
  onClose,
  onResultClick
}) => {
  const resultsRef = useRef<HTMLDivElement>(null);
  const { navigateToResult } = useSearchNavigation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'Enter': {
          // Handle enter key to select the focused result
          const focusedElement = document.querySelector('.search-result-item.focused');
          if (focusedElement) {
            const resultId = focusedElement.getAttribute('data-id');
            const result = results.find(r => r.id === resultId);
            if (result) {
              onResultClick(result);
              navigateToResult(result);
              onClose();
            }
          }
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          const currentFocused = document.querySelector('.search-result-item.focused');
          const nextElement = currentFocused 
            ? currentFocused.nextElementSibling?.classList.contains('search-result-item') 
              ? currentFocused.nextElementSibling 
              : document.querySelector('.search-result-item')
            : document.querySelector('.search-result-item');
          
          if (currentFocused) currentFocused.classList.remove('focused');
          if (nextElement) nextElement.classList.add('focused');
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const currentFocusedUp = document.querySelector('.search-result-item.focused');
          const prevElement = currentFocusedUp 
            ? currentFocusedUp.previousElementSibling?.classList.contains('search-result-item') 
              ? currentFocusedUp.previousElementSibling 
              : document.querySelectorAll('.search-result-item')[document.querySelectorAll('.search-result-item').length - 1]
            : document.querySelectorAll('.search-result-item')[document.querySelectorAll('.search-result-item').length - 1];
          
          if (currentFocusedUp) currentFocusedUp.classList.remove('focused');
          if (prevElement) prevElement.classList.add('focused');
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, results, onClose, onResultClick, navigateToResult]);

  // Group results by category
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResultItem[]>);

  // Get icon based on category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Pages':
        return <PageIcon />;
      case 'Widgets':
        return <WidgetIcon />;
      case 'API Keys':
        return <KeyIcon />;
      case 'Usage':
        return <UsageIcon />;
      default:
        return <PageIcon />;
    }
  };

  // Highlight matching text in results
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.trim()})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
    );
  };

  if (!isVisible) return null;

  return (
    <div className="search-results-container" ref={resultsRef}>
      <div className="search-results-header">
        <span className="results-count">{results.length} results</span>
        <button className="close-button" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      
      <div className="search-results-content">
        {results.length === 0 ? (
          <div className="no-results">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
            </svg>
            <p>No results found for "<strong>{query}</strong>"</p>
            <p className="suggestion">Try different keywords or check spelling</p>
          </div>
        ) : (
          Object.entries(groupedResults).map(([category, items]) => (
            <div key={category} className="result-category">
              <div className="category-header">
                <span className="category-icon">{getCategoryIcon(category)}</span>
                <h4>{category}</h4>
              </div>
              <div className="category-items">
                {items.map((result) => (
                  <div 
                    key={result.id} 
                    className="search-result-item"
                    data-id={result.id}
                    onClick={() => {
                      onResultClick(result);
                      navigateToResult(result);
                      onClose();
                    }}
                  >
                    <div className="result-icon">
                      {result.icon || getCategoryIcon(category)}
                    </div>
                    <div className="result-content">
                      <div className="result-title">
                        {highlightMatch(result.title, query)}
                      </div>
                      <div className="result-description">
                        {highlightMatch(result.description, query)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="search-results-footer">
        <div className="keyboard-shortcuts">
          <span className="shortcut">
            <kbd>↑</kbd><kbd>↓</kbd> to navigate
          </span>
          <span className="shortcut">
            <kbd>Enter</kbd> to select
          </span>
          <span className="shortcut">
            <kbd>Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
