type StatusType = 'Ja' | 'Nej' | 'Delvis';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'default' | 'xs';
  variant?: 'badge' | 'dot';
}

export default function StatusBadge({ status, size = 'default', variant = 'badge' }: StatusBadgeProps) {
  const statusClass = status.toLowerCase();
  const sizeClass = size === 'xs' ? 'status-badge-xs' : '';
  const variantClass = variant === 'dot' ? 'dot' : '';

  return (
    <div
      className={`status-badge ${statusClass} ${sizeClass} ${variantClass}`}
      title={variant === 'dot' ? status : undefined}
      aria-label={variant === 'dot' ? status : undefined}
    >
      {variant === 'badge' ? status : ''}
    </div>
  );
}
