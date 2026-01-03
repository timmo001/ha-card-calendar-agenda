import {
  array,
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
  entities?: string[];
  date_range?: "today" | "today_tomorrow" | "tomorrow" | "week" | "this_week";
  hide_background?: boolean;
  hide_when_empty?: boolean;
}

export const calendarAgendaCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  object({
    title: optional(string()),
    entities: optional(array(string())),
    date_range: optional(defaulted(string(), "today")),
    hide_background: optional(boolean()),
    hide_when_empty: optional(boolean()),
  })
);
