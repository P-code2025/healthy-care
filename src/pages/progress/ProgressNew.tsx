import { useState, useEffect } from 'react';
import styles from './ProgressNew.module.css';
import { api, type User } from '../../services/api';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Scale, Ruler, TrendingUp, Plus, Check, Camera } from 'lucide-react';

interface WeightLog {
  date: string;
  weight: number;
}

interface MeasurementLog {
  date: string;
  neck?: number;
  waist?: number;
  hip?: number;
  biceps?: number;
  thigh?: number;
}

export default function ProgressNew() {
  const [activeTab, setActiveTab] = useState<'weight' | 'measurements' | 'photos'>('weight');
  const [user, setUser] = useState<User | null>(null);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [measurementLogs, setMeasurementLogs] = useState<MeasurementLog[]>([]);
  const [period, setPeriod] = useState<'7' | '30' | '90' | 'all'>('30');
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newWeight, setNewWeight] = useState('');
  const [newMeasurements, setNewMeasurements] = useState({
    neck: '',
    waist: '',
    hip: '',
    biceps: '',
    thigh: '',
  });

  const [photosData, setPhotosData] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (activeTab === 'photos') {
      const loadPhotos = async () => {
        setLoading(true);
        try {
          const res = await api.getProgressPhotos();
          setPhotosData(res);
          const dates = Object.keys(res).sort().reverse();
          if (dates.length > 0) setSelectedDate(dates[0]);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadPhotos();
    }
  }, [activeTab]);

  const handleUpload = async (view: "front" | "side" | "back", file: File) => {
    if (!file) return;

    setUploading(true);

    const toBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });

    try {
      const base64 = await toBase64(file); 
      const today = new Date().toISOString().split("T")[0];

      await api.uploadProgressPhoto({
        date: today,
        view,
        imageBase64: base64,
        note: "",
      });

      const res = await api.getProgressPhotos();
      setPhotosData(res);

      const dates = Object.keys(res).sort((a, b) => b.localeCompare(a));
      const latestDate = dates[0];
      setSelectedDate(latestDate);

      alert("Upload thành công!");
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert("Upload thất bại: " + (err.message || "Lỗi không xác định"));
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, measurements] = await Promise.all([
          api.getCurrentUser(),
          api.getBodyMeasurements(),
        ]);

        setUser(userData);

        const heightM = (userData.height_cm || 170) / 100;

        const weightData = measurements
          .filter(m => m.weight_kg)
          .map(m => ({
            date: m.measured_at,
            weight: m.weight_kg,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        const measData = measurements.map(m => ({
          date: m.measured_at,
          neck: m.neck_cm || undefined,
          waist: m.waist_cm || undefined,
          hip: m.hip_cm || undefined,
          biceps: m.biceps_cm || undefined,
          thigh: m.thigh_cm || undefined,
        }));

        setWeightLogs(weightData);
        setMeasurementLogs(measData);
      } catch (err) {
        console.error("Error loading progress data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddWeight = async () => {
    const weight = parseFloat(newWeight);
    if (!weight || weight <= 0) {
      alert('Please enter a valid weight!');
      return;
    }

    setSaving(true);
    try {
      const saved = await api.createOrUpdateBodyMeasurement({ weight_kg: weight });
      const today = saved.measured_at.split('T')[0];
      setWeightLogs(prev => {
        const filtered = prev.filter(l => l.date !== today);
        return [...filtered, { date: today, weight: saved.weight_kg }].sort((a, b) => a.date.localeCompare(b.date));
      });

      if (user) {
        const updatedUser = await api.updateCurrentUser({ weightKg: saved.weight_kg });
        setUser(updatedUser);
      }

      setNewWeight('');
      setShowWeightForm(false);
    } catch (err) {
      alert('Failed to save weight!');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMeasurements = async () => {
    const payload: any = { weight_kg: user?.weight_kg || 70 };

    let hasValue = false;
    ['neck', 'waist', 'hip', 'biceps', 'thigh'].forEach(part => {
      const key = part as keyof typeof newMeasurements;
      if (newMeasurements[key]) {
        payload[`${part}_cm`] = parseFloat(newMeasurements[key]);
        hasValue = true;
      }
    });

    if (!hasValue) {
      alert('Please enter at least one measurement!');
      return;
    }

    setSaving(true);
    try {
      const saved = await api.createOrUpdateBodyMeasurement(payload);

      const today = saved.measured_at.split('T')[0];
      setMeasurementLogs(prev => {
        const filtered = prev.filter(l => l.date !== today);
        return [...filtered, {
          date: today,
          neck: saved.neck_cm || undefined,
          waist: saved.waist_cm || undefined,
          hip: saved.hip_cm || undefined,
          biceps: saved.biceps_cm || undefined,
          thigh: saved.thigh_cm || undefined,
        }].sort((a, b) => a.date.localeCompare(b.date));
      });

      const updatePayload: any = {};
      if (saved.neck_cm) updatePayload.neckCm = saved.neck_cm;
      if (saved.waist_cm) updatePayload.waistCm = saved.waist_cm;
      if (saved.hip_cm) updatePayload.hipCm = saved.hip_cm;
      if (saved.biceps_cm) updatePayload.bicepsCm = saved.biceps_cm;
      if (saved.thigh_cm) updatePayload.thighCm = saved.thigh_cm;

      if (Object.keys(updatePayload).

        length > 0) {
        const updatedUser = await api.updateCurrentUser(updatePayload);
        setUser(updatedUser);
      }

      setNewMeasurements({ neck: '', waist: '', hip: '', biceps: '', thigh: '' });
      setShowMeasurementForm(false);
    } catch (err) {
      alert('Failed to save measurements!');
    } finally {
      setSaving(false);
    }
  };

  const filteredWeightLogs = weightLogs.slice(period === 'all' ? 0 : -Number(period));
  const weightChartData = filteredWeightLogs.map(log => ({
    date: format(new Date(log.date), 'dd/MM'),
    weight: log.weight.toFixed(1),
  }));

  const filteredMeasLogs = measurementLogs.slice(period === 'all' ? 0 : -Number(period));
  const measChartData = filteredMeasLogs.map(log => ({
    date: format(new Date(log.date), 'dd/MM'),
    waist: log.waist?.toFixed(1),
    neck: log.neck?.toFixed(1),
    hip: log.hip?.toFixed(1),
    biceps: log.biceps?.toFixed(1),
    thigh: log.thigh?.toFixed(1),
  }));

  const latestWeight = weightLogs[weightLogs.length - 1]?.weight;
  const firstWeight = weightLogs[0]?.weight;
  const weightChange = firstWeight ? (firstWeight - (latestWeight || 0)).toFixed(1) : '0';

  if (loading) return <div className={styles.container}>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Your Progress</h1>
        <p className={styles.subtitle}>Track your body's changes daily</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <Scale className={styles.statIcon} />
          <div className={styles.statLabel}>Current Weight</div>
          <div className={styles.statValue}>{latestWeight?.toFixed(1) || '--'} <span>kg</span></div>
        </div>
        <div className={styles.statCard}>
          <TrendingUp className={styles.statIcon} />
          <div className={styles.statLabel}>Change</div>
          <div className={`${styles.statValue} ${Number(weightChange) > 0 ? styles.positive : styles.negative}`}>
            {Number(weightChange) > 0 ? '-' : '+'}{Math.abs(Number(weightChange))} kg
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'weight' ? styles.activeTab : ''}`} onClick={() => setActiveTab('weight')}>
          <Scale className="w-4 h-4" /> Weight
        </button>
        <button className={`${styles.tab} ${activeTab === 'measurements' ? styles.activeTab : ''}`} onClick={() => setActiveTab('measurements')}>
          <Ruler className="w-4 h-4" /> Measurements
        </button>
        <button className={`${styles.tab} ${activeTab === 'photos' ? styles.activeTab : ''}`} onClick={() => setActiveTab('photos')}>
          Photos
        </button>
      </div>

      {activeTab === 'weight' && (
        <div className={styles.chartSection}>
          <div className={styles.periodControl}>
            <div className={styles.periodButtons}>
              {(['7', '30', '90', 'all'] as const).map(p => (
                <button key={p} className={`${styles.periodBtn} ${period === p ? styles.periodActive : ''}`} onClick={() => setPeriod(p)}>
                  {p === 'all' ? 'All' : `${p} days`}
                </button>
              ))}
            </div>
            <button onClick={() => setShowWeightForm(true)} className={styles.addButton}>
              <Plus className="w-5 h-5" /> Add Today's Weight
            </button>
          </div>

          {showWeightForm && (
            <div className={`${styles.card} ${styles.formCard}`}>
              <h3>Enter Today's Weight ({format(new Date(), 'dd/MM/yyyy')})</h3>
              <div className={styles.formGrid}>
                <input
                  type="number"
                  step="0.1"
                  placeholder="72.5"
                  value={newWeight}
                  onChange={e => setNewWeight(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.formActions}>
                <button onClick={() => setShowWeightForm(false)} className={styles.cancelBtn}>Hủy</button>
                <button onClick={handleAddWeight} disabled={saving} className={styles.saveBtn}>
                  {saving ? 'Đang lưu...' : <><Check className="w-5 h-5" /> Lưu</>}
                </button>
              </div>
            </div>
          )}

          <div className={styles.card}>
            <h3 className={styles.chartTitle}>Weight Changes</h3>
            {weightChartData.length === 0 ? (
              <p className={styles.emptyState}>No weight data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={weightChartData}>
                  <CartesianGrid strokeDasharray="4 4" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={4} name="Cân nặng (kg)" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

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
            <button onClick={() => setShowMeasurementForm(true)} className={styles.addButton}>
              <Plus className="w-5 h-5" /> Add Today's Measurements
            </button>
          </div>

          {showMeasurementForm && (
            <div className={`${styles.card} ${styles.formCard}`}>
              <h3>Enter Today's Measurements ({format(new Date(), 'dd/MM/yyyy')})</h3>
              <div className={styles.formGrid}>
                {['neck', 'waist', 'hip', 'biceps', 'thigh'].map(part => (
                  <div key={part}>
                    <label className={styles.formLabel}>
                      {part === 'neck' ? 'Neck' : part === 'waist' ? 'Waist' : part === 'hip' ? 'Hip' : part === 'biceps' ? 'Biceps' : 'Thigh'} (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newMeasurements[part as keyof typeof newMeasurements]}
                      onChange={e => setNewMeasurements(prev => ({ ...prev, [part]: e.target.value }))}
                      className={styles.input}
                      placeholder="38.5"
                    />
                  </div>
                ))}
              </div>
              <div className={styles.formActions}>
                <button onClick={() => setShowMeasurementForm(false)} className={styles.cancelBtn}>Hủy</button>
                <button onClick={handleAddMeasurements} disabled={saving} className={styles.saveBtn}>
                  {saving ? 'Đang lưu...' : <><Check className="w-5 h-5" /> Lưu số đo</>}
                </button>
              </div>
            </div>
          )}

          <div className={styles.card}>
            <h3 className={styles.chartTitle}>Body Measurements Changes</h3>
            {measChartData.length === 0 ? (
              <p className={styles.emptyState}>No measurements available</p>
            ) : (
              <ResponsiveContainer width="100%" height={420}>
                <LineChart data={measChartData}>
                  <CartesianGrid strokeDasharray="4 4" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="waist" stroke="#f59e0b" strokeWidth={3} name="Eo (cm)" />
                  <Line type="monotone" dataKey="neck" stroke="#3b82f6" name="Cổ (cm)" />
                  <Line type="monotone" dataKey="hip" stroke="#8b5cf6" name="Mông (cm)" />
                  <Line type="monotone" dataKey="biceps" stroke="#ef4444" name="Bắp tay (cm)" />
                  <Line type="monotone" dataKey="thigh" stroke="#ec4899" name="Đùi (cm)" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {measurementLogs.length > 0 && (
            <div className={`${styles.card} ${styles.latestMeasurements}`}>
              <h3>Latest Measurements</h3>
              <div className={styles.measurementGrid}>
                {[
                  { label: 'Waist', value: measurementLogs[measurementLogs.length - 1].waist?.toFixed(1) },
                  { label: 'Neck', value: measurementLogs[measurementLogs.length - 1].neck?.toFixed(1) },
                  { label: 'Hip', value: measurementLogs[measurementLogs.length - 1].hip?.toFixed(1) },
                  { label: 'Biceps', value: measurementLogs[measurementLogs.length - 1].biceps?.toFixed(1) },
                  { label: 'Thigh', value: measurementLogs[measurementLogs.length - 1].thigh?.toFixed(1) },
                ].map(item => (
                  <div key={item.label} className={styles.measurementItem}>
                    <div className={styles.measurementLabel}>{item.label}</div>
                    <div className={styles.measurementValue}>
                      {item.value || '--'} <span className={styles.unit}>cm</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'photos' && (
        <div className={styles.chartSection}>
          <div className={styles.periodControl}>
            <div className={styles.periodButtons}>
              {(['7', '30', '90', 'all'] as const).map(p => (
                <button key={p} className={`${styles.periodBtn} ${period === p ? styles.periodActive : ''}`} onClick={() => setPeriod(p)}>
                  {p === 'all' ? 'All' : `${p} days`}
                </button>
              ))}
            </div>
          </div>

          <div className={`${styles.card} ${styles.formCard}`}>
            <h3>Upload body's image today ({format(new Date(), 'dd/MM/yyyy')})</h3>
            <div className={styles.photoUploadGrid}>
              {(['front', 'side', 'back'] as const).map(view => (
                <div key={view} className={styles.uploadBox}>
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => e.target.files?.[0] && handleUpload(view, e.target.files[0])}
                      disabled={uploading}
                      style={{ display: 'none' }}
                    />
                    <div className={styles.uploadPlaceholder}>
                      {uploading ? "Uploading..." : (
                        <>
                          <Camera className="w-8 h-8" />
                          <p>{view === 'front' ? 'Front' : view === 'side' ? 'Side' : 'Back'}</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <h3>Compare changes</h3>
            <div className={styles.dateSelector}>
              {Object.keys(photosData)
                .sort((a, b) => b.localeCompare(a))
                .filter((_, i) => period === 'all' || i < Number(period))
                .map(d => (
                  <button
                    key={d}
                    className={`${styles.dateBtn} ${selectedDate === d ? styles.dateActive : ''}`}
                    onClick={() => setSelectedDate(d)}
                  >
                    {format(new Date(d), 'dd/MM')}
                  </button>
                ))}
            </div>

            {selectedDate && photosData[selectedDate] && (
              <div className={styles.comparisonGrid}>
                {(['front', 'side', 'back'] as const).map(view => {
                  const img = photosData[selectedDate][view];
                  return (
                    <div key={view} className={styles.photoItem}>
                      <p className={styles.photoLabel}>
                        {view === 'front' ? 'Front' : view === 'side' ? 'Side' : 'Back'}
                      </p>
                      {img ? (
                        <img src={img.imageUrl} alt={view} className={styles.progressImg} />
                      ) : (
                        <div className={styles.noPhoto}>No photo</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!selectedDate && <p className={styles.emptyState}>No photos yet. Please upload today's photos!</p>}
          </div>
        </div>
      )}
    </div>
  );
}