import { assign, boolean, object, optional, string } from "superstruct";
import { LovelaceCardConfig } from "../ha";
import { lovelaceCardConfigStruct } from "../shared/config/lovelace-card-config";

export interface CalendarAgendaCardConfig extends LovelaceCardConfig {
  entity?: string;
  hide_background?: boolean;
}

export const calendarAgendaCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  object({
    entity: optional(string()),
    hide_background: optional(boolean()),
  })
);
