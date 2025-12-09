import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="header-title">
            Svensk databas av Maximilian
          </Link>
          <Link to="/om" className="header-link">
            Om
          </Link>
        </div>
      </div>
    </header>
  );
}
