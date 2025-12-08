import { useState, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Search from './components/Search';
import DataTable from './components/DataTable';
import brandsData from './data/brands.json';
import { SortColumn, SortDirection } from './types/brand';

// Swedish locale comparator for proper Å, Ä, Ö ordering
const compareSwedish = (a: string, b: string): number => {
  return a.localeCompare(b, 'sv-SE', { sensitivity: 'base' });
};

// Status order for sorting
const statusOrder = { 'Ja': 1, 'Delvis': 2, 'Nej': 3 };

function App() {
  const [currentInput, setCurrentInput] = useState('');
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const addSearchTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !searchTags.includes(trimmedTag)) {
      setSearchTags([...searchTags, trimmedTag]);
      setCurrentInput('');
    }
  };

  const removeSearchTag = (tagToRemove: string) => {
    setSearchTags(searchTags.filter(tag => tag !== tagToRemove));
  };

  const clearAllTags = () => {
    setSearchTags([]);
    setCurrentInput('');
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Same column: cycle through asc → desc → null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      // New column: start with ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter brands based on search tags and current input (hybrid live search)
  const filteredBrands = useMemo(() => {
    let results = brandsData.brands;

    // Step 1: Filter by tags (AND logic between tags)
    if (searchTags.length > 0) {
      results = results.filter((brand) => {
        // Brand must match ALL tags (AND logic)
        return searchTags.every((tag) => {
          const tagLower = tag.toLowerCase();

          // Each tag matches if found in name OR category OR status
          const matchesName = brand.varumärke.toLowerCase().includes(tagLower);
          const matchesCategory = brand.kategori.toLowerCase().includes(tagLower);
          const matchesStatus = brand.tillverkadISverige.toLowerCase().includes(tagLower);

          return matchesName || matchesCategory || matchesStatus;
        });
      });
    }

    // Step 2: Filter by current input (live search)
    const trimmedInput = currentInput.trim();
    if (trimmedInput) {
      const inputLower = trimmedInput.toLowerCase();
      results = results.filter((brand) => {
        const matchesName = brand.varumärke.toLowerCase().includes(inputLower);
        const matchesCategory = brand.kategori.toLowerCase().includes(inputLower);
        const matchesStatus = brand.tillverkadISverige.toLowerCase().includes(inputLower);
        return matchesName || matchesCategory || matchesStatus;
      });
    }

    // Step 3: Sort results
    if (sortColumn && sortDirection) {
      results = [...results].sort((a, b) => {
        let comparison = 0;

        if (sortColumn === 'varumärke') {
          comparison = compareSwedish(a.varumärke, b.varumärke);
        } else if (sortColumn === 'kategori') {
          comparison = compareSwedish(a.kategori, b.kategori);
        } else if (sortColumn === 'tillverkadISverige') {
          comparison = statusOrder[a.tillverkadISverige] - statusOrder[b.tillverkadISverige];
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return results;
  }, [searchTags, currentInput, sortColumn, sortDirection]);

  return (
    <div>
      <Header />
      <main className="main">
        <div className="container">
          <div className="content">
            <Hero />
            <div className="search-wrapper">
              <Search
                currentInput={currentInput}
                onInputChange={setCurrentInput}
                searchTags={searchTags}
                onAddTag={addSearchTag}
                onRemoveTag={removeSearchTag}
                onClearAll={clearAllTags}
              />
            </div>
            <DataTable
              brands={filteredBrands}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
