/**
 * StatCard — displays a KPI metric with icon, value, title, subtitle, and optional trend.
 * Props: { title, value, icon, color, subtitle, trend }
 *   color: 'primary' | 'success' | 'warning' | 'danger' | 'secondary'
 *   trend: { value: number, label: string } — positive = up, negative = down
 */

const COLOR_MAP = {
  primary: {
    bg: 'rgba(99,102,241,0.12)',
    color: '#6366f1',
    gradient: 'linear-gradient(90deg, #6366f1, #818cf8)',
  },
  secondary: {
    bg: 'rgba(6,182,212,0.12)',
    color: '#06b6d4',
    gradient: 'linear-gradient(90deg, #06b6d4, #22d3ee)',
  },
  success: {
    bg: 'rgba(16,185,129,0.12)',
    color: '#10b981',
    gradient: 'linear-gradient(90deg, #10b981, #34d399)',
  },
  warning: {
    bg: 'rgba(245,158,11,0.12)',
    color: '#f59e0b',
    gradient: 'linear-gradient(90deg, #f59e0b, #fcd34d)',
  },
  danger: {
    bg: 'rgba(239,68,68,0.12)',
    color: '#ef4444',
    gradient: 'linear-gradient(90deg, #ef4444, #f87171)',
  },
};

const StatCard = ({ title, value, icon, color = 'primary', subtitle, trend }) => {
  const palette = COLOR_MAP[color] || COLOR_MAP.primary;

  return (
    <div
      className="stat-card"
      style={{
        '--stat-color': palette.gradient,
      }}
    >
      {/* Icon */}
      <div
        className="stat-icon"
        style={{
          background: palette.bg,
          color: palette.color,
        }}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Body */}
      <div className="stat-body">
        <div
          className="stat-value"
          style={{ color: palette.color }}
        >
          {value ?? '—'}
        </div>
        <div className="stat-title">{title}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}

        {trend !== undefined && trend !== null && (
          <div
            className={`stat-trend ${trend >= 0 ? 'up' : 'down'}`}
            aria-label={`Trend: ${trend >= 0 ? '+' : ''}${trend}%`}
          >
            <span>{trend >= 0 ? '▲' : '▼'}</span>
            <span>
              {Math.abs(trend)}% {trend >= 0 ? 'increase' : 'decrease'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
