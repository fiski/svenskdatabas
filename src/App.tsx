import { useState, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Search from './components/Search';
import DataTable from './components/DataTable';
import brandsData from './data/brands.json';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter brands based on search query
  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) {
      return brandsData.brands;
    }

    const query = searchQuery.toLowerCase();

    return brandsData.brands.filter((brand) => {
      // Search in brand name
      const matchesName = brand.varumärke.toLowerCase().includes(query);

      // Search in categories
      const matchesCategory = brand.kategori.toLowerCase().includes(query);

      return matchesName || matchesCategory;
    });
  }, [searchQuery]);

  return (
    <div>
      <Header />
      <main className="main">
        <div className="container">
          <div className="content">
            <Hero />
            <div className="search-wrapper">
              <Search value={searchQuery} onChange={setSearchQuery} />
              <DataTable brands={filteredBrands} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
