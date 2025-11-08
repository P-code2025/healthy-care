import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from './WeeklyActivityChart.module.css';

export default function WeeklyActivityChart() {
  const data = [
    { day: 'Mon', calories: 2100, exercise: 400 },
    { day: 'Tue', calories: 1800, exercise: 300 },
    { day: 'Wed', calories: 2300, exercise: 500 },
    { day: 'Thu', calories: 1900, exercise: 350 },
    { day: 'Fri', calories: 2200, exercise: 450 },
    { day: 'Sat', calories: 2400, exercise: 600 },
    { day: 'Sun', calories: 2000, exercise: 380 },
  ];

  return (
    <div className={styles.card}>
      <h4 className={styles.title}>Weekly Activity</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis 
            dataKey="day" 
            tick={{ fill: '#616161', fontSize: 12 }}
            axisLine={{ stroke: '#E0E0E0' }}
          />
          <YAxis 
            tick={{ fill: '#616161', fontSize: 12 }}
            axisLine={{ stroke: '#E0E0E0' }}
          />
          <Tooltip 
            contentStyle={{
              background: '#fff',
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar dataKey="calories" fill="#FF6B35" radius={[8, 8, 0, 0]} name="Calories Intake" />
          <Bar dataKey="exercise" fill="#FFB800" radius={[8, 8, 0, 0]} name="Calories Burned" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
