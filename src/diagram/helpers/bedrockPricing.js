/**
 * Detects the unit scale from the "unit" field in the JSON.
 * Currently all entries use "1K tokens" → factor 1000 to reach 1M.
 * If future entries use "1M tokens" → factor 1.
 *
 * @param {string} unit  e.g. "1K tokens" | "1M tokens"
 * @returns {number}  multiplier to convert stored price to per-1M-tokens price
 */
export function unitToMillionFactor(unit = "") {
  const lower = unit.toLowerCase();
  if (lower.includes("1m")) return 1;
  if (lower.includes("1k")) return 1000;
  // fallback: assume 1K
  return 1000;
}

/**
 * Returns the price per 1M tokens for input and output.
 *
 * @param {{ inputPrice: number, outputPrice: number, unit: string } | null} entry
 * @returns {{ inputPerM: number | null, outputPerM: number | null }}
 */
export function pricePerMillion(entry) {
  if (!entry) return { inputPerM: null, outputPerM: null };
  const factor = unitToMillionFactor(entry.unit);
  return {
    inputPerM: entry.inputPrice * factor,
    outputPerM: entry.outputPrice * factor,
  };
}

/**
 * Formats a price in USD.
 * Uses up to 4 significant decimals after removing leading zeros.
 *
 * @param {number | null} value
 * @returns {string}
 */
export function formatUSD(value) {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })}`;
}

/**
 * Calculates the total cost for a given volume of messages.
 *
 * Formula:
 *   totalInputTokens  = messageCount × avgInputTokens
 *   totalOutputTokens = messageCount × avgOutputTokens
 *   cost = (totalInputTokens  × inputPrice  / unitFactor)
 *        + (totalOutputTokens × outputPrice / unitFactor)
 *
 * @param {{
 *   messageCount: number,
 *   avgInputTokens: number,
 *   avgOutputTokens: number,
 *   entry: { inputPrice: number, outputPrice: number, unit: string } | null
 * }} params
 * @returns {{ totalCost: number | null, totalInputTokens: number, totalOutputTokens: number }}
 */
export function calcVolumeCost({
  messageCount,
  avgInputTokens,
  avgOutputTokens,
  entry,
}) {
  if (!entry)
    return { totalCost: null, totalInputTokens: 0, totalOutputTokens: 0 };

  const count = Math.max(0, Number(messageCount) || 0);
  const avgIn = Math.max(0, Number(avgInputTokens) || 0);
  const avgOut = Math.max(0, Number(avgOutputTokens) || 0);

  const totalIn = count * avgIn;
  const totalOut = count * avgOut;

  const factor = unitToMillionFactor(entry.unit);
  // factor converts stored price (per 1K or 1M) to per-single-token cost when divided
  const costIn = (totalIn * entry.inputPrice) / factor;
  const costOut = (totalOut * entry.outputPrice) / factor;

  return {
    totalCost: costIn + costOut,
    totalInputTokens: totalIn,
    totalOutputTokens: totalOut,
  };
}
