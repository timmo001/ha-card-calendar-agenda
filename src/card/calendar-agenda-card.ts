import { css, CSSResultGroup, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { assert } from "superstruct";
import {
  HomeAssistant,
  LovelaceCard,
  LovelaceCardEditor,
  CalendarEvent,
  fetchCalendarEvents,
} from "../ha";
import { BaseElement } from "../utils/base-element";
import { cardStyle } from "../utils/card-styles";
import { registerCustomCard } from "../utils/custom-cards";
import { getDateRange } from "../utils/date-range";
import { isToday, formatDateTime, formatDuration } from "../utils/datetime";
import {
  CARD_DESCRIPTION,
  CARD_NAME_FRIENDLY,
  CARD_EDITOR_NAME,
  CARD_NAME,
} from "./const";
import {
  CalendarAgendaCardConfig,
  calendarAgendaCardConfigStruct,
} from "./calendar-agenda-card-config";

registerCustomCard({
  type: CARD_NAME,
  name: CARD_NAME_FRIENDLY,
  description: CARD_DESCRIPTION,
});

@customElement(CARD_NAME)
export class CalendarAgendaCard extends BaseElement implements LovelaceCard {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./calendar-agenda-card-editor");
    return document.createElement(CARD_EDITOR_NAME) as LovelaceCardEditor;
  }

  public setConfig(config: CalendarAgendaCardConfig): void {
    assert(config, calendarAgendaCardConfigStruct);
    this._config = config;
    this._fetchEvents();
  }

  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: CalendarAgendaCardConfig;

  @state() private _events?: CalendarEvent[];

  public static async getStubConfig(): Promise<CalendarAgendaCardConfig> {
    return { type: `custom:${CARD_NAME}`, title: "Agenda" };
  }

  public getCardSize(): number {
    return 3;
  }

  public getGridOptions(): any {
    return {
      columns: 12,
      rows: 3,
      min_columns: 5,
      min_rows: 2,
    };
  }

  protected updated(changedProps: Map<string, any>): void {
    super.updated(changedProps);
    if (changedProps.has("hass")) {
      this._fetchEvents();
    }
  }

  private async _fetchEvents(): Promise<void> {
    if (!this.hass || !this._config?.entity) {
      return;
    }

    const { start, end } = getDateRange(
      this._config.date_range || "today",
      this.hass
    );

    try {
      const { events } = await fetchCalendarEvents(this.hass, start, end, [
        { entity_id: this._config.entity },
      ]);
      this._events = events;
    } catch (err) {
      console.error("Error fetching calendar events:", err);
      this._events = [];
    }
  }

  protected render() {
    if (!this._config || !this.hass) {
      return nothing;
    }

    const sortedEvents = this._events
      ? [...this._events].sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
        )
      : [];

    return html`<ha-card
      class=${classMap({
        "hide-background": this._config?.hide_background === true,
      })}
    >
      ${this._config.title !== undefined
        ? html`<div class="card-header">${this._config.title}</div>`
        : nothing}
      <div class="card-content">
        ${!this._config.entity
          ? html`<p>No calendar selected</p>`
          : sortedEvents.length === 0
            ? html`<p>No events</p>`
            : html`
                <ul>
                  ${sortedEvents.map((event) => {
                    const startDate = new Date(event.start);
                    const showTimeOnly = isToday(startDate);
                    const dateTime = formatDateTime(
                      startDate,
                      this.hass.locale.language || "en",
                      showTimeOnly
                    );
                    const duration = formatDuration(event.start, event.end!);
                    return html`<li>
                      ${event.title} - ${dateTime} (${duration})
                    </li>`;
                  })}
                </ul>
              `}
      </div>
    </ha-card>`;
  }

  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cardStyle,
      css`
        ha-card {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        ha-card.hide-background {
          background: transparent;
          box-shadow: none;
          border: none;
        }

        .card-header {
          padding-bottom: 0;
        }

        ha-card.hide-background .card-header {
          padding: 0 0 var(--ha-space-1);
          line-height: var(--ha-line-height-normal);
        }

        .card-content {
          padding: var(--ha-space-2) var(--ha-space-4);
          flex: 1;
        }
        ha-card.hide-background .card-content {
          padding: var(--ha-space-1) 0;
        }

        ul {
          list-style: inside;
          margin: 0;
          padding-inline-start: var(--ha-space-6);
        }

        li {
          padding: 0;
        }
      `,
    ];
  }
}

console.log("%c 📅 Calendar Agenda Card", "color: #007bff; font-weight: bold");
