import {
  assign,
  boolean,
  defaulted,
  object,
  optional,
  string,
} from "superstruct";
import { LovelaceCardConfig } from "../ha";
import { lovelaceCardConfigStruct } from "../shared/config/lovelace-card-config";

export interface CalendarAgendaCardConfig extends LovelaceCardConfig {
  title?: string;
  entity?: string;
  date_range?: "today" | "today_tomorrow" | "tomorrow" | "week";
  hide_background?: boolean;
}

export const calendarAgendaCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  object({
    title: optional(string()),
    entity: optional(string()),
    date_range: optional(defaulted(string(), "today")),
    hide_background: optional(boolean()),
  })
);
