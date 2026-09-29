export interface BaseActionConfig {
  action?: string;
  confirmation?: boolean | { text?: string };
}

export interface ActionConfig extends BaseActionConfig {
  // Common properties can be extended here
}
