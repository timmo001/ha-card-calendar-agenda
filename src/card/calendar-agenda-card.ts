import { css, CSSResultGroup, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { assert } from "superstruct";
import { isAfter } from "date-fns";
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
    this._scheduleFetch();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._fetchTimeout) {
      clearTimeout(this._fetchTimeout);
    }
  }

  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: CalendarAgendaCardConfig;

  @state() private _events?: CalendarEvent[];

  private _fetchTimeout?: number;
  private _lastEntityIds?: string[];

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
    if (changedProps.has("hass") || changedProps.has("_config")) {
      this._scheduleFetch();
    }
  }

  private _scheduleFetch(): void {
    if (this._fetchTimeout) {
      clearTimeout(this._fetchTimeout);
    }

    this._fetchTimeout = window.setTimeout(() => {
      this._fetchEvents();
    }, 200); // Debounce by 200ms
  }

  private async _fetchEvents(): Promise<void> {
    if (!this.hass || !this._config) {
      return;
    }

    const entityIds = this._config.entities || [];

    // Only fetch if entities changed or first time
    if (
      this._lastEntityIds &&
      JSON.stringify([...this._lastEntityIds].sort()) ===
        JSON.stringify([...entityIds].sort())
    ) {
      return;
    }

    this._lastEntityIds = entityIds;

    if (entityIds.length === 0) {
      this._events = [];
      return;
    }

    const { start, end } = getDateRange(
      this._config.date_range || "today",
      this.hass
    );

    try {
      const { events } = await fetchCalendarEvents(
        this.hass,
        start,
        end,
        entityIds.map((entity_id) => ({ entity_id }))
      );
      this._events = events;
    } catch (err) {
      console.error("Error fetching calendar events:", err);
      this._events = [];
    }
  }

  private _deduplicateEvents(events: CalendarEvent[]): CalendarEvent[] {
    if (!this._config?.dedupe_events || !this._config?.entities) {
      return events;
    }

    const seen = new Map<string, CalendarEvent>();
    const entityPriority = this._config.entities;

    // Build priority map: lower index = higher priority
    const priorityMap = new Map<string, number>();
    entityPriority.forEach((entityId, index) => {
      priorityMap.set(entityId, index);
    });

    for (const event of events) {
      // Create unique key: title + start time (case-sensitive)
      const key = `${event.title}|${event.start}`;

      const existingEvent = seen.get(key);

      if (!existingEvent) {
        // First occurrence of this event
        seen.set(key, event);
      } else {
        // Duplicate found - keep the one from higher priority calendar
        const existingPriority =
          priorityMap.get(existingEvent.calendar) ?? Infinity;
        const newPriority = priorityMap.get(event.calendar) ?? Infinity;

        if (newPriority < existingPriority) {
          // New event has higher priority (earlier in config)
          seen.set(key, event);
        }
        // Otherwise keep existing event
      }
    }

    return Array.from(seen.values());
  }

  protected render() {
    if (!this._config || !this.hass) {
      return nothing;
    }

    const now = new Date();
    let sortedEvents = this._events
      ? [...this._events]
          .filter((event) => isAfter(new Date(event.end || event.start), now))
          .sort(
            (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
          )
      : [];

    // Apply deduplication if enabled
    if (this._config?.dedupe_events) {
      sortedEvents = this._deduplicateEvents(sortedEvents);
    }

    // Hide card when empty if option is enabled
    if (
      this._config.hide_when_empty === true &&
      this._events !== undefined &&
      sortedEvents.length === 0
    ) {
      return nothing;
    }

    return html`<ha-card
      class=${classMap({
        "hide-background": this._config?.hide_background === true,
      })}
    >
      ${this._config.title !== undefined
        ? html`<div class="card-header">${this._config.title}</div>`
        : nothing}
      <div class="card-content">
        <ul>
          ${!this._config.entities
            ? html`<li>No calendar selected</li>`
            : this._events === undefined
              ? html`<li>Loading events...</li>`
              : sortedEvents.length === 0
                ? html`<li>No events</li>`
                : sortedEvents.map((event) => {
                    const startDate = new Date(event.start);
                    const showTimeOnly = isToday(startDate);
                    const dateTime = formatDateTime(
                      startDate,
                      this.hass.locale.language || "en",
                      showTimeOnly
                    );
                    const duration = formatDuration(event.start, event.end!);
                    return html`<li>
                      [${dateTime}] ${event.title} (${duration})
                    </li>`;
                  })}
        </ul>
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
          overflow-y: auto;
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
