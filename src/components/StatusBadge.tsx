type StatusType = 'Ja' | 'Nej' | 'Delvis';

interface StatusBadgeProps {
  status: StatusType;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusClass = status.toLowerCase();

  return (
    <div className={`status-badge ${statusClass}`}>
      {status}
    </div>
  );
}
