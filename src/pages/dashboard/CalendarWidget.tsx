import styles from './CalendarWidget.module.css';

export default function CalendarWidget() {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const currentDay = currentDate.getDate();

  // Generate calendar days
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h4 className={styles.title}>{currentMonth}</h4>
        <div className={styles.nav}>
          <button>‹</button>
          <button>›</button>
        </div>
      </div>
      <div className={styles.weekDays}>
        {weekDays.map((day, index) => (
          <div key={index} className={styles.weekDay}>{day}</div>
        ))}
      </div>
      <div className={styles.days}>
        {days.map((day, index) => (
          <div 
            key={index} 
            className={`${styles.day} ${day === currentDay ? styles.active : ''} ${!day ? styles.empty : ''}`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}
