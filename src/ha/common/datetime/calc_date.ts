import {
  addMilliseconds,
  addMonths,
  isFirstDayOfMonth,
  isLastDayOfMonth,
  differenceInMilliseconds,
  differenceInMonths,
  endOfMonth,
  startOfDay,
  endOfDay,
  differenceInDays,
  addDays,
} from "date-fns";
import { TZDate } from "@date-fns/tz";
import type { HassConfig } from "home-assistant-js-websocket";
import type { FrontendLocaleData } from "../../data/translation";
import { TimeZone } from "../../data/translation";

const calcZonedDate = (
  date: Date,
  tz: string,
  fn: (date: Date, options?: any) => Date,
  options?
) => new Date(fn(new TZDate(date, tz), options).getTime());

export const calcDate = (
  date: Date,
  fn: (date: Date, options?: any) => Date,
  locale: FrontendLocaleData,
  config: HassConfig,
  options?
) =>
  locale.time_zone === TimeZone.server
    ? calcZonedDate(date, config.time_zone, fn, options)
    : fn(date, options);

export const calcDateProperty = <Result extends boolean | number>(
  date: Date,
  fn: (date: Date, options?: any) => Result,
  locale: FrontendLocaleData,
  config: HassConfig,
  options?
) =>
  locale.time_zone === TimeZone.server
    ? fn(new TZDate(date, config.time_zone), options)
    : fn(date, options);

export const calcDateDifferenceProperty = <Result extends boolean | number>(
  endDate: Date,
  startDate: Date,
  fn: (date: Date, options?: any) => Result,
  locale: FrontendLocaleData,
  config: HassConfig
) =>
  calcDateProperty(
    endDate,
    fn,
    locale,
    config,
    locale.time_zone === TimeZone.server
      ? new TZDate(startDate, config.time_zone)
      : startDate
  );

export const shiftDateRange = (
  startDate: Date,
  endDate: Date,
  forward: boolean,
  locale: FrontendLocaleData,
  config: any
) => {
  let start: Date;
  let end: Date;

  if (
    calcDateProperty(startDate, isFirstDayOfMonth, locale, config) &&
    calcDateProperty(endDate, isLastDayOfMonth, locale, config)
  ) {
    const difference =
      (calcDateDifferenceProperty(
        endDate,
        startDate,
        differenceInMonths,
        locale,
        config
      ) +
        1) *
      (forward ? 1 : -1);

    start = calcDate(startDate, addMonths, locale, config, difference);
    end = calcDate(
      calcDate(endDate, addMonths, locale, config, difference),
      endOfMonth,
      locale,
      config
    );
  } else if (
    calcDateProperty(
      startDate,
      (date) => startOfDay(date).getMilliseconds() === date.getMilliseconds(),
      locale,
      config
    ) &&
    calcDateProperty(
      endDate,
      (date) => endOfDay(date).getMilliseconds() === date.getMilliseconds(),
      locale,
      config
    )
  ) {
    const difference =
      (calcDateDifferenceProperty(
        endDate,
        startDate,
        differenceInDays,
        locale,
        config
      ) +
        1) *
      (forward ? 1 : -1);

    start = calcDate(startDate, addDays, locale, config, difference);
    end = calcDate(endDate, addDays, locale, config, difference);
  } else {
    const difference =
      calcDateDifferenceProperty(
        endDate,
        startDate,
        differenceInMilliseconds,
        locale,
        config
      ) * (forward ? 1 : -1);

    start = calcDate(startDate, addMilliseconds, locale, config, difference);
    end = calcDate(endDate, addMilliseconds, locale, config, difference);
  }

  return { start, end };
};

export const parseDate = (date: string, timezone: string): Date => {
  const tzDate = new TZDate(date, timezone);

  return new Date(tzDate.getTime());
};

export const formatDate = (date: Date, timezone: string): string => {
  const tzDate = new TZDate(date, timezone);

  return tzDate.toISOString().split("T")[0];
};

export const formatTime = (date: Date, timezone: string): string => {
  const tzDate = new TZDate(date, timezone);

  return tzDate.toISOString().split("T")[1].split(".")[0];
};

export { startOfDay, endOfDay, addDays };
