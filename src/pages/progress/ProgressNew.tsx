// src/pages/ProgressNew.tsx
import { useState, useEffect } from 'react';
import styles from './ProgressNew.module.css';
import { api, type User } from '../../services/api';
import { format, subDays } from 'date-fns';

interface BodyMeasurement {
  label: string;
  key: 'biceps_cm' | 'neck_cm' | 'waist_cm' | 'hip_cm' | 'thigh_cm';
  unit: string;
  position: { top: string; left: string };
}

const BODY_MEASUREMENTS: BodyMeasurement[] = [
  { label: 'Arm', key: 'biceps_cm', unit: 'cm', position: { top: '15%', left: '25%' } },
  { label: 'Chest', key: 'neck_cm', unit: 'cm', position: { top: '25%', left: '15%' } }, // dùng neck thay chest tạm
  { label: 'Waist', key: 'waist_cm', unit: 'cm', position: { top: '40%', left: '25%' } },
  { label: 'Hips', key: 'hip_cm', unit: 'cm', position: { top: '55%', left: '25%' } },
  { label: 'Thigh', key: 'thigh_cm', unit: 'cm', position: { top: '75%', left: '20%' } },
];

export default function ProgressNew() {
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Lấy user + stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await api.getCurrentUser();
        setUser(userData);
        setEditForm({
          weight_kg: userData.weight_kg || 0,
          height_cm: userData.height_cm || 0,
          neck_cm: userData.neck_cm || 0,
          waist_cm: userData.waist_cm || 0,
          hip_cm: userData.hip_cm || 0,
          biceps_cm: userData.biceps_cm || 0,
          thigh_cm: userData.thigh_cm || 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await api.updateCurrentUser({
        weightKg: editForm.weight_kg ?? undefined,
        heightCm: editForm.height_cm ?? undefined,
        neckCm: editForm.neck_cm ?? undefined,
        waistCm: editForm.waist_cm ?? undefined,
        hipCm: editForm.hip_cm ?? undefined,
        bicepsCm: editForm.biceps_cm ?? undefined,
        thighCm: editForm.thigh_cm ?? undefined,
      });
      setUser(updated);
      setEditing(false);
      alert('Cập nhật thành công!');
    } catch (err) {
      alert('Lỗi khi lưu, thử lại nhé!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.container}>Đang tải dữ liệu...</div>;
  }

  if (!user) {
    return <div className={styles.container}>Không tìm thấy thông tin người dùng</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Tiến Độ Của Bạn</h1>
        <button
          onClick={() => setEditing(!editing)}
          className={styles.periodBtn + ' ' + (editing ? styles.active : '')}
        >
          {editing ? 'Hủy' : 'Chỉnh sửa số đo'}
        </button>
      </div>

      <div className={styles.mainGrid}>
        {/* Cột trái - Body Measurements */}
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Số Đo Cơ Thể</h3>
            </div>

            <div className={styles.bodyMeasurementContainer}>
              <div className={styles.bodySvgWrapper}>
                {/* SVG giữ nguyên */}
                <svg viewBox="0 0 300 600" className={styles.bodySvg}>
                  <ellipse cx="150" cy="50" rx="30" ry="40" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
                  <line x1="150" y1="90" x2="150" y2="110" stroke="#9CA3AF" strokeWidth="15"/>
                  <circle cx="110" cy="120" r="15" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
                  <circle cx="190" cy="120" r="15" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
                  <ellipse cx="150" cy="200" rx="50" ry="80" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
                  <line x1="110" y1="120" x2="70" y2="220" stroke="#9CA3AF" strokeWidth="12"/>
                  <line x1="190" y1="120" x2="230" y2="220" stroke="#9CA3AF" strokeWidth="12"/>
                  <line x1="70" y1="220" x2="50" y2="300" stroke="#9CA3AF" strokeWidth="10"/>
                  <line x1="230" y1="220" x2="250" y2="300" stroke="#9CA3AF" strokeWidth="10"/>
                  <circle cx="50" cy="310" r="12" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
                  <circle cx="250" cy="310" r="12" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
                  <ellipse cx="150" cy="300" rx="55" ry="30" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
                  <line x1="130" y1="330" x2="120" y2="450" stroke="#9CA3AF" strokeWidth="18"/>
                  <line x1="170" y1="330" x2="180" y2="450" stroke="#9CA3AF" strokeWidth="18"/>
                  <line x1="120" y1="450" x2="115" y2="550" stroke="#9CA3AF" strokeWidth="14"/>
                  <line x1="180" y1="450" x2="185" y2="550" stroke="#9CA3AF" strokeWidth="14"/>
                  <ellipse cx="115" cy="565" rx="15" ry="8" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
                  <ellipse cx="185" cy="565" rx="15" ry="8" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
                  <circle cx="110" cy="150" r="4" fill="#FF6B6B"/>
                  <circle cx="150" cy="180" r="4" fill="#FF6B6B"/>
                  <circle cx="150" cy="250" r="4" fill="#FF6B6B"/>
                  <circle cx="150" cy="310" r="4" fill="#FF6B6B"/>
                  <circle cx="125" cy="390" r="4" fill="#FF6B6B"/>
                </svg>

                {/* Labels - DỮ LIỆU THẬT + EDIT MODE */}
                {BODY_MEASUREMENTS.map((m) => {
                  const value = user[m.key] as number | null;
                  return (
                    <div key={m.key} className={styles.measurementLabel} style={m.position}>
                      <div className={styles.measurementLine}></div>
                      <div className={styles.measurementBadge}>
                        <div className={styles.measurementText}>{m.label}</div>
                        {editing ? (
                          <input
                            type="number"
                            value={editForm[m.key] ?? ''}
                            onChange={(e) => setEditForm({ ...editForm, [m.key]: parseFloat(e.target.value) || 0 })}
                            className={styles.measurementInput}
                            step="0.1"
                          />
                        ) : (
                          <div className={styles.measurementValue}>
                            {value?.toFixed(1) || '--'} {m.unit}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form chỉnh sửa cân nặng, chiều cao */}
            {editing && (
              <div className={styles.editForm}>
                <div className={styles.formRow}>
                  <div>
                    <label>Cân nặng (kg)</label>
                    <input
                      type="number"
                      value={editForm.weight_kg || ''}
                      onChange={(e) => setEditForm({ ...editForm, weight_kg: parseFloat(e.target.value) || 0 })}
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label>Chiều cao (cm)</label>
                    <input
                      type="number"
                      value={editForm.height_cm || ''}
                      onChange={(e) => setEditForm({ ...editForm, height_cm: parseFloat(e.target.value) || 0 })}
                      step="0.1"
                    />
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button onClick={handleSave} disabled={saving} className={styles.saveBtn}>
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cột giữa - Weight Chart (dùng dữ liệu thật từ user.weight_kg) */}
        <div className={styles.middleColumn}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Theo Dõi Cân Nặng</h3>
            </div>
            <div className={styles.weightInfo}>
              <div className={styles.weightStat}>
                <span className={styles.weightLabel}>Cân nặng hiện tại</span>
                <span className={styles.weightValue}>{user.weight_kg?.toFixed(1) || '--'} kg</span>
              </div>
              <div className={styles.weightStat}>
                <span className={styles.weightLabel}>Chiều cao</span>
                <span className={styles.weightValue}>{user.height_cm || '--'} cm</span>
              </div>
              <div className={styles.weightStat}>
                <span className={styles.weightLabel}>BMI</span>
                <span className={styles.weightValue}>
                  {user.weight_kg && user.height_cm
                    ? ((user.weight_kg / ((user.height_cm / 100) ** 2))).toFixed(1)
                    : '--'}
                </span>
              </div>
            </div>

            {/* Chart đơn giản (có thể nâng cấp sau) */}
            <div className={styles.chartWrapper}>
              <svg viewBox="0 0 500 150" className={styles.lineChart}>
                <polyline
                  points="0,100 100,90 200,80 300,70 400,60 500,50"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                />
                <text x="250" y="80" textAnchor="middle" fill="#10b981" fontWeight="bold">
                  ↓ Giảm cân đều đặn
                </text>
              </svg>
              <div className={styles.chartLabels}>
                <span>Tuần trước</span>
                <span>Hôm nay</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải - giữ nguyên phần calories nếu cần */}
        <div className={styles.rightColumn}>
          {/* Có thể thêm chart calo ở đây sau */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Mẹo nhỏ</h3>
            </div>
            <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              Cập nhật số đo thường xuyên để theo dõi tiến độ chính xác nhất!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}