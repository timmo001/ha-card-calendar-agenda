import {
  array,
  assign,
  boolean,
  defaulted,
  enums,
  number,
  object,
  optional,
  string,
} from "superstruct";
import { LovelaceCardConfig } from "../ha";
import { lovelaceCardConfigStruct } from "../shared/config/lovelace-card-config";

export interface CalendarAgendaCardConfig extends LovelaceCardConfig {
  title?: string;
  entities?: string[];
  date_range?:
    | "today"
    | "today_tomorrow"
    | "next_3_days"
    | "tomorrow"
    | "week"
    | "this_week";
  card_opacity?: number;
  /** @deprecated Use card_opacity */
  hide_background?: boolean;
  hide_when_empty?: boolean;
  dedupe_events?: boolean;
  horizontal_alignment?: "left" | "center" | "right";
  vertical_alignment?: "top" | "center" | "bottom";
  bullet_type?: "disc" | "circle" | "square" | "none" | "decimal" | "dash";
}

export const calendarAgendaCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  object({
    title: optional(string()),
    entities: optional(array(string())),
    date_range: optional(defaulted(string(), "today")),
    card_opacity: optional(number()),
    hide_background: optional(boolean()),
    hide_when_empty: optional(boolean()),
    dedupe_events: optional(boolean()),
    horizontal_alignment: optional(enums(["left", "center", "right"])),
    vertical_alignment: optional(enums(["top", "center", "bottom"])),
    bullet_type: optional(
      enums(["disc", "circle", "square", "none", "decimal", "dash"])
    ),
  })
);
