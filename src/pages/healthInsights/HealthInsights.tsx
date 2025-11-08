import { useState } from 'react';
import styles from './HealthInsights.module.css';

interface HealthMetric {
  date: string;
  weight: number;
  calories: number;
  steps: number;
  sleep: number;
  water: number;
}

interface InsightCard {
  id: string;
  title: string;
  value: string;
  change: number;
  icon: string;
  trend: 'up' | 'down' | 'neutral';
}

// Simple chart component
const MiniChart = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className={styles.miniChart}>
      {data.map((value, index) => {
        const height = ((value - min) / range) * 100;
        return (
          <div
            key={index}
            className={styles.chartBar}
            style={{
              height: `${height}%`,
              background: color,
            }}
          />
        );
      })}
    </div>
  );
};

export default function HealthInsights() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  
  // Mock data
  const healthMetrics: HealthMetric[] = [
    { date: '2024-01-01', weight: 78, calories: 2100, steps: 8500, sleep: 7, water: 8 },
    { date: '2024-01-02', weight: 77.8, calories: 1950, steps: 9200, sleep: 7.5, water: 9 },
    { date: '2024-01-03', weight: 77.5, calories: 2000, steps: 10000, sleep: 8, water: 10 },
    { date: '2024-01-04', weight: 77.3, calories: 2150, steps: 7800, sleep: 6.5, water: 7 },
    { date: '2024-01-05', weight: 77.2, calories: 1900, steps: 11000, sleep: 8, water: 9 },
    { date: '2024-01-06', weight: 77.0, calories: 2050, steps: 9500, sleep: 7.5, water: 8 },
    { date: '2024-01-07', weight: 76.8, calories: 1950, steps: 10500, sleep: 8, water: 10 },
  ];

  const insights: InsightCard[] = [
    {
      id: '1',
      title: 'Average Weight',
      value: '77.2 kg',
      change: -1.2,
      icon: '⚖️',
      trend: 'down'
    },
    {
      id: '2',
      title: 'Daily Calories',
      value: '2,014',
      change: 2.5,
      icon: '🔥',
      trend: 'up'
    },
    {
      id: '3',
      title: 'Daily Steps',
      value: '9,500',
      change: 8.3,
      icon: '👟',
      trend: 'up'
    },
    {
      id: '4',
      title: 'Avg Sleep',
      value: '7.5 hrs',
      change: -0.5,
      icon: '😴',
      trend: 'down'
    },
    {
      id: '5',
      title: 'Water Intake',
      value: '8.7 cups',
      change: 12.0,
      icon: '💧',
      trend: 'up'
    },
    {
      id: '6',
      title: 'Active Days',
      value: '6/7',
      change: 14.3,
      icon: '💪',
      trend: 'up'
    }
  ];

  const weightData = healthMetrics.map(m => m.weight);
  const caloriesData = healthMetrics.map(m => m.calories);
  const stepsData = healthMetrics.map(m => m.steps);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Health Insights</h2>
          <p className={styles.subtitle}>Track your health metrics and progress</p>
        </div>
        <div className={styles.timeRangeSelector}>
          <button
            className={`${styles.timeButton} ${timeRange === 'week' ? styles.active : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button
            className={`${styles.timeButton} ${timeRange === 'month' ? styles.active : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button
            className={`${styles.timeButton} ${timeRange === 'year' ? styles.active : ''}`}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
      </div>

      {/* Insight Cards */}
      <div className={styles.insightsGrid}>
        {insights.map((insight) => (
          <div key={insight.id} className={styles.insightCard}>
            <div className={styles.insightHeader}>
              <span className={styles.insightIcon}>{insight.icon}</span>
              <span className={`${styles.insightChange} ${styles[insight.trend]}`}>
                {insight.trend === 'up' ? '↑' : insight.trend === 'down' ? '↓' : '→'}
                {Math.abs(insight.change)}%
              </span>
            </div>
            <h3 className={styles.insightValue}>{insight.value}</h3>
            <p className={styles.insightTitle}>{insight.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className={styles.chartsSection}>
        {/* Weight Trend */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Weight Trend</h3>
              <p className={styles.chartSubtitle}>Last 7 days</p>
            </div>
            <span className={styles.chartIcon}>⚖️</span>
          </div>
          <div className={styles.chartContent}>
            <div className={styles.currentValue}>
              <span className={styles.mainValue}>{weightData[weightData.length - 1]}</span>
              <span className={styles.unit}>kg</span>
            </div>
            <MiniChart data={weightData} color="#22c55e" />
            <div className={styles.chartLabels}>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Calories Trend */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Calorie Intake</h3>
              <p className={styles.chartSubtitle}>Last 7 days</p>
            </div>
            <span className={styles.chartIcon}>🔥</span>
          </div>
          <div className={styles.chartContent}>
            <div className={styles.currentValue}>
              <span className={styles.mainValue}>{caloriesData[caloriesData.length - 1]}</span>
              <span className={styles.unit}>cal</span>
            </div>
            <MiniChart data={caloriesData} color="#f59e0b" />
            <div className={styles.chartLabels}>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Steps Trend */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Daily Steps</h3>
              <p className={styles.chartSubtitle}>Last 7 days</p>
            </div>
            <span className={styles.chartIcon}>👟</span>
          </div>
          <div className={styles.chartContent}>
            <div className={styles.currentValue}>
              <span className={styles.mainValue}>{stepsData[stepsData.length - 1].toLocaleString()}</span>
              <span className={styles.unit}>steps</span>
            </div>
            <MiniChart data={stepsData} color="#3b82f6" />
            <div className={styles.chartLabels}>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className={styles.suggestionsSection}>
        <h3 className={styles.sectionTitle}>AI Recommendations</h3>
        <div className={styles.suggestionsList}>
          <div className={styles.suggestionCard}>
            <div className={styles.suggestionIcon}>💡</div>
            <div className={styles.suggestionContent}>
              <h4 className={styles.suggestionTitle}>Great Progress on Weight!</h4>
              <p className={styles.suggestionText}>
                You've lost 1.2kg this week. Keep maintaining your current calorie intake and exercise routine.
              </p>
            </div>
          </div>
          <div className={styles.suggestionCard}>
            <div className={styles.suggestionIcon}>⚠️</div>
            <div className={styles.suggestionContent}>
              <h4 className={styles.suggestionTitle}>Improve Sleep Quality</h4>
              <p className={styles.suggestionText}>
                Your sleep duration dropped below 7 hours on Thursday. Try to maintain consistent sleep schedule.
              </p>
            </div>
          </div>
          <div className={styles.suggestionCard}>
            <div className={styles.suggestionIcon}>🎯</div>
            <div className={styles.suggestionContent}>
              <h4 className={styles.suggestionTitle}>Step Goal Achievement</h4>
              <p className={styles.suggestionText}>
                You're averaging 9,500 steps daily! Consider increasing your goal to 11,000 steps.
              </p>
            </div>
          </div>
          <div className={styles.suggestionCard}>
            <div className={styles.suggestionIcon}>💧</div>
            <div className={styles.suggestionContent}>
              <h4 className={styles.suggestionTitle}>Excellent Hydration</h4>
              <p className={styles.suggestionText}>
                Your water intake improved by 12% this week. Keep up the good hydration habits!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className={styles.summarySection}>
        <h3 className={styles.sectionTitle}>Weekly Summary</h3>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>🏆</div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryValue}>6/7</div>
              <div className={styles.summaryLabel}>Active Days</div>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>🎯</div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryValue}>85%</div>
              <div className={styles.summaryLabel}>Goals Met</div>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>📈</div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryValue}>+12%</div>
              <div className={styles.summaryLabel}>Improvement</div>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>⭐</div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryValue}>4.5</div>
              <div className={styles.summaryLabel}>Health Score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
