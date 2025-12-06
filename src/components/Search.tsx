import { useRef } from 'react';

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Search({ value, onChange }: SearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {value.trim() && (
        <div className="search-chip">
          <span className="search-chip-text">{value}</span>
          <button
            className="search-chip-close"
            onClick={handleClear}
            aria-label="Clear search"
            type="button"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
