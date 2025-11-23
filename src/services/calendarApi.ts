import { http } from "./http";

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

export const calendarApi = {
  list(userId: number, params?: { start?: string; end?: string; category?: CalendarApiCategory; linkedModule?: CalendarApiModule }) {
    const query = new URLSearchParams({ userId: userId.toString() });
    if (params?.start) query.set("start", params.start);
    if (params?.end) query.set("end", params.end);
    if (params?.category) query.set("category", params.category);
    if (params?.linkedModule) query.set("linkedModule", params.linkedModule);
    return http.request<CalendarEventDto[]>(
      `/api/calendar-events?${query.toString()}`
    );
  },
  create(userId: number, payload: CalendarEventPayload) {
    return http.request<CalendarEventDto>("/api/calendar-events", {
      method: "POST",
      json: { ...payload, userId },
    });
  },
  update(id: number, userId: number, payload: CalendarEventPayload) {
    return http.request<CalendarEventDto>(`/api/calendar-events/${id}`, {
      method: "PUT",
      json: { ...payload, userId },
    });
  },
  remove(id: number, userId: number) {
    return http.request<void>(
      `/api/calendar-events/${id}?userId=${userId}`,
      { method: "DELETE" }
    );
  },
};
