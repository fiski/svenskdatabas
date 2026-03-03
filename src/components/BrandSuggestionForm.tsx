import { useState } from 'react';
import { Brand } from '../types/brand';
import { sanityWriteClient } from '../lib/sanityClient';
import KoncernstrukturTree from './KoncernstrukturTree';

interface BrandSuggestionFormProps {
  brand: Brand;
  onCancel: () => void;
  onSubmit: () => void;
}

interface FormValues {
  varumarke: string;
  kategori: string;
  tillverkadISverige: 'Ja' | 'Nej' | 'Delvis';
  tillverkningslander: string[];
  intro: string;
  hallbarhetsFokus: string;
  koncernNote: string;
  kommentarer: string;
}

export default function BrandSuggestionForm({ brand, onCancel, onSubmit }: BrandSuggestionFormProps) {
  const [formValues, setFormValues] = useState<FormValues>({
    varumarke: brand.varumärke,
    kategori: brand.kategori,
    tillverkadISverige: brand.tillverkadISverige,
    tillverkningslander: [...(brand.merInfo.tillverkningsländer ?? [])],
    intro: brand.merInfo.intro ?? '',
    hallbarhetsFokus: brand.merInfo.hallbarhetsFokus ?? '',
    koncernNote: '',
    kommentarer: '',
  });
  const [email, setEmail] = useState('');
  const [countryInput, setCountryInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleAddCountry = () => {
    const trimmed = countryInput.trim();
    if (trimmed && !formValues.tillverkningslander.includes(trimmed)) {
      setFormValues((prev) => ({
        ...prev,
        tillverkningslander: [...prev.tillverkningslander, trimmed],
      }));
    }
    setCountryInput('');
  };

  const handleRemoveCountry = (country: string) => {
    setFormValues((prev) => ({
      ...prev,
      tillverkningslander: prev.tillverkningslander.filter((c) => c !== country),
    }));
  };

  const handleCountryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCountry();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Ange en giltig e-postadress.');
      return;
    }

    setSubmitting(true);

    const originalValues = {
      varumarke: brand.varumärke,
      kategori: brand.kategori,
      tillverkadISverige: brand.tillverkadISverige,
      tillverkningslander: brand.merInfo.tillverkningsländer ?? [],
      intro: brand.merInfo.intro ?? '',
      hallbarhetsFokus: brand.merInfo.hallbarhetsFokus ?? '',
    };

    try {
      await sanityWriteClient.create({
        _type: 'suggestion',
        brandRef: { _type: 'reference', _ref: brand.id },
        brandName: brand.varumärke,
        email: email,
        suggestedChanges: formValues,
        originalValues,
        submittedAt: new Date().toISOString(),
        status: 'pending',
      });
      setSubmitted(true);
      setTimeout(() => onSubmit(), 2000);
    } catch {
      setError('Något gick fel. Försök igen eller kontakta oss via e-post.');
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="suggestion-form">
        <div className="suggestion-success">
          Tack! Ditt förslag har skickats och kommer granskas inom kort.
        </div>
      </div>
    );
  }

  return (
    <div className="suggestion-form">
      <div className="suggestion-form-title">Föreslå ändring för {brand.varumärke}</div>
      <form onSubmit={handleSubmit} noValidate>
        <div className="suggestion-form-grid">
          <div className="suggestion-field">
            <label htmlFor={`varumarke-${brand.id}`}>Varumärke</label>
            <input
              id={`varumarke-${brand.id}`}
              type="text"
              value={formValues.varumarke}
              onChange={(e) => setFormValues((prev) => ({ ...prev, varumarke: e.target.value }))}
            />
          </div>

          <div className="suggestion-field">
            <label htmlFor={`kategori-${brand.id}`}>Kategori</label>
            <input
              id={`kategori-${brand.id}`}
              type="text"
              value={formValues.kategori}
              onChange={(e) => setFormValues((prev) => ({ ...prev, kategori: e.target.value }))}
            />
          </div>

          <div className="suggestion-field">
            <label>Tillverkad i Sverige</label>
            <div className="suggestion-radio-group">
              {(['Ja', 'Delvis', 'Nej'] as const).map((option) => (
                <label key={option} className="suggestion-radio-label">
                  <input
                    type="radio"
                    name={`tillverkadISverige-${brand.id}`}
                    value={option}
                    checked={formValues.tillverkadISverige === option}
                    onChange={() =>
                      setFormValues((prev) => ({ ...prev, tillverkadISverige: option }))
                    }
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div className="suggestion-field">
            <label>Tillverkningsländer</label>
            <div className="suggestion-countries">
              {formValues.tillverkningslander.map((country) => (
                <span key={country} className="suggestion-country-chip">
                  {country}
                  <button
                    type="button"
                    className="chip-remove"
                    onClick={() => handleRemoveCountry(country)}
                    aria-label={`Ta bort ${country}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                className="suggestion-country-input"
                placeholder="Lägg till land..."
                value={countryInput}
                onChange={(e) => setCountryInput(e.target.value)}
                onKeyDown={handleCountryKeyDown}
                onBlur={handleAddCountry}
              />
            </div>
          </div>

          <div className="suggestion-field">
            <label htmlFor={`intro-${brand.id}`}>Om varumärket</label>
            <textarea
              id={`intro-${brand.id}`}
              value={formValues.intro}
              onChange={(e) => setFormValues((prev) => ({ ...prev, intro: e.target.value }))}
            />
          </div>

          <div className="suggestion-field">
            <label htmlFor={`hallbarhet-${brand.id}`}>Hållbarhetsfokus</label>
            <input
              id={`hallbarhet-${brand.id}`}
              type="text"
              value={formValues.hallbarhetsFokus}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, hallbarhetsFokus: e.target.value }))
              }
            />
          </div>

          <div className="suggestion-field">
            <label>Nuvarande koncernstruktur</label>
            <div className="suggestion-tree-display">
              <KoncernstrukturTree
                koncernstruktur={brand.merInfo.koncernstruktur}
                currentBrandName={brand.varumärke}
                currentBrandStatus={brand.tillverkadISverige}
              />
            </div>
          </div>

          <div className="suggestion-field">
            <label htmlFor={`koncern-${brand.id}`}>Notering om koncernstruktur</label>
            <textarea
              id={`koncern-${brand.id}`}
              value={formValues.koncernNote}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, koncernNote: e.target.value }))
              }
              placeholder="Beskriv önskade ändringar i ägarstruktur..."
            />
          </div>

          <div className="suggestion-field">
            <label htmlFor={`email-${brand.id}`}>
              Din e-postadress <span className="suggestion-required">*</span>
            </label>
            <input
              id={`email-${brand.id}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="suggestion-helper-text">Obligatorisk uppgift</p>
            {emailError && <p className="suggestion-field-error">{emailError}</p>}
          </div>

          <div className="suggestion-field suggestion-field-full">
            <label htmlFor={`kommentarer-${brand.id}`}>Eventuella kommentarer</label>
            <textarea
              id={`kommentarer-${brand.id}`}
              value={formValues.kommentarer}
              onChange={(e) => setFormValues((prev) => ({ ...prev, kommentarer: e.target.value }))}
              placeholder="Ange gärna källor, länkar eller annan information som stödjer ditt förslag..."
            />
          </div>
        </div>

        {error && <div className="suggestion-error">{error}</div>}

        <div className="suggestion-form-actions">
          <button type="submit" className="suggestion-submit-btn" disabled={submitting}>
            {submitting ? 'Skickar...' : 'Skicka förslag'}
          </button>
          <button type="button" className="suggestion-cancel-btn" onClick={onCancel}>
            Avbryt
          </button>
        </div>
      </form>
    </div>
  );
}
