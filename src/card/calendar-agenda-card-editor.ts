import { html, LitElement, nothing, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { assert } from "superstruct";
import { configElementStyle, HomeAssistant } from "../ha";
import { CARD_EDITOR_NAME, CARD_NAME } from "./const";
import { HaFormSchema } from "../utils/form/ha-form";
import {
  CalendarAgendaCardConfig,
  calendarAgendaCardConfigStruct,
} from "./calendar-agenda-card-config";

@customElement(CARD_EDITOR_NAME)
export class CalendarAgendaCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: CalendarAgendaCardConfig;

  private _schema: readonly HaFormSchema[] = [
    {
      name: "title",
      selector: {
        text: {},
      },
    },
    {
      name: "entities",
      selector: {
        entity: {
          filter: {
            domain: "calendar",
          },
          multiple: true,
        },
      },
    },
    {
      name: "date_range",
      selector: {
        select: {
          options: [
            { value: "today", label: "Today" },
            { value: "today_tomorrow", label: "Today & Tomorrow" },
            { value: "tomorrow", label: "Tomorrow" },
            { value: "week", label: "This Week" },
          ],
        },
      },
    },
    {
      name: "hide_background",
      selector: {
        boolean: {},
      },
    },
  ] as const;

  public setConfig(config: CalendarAgendaCardConfig): void {
    assert(config, calendarAgendaCardConfigStruct);

    if (config.entity && !config.entities) {
      this._config = {
        ...config,
        entities: [config.entity],
        entity: undefined,
      };
    } else {
      this._config = config;
    }
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${this._schema}
        .computeLabel=${this._computeLabelCallback}
        .computeHelper=${this._computeHelperCallback}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    const newConfig = ev.detail.value as CalendarAgendaCardConfig;

    const config: CalendarAgendaCardConfig = {
      ...newConfig,
      type: `custom:${CARD_NAME}`,
    };

    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config } })
    );
  }

  private _computeHelperCallback = (
    schema: HaFormSchema
  ): string | undefined => {
    switch (schema.name) {
      case "title":
        return "Title shown at the top of the card";
      case "entities":
        return "The calendar entities to display";
      case "date_range":
        return "Which days to show events for";
      case "hide_background":
        return "Hide the card background and border";
      default:
        return undefined;
    }
  };

  private _computeLabelCallback = (schema: HaFormSchema) => {
    switch (schema.name) {
      case "title":
        return "Title";
      case "entities":
        return "Calendar Entities";
      case "date_range":
        return "Date Range";
      case "hide_background":
        return "Hide Background";
      default:
        return undefined;
    }
  };

  static get styles() {
    return [
      configElementStyle,
      css`
        ha-form {
          display: block;
          margin-bottom: 24px;
        }
      `,
    ];
  }
}
