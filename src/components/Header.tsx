import { Link } from 'react-router-dom';

interface HeaderProps {
  onAddBrand: () => void;
}

export default function Header({ onAddBrand }: HeaderProps) {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="header-title">
            Svensk databas av Maximilian
          </Link>
          <div className="header-nav">
            <button className="add-brand-btn header-add-btn" onClick={onAddBrand} type="button">
              + Föreslå märke
            </button>
            <Link to="/om" className="add-brand-btn header-add-btn secondary-btn">
              Om
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
