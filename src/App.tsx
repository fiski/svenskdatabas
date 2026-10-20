import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Data from './pages/Data';
import AddBrandForm from './components/AddBrandForm';

function App() {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <Router>
      <div>
        <Header onAddBrand={() => setShowAddForm(true)} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/data" element={<Data />} />
          <Route path="/om" element={<About />} />
        </Routes>
        <Footer />
        {showAddForm && (
          <AddBrandForm
            onCancel={() => setShowAddForm(false)}
            onSubmit={() => setShowAddForm(false)}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
