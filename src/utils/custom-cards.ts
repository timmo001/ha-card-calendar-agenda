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
export function registerCustomCard(params: RegisterCardParams) {
  const windowWithCards = window as unknown as Window & {
    customCards: unknown[];
  };
  windowWithCards.customCards = windowWithCards.customCards || [];

  const cardPage = params.type.replace("-card", "");
  windowWithCards.customCards.push({
    ...params,
    preview: true,
    documentationURL: `${repository.url}/blob/main/docs/cards/${cardPage}.md`,
  });
}
