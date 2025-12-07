import { useRef } from 'react';

interface SearchProps {
  currentInput: string;
  onInputChange: (value: string) => void;
  searchTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onClearAll: () => void;
}

export default function Search({
  currentInput,
  onInputChange,
  searchTags,
  onAddTag,
  onRemoveTag,
  onClearAll
}: SearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    if (currentInput.trim()) {
      onInputChange('');
    } else {
      onClearAll();
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentInput.trim()) {
        onAddTag(currentInput);
      }
    } else if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <>
      <div className="search">
        <div className="search-icon">
          <svg viewBox="0 0 48 48" fill="none">
            <path
              d="M34 32L40 38M22 34C15.3726 34 10 28.6274 10 22C10 15.3726 15.3726 10 22 10C28.6274 10 34 15.3726 34 22C34 28.6274 28.6274 34 22 34Z"
              stroke="#6e6e6e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Sök i registret"
          className="search-input"
          value={currentInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {searchTags.length > 0 && (
        <div className="search-chips-container">
          {searchTags.map((tag) => (
            <div key={tag} className="search-chip">
              <span className="search-chip-text">{tag}</span>
              <button
                className="search-chip-close"
                onClick={() => onRemoveTag(tag)}
                aria-label={`Ta bort sökning: ${tag}`}
                type="button"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
