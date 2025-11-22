import { useState, useEffect } from 'react';
import styles from './ProgressNew.module.css';
import { api, type User } from '../../services/api';
import { format, subDays, addDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, TrendingUp, Camera, Plus, Check, Ruler, Scale } from 'lucide-react';

interface MeasurementLog {
  date: string;
  weight: number;
  neck?: number;
  waist?: number;
  hip?: number;
  biceps?: number;
  thigh?: number;
}

export default function ProgressNew() {
  const [activeTab, setActiveTab] = useState<'weight' | 'measurements' | 'photos'>('measurements');
  const [user, setUser] = useState<User | null>(null);
  const [targetWeight, setTargetWeight] = useState<number | ''>('');
  const [measurementLogs, setMeasurementLogs] = useState<MeasurementLog[]>([]);
  const [period, setPeriod] = useState<'7' | '30' | '90' | 'all'>('30');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newEntry, setNewEntry] = useState({
    weight: '',
    neck: '',
    waist: '',
    hip: '',
    biceps: '',
    thigh: '',
  });

  // Load dữ liệu
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, measurements] = await Promise.all([
          api.getCurrentUser(),
          api.getBodyMeasurements(),
        ]);

        setUser(userData);
        setTargetWeight(userData.goal ? Number(userData.goal) : '');

        // Chuyển đổi từ DB → format cho biểu đồ
        const logs = measurements
          .map((m): MeasurementLog => {
            const heightM = (userData.height_cm || 170) / 100;
            const bmi = m.weight_kg / (heightM * heightM);
            return {
              date: m.measured_at.split('T')[0],
              weight: m.weight_kg,
              neck: m.neck_cm || undefined,
              waist: m.waist_cm || undefined,
              hip: m.hip_cm || undefined,
              biceps: m.biceps_cm || undefined,
              thigh: m.thigh_cm || undefined,
            };
          })
          .sort((a, b) => a.date.localeCompare(b.date));

        setMeasurementLogs(logs);
      } catch (err) {
        console.error("Error loading progress data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddToday = async () => {
    if (!newEntry.weight || parseFloat(newEntry.weight) <= 0) {
      alert('Please enter a valid weight!');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        weight_kg: parseFloat(newEntry.weight),
        neck_cm: newEntry.neck ? parseFloat(newEntry.neck) : undefined,
        waist_cm: newEntry.waist ? parseFloat(newEntry.waist) : undefined,
        hip_cm: newEntry.hip ? parseFloat(newEntry.hip) : undefined,
        biceps_cm: newEntry.biceps ? parseFloat(newEntry.biceps) : undefined,
        thigh_cm: newEntry.thigh ? parseFloat(newEntry.thigh) : undefined,
      };

      const saved = await api.createOrUpdateBodyMeasurement(payload);

      // Cập nhật local state
      const today = saved.measured_at.split('T')[0];
      const heightM = (user?.height_cm || 170) / 100;
      const bmi = saved.weight_kg / (heightM * heightM);

      const newLog: MeasurementLog = {
        date: today,
        weight: saved.weight_kg,
        neck: saved.neck_cm || undefined,
        waist: saved.waist_cm || undefined,
        hip: saved.hip_cm || undefined,
        biceps: saved.biceps_cm || undefined,
        thigh: saved.thigh_cm || undefined,
      };

      setMeasurementLogs(prev => {
        const filtered = prev.filter(l => l.date !== today);
        return [...filtered, newLog].sort((a, b) => a.date.localeCompare(b.date));
      });

      setNewEntry({ weight: '', neck: '', waist: '', hip: '', biceps: '', thigh: '' });
      setShowAddForm(false);
    } catch (err) {
      alert('Failed to save. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredLogs = measurementLogs.slice(period === 'all' ? 0 : -Number(period));
  const chartData = filteredLogs.map(log => ({
    date: format(new Date(log.date), 'dd/MM'),
    weight: log.weight.toFixed(1),
    waist: log.waist?.toFixed(1),
    neck: log.neck?.toFixed(1),
    hip: log.hip?.toFixed(1),
    biceps: log.biceps?.toFixed(1),
    thigh: log.thigh?.toFixed(1),
  }));

  const latest = measurementLogs[measurementLogs.length - 1] || {};
  const first = measurementLogs[0] || {};
  const weightLost = first.weight ? (first.weight - latest.weight).toFixed(1) : '0';

  if (loading) {
    return <div className={styles.container}>Loading progress...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Your Progress</h1>
          <p className={styles.subtitle}>Track your body's transformation journey day by day</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <Scale className={styles.statIcon} />
          <div className={styles.statLabel}>Current Weight</div>
          <div className={styles.statValue}>{latest.weight?.toFixed(1) || '--'} <span>kg</span></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Lost</div>
          <div className={`${styles.statValue} ${Number(weightLost) > 0 ? styles.positive : styles.negative}`}>
            {Number(weightLost) > 0 ? '-' : '+'}{Math.abs(Number(weightLost))} kg
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'measurements' ? styles.activeTab : ''}`} onClick={() => setActiveTab('measurements')}>
          Measurements
        </button>
        <button className={`${styles.tab} ${activeTab === 'weight' ? styles.activeTab : ''}`} onClick={() => setActiveTab('weight')}>
          Weight
        </button>
        <button className={`${styles.tab} ${activeTab === 'photos' ? styles.activeTab : ''}`} onClick={() => setActiveTab('photos')}>
          Photos
        </button>
      </div>

      {/* Main Content */}
      {activeTab === 'measurements' && (
        <div className={styles.chartSection}>
          <div className={styles.periodControl}>
            <div className={styles.periodButtons}>
              {(['7', '30', '90', 'all'] as const).map(p => (
                <button key={p} className={`${styles.periodBtn} ${period === p ? styles.periodActive : ''}`} onClick={() => setPeriod(p)}>
                  {p === 'all' ? 'All' : `${p} days`}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={styles.addButton}
            >
              <Plus className="w-5 h-5" />
              Add today's measurements
            </button>
          </div>

          {/* Form thêm số đo */}
          {showAddForm && (
            <div className={`${styles.card} ${styles.formCard}`}>
              <h3 className={styles.formTitle}>Enter today's measurements ({format(new Date(), 'dd/MM/yyyy')})</h3>
              <div className={styles.formGrid}>
                <div>
                  <label className={styles.formLabel}>Weight (kg) *</label>
                  <input type="number" step="0.1" value={newEntry.weight} onChange={e => setNewEntry({ ...newEntry, weight: e.target.value })} className={styles.input} placeholder="72.5" />
                </div>
                {['neck', 'waist', 'hip', 'biceps', 'thigh'].map(part => (
                  <div key={part}>
                    <label className={styles.formLabel}>
                      {part === 'neck' ? 'Neck' : part === 'waist' ? 'Waist' : part === 'hip' ? 'Hip' : part === 'biceps' ? 'Biceps' : 'Thigh'} (cm)
                    </label>
                    <input type="number" step="0.1" value={newEntry[part as keyof typeof newEntry]} onChange={e => setNewEntry({ ...newEntry, [part]: e.target.value })} className={styles.input} />
                  </div>
                ))}
              </div>
              <div className={styles.formActions}>
                <button onClick={() => setShowAddForm(false)} className={styles.cancelBtn}>Cancel</button>
                <button onClick={handleAddToday} disabled={saving} className={styles.saveBtn}>
                  {saving ? 'Saving...' : <><Check className="w-5 h-5" /> Save Measurement</>}
                </button>
              </div>
            </div>
          )}

          {/* Biểu đồ */}
          <div className={styles.card}>
            <h3 className={styles.chartTitle}>Change chart over time</h3>
            {chartData.length === 0 ? (
              <p className={styles.emptyState}>No data available. Please add the first measurement!</p>
            ) : (
              <ResponsiveContainer width="100%" height={420}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="4 4" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '12px', color: 'white' }} />
                  <Legend />
                  <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={4} name="Weight (kg)" />
                  <Line type="monotone" dataKey="waist" stroke="#f59e0b" strokeWidth={3} name="Waist (cm)" />
                  <Line type="monotone" dataKey="neck" stroke="#3b82f6" name="Neck (cm)" />
                  <Line type="monotone" dataKey="hip" stroke="#8b5cf6" name="Hip (cm)" />
                  <Line type="monotone" dataKey="biceps" stroke="#ef4444" name="Biceps (cm)" />
                  <Line type="monotone" dataKey="thigh" stroke="#ec4899" name="Thigh (cm)" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Số đo mới nhất */}
          {latest.weight && (
            <div className={`${styles.card} ${styles.latestMeasurements}`}>
              <h3 className={styles.chartTitle}>Most recent measurement ({format(new Date(latest.date), 'dd/MM/yyyy')})</h3>
              <div className={styles.measurementGrid}>
                {[
                  { label: 'Weight', value: latest.weight?.toFixed(1), unit: 'kg' },
                  { label: 'Waist', value: latest.waist?.toFixed(1), unit: 'cm' },
                  { label: 'Hip', value: latest.hip?.toFixed(1), unit: 'cm' },
                  { label: 'Neck', value: latest.neck?.toFixed(1), unit: 'cm' },
                  { label: 'Biceps', value: latest.biceps?.toFixed(1), unit: 'cm' },
                  { label: 'Thigh', value: latest.thigh?.toFixed(1), unit: 'cm' },
                ].map(item => (
                  <div key={item.label} className={styles.measurementItem}>
                    <div className={styles.measurementLabel}>{item.label}</div>
                    <div className={styles.measurementValue}>
                      {item.value || '--'} <span className={styles.unit}>{item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'weight' && (
        <div className={styles.card}>
          <h3 className={styles.chartTitle}>Weight Tracking</h3>
          <p className={styles.emptyState}>Weight tracking chart will display here</p>
        </div>
      )}

      {activeTab === 'photos' && (
        <div className={styles.card}>
          <h3 className={styles.chartTitle}>Progress Photos</h3>
          <p className={styles.emptyState}>Upload your progress photos here</p>
        </div>
      )}

    </div>
  );
}