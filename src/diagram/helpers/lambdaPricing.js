import lambdaPrices from "../../shared/constants/prices/lambda/lambda_prices.json";
import { formatUSD } from "./bedrockPricing";

export { formatUSD };

const { on_demand, free_tier } = lambdaPrices;

export const FREE_TIER_GB_SECONDS = free_tier.gb_seconds_per_month;
export const FREE_TIER_REQUESTS = free_tier.requests_per_month;

/**
 * Returns the pricing constants for a given architecture.
 * @param {"x86"|"arm"} architecture
 * @returns {{ pricePerGbSecond: number, pricePerMillionRequests: number }}
 */
export function getArchitecturePricing(architecture = "x86") {
  const key = architecture === "arm" ? "arm" : "x86";
  return {
    pricePerGbSecond: on_demand[key].price_per_gb_second,
    pricePerMillionRequests: on_demand[key].price_per_million_requests,
  };
}

/**
 * Calculates the estimated monthly cost of an AWS Lambda function.
 *
 * The free tier (freeTierGBs / freeTierRequests) should be provided by
 * LambdaDataContext, which distributes the account-level free tier across
 * all Lambda nodes in order of creation (oldest gets priority).
 *
 * Formula:
 *   GB-s = invocations × (durationMs / 1000) × (memoryMB / 1024)
 *   billableGBs = max(0, GB-s − freeTierGBs)
 *   computeCost = billableGBs × pricePerGbSecond
 *   billableRequests = max(0, invocations − freeTierRequests)
 *   requestCost = (billableRequests / 1_000_000) × pricePerMillionRequests
 *   totalCost = computeCost + requestCost
 *
 * @param {{
 *   memoryMB: number,
 *   architecture: "x86"|"arm",
 *   durationMs: number,
 *   invocationsMonthly: number,
 *   freeTierGBs?: number,
 *   freeTierRequests?: number,
 * }} params
 * @returns {{
 *   gbSeconds: number,
 *   billableGBs: number,
 *   billableRequests: number,
 *   computeCost: number,
 *   requestCost: number,
 *   totalCost: number
 * }}
 */
export function calcLambdaCost({
  memoryMB,
  architecture,
  durationMs,
  invocationsMonthly,
  freeTierGBs = 0,
  freeTierRequests = 0,
}) {
  const mem = Math.max(128, Number(memoryMB) || 128);
  const dur = Math.max(0, Number(durationMs) || 0);
  const inv = Math.max(0, Number(invocationsMonthly) || 0);

  const { pricePerGbSecond, pricePerMillionRequests } =
    getArchitecturePricing(architecture);

  const gbSeconds = inv * (dur / 1000) * (mem / 1024);
  const billableGBs = Math.max(0, gbSeconds - freeTierGBs);
  const computeCost = billableGBs * pricePerGbSecond;

  const billableRequests = Math.max(0, inv - freeTierRequests);
  const requestCost = (billableRequests / 1_000_000) * pricePerMillionRequests;

  return {
    gbSeconds,
    billableGBs,
    billableRequests,
    computeCost,
    requestCost,
    totalCost: computeCost + requestCost,
  };
}
