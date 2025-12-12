import { useState } from 'react';

export default function About() {
  const [copied, setCopied] = useState(false);

  const handleEmailClick = () => {
    navigator.clipboard.writeText('maximilian.relam@gmail.com');
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="about-page">
      <div className="container">
        <div className="content">
          <section className="about-section about-hero">
            <h1 className="about-title">Svensktillverkat?</h1>
            <p className="about-intro">
              Det är inte alltid så enkelt som det låter. Den här databasen skapar transparens kring svenska varumärken och var deras produkter faktiskt tillverkas.
            </p>
          </section>

          <section className="about-section">
            <h2 className="about-heading">Om projektet</h2>

            <p>
              Den här databasen samlar information om svenska varumärken och deras tillverkningsprocesser. Målet är inte att peka finger, utan att ge dig som konsument möjlighet att fatta informerade beslut baserade på fakta.
            </p>
            <p>
              Vissa varumärken tillverkar allt i Sverige. Andra har flyttat produktionen utomlands men behållit sitt svenska arv i marknadsföringen. Många ligger någonstans däremellan, med vissa produktlinjer eller komponenter tillverkade i Sverige.
            </p>
          </section>

          <section className="about-section">
            <h2 className="about-heading">Så funkar det</h2>
            <p>Varje varumärke kategoriseras enligt följande:</p>

            <div className="category-explanation">
              <div className="category-item">
                <span className="category-label category-ja">Ja</span>
                <p>Produkterna tillverkas huvudsakligen i Sverige. Det kan innebära att hela produktionen sker här, eller att de mest kritiska komponenterna och monteringen görs i Sverige.</p>
              </div>

              <div className="category-item">
                <span className="category-label category-delvis">Delvis</span>
                <p>Delar av produktionen sker i Sverige, men betydande delar görs även utomlands. Detta kan innebära att vissa produktlinjer tillverkas i Sverige medan andra inte gör det, eller att komponenter kommer från olika länder.</p>
              </div>

              <div className="category-item">
                <span className="category-label category-nej">Nej</span>
                <p>Produktionen sker huvudsakligen utomlands. Varumärket kan vara svenskt i ursprung eller ägande, men tillverkningen är förlagd till andra länder.</p>
              </div>
            </div>

            <p>
              Informationen samlas in från företagens egna uppgifter, årsredovisningar, pressmeddelanden och offentliga källor. Jag strävar efter att hålla databasen så aktuell och korrekt som möjligt.
            </p>
          </section>

          <section className="about-section">
            <h2 className="about-heading">Upptäcker du att något är fel?</h2>
            <p>
              Företag förändras, produktionen flyttas, och ägare byts ut. Om du upptäcker att information i databasen är föråldrad eller felaktig, hör gärna av dig till{' '}
              <span
                className="email-link"
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
                maximilian.relam@gmail.com
              </span>
            </p>
            {copied && <span className="copied-message">E-postadress kopierad!</span>}
            <p>Jag tar gärna emot:</p>
            <ul className="about-list">
              <li>Rättelser av befintlig information</li>
              <li>Förslag på nya varumärken att lägga till</li>
              <li>Uppdateringar om förändringar i produktion eller ägande</li>
              <li>Källor som kan verifiera information</li>
            </ul>
            <p>All feedback hjälper till att göra databasen mer användbar för alla.</p>
          </section>

          <section className="about-section">
            <h2 className="about-heading">Kommande funktioner</h2>
            <p>Framtida funktioner inkluderar bland annat:</p>
            <ul className="about-list">
              <li>Tipsa om nya varumärken direkt på sidan</li>
              <li>Rapportera felaktig information med ett klick</li>
              <li>M.fl..</li>

            </ul>
            <p>Har du förslag på funktioner som skulle göra databasen mer användbar? Hör av dig!</p>
          </section>

          <section className="about-section">
            <h2 className="about-heading">Transparens & begränsningar</h2>
            <p>
              <strong>Detta är ett oberoende projekt</strong> som drivs av intresse för konsumenttransparens och svensk industri. Ingen information är sponsrad eller betald.
            </p>
            <p><strong>Begränsningar att ha i återhake:</strong></p>
            <ul className="about-list">
              <li>Tillverkningsinformation kan ändras över tid</li>
              <li>Komplexa koncernstrukturer gör det ibland svårt att ge ett enkelt svar</li>
              <li>"Tillverkad i Sverige" kan betyda olika saker för olika produkter</li>
              <li>Databasen uppdateras löpande men är inte alltid realtidsuppdaterad</li>
            </ul>
          </section>

          {/* <div className="about-signature">
            //Max
          </div> */}
        </div>
      </div>
    </div>
  );
}
