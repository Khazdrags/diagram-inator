import { createContext, useContext, useMemo } from "react";
import PropTypes from "prop-types";
import metaPrices from "../../shared/constants/meta_prices.json";
import openaiPrices from "../../shared/constants/openai_prices.json";
import anthropicPrices from "../../shared/constants/anthropic_prices.json";
import googlePrices from "../../shared/constants/google_prices.json";
import mistralPrices from "../../shared/constants/mistral_prices.json";
import qwenPrices from "../../shared/constants/qwen_prices.json";

const BedrockDataContext = createContext(null);

/** Combine and deduplicate all price entries by provider+model key */
const ALL_ENTRIES = (() => {
  const seen = new Set();
  const result = [];
  for (const entry of [
    ...metaPrices,
    ...openaiPrices,
    ...anthropicPrices,
    ...googlePrices,
    ...mistralPrices,
    ...qwenPrices,
  ]) {
    const key = `${entry.provider}::${entry.model}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(entry);
    }
  }
  return result;
})();

export function BedrockDataProvider({ children }) {
  /** Unique providers, in order of first appearance */
  const providers = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const entry of ALL_ENTRIES) {
      if (!seen.has(entry.provider)) {
        seen.add(entry.provider);
        result.push(entry.provider);
      }
    }
    return result;
  }, []);

  /** Map: provider → array of model names */
  const modelsByProvider = useMemo(() => {
    const map = {};
    for (const entry of ALL_ENTRIES) {
      if (!map[entry.provider]) map[entry.provider] = [];
      map[entry.provider].push(entry.model);
    }
    return map;
  }, []);

  /**
   * Returns the price entry for a given provider/model pair, or null.
   * @param {string} provider
   * @param {string} model
   * @returns {{ inputPrice: number, outputPrice: number, unit: string } | null}
   */
  const getPrice = useMemo(
    () => (provider, model) => {
      return (
        ALL_ENTRIES.find((e) => e.provider === provider && e.model === model) ??
        null
      );
    },
    [],
  );

  const value = useMemo(
    () => ({ providers, modelsByProvider, getPrice }),
    [providers, modelsByProvider, getPrice],
  );

  return (
    <BedrockDataContext.Provider value={value}>
      {children}
    </BedrockDataContext.Provider>
  );
}

BedrockDataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useBedrockData() {
  const ctx = useContext(BedrockDataContext);
  if (!ctx) {
    throw new Error("useBedrockData must be used inside BedrockDataProvider");
  }
  return ctx;
}
