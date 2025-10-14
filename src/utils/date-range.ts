import { HomeAssistant, calcDate, startOfDay, endOfDay, addDays } from "../ha";
import { endOfWeek } from "date-fns";

export function getDateRange(
  dateRange: string,
  hass: HomeAssistant
): { start: Date; end: Date } {
  const now = new Date();
  const locale = hass.locale;
  const config = hass.config;

  switch (dateRange) {
    case "today": {
      const start = calcDate(now, startOfDay, locale, config);
      const end = calcDate(now, endOfDay, locale, config);
      return { start, end };
    }
    case "today_tomorrow": {
      const start = calcDate(now, startOfDay, locale, config);
      const tomorrow = calcDate(now, addDays, locale, config, 1);
      const end = calcDate(tomorrow, endOfDay, locale, config);
      return { start, end };
    }
    case "tomorrow": {
      const tomorrow = calcDate(now, addDays, locale, config, 1);
      const start = calcDate(tomorrow, startOfDay, locale, config);
      const end = calcDate(tomorrow, endOfDay, locale, config);
      return { start, end };
    }
    case "week": {
      const start = calcDate(now, startOfDay, locale, config);
      const endDate = calcDate(now, addDays, locale, config, 6);
      const end = calcDate(endDate, endOfDay, locale, config);
      return { start, end };
    }
    case "this_week": {
      const start = calcDate(now, startOfDay, locale, config);
      // Calculate end of week based on HA's first_weekday, then subtract 1 day
      const endOfWeekDate = endOfWeek(now, { weekStartsOn: locale.first_weekday });
      const endDateMinusOne = calcDate(endOfWeekDate, addDays, locale, config, -1);
      const end = calcDate(endDateMinusOne, endOfDay, locale, config);
      return { start, end };
    }
    default: {
      const start = calcDate(now, startOfDay, locale, config);
      const end = calcDate(now, endOfDay, locale, config);
      return { start, end };
    }
  }
}
