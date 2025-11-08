import { useState } from 'react';
import styles from './Settings.module.css';

interface UserProfile {
  name: string;
  email: string;
  age: number;
  height: number;
  weight: number;
  goal: string;
  activityLevel: string;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'account'>('profile');
  
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Adam Johnson',
    email: 'adam.johnson@email.com',
    age: 28,
    height: 175,
    weight: 77,
    goal: 'weight-loss',
    activityLevel: 'moderate'
  });

  const [notifications, setNotifications] = useState({
    mealReminders: true,
    workoutReminders: true,
    progressUpdates: true,
    weeklyReports: true,
    emailNotifications: false,
    pushNotifications: true
  });

  const handleProfileUpdate = (field: keyof UserProfile, value: string | number) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleNotificationToggle = (field: keyof typeof notifications) => {
    setNotifications({ ...notifications, [field]: !notifications[field] });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Settings</h2>

      <div className={styles.layout}>
        {/* Sidebar Navigation */}
        <div className={styles.sidebar}>
          <button
            className={`${styles.tabButton} ${activeTab === 'profile' ? styles.active : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className={styles.tabIcon}>👤</span>
            Profile
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'preferences' ? styles.active : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <span className={styles.tabIcon}>⚙️</span>
            Preferences
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'notifications' ? styles.active : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <span className={styles.tabIcon}>🔔</span>
            Notifications
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'account' ? styles.active : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <span className={styles.tabIcon}>🔐</span>
            Account
          </button>
        </div>

        {/* Content Area */}
        <div className={styles.content}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Personal Information</h3>
              
              <div className={styles.profileHeader}>
                <div className={styles.avatar}>
                  <span className={styles.avatarIcon}>👤</span>
                </div>
                <button className={styles.uploadButton}>Upload Photo</button>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleProfileUpdate('name', e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileUpdate('email', e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Age</label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => handleProfileUpdate('age', parseInt(e.target.value))}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Height (cm)</label>
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) => handleProfileUpdate('height', parseInt(e.target.value))}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Current Weight (kg)</label>
                  <input
                    type="number"
                    value={profile.weight}
                    onChange={(e) => handleProfileUpdate('weight', parseInt(e.target.value))}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Fitness Goal</label>
                  <select
                    value={profile.goal}
                    onChange={(e) => handleProfileUpdate('goal', e.target.value)}
                    className={styles.select}
                  >
                    <option value="weight-loss">Weight Loss</option>
                    <option value="muscle-gain">Muscle Gain</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="general-fitness">General Fitness</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Activity Level</label>
                  <select
                    value={profile.activityLevel}
                    onChange={(e) => handleProfileUpdate('activityLevel', e.target.value)}
                    className={styles.select}
                  >
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                    <option value="very-active">Very Active</option>
                  </select>
                </div>
              </div>

              <button className={styles.saveButton}>Save Changes</button>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>App Preferences</h3>

              <div className={styles.preferenceGroup}>
                <div className={styles.preferenceItem}>
                  <div>
                    <h4 className={styles.preferenceTitle}>Units</h4>
                    <p className={styles.preferenceDescription}>Choose your preferred measurement system</p>
                  </div>
                  <select className={styles.select}>
                    <option value="metric">Metric (kg, cm)</option>
                    <option value="imperial">Imperial (lbs, inches)</option>
                  </select>
                </div>

                <div className={styles.preferenceItem}>
                  <div>
                    <h4 className={styles.preferenceTitle}>Theme</h4>
                    <p className={styles.preferenceDescription}>Select your app theme</p>
                  </div>
                  <select className={styles.select}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div className={styles.preferenceItem}>
                  <div>
                    <h4 className={styles.preferenceTitle}>Language</h4>
                    <p className={styles.preferenceDescription}>Choose your language</p>
                  </div>
                  <select className={styles.select}>
                    <option value="en">English</option>
                    <option value="vi">Tiếng Việt</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                <div className={styles.preferenceItem}>
                  <div>
                    <h4 className={styles.preferenceTitle}>Start of Week</h4>
                    <p className={styles.preferenceDescription}>Set your preferred week start day</p>
                  </div>
                  <select className={styles.select}>
                    <option value="sunday">Sunday</option>
                    <option value="monday">Monday</option>
                  </select>
                </div>
              </div>

              <button className={styles.saveButton}>Save Preferences</button>
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
                    <h4 className={styles.notificationTitle}>Email Notifications</h4>
                    <p className={styles.notificationDescription}>Receive notifications via email</p>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={() => handleNotificationToggle('emailNotifications')}
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

                <div className={styles.accountItem}>
                  <div>
                    <h4 className={styles.accountTitle}>Two-Factor Authentication</h4>
                    <p className={styles.accountDescription}>Add an extra layer of security</p>
                  </div>
                  <button className={styles.secondaryButton}>Enable 2FA</button>
                </div>

                <div className={styles.accountItem}>
                  <div>
                    <h4 className={styles.accountTitle}>Export Data</h4>
                    <p className={styles.accountDescription}>Download all your health data</p>
                  </div>
                  <button className={styles.secondaryButton}>Export</button>
                </div>

                <div className={styles.accountItem}>
                  <div>
                    <h4 className={styles.accountTitle}>Connected Devices</h4>
                    <p className={styles.accountDescription}>Manage connected fitness devices</p>
                  </div>
                  <button className={styles.secondaryButton}>Manage Devices</button>
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
