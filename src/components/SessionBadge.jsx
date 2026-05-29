import { useEffect, useState } from 'react';

/**
 * SessionBadge
 * Props: { status, subject, department, year, section, expiresAt }
 */
const SessionBadge = ({ status, subject, department, year, section, expiresAt }) => {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (status !== 'active' || !expiresAt) return;

    const update = () => {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${m}:${String(s).padStart(2, '0')} remaining`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [status, expiresAt]);

  if (status === 'active') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span className="badge badge-active">
          <span className="pulse-dot" />
          LIVE
        </span>
        {subject && (
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            {subject}
          </span>
        )}
        {(department || year || section) && (
          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
            }}
          >
            {[department, year && `Year ${year}`, section && `Sec ${section}`]
              .filter(Boolean)
              .join(' · ')}
          </span>
        )}
        {timeRemaining && (
          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--accent-success)',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            ⏱ {timeRemaining}
          </span>
        )}
      </div>
    );
  }

  return (
    <span className="badge badge-closed">
      ⏹ Closed
    </span>
  );
};

export default SessionBadge;
