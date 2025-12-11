type StatusType = 'Ja' | 'Nej' | 'Delvis';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'default' | 'xs';
}

export default function StatusBadge({ status, size = 'default' }: StatusBadgeProps) {
  const statusClass = status.toLowerCase();
  const sizeClass = size === 'xs' ? 'status-badge-xs' : '';

  return (
    <div className={`status-badge ${statusClass} ${sizeClass}`}>
      {status}
    </div>
  );
}
