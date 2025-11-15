import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import {
  MEAL_TEMPLATES,
  WORKOUT_TEMPLATES,
  type CalendarModuleKey,
  type CalendarTemplate,
} from "../../data/calendarTemplates";
import {
  calendarApi,
  type CalendarEventDto,
  type CalendarEventPayload,
  type CalendarApiModule,
} from "../../services/calendarApi";
import styles from "./Calendar.module.css";
import { useAuth } from "../../context/AuthContext";

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

const API_TO_MODULE: Record<CalendarApiModule, CalendarModuleKey> = {
  meal_plan: "meal-plan",
  exercises: "exercises",
  food_diary: "food-diary",
  messages: "messages",
};

const MODULE_TO_API: Record<CalendarModuleKey, CalendarApiModule> = {
  "meal-plan": "meal_plan",
  exercises: "exercises",
  "food-diary": "food_diary",
  messages: "messages",
};

const sortEvents = (items: CalendarEvent[]) =>
  [...items].sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
  );

const mapFromApi = (record: CalendarEventDto): CalendarEvent => {
  const date = record.eventDate.slice(0, 10);
  const category = record.category as EventCategory;
  const linked =
    (record.linkedModule && API_TO_MODULE[record.linkedModule]) ||
    DEFAULT_LINK_BY_CATEGORY[category];

  return {
    id: record.id.toString(),
    title: record.title,
    date,
    time: record.timeSlot,
    category,
    location: record.location || "",
    note: record.note || "",
    linkedModule: linked,
  };
};

const buildPayload = (state: CalendarFormState): CalendarEventPayload => ({
  title: state.title.trim(),
  date: state.date,
  time: state.time,
  category: state.category,
  location: state.location.trim() || undefined,
  note: state.note.trim() || undefined,
  linkedModule: state.linkedModule ? MODULE_TO_API[state.linkedModule] : null,
});

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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState<CalendarFormState>(() => createEmptyForm(selectedDate));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMealTemplate, setSelectedMealTemplate] = useState(MEAL_TEMPLATES[0]?.id ?? "");
  const [selectedWorkoutTemplate, setSelectedWorkoutTemplate] = useState(
    WORKOUT_TEMPLATES[0]?.id ?? ""
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const activeUserId = user?.user_id;

  useEffect(() => {
    let active = true;
    if (!activeUserId) return () => {
      active = false;
    };

    setLoading(true);
    calendarApi
      .list(activeUserId)
      .then((records) => {
        if (!active) return;
        const mapped = sortEvents(records.map(mapFromApi));
        setEvents(mapped);
        if (mapped.length > 0) {
          setSelectedDate((prev) =>
            mapped.some((event) => event.date === prev) ? prev : mapped[0].date
          );
        }
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Calendar fetch error", err);
        setError("Unable to load calendar data from database");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeUserId]);

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.title.trim()) return;
    if (!activeUserId) {
      setError("Please sign in again to manage your calendar.");
      return;
    }

    const payload = buildPayload(formState);

    try {
      if (editingId) {
        const updated = await calendarApi.update(Number(editingId), activeUserId, payload);
        setEvents((prev) =>
          sortEvents(
            prev.map((item) => (item.id === editingId ? mapFromApi(updated) : item))
          )
        );
      } else {
        const created = await calendarApi.create(activeUserId, payload);
        setEvents((prev) => sortEvents([...prev, mapFromApi(created)]));
      }
      setSelectedDate(payload.date);
      setIsFormOpen(false);
      setError(null);
    } catch (err) {
      console.error("Calendar save error", err);
      setError("Unable to save calendar event");
    }
  };

  const handleRemove = async (id: string) => {
    if (!activeUserId) return;
    try {
      await calendarApi.remove(Number(id), activeUserId);
      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (err) {
      console.error("Calendar delete error", err);
      setError("Unable to remove calendar event");
    }
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

      {error && <div className={styles.errorBanner}>{error}</div>}

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
            {loading ? (
              <div className={styles.loadingState}>Loading schedule...</div>
            ) : dayEvents.length === 0 ? (
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
