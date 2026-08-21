import type { ProviderAdapter } from "./types";
import { SimulatedAdapter } from "./simulated";

/**
 * Provider registry. Add real providers here, e.g.:
 *
 *   import { AnthropicAdapter } from "./anthropic";
 *   const adapters = { simulated, anthropic: new AnthropicAdapter() };
 *
 * Agents choose their adapter via the `provider` column.
 */
const simulated = new SimulatedAdapter();

const adapters: Record<string, ProviderAdapter> = {
  simulated,
};

export function getProviderAdapter(provider: string): ProviderAdapter {
  return adapters[provider] ?? simulated;
}
