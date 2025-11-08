import { useState } from 'react';
import styles from './ExercisesNew.module.css';

interface Exercise {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  sets: number;
  reps: string;
  rest: string;
  weight: string;
  calories: number;
  status: 'Completed' | 'In Progress' | 'Not Started' | 'Skipped';
}

const EXERCISES: Exercise[] = [
  {
    id: '1',
    name: 'Squats',
    icon: '🏋️',
    iconBg: 'linear-gradient(135deg, #D4F4DD 0%, #A7E9AF 100%)',
    sets: 4,
    reps: '12 repetitions',
    rest: '60 sec',
    weight: '45 kg',
    calories: 180,
    status: 'Completed'
  },
  {
    id: '2',
    name: 'Deadlifts',
    icon: '🏋️',
    iconBg: 'linear-gradient(135deg, #FFE5B4 0%, #FFD89B 100%)',
    sets: 3,
    reps: '10 repetitions',
    rest: '90 sec',
    weight: '60 kg',
    calories: 220,
    status: 'Completed'
  },
  {
    id: '3',
    name: 'Bench Press',
    icon: '🏋️',
    iconBg: 'linear-gradient(135deg, #FFD4A3 0%, #FFB84D 100%)',
    sets: 3,
    reps: '8 repetitions',
    rest: '80 sec',
    weight: '40 kg',
    calories: 150,
    status: 'In Progress'
  },
  {
    id: '4',
    name: 'Pull-ups',
    icon: '💪',
    iconBg: 'linear-gradient(135deg, #D4F4DD 0%, #A7E9AF 100%)',
    sets: 4,
    reps: '8 repetitions',
    rest: '90 sec',
    weight: 'Bodyweight',
    calories: 120,
    status: 'Skipped'
  },
  {
    id: '5',
    name: 'Plank',
    icon: '🤸',
    iconBg: 'linear-gradient(135deg, #FFE5B4 0%, #FFD89B 100%)',
    sets: 3,
    reps: '60 repetitions',
    rest: '30 sec',
    weight: '--',
    calories: 90,
    status: 'Completed'
  },
  {
    id: '6',
    name: 'Running',
    icon: '🏃',
    iconBg: 'linear-gradient(135deg, #FFD4A3 0%, #FFB84D 100%)',
    sets: 1,
    reps: '30 minutes',
    rest: 'N/A',
    weight: '--',
    calories: 300,
    status: 'Completed'
  },
  {
    id: '7',
    name: 'Lunges',
    icon: '🦵',
    iconBg: 'linear-gradient(135deg, #D4F4DD 0%, #A7E9AF 100%)',
    sets: 3,
    reps: '16 repetitions',
    rest: '60 sec',
    weight: '20 kg',
    calories: 160,
    status: 'Not Started'
  },
  {
    id: '8',
    name: 'Shoulder Press',
    icon: '🏋️',
    iconBg: 'linear-gradient(135deg, #FFE5B4 0%, #FFD89B 100%)',
    sets: 3,
    reps: '10 repetitions',
    rest: '60 sec',
    weight: '25 kg',
    calories: 140,
    status: 'Not Started'
  },
  {
    id: '9',
    name: 'Bicep Curls',
    icon: '💪',
    iconBg: 'linear-gradient(135deg, #FFD4A3 0%, #FFB84D 100%)',
    sets: 3,
    reps: '12 repetitions',
    rest: '45 sec',
    weight: '15 kg',
    calories: 110,
    status: 'In Progress'
  },
  {
    id: '10',
    name: 'Cycling',
    icon: '🚴',
    iconBg: 'linear-gradient(135deg, #D4F4DD 0%, #A7E9AF 100%)',
    sets: 1,
    reps: '45 minutes',
    rest: 'N/A',
    weight: '--',
    calories: 350,
    status: 'Completed'
  },
  {
    id: '11',
    name: 'Mountain Climbers',
    icon: '🏔️',
    iconBg: 'linear-gradient(135deg, #FFE5B4 0%, #FFD89B 100%)',
    sets: 4,
    reps: '20 repetitions',
    rest: '30 sec',
    weight: '--',
    calories: 200,
    status: 'In Progress'
  },
  {
    id: '12',
    name: 'Yoga (Stretching)',
    icon: '🧘',
    iconBg: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
    sets: 1,
    reps: '60 minutes',
    rest: 'N/A',
    weight: '--',
    calories: 150,
    status: 'Not Started'
  }
];

const STATUS_OPTIONS = ['All Status', 'Completed', 'In Progress', 'Not Started', 'Skipped'];

export default function ExercisesNew() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedWeek, setSelectedWeek] = useState('This Week');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Filter exercises
  const filteredExercises = EXERCISES.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All Status' || exercise.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredExercises.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExercises = filteredExercises.slice(startIndex, endIndex);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Completed':
        return styles.completed;
      case 'In Progress':
        return styles.inProgress;
      case 'Not Started':
        return styles.notStarted;
      case 'Skipped':
        return styles.skipped;
      default:
        return '';
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Exercises</h1>
        <button className={styles.addButton}>
          <span className={styles.addIcon}>+</span>
          Add Exercise
        </button>
      </div>

      {/* Filters Section */}
      <div className={styles.filtersSection}>
        <div className={styles.leftFilters}>
          <div className={styles.searchBox}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path 
                d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search for exercise"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select 
            className={styles.filterSelect}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Status</option>
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select className={styles.filterSelect} value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)}>
            <option>This Week</option>
            <option>Last Week</option>
            <option>This Month</option>
            <option>Last Month</option>
          </select>
        </div>

        <div className={styles.rightFilters}>
          <button className={styles.iconButton}>
            <span>☰</span>
            Popular
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className={styles.tableSection}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  Exercise Name
                  <span className={styles.sortIcon}>↕</span>
                </th>
                <th>
                  Sets
                  <span className={styles.sortIcon}>↕</span>
                </th>
                <th>
                  Reps
                  <span className={styles.sortIcon}>↕</span>
                </th>
                <th>
                  Rest
                  <span className={styles.sortIcon}>↕</span>
                </th>
                <th>
                  Weight
                  <span className={styles.sortIcon}>↕</span>
                </th>
                <th>
                  Calories
                  <span className={styles.sortIcon}>↕</span>
                </th>
                <th>
                  Status
                  <span className={styles.sortIcon}>↕</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentExercises.map((exercise) => (
                <tr key={exercise.id} className={styles.tableRow}>
                  <td>
                    <div className={styles.exerciseCell}>
                      <div className={styles.exerciseIcon} style={{ background: exercise.iconBg }}>
                        <span>{exercise.icon}</span>
                      </div>
                      <span className={styles.exerciseName}>{exercise.name}</span>
                    </div>
                  </td>
                  <td className={styles.sets}>{exercise.sets}</td>
                  <td className={styles.reps}>{exercise.reps}</td>
                  <td className={styles.rest}>{exercise.rest}</td>
                  <td className={styles.weight}>{exercise.weight}</td>
                  <td className={styles.calories}>{exercise.calories} cal</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(exercise.status)}`}>
                      {exercise.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing 
            <select 
              className={styles.perPageSelect}
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={12}>12</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            out of {filteredExercises.length}
          </div>
          <div className={styles.paginationControls}>
            <button 
              className={styles.pageBtn}
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              1
            </button>
            <button 
              className={styles.pageBtn}
              onClick={() => setCurrentPage(2)}
              disabled={currentPage === 2 || totalPages < 2}
            >
              2
            </button>
            <button 
              className={styles.pageBtn}
              onClick={() => setCurrentPage(3)}
              disabled={currentPage === 3 || totalPages < 3}
            >
              3
            </button>
            <button 
              className={styles.pageBtn}
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className={styles.promoBanner}>
        <div className={styles.promoContent}>
          <div className={styles.promoVeggies}>🥬</div>
          <div className={styles.promoText}>
            <p className={styles.promoTitle}>Start your health journey</p>
            <p className={styles.promoSubtitle}>
              with a <strong>FREE 1-month</strong>
            </p>
            <p className={styles.promoSubtitle}>access to Nutrigo</p>
          </div>
        </div>
        <button className={styles.claimBtn}>Claim Now!</button>
      </div>
    </div>
  );
}
