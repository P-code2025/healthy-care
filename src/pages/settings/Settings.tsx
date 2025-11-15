import { useState, useEffect } from 'react';
import styles from './Settings.module.css';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { formatGoalWeight, getGoalWeightFromUser } from '../../utils/profile';
import { messages } from '../../i18n/messages';

interface UserProfile {
  name: string;
  email: string;
  age: number;
  height: number;
  weight: number;
  goalWeight: number;
  gender: string;
  neck?: number;
  waist?: number;
  hip?: number;
  biceps?: number;
  thigh?: number;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'account'>('profile');
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    age: 0,
    height: 0,
    weight: 0,
    goalWeight: 0,
    gender: "",
  });

  const [notifications, setNotifications] = useState({
    mealReminders: true,
    workoutReminders: true,
    progressUpdates: true,
    weeklyReports: true,
    emailNotifications: false,
    pushNotifications: true
  });

  // Load profile data from the API on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await api.getCurrentUser();
        setProfile({
          name: user.email.split('@')[0],
          email: user.email,
          age: user.age || 0,
          height: user.height_cm || 0,
          weight: user.weight_kg || 0,
          goalWeight: getGoalWeightFromUser(user),
          gender: user.gender || '',
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem("userProfile");
        if (saved) {
          const data = JSON.parse(saved);
          setProfile((prev) => ({ ...prev, ...data }));
        }
      }
    };
    fetchProfile();
  }, []);

  // Keep a localStorage copy in sync for offline fallback
  const handleProfileUpdate = (field: keyof UserProfile, value: any) => {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    localStorage.setItem("userProfile", JSON.stringify(updated));
  };

  // Persist profile data through the API
  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateCurrentUser({
        age: profile.age,
        gender: profile.gender,
        height_cm: profile.height,
        weight_kg: profile.weight,
        goal: formatGoalWeight(profile.goalWeight),
      });
      toast.success(messages.settings.saveSuccess);
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error(messages.settings.saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = (field: keyof typeof notifications) => {
    setNotifications({ ...notifications, [field]: !notifications[field] });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Settings</h2>

      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <button
            className={`${styles.tabButton} ${activeTab === "profile" ? styles.active : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <span className={styles.tabIcon}>👤</span> Profile
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "notifications" ? styles.active : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            <span className={styles.tabIcon}>🔔</span> Notifications
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "account" ? styles.active : ""}`}
            onClick={() => setActiveTab("account")}
          >
            <span className={styles.tabIcon}>🔐</span> Account
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === "profile" && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Personal Information</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleProfileUpdate("name", e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileUpdate("email", e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Age</label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => handleProfileUpdate("age", parseInt(e.target.value) || 0)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) => handleProfileUpdate("height", parseInt(e.target.value) || 0)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Current Weight (kg)</label>
                  <input
                    type="number"
                    value={profile.weight}
                    onChange={(e) => handleProfileUpdate("weight", parseFloat(e.target.value) || 0)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Goal Weight (kg)</label>
                  <input
                    type="number"
                    value={profile.goalWeight}
                    onChange={(e) => handleProfileUpdate("goalWeight", parseFloat(e.target.value) || 0)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Gender</label>
                  <select
                    value={profile.gender}
                    onChange={(e) => handleProfileUpdate("gender", e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Select</option>
                    <option value="Nam">Male</option>
                    <option value="Nữ">Female</option>
                  </select>
                </div>
              </div>
              <button 
                className={styles.saveButton}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? messages.common.saving : messages.common.saveChanges}
              </button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Notification Settings</h3>

              <div className={styles.notificationGroup}>
                <div className={styles.notificationItem}>
                  <div>
                    <h4 className={styles.notificationTitle}>Meal Reminders</h4>
                    <p className={styles.notificationDescription}>Get reminded about meal times</p>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={notifications.mealReminders}
                      onChange={() => handleNotificationToggle('mealReminders')}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.notificationItem}>
                  <div>
                    <h4 className={styles.notificationTitle}>Workout Reminders</h4>
                    <p className={styles.notificationDescription}>Get reminded about workouts</p>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={notifications.workoutReminders}
                      onChange={() => handleNotificationToggle('workoutReminders')}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.notificationItem}>
                  <div>
                    <h4 className={styles.notificationTitle}>Progress Updates</h4>
                    <p className={styles.notificationDescription}>Daily progress notifications</p>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={notifications.progressUpdates}
                      onChange={() => handleNotificationToggle('progressUpdates')}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.notificationItem}>
                  <div>
                    <h4 className={styles.notificationTitle}>Weekly Reports</h4>
                    <p className={styles.notificationDescription}>Weekly summary reports</p>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={notifications.weeklyReports}
                      onChange={() => handleNotificationToggle('weeklyReports')}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.notificationItem}>
                  <div>
                    <h4 className={styles.notificationTitle}>Push Notifications</h4>
                    <p className={styles.notificationDescription}>Receive push notifications</p>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={notifications.pushNotifications}
                      onChange={() => handleNotificationToggle('pushNotifications')}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Account Settings</h3>

              <div className={styles.accountSection}>
                <div className={styles.accountItem}>
                  <div>
                    <h4 className={styles.accountTitle}>Change Password</h4>
                    <p className={styles.accountDescription}>Update your password regularly for security</p>
                  </div>
                  <button className={styles.secondaryButton}>Change Password</button>
                </div>

              </div>

              <div className={styles.dangerZone}>
                <h4 className={styles.dangerTitle}>Danger Zone</h4>
                <div className={styles.accountItem}>
                  <div>
                    <h4 className={styles.accountTitle}>Delete Account</h4>
                    <p className={styles.accountDescription}>Permanently delete your account and all data</p>
                  </div>
                  <button className={styles.dangerButton}>Delete Account</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


