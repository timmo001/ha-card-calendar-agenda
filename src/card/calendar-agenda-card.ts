import { css, CSSResultGroup, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { assert } from "superstruct";
import { HomeAssistant, LovelaceCard, LovelaceCardEditor } from "../ha";
import { BaseElement } from "../utils/base-element";
import { cardStyle } from "../utils/card-styles";
import { registerCustomCard } from "../utils/custom-cards";
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
  }

  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: CalendarAgendaCardConfig;

  public static async getStubConfig(): Promise<CalendarAgendaCardConfig> {
    return { type: `custom:${CARD_NAME}` };
  }

  public getCardSize(): number {
    return 3;
  }

  protected render() {
    if (!this._config || !this.hass) {
      return nothing;
    }

    return html`<ha-card
      class=${classMap({
        "hide-background": this._config?.hide_background === true,
      })}
    >
      <div class="card-content">
        <p>Calendar Agenda Card</p>
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

        .card-content {
          padding: 16px;
          flex: 1;
        }
      `,
    ];
  }
}

console.log("%c 📅 Calendar Agenda Card", "color: #007bff; font-weight: bold");
