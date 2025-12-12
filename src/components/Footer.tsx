import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [copied, setCopied] = useState(false);

  const handleEmailClick = () => {
    navigator.clipboard.writeText('maximilian.relam@gmail.com');
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Left: Brand & Description */}
          <div className="footer-brand">
            <h3 className="footer-title">Svensk databas</h3>
            <p className="footer-description">
              Transparens kring svenska varumärken och deras tillverkning
            </p>
          </div>

          {/* Right: Navigation Links */}
          <div className="footer-links">
            <div className="footer-nav">
              <Link to="/om" className="footer-link">Om</Link>
              <a
                href="https://www.linkedin.com/in/maximilianrelam/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                LinkedIn
              </a>
              <span
                className="footer-link footer-email"
                onClick={handleEmailClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleEmailClick();
                  }
                }}
              >
                Kontakt
              </span>
              {copied && <span className="footer-copied">E-post kopierad!</span>}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
