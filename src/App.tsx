import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';

function App() {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <Router>
      <div>
        <Header onAddBrand={() => setShowAddForm(true)} />
        <Routes>
          <Route path="/" element={<Home showAddForm={showAddForm} onCloseAddForm={() => setShowAddForm(false)} />} />
          <Route path="/om" element={<About />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
