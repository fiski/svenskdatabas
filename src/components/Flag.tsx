import 'flag-icons/css/flag-icons.min.css';

interface FlagProps {
  countryCode: string;  // ISO 3166-1 alpha-2 (e.g., "SE", "DE")
  size?: 'small' | 'medium';
}

export default function Flag({ countryCode, size = 'small' }: FlagProps) {
  if (!countryCode) return null;

  return (
    <span
      className={`fi fi-${countryCode.toLowerCase()} flag-icon flag-${size}`}
      role="img"
      aria-label={`${countryCode} flag`}
    />
  );
}
