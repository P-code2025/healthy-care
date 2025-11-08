import styles from "./CaloriesCard.module.css";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Props {
  total: number;
  goal: number;
  consumed: number;
}

export default function CaloriesCard({ total, goal, consumed }: Props) {
  const data = [
    { name: 'Consumed', value: consumed },
    { name: 'Remaining', value: Math.max(0, goal - consumed) }
  ];
  
  const COLORS = ['#FFB84D', '#F0F0F0'];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Calories Intake</h3>
        <button className={styles.menuBtn}>⋮</button>
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        <div className={styles.centerValue}>
          <div className={styles.mainCalories}>{total}</div>
          <div className={styles.caloriesUnit}>kcal</div>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <div className={styles.statIcon} style={{ background: '#E8F5E9' }}>
            <span style={{ color: '#8FD14F' }}>🔥</span>
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{goal} kcal</div>
            <div className={styles.statLabel}>Goal</div>
          </div>
        </div>

        <div className={styles.statItem}>
          <div className={styles.statIcon} style={{ background: '#FFF3E0' }}>
            <span style={{ color: '#FFB84D' }}>⚡</span>
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{consumed} kcal</div>
            <div className={styles.statLabel}>Consumed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
