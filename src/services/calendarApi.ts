const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export type CalendarApiCategory = "meal" | "activity" | "appointment";
export type CalendarApiModule =
  | "meal_plan"
  | "exercises"
  | "food_diary"
  | "messages";

export interface CalendarEventDto {
  id: number;
  userId: number;
  title: string;
  eventDate: string;
  timeSlot: string;
  category: CalendarApiCategory;
  location: string | null;
  note: string | null;
  linkedModule: CalendarApiModule | null;
}

export interface CalendarEventPayload {
  title: string;
  date: string;
  time: string;
  category: CalendarApiCategory;
  location?: string;
  note?: string;
  linkedModule?: CalendarApiModule | null;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Calendar API error");
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json();
}

export const calendarApi = {
  list(userId: number) {
    return request<CalendarEventDto[]>(
      `/api/calendar-events?userId=${userId}`
    );
  },
  create(userId: number, payload: CalendarEventPayload) {
    return request<CalendarEventDto>("/api/calendar-events", {
      method: "POST",
      body: JSON.stringify({ ...payload, userId }),
    });
  },
  update(id: number, userId: number, payload: CalendarEventPayload) {
    return request<CalendarEventDto>(`/api/calendar-events/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...payload, userId }),
    });
  },
  remove(id: number, userId: number) {
    return request<void>(`/api/calendar-events/${id}?userId=${userId}`, {
      method: "DELETE",
    });
  },
};
