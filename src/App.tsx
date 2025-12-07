import { useState, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Search from './components/Search';
import DataTable from './components/DataTable';
import brandsData from './data/brands.json';

function App() {
  const [currentInput, setCurrentInput] = useState('');
  const [searchTags, setSearchTags] = useState<string[]>([]);

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

  // Filter brands based on search tags
  const filteredBrands = useMemo(() => {
    if (searchTags.length === 0) {
      return brandsData.brands;
    }

    return brandsData.brands.filter((brand) => {
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
  }, [searchTags]);

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
            <DataTable brands={filteredBrands} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
