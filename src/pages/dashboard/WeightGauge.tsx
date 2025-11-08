import styles from './WeightGauge.module.css';

interface Props {
  current: number;
  min: number;
  max: number;
}

export default function WeightGauge({ current, min, max }: Props) {
  // Calculate percentage (0-100)
  const percentage = ((current - min) / (max - min)) * 100;
  // Convert to degrees (-90 to 90, where -90 is left, 90 is right)
  const degrees = (percentage / 100) * 180 - 90;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Weight Data</h3>
        <button className={styles.menuBtn}>⋮</button>
      </div>
      
      <div className={styles.gaugeContainer}>
        <svg viewBox="0 0 200 120" className={styles.gauge}>
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#F0F0F0"
            strokeWidth="20"
            strokeLinecap="round"
          />
          {/* Progress arc - orange/green gradient */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.51}, 251`}
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFB84D" />
              <stop offset="50%" stopColor="#8FD14F" />
              <stop offset="100%" stopColor="#8FD14F" />
            </linearGradient>
          </defs>
          {/* Needle */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="35"
            stroke="#2D3748"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${degrees} 100 100)`}
            className={styles.needle}
          />
          {/* Center dot */}
          <circle cx="100" cy="100" r="6" fill="#2D3748" />
        </svg>

        <div className={styles.valueContainer}>
          <div className={styles.mainValue}>
            <span className={styles.number}>{current}</span>
            <span className={styles.unit}>kg</span>
          </div>
          <div className={styles.subtitle}>12 kg left</div>
        </div>
      </div>

      <div className={styles.range}>
        <span className={styles.rangeLabel}>{min}</span>
        <span className={styles.rangeLabel}>{max}</span>
      </div>

      <div className={styles.message}>
        Progress is progress, no matter how slow.<br />
        Keep going, You're getting closer to your<br />
        goal every day 💪
      </div>
    </div>
  );
}
