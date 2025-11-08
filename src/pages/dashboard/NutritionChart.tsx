import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import styles from './NutritionChart.module.css';

interface NutritionData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

export default function NutritionChart() {
  const data: NutritionData[] = [
    { name: 'Protein', value: 30, color: '#E91E63' },
    { name: 'Carbs', value: 45, color: '#FFC107' },
    { name: 'Fats', value: 25, color: '#FF5722' },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={styles.card}>
      <h4 className={styles.title}>Nutrition Distribution</h4>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => (
                <span className={styles.legendText}>
                  {value}: {entry.payload.value}g ({Math.round((entry.payload.value / total) * 100)}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
