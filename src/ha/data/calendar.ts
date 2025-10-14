import type { HomeAssistant } from "../types";

export interface Calendar {
  entity_id: string;
  name?: string;
  backgroundColor?: string;
}

export interface CalendarEvent {
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
  calendar: string;
  eventData: CalendarEventData;
  [key: string]: any;
}

export interface CalendarEventData {
  uid?: string;
  recurrence_id?: string;
  summary: string;
  dtstart: string;
  dtend: string;
  rrule?: string;
  description?: string;
}

export const fetchCalendarEvents = async (
  hass: HomeAssistant,
  start: Date,
  end: Date,
  calendars: Calendar[]
): Promise<{ events: CalendarEvent[]; errors: string[] }> => {
  if (!start || isNaN(start.getTime()) || !end || isNaN(end.getTime())) {
    console.error("Invalid date range:", { start, end });
    return { events: [], errors: [] };
  }

  const params = encodeURI(
    `?start=${start.toISOString()}&end=${end.toISOString()}`
  );

  const calEvents: CalendarEvent[] = [];
  const errors: string[] = [];
  const promises: Promise<CalendarEvent[]>[] = [];

  calendars.forEach((cal) => {
    promises.push(
      hass.callApi<CalendarEvent[]>(
        "GET",
        `calendars/${cal.entity_id}${params}`
      )
    );
  });

  for (const [idx, promise] of promises.entries()) {
    let result: CalendarEvent[];
    try {
      result = await promise;
    } catch (_err) {
      errors.push(calendars[idx].entity_id);
      continue;
    }
    const cal = calendars[idx];
    result.forEach((ev) => {
      const eventStart = getCalendarDate(ev.start);
      const eventEnd = getCalendarDate(ev.end);
      if (!eventStart || !eventEnd) {
        return;
      }
      const eventData: CalendarEventData = {
        uid: ev.uid,
        summary: ev.summary,
        description: ev.description,
        dtstart: eventStart,
        dtend: eventEnd,
        recurrence_id: ev.recurrence_id,
        rrule: ev.rrule,
      };
      const event: CalendarEvent = {
        start: eventStart,
        end: eventEnd,
        title: ev.summary,
        backgroundColor: cal.backgroundColor,
        borderColor: cal.backgroundColor,
        calendar: cal.entity_id,
        eventData: eventData,
      };

      calEvents.push(event);
    });
  }

  return { events: calEvents, errors };
};

const getCalendarDate = (dateObj: any): string | undefined => {
  if (typeof dateObj === "string") {
    return dateObj;
  }

  if (dateObj.dateTime) {
    return dateObj.dateTime;
  }

  if (dateObj.date) {
    return dateObj.date;
  }

  return undefined;
};
