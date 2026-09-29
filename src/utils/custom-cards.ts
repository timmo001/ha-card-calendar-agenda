import { repository } from "../../package.json";
import type { HomeAssistant, LovelaceCardConfig } from "../ha";

interface CustomCardSuggestion<
  T extends LovelaceCardConfig = LovelaceCardConfig,
> {
  label?: string;
  config: T;
}

interface RegisterCardParams {
  type: string;
  name: string;
  description: string;
  getEntitySuggestion?: (
    hass: HomeAssistant,
    entityId: string
  ) => CustomCardSuggestion | CustomCardSuggestion[] | null;
}

declare global {
  interface Window {
    customCards?: unknown[];
  }
}

export function registerCustomCard(params: RegisterCardParams) {
  window.customCards = window.customCards || [];

  const cardPage = params.type.replace("-card", "");
  window.customCards.push({
    ...params,
    preview: true,
    documentationURL: `${repository.url}/blob/main/docs/cards/${cardPage}.md`,
  });
}
