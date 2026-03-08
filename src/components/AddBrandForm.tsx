import { useState, useEffect, useRef } from 'react';
import { sanityWriteClient } from '../lib/sanityClient';

const COUNTRIES: { iso: string; name: string }[] = [
  { iso: 'SE', name: 'Sverige' },
  { iso: 'DE', name: 'Tyskland' },
  { iso: 'FR', name: 'Frankrike' },
  { iso: 'IT', name: 'Italien' },
  { iso: 'ES', name: 'Spanien' },
  { iso: 'PT', name: 'Portugal' },
  { iso: 'GB', name: 'Storbritannien' },
  { iso: 'NO', name: 'Norge' },
  { iso: 'DK', name: 'Danmark' },
  { iso: 'FI', name: 'Finland' },
  { iso: 'NL', name: 'Nederländerna' },
  { iso: 'BE', name: 'Belgien' },
  { iso: 'CH', name: 'Schweiz' },
  { iso: 'AT', name: 'Österrike' },
  { iso: 'PL', name: 'Polen' },
  { iso: 'CZ', name: 'Tjeckien' },
  { iso: 'RO', name: 'Rumänien' },
  { iso: 'HU', name: 'Ungern' },
  { iso: 'TR', name: 'Turkiet' },
  { iso: 'US', name: 'USA' },
  { iso: 'CA', name: 'Kanada' },
  { iso: 'MX', name: 'Mexiko' },
  { iso: 'BR', name: 'Brasilien' },
  { iso: 'AR', name: 'Argentina' },
  { iso: 'CN', name: 'Kina' },
  { iso: 'JP', name: 'Japan' },
  { iso: 'KR', name: 'Sydkorea' },
  { iso: 'IN', name: 'Indien' },
  { iso: 'BD', name: 'Bangladesh' },
  { iso: 'VN', name: 'Vietnam' },
  { iso: 'ID', name: 'Indonesien' },
  { iso: 'TH', name: 'Thailand' },
  { iso: 'PK', name: 'Pakistan' },
  { iso: 'MA', name: 'Marocko' },
  { iso: 'ET', name: 'Etiopien' },
  { iso: 'ZA', name: 'Sydafrika' },
  { iso: 'AU', name: 'Australien' },
  { iso: 'NZ', name: 'Nya Zeeland' },
  { iso: 'LU', name: 'Luxemburg' },
  { iso: 'IE', name: 'Irland' },
  { iso: 'GR', name: 'Grekland' },
  { iso: 'HR', name: 'Kroatien' },
  { iso: 'SK', name: 'Slovakien' },
  { iso: 'LT', name: 'Litauen' },
  { iso: 'LV', name: 'Lettland' },
  { iso: 'EE', name: 'Estland' },
  { iso: 'UA', name: 'Ukraina' },
  { iso: 'RU', name: 'Ryssland' },
];

interface CountrySelectProps {
  id: string;
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
}

function CountrySelect({ id, value, onChange, placeholder = 'Välj land...' }: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedName = COUNTRIES.find((c) => c.iso === value)?.name ?? '';
  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (iso: string) => {
    onChange(iso);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="country-select-wrapper" ref={wrapperRef}>
      <input
        id={id}
        type="text"
        className="country-select-input"
        value={open ? query : selectedName}
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { setOpen(true); setQuery(''); }}
        onClick={() => { setOpen(true); setQuery(''); }}
        autoComplete="off"
        readOnly={!open}
      />
      {open && (
        <div className="country-select-dropdown">
          {filtered.length === 0 ? (
            <div className="country-select-option" style={{ color: '#888' }}>Inga resultat</div>
          ) : (
            filtered.map((c) => (
              <div
                key={c.iso}
                className={`country-select-option${value === c.iso ? ' selected' : ''}`}
                onMouseDown={() => handleSelect(c.iso)}
              >
                {c.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface CountryMultiSelectProps {
  selected: string[];
  onChange: (names: string[]) => void;
}

function CountryMultiSelect({ selected, onChange }: CountryMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) &&
      !selected.includes(c.name)
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (name: string) => {
    onChange([...selected, name]);
    setQuery('');
  };

  const handleRemove = (name: string) => {
    onChange(selected.filter((s) => s !== name));
  };

  return (
    <div className="country-select-wrapper" ref={wrapperRef}>
      <div className="suggestion-countries">
        {selected.map((name) => (
          <span key={name} className="suggestion-country-chip">
            {name}
            <button
              type="button"
              className="chip-remove"
              onMouseDown={(e) => { e.preventDefault(); handleRemove(name); }}
              aria-label={`Ta bort ${name}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          className="suggestion-country-input country-select-input"
          placeholder="Sök land..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          autoComplete="off"
        />
      </div>
      {open && (
        <div className="country-select-dropdown">
          {filtered.length === 0 ? (
            <div className="country-select-option" style={{ color: '#888' }}>
              {query ? 'Inga resultat' : 'Alla länder tillagda'}
            </div>
          ) : (
            filtered.map((c) => (
              <div
                key={c.iso}
                className="country-select-option"
                onMouseDown={() => handleSelect(c.name)}
              >
                {c.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface AddBrandFormProps {
  onCancel: () => void;
  onSubmit: () => void;
}

interface FormValues {
  varumarke: string;
  kategori: string;
  tillverkadISverige: 'Ja' | 'Nej' | 'Delvis' | '';
  borsnoterat: 'Ja' | 'Nej' | '';
  brandLand: string;
  tillverkningslander: string[];
  moderbolag: string;
  moderbolagLand: string;
  agare: string;
  agareLand: string;
  intro: string;
  hallbarhetsFokus: string;
  kommentarer: string;
}

export default function AddBrandForm({ onCancel, onSubmit }: AddBrandFormProps) {
  const [formValues, setFormValues] = useState<FormValues>({
    varumarke: '',
    kategori: '',
    tillverkadISverige: '',
    borsnoterat: '',
    brandLand: 'SE',
    tillverkningslander: [],
    moderbolag: '',
    moderbolagLand: '',
    agare: '',
    agareLand: '',
    intro: '',
    hallbarhetsFokus: '',
    kommentarer: '',
  });
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Ange en giltig e-postadress.');
      return;
    }

    setSubmitting(true);

    try {
      await sanityWriteClient.create({
        _type: 'brandProposal',
        ...formValues,
        email,
        submittedAt: new Date().toISOString(),
        status: 'pending',
      });
      setSubmitted(true);
      setTimeout(() => onSubmit(), 4000);
    } catch (err) {
      console.error('Brand proposal submit failed:', err);
      setError('Något gick fel. Försök igen eller kontakta oss via e-post.');
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="add-brand-backdrop" onClick={onCancel} />
      <div className="add-brand-drawer">
        <div className="add-brand-drawer-header">
          <h2 className="add-brand-drawer-title">Lägg till märke</h2>
          <button className="add-brand-drawer-close" onClick={onCancel} aria-label="Stäng">✕</button>
        </div>

        {submitted ? (
          <div style={{ padding: '24px' }}>
            <div className="suggestion-success">
              Tack! Ditt förslag har skickats och kommer granskas inom kort.
            </div>
          </div>
        ) : (
          <form className="suggestion-form" style={{ padding: '24px' }} onSubmit={handleSubmit} noValidate>
            <div className="suggestion-form-grid">
              <div className="suggestion-field">
                <label htmlFor="add-varumarke">Varumärke</label>
                <input
                  id="add-varumarke"
                  type="text"
                  value={formValues.varumarke}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, varumarke: e.target.value }))}
                />
                <p className="suggestion-helper-text">Vad heter varumärket?</p>
              </div>

              <div className="suggestion-field">
                <label htmlFor="add-kategori">Kategori</label>
                <input
                  id="add-kategori"
                  type="text"
                  value={formValues.kategori}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, kategori: e.target.value }))}
                />
                <p className="suggestion-helper-text">T.ex. Kläder, Skor, Möbler, Elektronik</p>
              </div>

              <div className="suggestion-field">
                <label>Tillverkad i Sverige</label>
                <div className="suggestion-radio-group">
                  {(['Ja', 'Delvis', 'Nej'] as const).map((option) => (
                    <label key={option} className="suggestion-radio-label">
                      <input
                        type="radio"
                        name="add-tillverkadISverige"
                        value={option}
                        checked={formValues.tillverkadISverige === option}
                        onChange={() => setFormValues((prev) => ({ ...prev, tillverkadISverige: option }))}
                      />
                      {option}
                    </label>
                  ))}
                </div>
                <p className="suggestion-helper-text">Tillverkas produkterna (åtminstone delvis) i Sverige?</p>
              </div>

              <div className="suggestion-field">
                <label>Börsnoterat</label>
                <div className="suggestion-radio-group">
                  {(['Ja', 'Nej'] as const).map((option) => (
                    <label key={option} className="suggestion-radio-label">
                      <input
                        type="radio"
                        name="add-borsnoterat"
                        value={option}
                        checked={formValues.borsnoterat === option}
                        onChange={() => setFormValues((prev) => ({ ...prev, borsnoterat: option }))}
                      />
                      {option}
                    </label>
                  ))}
                </div>
                <p className="suggestion-helper-text">Är företaget eller dess ägare börsnoterat?</p>
              </div>

              <div className="suggestion-field suggestion-field-full">
                <label>Tillverkningsländer</label>
                <CountryMultiSelect
                  selected={formValues.tillverkningslander}
                  onChange={(names) => setFormValues((prev) => ({ ...prev, tillverkningslander: names }))}
                />
                <p className="suggestion-helper-text">Välj alla länder där produkterna tillverkas</p>
              </div>

              <div className="suggestion-field">
                <label htmlFor="add-moderbolag">Moderbolag</label>
                <input
                  id="add-moderbolag"
                  type="text"
                  value={formValues.moderbolag}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, moderbolag: e.target.value }))}
                />
                <p className="suggestion-helper-text">Det direkta moderbolaget (lämna tomt om okänt)</p>
              </div>

              <div className="suggestion-field">
                <label htmlFor="add-moderbolagLand">Moderbolagets land</label>
                <CountrySelect
                  id="add-moderbolagLand"
                  value={formValues.moderbolagLand}
                  onChange={(iso) => setFormValues((prev) => ({ ...prev, moderbolagLand: iso }))}
                  placeholder="Välj land..."
                />
                <p className="suggestion-helper-text">Moderbolagets registreringsland</p>
              </div>

              <div className="suggestion-field">
                <label htmlFor="add-agare">Ägare</label>
                <input
                  id="add-agare"
                  type="text"
                  value={formValues.agare}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, agare: e.target.value }))}
                />
                <p className="suggestion-helper-text">Den yttersta ägaren i ägarkedjan (lämna tomt om okänt)</p>
              </div>

              <div className="suggestion-field">
                <label htmlFor="add-agareLand">Ägarens land</label>
                <CountrySelect
                  id="add-agareLand"
                  value={formValues.agareLand}
                  onChange={(iso) => setFormValues((prev) => ({ ...prev, agareLand: iso }))}
                  placeholder="Välj land..."
                />
                <p className="suggestion-helper-text">Ägarens registreringsland</p>
              </div>

              <div className="suggestion-field suggestion-field-full">
                <label htmlFor="add-intro">Om varumärket</label>
                <textarea
                  id="add-intro"
                  value={formValues.intro}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, intro: e.target.value }))}
                />
                <p className="suggestion-helper-text">Kort beskrivning, t.ex. år grundat, produkttyp, historia</p>
              </div>

              <div className="suggestion-field">
                <label htmlFor="add-hallbarhet">Hållbarhetsfokus</label>
                <input
                  id="add-hallbarhet"
                  type="text"
                  value={formValues.hallbarhetsFokus}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, hallbarhetsFokus: e.target.value }))}
                />
                <p className="suggestion-helper-text">T.ex. certifieringar, återbruk, klimatmål (valfritt)</p>
              </div>

              <div className="suggestion-field">
                <label htmlFor="add-email">
                  Din e-postadress <span className="suggestion-required">*</span>
                </label>
                <input
                  id="add-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="suggestion-helper-text">Obligatorisk uppgift</p>
                {emailError && <p className="suggestion-field-error">{emailError}</p>}
              </div>

              <div className="suggestion-field suggestion-field-full">
                <label htmlFor="add-kommentarer">Eventuella kommentarer</label>
                <textarea
                  id="add-kommentarer"
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
        )}
      </div>
    </>
  );
}
