import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register all required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  Title
);

const DARK_THEME = {
  color: '#9ca3af',
  borderColor: 'rgba(255,255,255,0.05)',
};

/**
 * AttendanceChart
 * Props:
 *   type: 'line' | 'doughnut'
 *   title: string
 *   labels: string[]
 *   values: number[]
 *   data: optional array of {date, count} — used to build labels+values if provided
 *   height: optional number (px)
 */
const AttendanceChart = ({ type = 'line', title, labels = [], values = [], data, height = 280 }) => {
  // Build from data prop if provided
  let resolvedLabels = labels;
  let resolvedValues = values;

  if (data && Array.isArray(data)) {
    resolvedLabels = data.map((d) => d.date || d.label || '');
    resolvedValues = data.map((d) => d.count ?? d.value ?? 0);
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17,24,39,0.95)',
        borderColor: 'rgba(99,102,241,0.3)',
        borderWidth: 1,
        titleColor: '#f9fafb',
        bodyColor: '#9ca3af',
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  if (type === 'line') {
    const lineData = {
      labels: resolvedLabels,
      datasets: [
        {
          label: title || 'Attendance',
          data: resolvedValues,
          borderColor: '#6366f1',
          backgroundColor: (ctx) => {
            const canvas = ctx.chart.ctx;
            const gradient = canvas.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, 'rgba(99,102,241,0.35)');
            gradient.addColorStop(1, 'rgba(99,102,241,0.0)');
            return gradient;
          },
          borderWidth: 2.5,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#0a0f1e',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4,
        },
      ],
    };

    const lineOptions = {
      ...commonOptions,
      scales: {
        x: {
          grid: { color: DARK_THEME.borderColor, drawBorder: false },
          ticks: { color: DARK_THEME.color, font: { size: 11 } },
          border: { display: false },
        },
        y: {
          grid: { color: DARK_THEME.borderColor, drawBorder: false },
          ticks: { color: DARK_THEME.color, font: { size: 11 }, stepSize: 1 },
          border: { display: false },
          beginAtZero: true,
        },
      },
    };

    return (
      <div style={{ height }}>
        <Line data={lineData} options={lineOptions} />
      </div>
    );
  }

  if (type === 'doughnut') {
    const doughnutData = {
      labels: resolvedLabels,
      datasets: [
        {
          data: resolvedValues,
          backgroundColor: [
            'rgba(16,185,129,0.85)',
            'rgba(239,68,68,0.85)',
            'rgba(99,102,241,0.85)',
            'rgba(245,158,11,0.85)',
          ],
          borderColor: [
            'rgba(16,185,129,1)',
            'rgba(239,68,68,1)',
            'rgba(99,102,241,1)',
            'rgba(245,158,11,1)',
          ],
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };

    const doughnutOptions = {
      ...commonOptions,
      cutout: '68%',
      plugins: {
        ...commonOptions.plugins,
        legend: { display: false },
      },
    };

    const total = resolvedValues.reduce((a, b) => a + b, 0);

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div style={{ height, width: height }}>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
        {/* Custom legend */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            justifyContent: 'center',
          }}
        >
          {resolvedLabels.map((label, i) => {
            const pct = total > 0 ? Math.round((resolvedValues[i] / total) * 100) : 0;
            const colors = ['#10b981', '#ef4444', '#6366f1', '#f59e0b'];
            return (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: colors[i] || '#6366f1',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                {label}:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {resolvedValues[i]} ({pct}%)
                </strong>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};

export default AttendanceChart;
