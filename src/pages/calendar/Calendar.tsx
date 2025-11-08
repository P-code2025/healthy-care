import { useState } from 'react';
import styles from './Calendar.module.css';

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: number;
  category: 'meal' | 'activity' | 'appointment';
  color: string;
  location?: string;
  note?: string;
}

interface ScheduleDetail {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  note: string;
  category: 'meal' | 'activity' | 'appointment';
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2028, 8, 1)); // September 2028
  const [selectedCategory, setSelectedCategory] = useState({
    meal: true,
    activity: true,
    appointment: true,
  });
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');

  // Mock events data
  const events: CalendarEvent[] = [
    // September 3
    { id: '1', title: 'Breakfast\nAvocado Toast with Eggs', time: '7:30 AM', date: 3, category: 'meal', color: '#bbf7d0' },
    
    // September 4
    { id: '2', title: 'Breakfast\nMorning Yoga Session', time: '7:00 AM', date: 4, category: 'activity', color: '#fed7aa' },
    { id: '3', title: 'Lunch\nQuinoa Health Check-up', time: '12:00 PM', date: 4, category: 'meal', color: '#bbf7d0' },
    
    // September 5
    { id: '4', title: 'Lunch\nChicken Stir-Fry for Two', time: '1:00 PM', date: 5, category: 'meal', color: '#bbf7d0' },
    { id: '5', title: 'Snack\nEnergy Bars', time: '3:00 PM', date: 5, category: 'meal', color: '#fde047' },
    
    // September 10
    { id: '6', title: 'Snack\nGarden Nutrition Class', time: '3:30 PM', date: 10, category: 'activity', color: '#fed7aa' },
    
    // September 11
    { id: '7', title: 'Breakfast\nGreen Salad (Dinner)', time: '7:00 AM', date: 11, category: 'meal', color: '#bbf7d0' },
    
    // September 12
    { id: '8', title: 'Dinner\nWeight Training', time: '6:00 PM', date: 12, category: 'activity', color: '#fde047' },
    { id: '9', title: 'Snack\nMeal Prep', time: '4:00 PM', date: 12, category: 'meal', color: '#bbf7d0' },
    
    // September 14
    { id: '10', title: 'Lunch\nGreek Salad', time: '12:30 PM', date: 14, category: 'meal', color: '#bbf7d0' },
    
    // September 16
    { id: '11', title: 'Dinner\nMeal Prep: Overnight Jar Recipes', time: '7:00 PM', date: 16, category: 'meal', color: '#bbf7d0' },
    { id: '12', title: 'Lunch\nGeneral Consultation', time: '1:00 PM', date: 16, category: 'appointment', color: '#fed7aa' },
    
    // September 21
    { id: '13', title: 'Lunch\nGroup Fitness Class', time: '12:00 PM', date: 21, category: 'activity', color: '#fed7aa' },
    
    // September 27
    { id: '14', title: 'Breakfast\nMorning Training Session', time: '6:30 AM', date: 27, category: 'activity', color: '#fde047' },
    { id: '15', title: 'Dinner\nGeneral Consultation', time: '7:30 PM', date: 27, category: 'appointment', color: '#fde047' },
  ];

  const scheduleDetails: ScheduleDetail[] = [
    {
      id: '1',
      title: 'Morning Yoga Session',
      date: 'Tuesday, 5 September 2028',
      time: '7:00 AM',
      location: 'Sunrise Yoga Studio, Main Street',
      note: 'Focus on flexibility and breathing exercises. 1-hour session',
      category: 'activity',
    },
    {
      id: '2',
      title: 'General Health Check-up with Doctor',
      date: 'Tuesday, 5 September 2028',
      time: '3:00 PM',
      location: 'Central Health Clinic, 5th Avenue',
      note: 'Annual check-up, bring previous health records, and fasting required for blood tests.',
      category: 'appointment',
    },
  ];

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const toggleCategory = (category: 'meal' | 'activity' | 'appointment') => {
    setSelectedCategory({ ...selectedCategory, [category]: !selectedCategory[category] });
  };

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      if (event.date !== day) return false;
      if (event.category === 'meal' && !selectedCategory.meal) return false;
      if (event.category === 'activity' && !selectedCategory.activity) return false;
      if (event.category === 'appointment' && !selectedCategory.appointment) return false;
      return true;
    });
  };

  const getTotalAgendas = (category: 'meal' | 'activity' | 'appointment') => {
    return events.filter(e => e.category === category).length;
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className={styles.emptyDay}></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const isToday = day === new Date().getDate() &&
                      currentDate.getMonth() === new Date().getMonth() &&
                      currentDate.getFullYear() === new Date().getFullYear();
      
      days.push(
        <div
          key={day}
          className={`${styles.calendarDay} ${isToday ? styles.today : ''}`}
        >
          <span className={styles.dayNumber}>{day}</span>
          <div className={styles.dayEvents}>
            {dayEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className={styles.eventBlock}
                style={{ backgroundColor: event.color }}
              >
                <div className={styles.eventTime}>{event.time}</div>
                <div className={styles.eventTitle}>{event.title}</div>
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className={styles.moreEvents}>+{dayEvents.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Calendar</h2>
        <button className={styles.newScheduleButton}>+ New Schedule</button>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard} style={{ backgroundColor: '#dcfce7' }}>
          <div className={styles.summaryIcon}>🍽️</div>
          <div className={styles.summaryContent}>
            <div className={styles.summaryValue}>{getTotalAgendas('meal')}</div>
            <div className={styles.summaryLabel}>agendas</div>
            <div className={styles.summaryTitle}>Total Meal Planning Schedule</div>
          </div>
        </div>

        <div className={styles.summaryCard} style={{ backgroundColor: '#fed7aa' }}>
          <div className={styles.summaryIcon}>🏃</div>
          <div className={styles.summaryContent}>
            <div className={styles.summaryValue}>{getTotalAgendas('activity')}</div>
            <div className={styles.summaryLabel}>agendas</div>
            <div className={styles.summaryTitle}>Total Physical Activities Schedule</div>
          </div>
        </div>

        <div className={styles.summaryCard} style={{ backgroundColor: '#fde047' }}>
          <div className={styles.summaryIcon}>📅</div>
          <div className={styles.summaryContent}>
            <div className={styles.summaryValue}>{getTotalAgendas('appointment')}</div>
            <div className={styles.summaryLabel}>agendas</div>
            <div className={styles.summaryTitle}>Total Appointments/Events Schedule</div>
          </div>
        </div>
      </div>

      <div className={styles.mainLayout}>
        {/* Calendar View */}
        <div className={styles.calendarSection}>
          <div className={styles.calendarControls}>
            <div className={styles.monthNavigation}>
              <button onClick={previousMonth} className={styles.navButton}>
                ←
              </button>
              <h3 className={styles.monthTitle}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button onClick={nextMonth} className={styles.navButton}>
                →
              </button>
            </div>

            <div className={styles.viewControls}>
              <button 
                className={`${styles.viewButton} ${viewMode === 'day' ? styles.active : ''}`}
                onClick={() => setViewMode('day')}
              >
                Day
              </button>
              <button 
                className={`${styles.viewButton} ${viewMode === 'week' ? styles.active : ''}`}
                onClick={() => setViewMode('week')}
              >
                Week
              </button>
              <button 
                className={`${styles.viewButton} ${viewMode === 'month' ? styles.active : ''}`}
                onClick={() => setViewMode('month')}
              >
                Month
              </button>
            </div>
          </div>

          {/* Category Filters */}
          <div className={styles.categoryFilters}>
            <label className={styles.filterCheckbox}>
              <input
                type="checkbox"
                checked={selectedCategory.meal}
                onChange={() => toggleCategory('meal')}
              />
              <span className={styles.checkmark}></span>
              <span className={styles.filterLabel}>Meal Planning</span>
            </label>
            <label className={styles.filterCheckbox}>
              <input
                type="checkbox"
                checked={selectedCategory.activity}
                onChange={() => toggleCategory('activity')}
              />
              <span className={styles.checkmark}></span>
              <span className={styles.filterLabel}>Physical Activities</span>
            </label>
            <label className={styles.filterCheckbox}>
              <input
                type="checkbox"
                checked={selectedCategory.appointment}
                onChange={() => toggleCategory('appointment')}
              />
              <span className={styles.checkmark}></span>
              <span className={styles.filterLabel}>Appointments/Events</span>
            </label>
          </div>

          {/* Calendar Grid */}
          <div className={styles.calendarCard}>
            <div className={styles.weekDays}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className={styles.weekDay}>
                  {day}
                </div>
              ))}
            </div>
            
            <div className={styles.calendarGrid}>
              {renderCalendarDays()}
            </div>
          </div>
        </div>

        {/* Schedule Details Sidebar */}
        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarTitle}>Schedule Details</h3>
          
          <div className={styles.scheduleList}>
            {scheduleDetails.map((detail) => (
              <div 
                key={detail.id} 
                className={styles.scheduleCard}
                style={{ 
                  borderLeft: `4px solid ${detail.category === 'activity' ? '#fed7aa' : '#fde047'}` 
                }}
              >
                <div className={styles.scheduleBadge}>
                  {detail.category === 'activity' ? 'Physical Activities' : 'Appointments'}
                </div>
                <h4 className={styles.scheduleTitle}>{detail.title}</h4>
                <div className={styles.scheduleDetails}>
                  <div className={styles.scheduleDetail}>
                    <span className={styles.detailIcon}>📅</span>
                    <span>{detail.date}</span>
                  </div>
                  <div className={styles.scheduleDetail}>
                    <span className={styles.detailIcon}>🕐</span>
                    <span>{detail.time}</span>
                  </div>
                  <div className={styles.scheduleDetail}>
                    <span className={styles.detailIcon}>📍</span>
                    <span>{detail.location}</span>
                  </div>
                </div>
                <div className={styles.scheduleNote}>
                  <strong>Note</strong>
                  <p>{detail.note}</p>
                </div>
                <div className={styles.scheduleActions}>
                  <button className={styles.editButton}>Edit</button>
                  <button className={styles.removeButton}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          {/* Health Journey Banner */}
          <div className={styles.healthBanner}>
            <div className={styles.bannerImage}>🥕🥬</div>
            <h4 className={styles.bannerTitle}>Start your health journey with a FREE 1-month trial</h4>
            <button className={styles.claimButton}>Claim Now!</button>
          </div>
        </div>
      </div>
    </div>
  );
}
