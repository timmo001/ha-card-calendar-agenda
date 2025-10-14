import { assign, boolean, object, optional } from "superstruct";
import { LovelaceCardConfig } from "../ha";
import { lovelaceCardConfigStruct } from "../shared/config/lovelace-card-config";

export interface CalendarAgendaCardConfig extends LovelaceCardConfig {
  hide_background?: boolean;
}

export const calendarAgendaCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  object({
    hide_background: optional(boolean()),
  })
);
