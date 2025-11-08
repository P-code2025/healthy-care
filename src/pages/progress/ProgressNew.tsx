import { useState } from 'react';
import styles from './ProgressNew.module.css';

interface BodyMeasurement {
  label: string;
  value: number;
  unit: string;
  position: { top: string; left: string };
}

interface WeekData {
  week: string;
  chest: number;
  arm: number;
  waist: number;
  hips: number;
  thigh: number;
}

const BODY_MEASUREMENTS: BodyMeasurement[] = [
  { label: 'Arm', value: 28.5, unit: 'cm', position: { top: '15%', left: '25%' } },
  { label: 'Chest', value: 93.0, unit: 'cm', position: { top: '25%', left: '15%' } },
  { label: 'Waist', value: 77.5, unit: 'cm', position: { top: '40%', left: '25%' } },
  { label: 'Hips', value: 98.0, unit: 'cm', position: { top: '55%', right: '25%' } },
  { label: 'Thigh', value: 58.5, unit: 'cm', position: { top: '75%', left: '20%' } },
];

const WEEKLY_DATA: WeekData[] = [
  { week: 'Week 1', chest: 93.5, arm: 29.0, waist: 78.0, hips: 99.0, thigh: 59.5 },
  { week: 'Week 2', chest: 94.0, arm: 29.5, waist: 79.0, hips: 99.0, thigh: 59.5 },
  { week: 'Week 3', chest: 93.5, arm: 29.0, waist: 78.0, hips: 88.5, thigh: 59.0 },
  { week: 'Week 4', chest: 93.0, arm: 28.5, waist: 77.5, hips: 98.0, thigh: 58.5 },
];

const CALORIES_DATA = [
  { day: 'Mon', consumed: 2100, burned: 500 },
  { day: 'Tue', consumed: 1795, burned: 400 },
  { day: 'Wed', consumed: 2300, burned: 600 },
  { day: 'Thu', consumed: 2000, burned: 450 },
];

const SLEEP_DATA = [
  { day: 'Mon', deepSleep: 3, lightSleep: 3, remPhase: 1.5, awake: 0.5 },
  { day: 'Tue', deepSleep: 2.5, lightSleep: 3.5, remPhase: 1.5, awake: 0.5 },
  { day: 'Wed', deepSleep: 3, lightSleep: 3, remPhase: 2, awake: 0.5 },
  { day: 'Thu', deepSleep: 2.5, lightSleep: 3, remPhase: 1.5, awake: 0.5 },
];

const HYDRATION_DATA = [
  { day: 'Mon', liters: 2.5 },
  { day: 'Tue', liters: 2.8 },
  { day: 'Wed', liters: 2.3 },
  { day: 'Thu', liters: 2.6 },
  { day: 'Fri', liters: 2.1 },
  { day: 'Sat', liters: 2.4 },
  { day: 'Sun', liters: 2.0 },
];

export default function ProgressNew() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedChartPeriod, setSelectedChartPeriod] = useState('Last 5 Days');

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Progress</h1>
        <div className={styles.periodSelector}>
          <button 
            className={`${styles.periodBtn} ${selectedPeriod === 'today' ? styles.active : ''}`}
            onClick={() => setSelectedPeriod('today')}
          >
            Today
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className={styles.mainGrid}>
        {/* Left Column - Body Measurements */}
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <div className={styles.bodyMeasurementContainer}>
              {/* Body SVG */}
              <div className={styles.bodySvgWrapper}>
                <svg viewBox="0 0 300 600" className={styles.bodySvg}>
                  {/* Head */}
                  <ellipse cx="150" cy="50" rx="30" ry="40" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
                  
                  {/* Neck */}
                  <line x1="150" y1="90" x2="150" y2="110" stroke="#9CA3AF" strokeWidth="15"/>
                  
                  {/* Shoulders */}
                  <circle cx="110" cy="120" r="15" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
                  <circle cx="190" cy="120" r="15" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
                  
                  {/* Torso */}
                  <ellipse cx="150" cy="200" rx="50" ry="80" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
                  
                  {/* Arms */}
                  <line x1="110" y1="120" x2="70" y2="220" stroke="#9CA3AF" strokeWidth="12"/>
                  <line x1="190" y1="120" x2="230" y2="220" stroke="#9CA3AF" strokeWidth="12"/>
                  
                  {/* Forearms */}
                  <line x1="70" y1="220" x2="50" y2="300" stroke="#9CA3AF" strokeWidth="10"/>
                  <line x1="230" y1="220" x2="250" y2="300" stroke="#9CA3AF" strokeWidth="10"/>
                  
                  {/* Hands */}
                  <circle cx="50" cy="310" r="12" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
                  <circle cx="250" cy="310" r="12" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
                  
                  {/* Hips */}
                  <ellipse cx="150" cy="300" rx="55" ry="30" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
                  
                  {/* Thighs */}
                  <line x1="130" y1="330" x2="120" y2="450" stroke="#9CA3AF" strokeWidth="18"/>
                  <line x1="170" y1="330" x2="180" y2="450" stroke="#9CA3AF" strokeWidth="18"/>
                  
                  {/* Calves */}
                  <line x1="120" y1="450" x2="115" y2="550" stroke="#9CA3AF" strokeWidth="14"/>
                  <line x1="180" y1="450" x2="185" y2="550" stroke="#9CA3AF" strokeWidth="14"/>
                  
                  {/* Feet */}
                  <ellipse cx="115" cy="565" rx="15" ry="8" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
                  <ellipse cx="185" cy="565" rx="15" ry="8" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
                  
                  {/* Measurement Points */}
                  <circle cx="110" cy="150" r="4" fill="#FF6B6B"/>
                  <circle cx="150" cy="180" r="4" fill="#FF6B6B"/>
                  <circle cx="150" cy="250" r="4" fill="#FF6B6B"/>
                  <circle cx="150" cy="310" r="4" fill="#FF6B6B"/>
                  <circle cx="125" cy="390" r="4" fill="#FF6B6B"/>
                </svg>

                {/* Measurement Labels */}
                {BODY_MEASUREMENTS.map((measurement, index) => (
                  <div 
                    key={index}
                    className={styles.measurementLabel}
                    style={measurement.position}
                  >
                    <div className={styles.measurementLine}></div>
                    <div className={styles.measurementBadge}>
                      <div className={styles.measurementText}>{measurement.label}</div>
                      <div className={styles.measurementValue}>
                        {measurement.value} {measurement.unit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Promotional Banner */}
          <div className={styles.promoBanner}>
            <div className={styles.promoContent}>
              <div className={styles.promoIcon}>🥬</div>
              <div className={styles.promoText}>
                <p className={styles.promoTitle}>Start your health journey</p>
                <p className={styles.promoSubtitle}>with a <strong>FREE 1-month</strong></p>
                <p className={styles.promoSubtitle}>access to Nutrigo</p>
              </div>
            </div>
            <button className={styles.claimBtn}>Claim Now!</button>
          </div>
        </div>

        {/* Middle Column - Charts */}
        <div className={styles.middleColumn}>
          {/* Weight Tracking */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Weight Tracking</h3>
              <button className={styles.moreBtn}>•••</button>
            </div>
            <div className={styles.weightInfo}>
              <div className={styles.weightStat}>
                <span className={styles.weightLabel}>Start Weight</span>
                <span className={styles.weightValue}>85 kg</span>
              </div>
              <div className={styles.weightStat}>
                <span className={styles.weightLabel}>Current weight</span>
                <span className={styles.weightValue}>78 kg</span>
              </div>
              <div className={styles.weightStat}>
                <span className={styles.weightLabel}>Weight Goal</span>
                <span className={styles.weightValue}>65 kg</span>
              </div>
            </div>
            <div className={styles.chartWrapper}>
              {/* Simple line chart representation */}
              <svg viewBox="0 0 500 150" className={styles.lineChart}>
                <polyline
                  points="0,30 100,45 200,50 300,70 400,85 500,100"
                  fill="none"
                  stroke="#FFB84D"
                  strokeWidth="3"
                />
                {[
                  { x: 0, y: 30, label: '93 kg' },
                  { x: 100, y: 45, label: '89 kg' },
                  { x: 200, y: 50, label: '85 kg' },
                  { x: 300, y: 70, label: '80 kg' },
                  { x: 400, y: 85, label: '71 kg' },
                  { x: 500, y: 100, label: '68 kg' },
                ].map((point, i) => (
                  <g key={i}>
                    <circle cx={point.x} cy={point.y} r="5" fill="#FFB84D"/>
                    <text x={point.x} y={point.y - 15} fontSize="10" fill="#6B7280" textAnchor="middle">
                      {point.label}
                    </text>
                  </g>
                ))}
              </svg>
              <div className={styles.chartLabels}>
                <span>Mar</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
              </div>
            </div>
          </div>

          {/* Progress Photos */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Progress Photos</h3>
              <button className={styles.viewAllBtn}>View All</button>
            </div>
            <div className={styles.photosGrid}>
              <div className={styles.photoCard}>
                <div className={styles.photoPlaceholder}>
                  <img src="/images/progress/progress-before.jpg" alt="Progress July 2018" />
                </div>
                <div className={styles.photoInfo}>
                  <span className={styles.photoDate}>July 2018</span>
                  <span className={styles.photoWeight}>82 kg</span>
                </div>
              </div>
              <div className={styles.photoCard}>
                <div className={styles.photoPlaceholder}>
                  <img src="/images/progress/progress-after.jpg" alt="Progress Sept 2018" />
                </div>
                <div className={styles.photoInfo}>
                  <span className={styles.photoDate}>Sept 2018</span>
                  <span className={styles.photoWeight}>78 kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Progress Table */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>September 2028</h3>
              <button className={styles.moreBtn}>•••</button>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.progressTable}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Chest (cm)</th>
                    <th>Arm (cm)</th>
                    <th>Waist (cm)</th>
                    <th>Hips (cm)</th>
                    <th>Thigh (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {WEEKLY_DATA.map((row, index) => (
                    <tr key={index}>
                      <td className={styles.weekCell}>{row.week}</td>
                      <td>{row.chest}</td>
                      <td>{row.arm}</td>
                      <td>{row.waist}</td>
                      <td>{row.hips}</td>
                      <td>{row.thigh}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Stats */}
        <div className={styles.rightColumn}>
          {/* Calories Activities */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Calories Activities</h3>
              <button className={styles.periodBadge}>{selectedChartPeriod}</button>
            </div>
            <div className={styles.caloriesInfo}>
              <div className={styles.caloriesStat}>
                <span className={styles.caloriesLabel}>
                  <span className={styles.legendDot} style={{ backgroundColor: '#FFB84D' }}></span>
                  Consumed
                </span>
                <span className={styles.caloriesValue}>450 kcal left</span>
              </div>
              <div className={styles.caloriesSubtext}>Calorie Goal: 3,000 kcal</div>
            </div>
            <div className={styles.barChartWrapper}>
              {CALORIES_DATA.map((day, index) => (
                <div key={index} className={styles.barGroup}>
                  <div className={styles.bars}>
                    <div 
                      className={styles.barConsumed}
                      style={{ height: `${(day.consumed / 2500) * 100}%` }}
                    ></div>
                    <div 
                      className={styles.barBurned}
                      style={{ height: `${(day.burned / 2500) * 100}%` }}
                    ></div>
                  </div>
                  <span className={styles.barLabel}>{day.day}</span>
                </div>
              ))}
            </div>
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: '#FFB84D' }}></span>
                <span>Consumed</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: '#FF6B6B' }}></span>
                <span>Burned</span>
              </div>
            </div>
          </div>

          {/* Sleep Statistics */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Sleep Statistics</h3>
              <button className={styles.periodBadge}>Last 5 Days</button>
            </div>
            <div className={styles.sleepChart}>
              {SLEEP_DATA.map((day, index) => (
                <div key={index} className={styles.sleepBar}>
                  <div className={styles.sleepStack}>
                    <div className={styles.sleepSegment} style={{ 
                      height: `${(day.deepSleep / 8) * 100}%`,
                      backgroundColor: '#FFB84D'
                    }}></div>
                    <div className={styles.sleepSegment} style={{ 
                      height: `${(day.lightSleep / 8) * 100}%`,
                      backgroundColor: '#FCD34D'
                    }}></div>
                    <div className={styles.sleepSegment} style={{ 
                      height: `${(day.remPhase / 8) * 100}%`,
                      backgroundColor: '#FDE68A'
                    }}></div>
                    <div className={styles.sleepSegment} style={{ 
                      height: `${(day.awake / 8) * 100}%`,
                      backgroundColor: '#FEF3C7'
                    }}></div>
                  </div>
                  <span className={styles.sleepLabel}>{day.day}</span>
                </div>
              ))}
            </div>
            <div className={styles.sleepLegend}>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: '#FFB84D' }}></span>
                <span>Deep Sleep</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: '#FCD34D' }}></span>
                <span>Light Sleep</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: '#FDE68A' }}></span>
                <span>REM Phase</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: '#FEF3C7' }}></span>
                <span>Awake</span>
              </div>
            </div>
          </div>

          {/* Hydration */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Hydration</h3>
              <button className={styles.periodBadge}>This Week</button>
            </div>
            <div className={styles.hydrationStatus}>
              <div className={styles.hydrationIcon}>💧</div>
              <div className={styles.hydrationText}>
                <span className={styles.hydrationLabel}>Normal</span>
                <span className={styles.hydrationValue}>2.0 L</span>
              </div>
            </div>
            <div className={styles.hydrationChart}>
              {HYDRATION_DATA.map((day, index) => (
                <div key={index} className={styles.hydrationBar}>
                  <div 
                    className={styles.hydrationFill}
                    style={{ height: `${(day.liters / 3) * 100}%` }}
                  ></div>
                  <div className={styles.hydrationInfo}>
                    <span className={styles.hydrationDay}>{day.day}</span>
                    <span className={styles.hydrationAmount}>{day.liters} L</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
