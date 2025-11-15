import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import {
  MEAL_TEMPLATES,
  WORKOUT_TEMPLATES,
  type CalendarModuleKey,
  type CalendarTemplate,
} from "../../data/calendarTemplates";
import styles from "./Calendar.module.css";

type EventCategory = "meal" | "activity" | "appointment";

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date
  time: string; // HH:mm
  category: EventCategory;
  location?: string;
  note?: string;
  linkedModule?: CalendarModuleKey;
}

interface CalendarFormState {
  title: string;
  date: string;
  time: string;
  category: EventCategory;
  location: string;
  note: string;
  linkedModule: CalendarModuleKey;
}

const STORAGE_KEY = "calendar_events_v1";

const CATEGORY_META: Record<EventCategory, { label: string; color: string; icon: string }> = {
  meal: { label: "Meal Planning", color: "#bbf7d0", icon: "MP" },
  activity: { label: "Physical Activities", color: "#fed7aa", icon: "PA" },
  appointment: { label: "Appointments / Events", color: "#fde047", icon: "AE" },
};

const MODULE_LINKS: Record<CalendarModuleKey, { label: string; path: string }> = {
  "meal-plan": { label: "Meal Plan", path: "/meal-plan" },
  exercises: { label: "Exercises", path: "/exercises" },
  "food-diary": { label: "Food Diary", path: "/food-diary" },
  messages: { label: "Messages", path: "/messages" },
};

const DEFAULT_LINK_BY_CATEGORY: Record<EventCategory, CalendarModuleKey> = {
  meal: "meal-plan",
  activity: "exercises",
  appointment: "messages",
};

const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Breakfast: Avocado Toast with Eggs",
    date: "2028-09-03",
    time: "07:30",
    category: "meal",
    location: "Home kitchen",
    note: "Keep hydration reminder nearby.",
    linkedModule: "meal-plan",
  },
  {
    id: "2",
    title: "Morning Yoga Session",
    date: "2028-09-04",
    time: "07:00",
    category: "activity",
    location: "Studio",
    note: "Flexibility + breathing drills",
    linkedModule: "exercises",
  },
  {
    id: "3",
    title: "Lunch: Quinoa Health Check-up",
    date: "2028-09-04",
    time: "12:00",
    category: "meal",
    location: "Downtown cafe",
    linkedModule: "meal-plan",
  },
  {
    id: "4",
    title: "Lunch: Chicken Stir-Fry for Two",
    date: "2028-09-05",
    time: "13:00",
    category: "meal",
    linkedModule: "meal-plan",
  },
  {
    id: "5",
    title: "Snack: Energy Bars",
    date: "2028-09-05",
    time: "15:00",
    category: "meal",
    linkedModule: "food-diary",
  },
  {
    id: "6",
    title: "Garden Nutrition Class",
    date: "2028-09-10",
    time: "15:30",
    category: "activity",
    location: "Community garden",
    linkedModule: "exercises",
  },
  {
    id: "7",
    title: "Breakfast: Green Salad",
    date: "2028-09-11",
    time: "07:00",
    category: "meal",
    linkedModule: "meal-plan",
  },
  {
    id: "8",
    title: "Dinner: Weight Training",
    date: "2028-09-12",
    time: "18:00",
    category: "activity",
    linkedModule: "exercises",
  },
  {
    id: "9",
    title: "Snack: Meal Prep",
    date: "2028-09-12",
    time: "16:00",
    category: "meal",
    linkedModule: "food-diary",
  },
  {
    id: "10",
    title: "Lunch: Greek Salad",
    date: "2028-09-14",
    time: "12:30",
    category: "meal",
    linkedModule: "meal-plan",
  },
  {
    id: "11",
    title: "Dinner: Overnight Jar Recipes",
    date: "2028-09-16",
    time: "19:00",
    category: "meal",
    linkedModule: "meal-plan",
  },
  {
    id: "12",
    title: "General Consultation",
    date: "2028-09-16",
    time: "13:00",
    category: "appointment",
    location: "Central Health Clinic",
    linkedModule: "messages",
  },
  {
    id: "13",
    title: "Group Fitness Class",
    date: "2028-09-21",
    time: "12:00",
    category: "activity",
    linkedModule: "exercises",
  },
  {
    id: "14",
    title: "Morning Training Session",
    date: "2028-09-27",
    time: "06:30",
    category: "activity",
    linkedModule: "exercises",
  },
  {
    id: "15",
    title: "Dinner: General Consultation",
    date: "2028-09-27",
    time: "19:30",
    category: "appointment",
    linkedModule: "messages",
  },
];

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDateLabel = (dateKey: string) =>
  parseDateKey(dateKey).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatTimeLabel = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const createEmptyForm = (date: string, category: EventCategory = "meal"): CalendarFormState => ({
  title: "",
  date,
  time: "08:00",
  category,
  location: "",
  note: "",
  linkedModule: DEFAULT_LINK_BY_CATEGORY[category],
});

const templateToFormState = (template: CalendarTemplate, date: string): CalendarFormState => ({
  title: template.title,
  date,
  time: template.time,
  category: template.category as EventCategory,
  location: template.location ?? "",
  note: template.note ?? "",
  linkedModule: template.linkedModule,
});

const isSameMonth = (eventDate: string, current: Date) => {
  const parsed = parseDateKey(eventDate);
  return (
    parsed.getFullYear() === current.getFullYear() &&
    parsed.getMonth() === current.getMonth()
  );
};

export default function Calendar() {
  const initialMonth = new Date(2028, 8, 1);
  const [currentDate, setCurrentDate] = useState(initialMonth);
  const [selectedDate, setSelectedDate] = useState(formatDateKey(initialMonth));
  const [selectedCategory, setSelectedCategory] = useState<Record<EventCategory, boolean>>({
    meal: true,
    activity: true,
    appointment: true,
  });
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("month");
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    if (typeof window === "undefined") return DEFAULT_EVENTS;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return DEFAULT_EVENTS;
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : DEFAULT_EVENTS;
    } catch {
      return DEFAULT_EVENTS;
    }
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState<CalendarFormState>(() => createEmptyForm(selectedDate));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMealTemplate, setSelectedMealTemplate] = useState(MEAL_TEMPLATES[0]?.id ?? "");
  const [selectedWorkoutTemplate, setSelectedWorkoutTemplate] = useState(
    WORKOUT_TEMPLATES[0]?.id ?? ""
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const monthEvents = useMemo(
    () => events.filter((event) => isSameMonth(event.date, currentDate)),
    [events, currentDate]
  );

  const dayEvents = useMemo(() => {
    return events
      .filter((event) => event.date === selectedDate && selectedCategory[event.category])
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [events, selectedDate, selectedCategory]);

  const conflictTimes = useMemo(() => {
    const counts: Record<string, number> = {};
    dayEvents.forEach((event) => {
      counts[event.time] = (counts[event.time] || 0) + 1;
    });
    return new Set(Object.entries(counts).filter(([, count]) => count > 1).map(([time]) => time));
  }, [dayEvents]);

  const summaryCounts = useMemo(() => {
    return {
      meal: monthEvents.filter((event) => event.category === "meal").length,
      activity: monthEvents.filter((event) => event.category === "activity").length,
      appointment: monthEvents.filter((event) => event.category === "appointment").length,
    };
  }, [monthEvents]);

  const changeMonth = useCallback((offset: number) => {
    setCurrentDate((prev) => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + offset, 1);
      setSelectedDate(formatDateKey(next));
      return next;
    });
  }, []);

  const openForm = useCallback(
    (event?: CalendarEvent, dateOverride?: string) => {
      if (event) {
        setFormState({
          title: event.title,
          date: event.date,
          time: event.time,
          category: event.category,
          location: event.location || "",
          note: event.note || "",
          linkedModule: event.linkedModule ?? DEFAULT_LINK_BY_CATEGORY[event.category],
        });
        setEditingId(event.id);
      } else {
        const baseDate = dateOverride || selectedDate;
        setFormState(createEmptyForm(baseDate));
        setEditingId(null);
      }
      setIsFormOpen(true);
    },
    [selectedDate]
  );

  const closeForm = () => setIsFormOpen(false);

  const handleFormChange = (
    field: keyof CalendarFormState,
    value: string
  ) => {
    setFormState((prev) => {
      if (field === "category") {
        const category = value as EventCategory;
        return {
          ...prev,
          category,
          linkedModule: DEFAULT_LINK_BY_CATEGORY[category],
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.title.trim()) return;

    if (editingId) {
      setEvents((prev) => prev.map((item) => (item.id === editingId ? { ...item, ...formState } : item)));
    } else {
      const newEvent: CalendarEvent = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString(),
        ...formState,
      };
      setEvents((prev) => [...prev, newEvent]);
    }

    setSelectedDate(formState.date);
    setIsFormOpen(false);
  };

  const handleRemove = (id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const applyTemplate = useCallback(
    (templateId: string, list: CalendarTemplate[]) => {
      const template = list.find((item) => item.id === templateId);
      if (!template) return;
      setFormState(templateToFormState(template, selectedDate));
      setEditingId(null);
      setIsFormOpen(true);
    },
    [selectedDate]
  );

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        changeMonth(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        changeMonth(1);
      } else if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        openForm();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [changeMonth, openForm]);

  const renderCalendarDays = () => {
    const days: JSX.Element[] = [];
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

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className={styles.emptyDay}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      );
      const dayEvents = monthEvents.filter((event) => {
        const parsed = parseDateKey(event.date);
        if (parsed.getDate() !== day) return false;
        return selectedCategory[event.category];
      });
      const isToday = dateKey === formatDateKey(new Date());

      days.push(
        <div
          key={day}
          className={`${styles.calendarDay} ${isToday ? styles.today : ""} ${
            dateKey === selectedDate ? styles.selectedDay : ""
          }`}
          onClick={() => setSelectedDate(dateKey)}
        >
          <span className={styles.dayNumber}>{day}</span>
          <div className={styles.dayEvents}>
            {dayEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className={styles.eventBlock}
                style={{ backgroundColor: CATEGORY_META[event.category].color }}
              >
                <div className={styles.eventTime}>{formatTimeLabel(event.time)}</div>
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
        <button className={styles.newScheduleButton} onClick={() => openForm()}>
          + New Schedule (N)
        </button>
      </div>

      <div className={styles.summaryCards}>
        {(Object.entries(CATEGORY_META) as [EventCategory, typeof CATEGORY_META.meal][]).map(
          ([category, meta]) => (
            <div key={category} className={styles.summaryCard} style={{ backgroundColor: meta.color }}>
              <div className={styles.summaryIcon}>{meta.icon}</div>
              <div className={styles.summaryContent}>
                <div className={styles.summaryValue}>{summaryCounts[category]}</div>
                <div className={styles.summaryLabel}>items this month</div>
                <div className={styles.summaryTitle}>{meta.label}</div>
              </div>
            </div>
          )
        )}
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.calendarSection}>
          <div className={styles.calendarControls}>
            <div className={styles.monthNavigation}>
              <button
                onClick={() => changeMonth(-1)}
                className={styles.navButton}
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>
              <h3 className={styles.monthTitle}>
                {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
              </h3>
              <button
                onClick={() => changeMonth(1)}
                className={styles.navButton}
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className={styles.viewControls}>
              {(["day", "week", "month"] as const).map((mode) => (
                <button
                  key={mode}
                  className={`${styles.viewButton} ${viewMode === mode ? styles.active : ""}`}
                  onClick={() => setViewMode(mode)}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.categoryFilters}>
            {(Object.keys(CATEGORY_META) as EventCategory[]).map((category) => (
              <label key={category} className={styles.filterCheckbox}>
                <input
                  type="checkbox"
                  checked={selectedCategory[category]}
                  onChange={() =>
                    setSelectedCategory((prev) => ({ ...prev, [category]: !prev[category] }))
                  }
                />
                <span className={styles.checkmark}></span>
                <span className={styles.filterLabel}>{CATEGORY_META[category].label}</span>
              </label>
            ))}
          </div>

          <div className={styles.calendarCard}>
            <div className={styles.weekDays}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className={styles.weekDay}>
                  {day}
                </div>
              ))}
            </div>

            <div className={styles.calendarGrid}>{renderCalendarDays()}</div>
          </div>
        </div>

        <div className={styles.sidebarSection}>
          <div className={styles.sidebarHeader}>
            <div>
              <h3 className={styles.sidebarTitle}>Schedule Details</h3>
              <p className={styles.sidebarSubtitle}>{formatDateLabel(selectedDate)}</p>
            </div>
            <button className={styles.addSmallButton} onClick={() => openForm(undefined, selectedDate)}>
              + Add
            </button>
          </div>

          <div className={styles.templateSection}>
            <p className={styles.templateTitle}>Quick import</p>
            <div className={styles.templateRow}>
              <select
                className={styles.templateSelect}
                value={selectedMealTemplate}
                onChange={(e) => setSelectedMealTemplate(e.target.value)}
              >
                {MEAL_TEMPLATES.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.title}
                  </option>
                ))}
              </select>
              <button
                className={styles.templateButton}
                onClick={() => applyTemplate(selectedMealTemplate, MEAL_TEMPLATES)}
              >
                Insert Meal
              </button>
            </div>
            <div className={styles.templateRow}>
              <select
                className={styles.templateSelect}
                value={selectedWorkoutTemplate}
                onChange={(e) => setSelectedWorkoutTemplate(e.target.value)}
              >
                {WORKOUT_TEMPLATES.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.title}
                  </option>
                ))}
              </select>
              <button
                className={styles.templateButton}
                onClick={() => applyTemplate(selectedWorkoutTemplate, WORKOUT_TEMPLATES)}
              >
                Insert Workout
              </button>
            </div>
          </div>

          <div className={styles.scheduleList}>
            {dayEvents.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🗓️</div>
                <p>No schedule yet. Create one to stay on track.</p>
              </div>
            ) : (
              dayEvents.map((detail) => {
                const linkedInfo = detail.linkedModule ? MODULE_LINKS[detail.linkedModule] : undefined;
                const hasConflict = conflictTimes.has(detail.time);
                return (
                  <div
                    key={detail.id}
                    className={`${styles.scheduleCard} ${hasConflict ? styles.conflictCard : ""}`}
                    style={{ borderLeft: `4px solid ${CATEGORY_META[detail.category].color}` }}
                  >
                    <div className={styles.scheduleBadge}>{CATEGORY_META[detail.category].label}</div>
                    {hasConflict && <span className={styles.conflictBadge}>Conflict</span>}
                    <h4 className={styles.scheduleTitle}>{detail.title}</h4>
                    <div className={styles.scheduleDetails}>
                      <div className={styles.scheduleDetail}>
                        <span className={styles.detailLabel}>Date</span>
                        <span>{formatDateLabel(detail.date)}</span>
                      </div>
                      <div className={styles.scheduleDetail}>
                        <span className={styles.detailLabel}>Time</span>
                        <span>{formatTimeLabel(detail.time)}</span>
                      </div>
                      {detail.location && (
                        <div className={styles.scheduleDetail}>
                          <span className={styles.detailLabel}>Place</span>
                          <span>{detail.location}</span>
                        </div>
                      )}
                    </div>
                    {linkedInfo && (
                      <Link className={styles.linkButton} to={linkedInfo.path}>
                        Open {linkedInfo.label} <ArrowUpRight size={14} />
                      </Link>
                    )}
                    {detail.note && (
                      <div className={styles.scheduleNote}>
                        <strong>Note</strong>
                        <p>{detail.note}</p>
                      </div>
                    )}
                    <div className={styles.scheduleActions}>
                      <button className={styles.editButton} onClick={() => openForm(detail)}>
                        Edit
                      </button>
                      <button className={styles.removeButton} onClick={() => handleRemove(detail.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{editingId ? "Edit Schedule" : "New Schedule"}</h3>
              <button className={styles.modalClose} onClick={closeForm}>
                ×
              </button>
            </div>
            <form className={styles.modalForm} onSubmit={handleSubmit}>
              <label className={styles.formGroup}>
                <span>Title</span>
                <input
                  className={styles.input}
                  type="text"
                  value={formState.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                  required
                />
              </label>
              <div className={styles.formGrid}>
                <label className={styles.formGroup}>
                  <span>Date</span>
                  <input
                    className={styles.input}
                    type="date"
                    value={formState.date}
                    onChange={(e) => handleFormChange("date", e.target.value)}
                    required
                  />
                </label>
                <label className={styles.formGroup}>
                  <span>Time</span>
                  <input
                    className={styles.input}
                    type="time"
                    value={formState.time}
                    onChange={(e) => handleFormChange("time", e.target.value)}
                    required
                  />
                </label>
              </div>
              <label className={styles.formGroup}>
                <span>Category</span>
                <select
                  className={styles.select}
                  value={formState.category}
                  onChange={(e) => handleFormChange("category", e.target.value as EventCategory)}
                >
                  {(Object.keys(CATEGORY_META) as EventCategory[]).map((category) => (
                    <option key={category} value={category}>
                      {CATEGORY_META[category].label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.formGroup}>
                <span>Linked Module</span>
                <select
                  className={styles.select}
                  value={formState.linkedModule}
                  onChange={(e) => handleFormChange("linkedModule", e.target.value as CalendarModuleKey)}
                >
                  {Object.entries(MODULE_LINKS).map(([value, info]) => (
                    <option key={value} value={value}>
                      {info.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.formGroup}>
                <span>Location</span>
                <input
                  className={styles.input}
                  type="text"
                  value={formState.location}
                  onChange={(e) => handleFormChange("location", e.target.value)}
                />
              </label>
              <label className={styles.formGroup}>
                <span>Note</span>
                <textarea
                  className={styles.textarea}
                  value={formState.note}
                  rows={3}
                  onChange={(e) => handleFormChange("note", e.target.value)}
                ></textarea>
              </label>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton}>
                  {editingId ? "Save Changes" : "Add Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
