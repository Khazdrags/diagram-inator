import { createContext, useContext, useMemo } from "react";
import PropTypes from "prop-types";
import { useNodes } from "@xyflow/react";
import {
  FREE_TIER_GB_SECONDS,
  FREE_TIER_REQUESTS,
} from "../helpers/lambdaPricing";

const LambdaDataContext = createContext(null);

/**
 * Distributes the AWS Lambda free tier across all Lambda nodes in the diagram,
 * ordered by creation time (ascending node ID = oldest first).
 *
 * Algorithm:
 *   For each Lambda node (oldest → newest):
 *     allocatedGBs      = min(remainingFreeTierGBs, node.gbSeconds)
 *     allocatedRequests = min(remainingFreeTierRequests, node.invocations)
 *   Remaining free tier carries over to the next node.
 */
export function LambdaDataProvider({ children }) {
  const nodes = useNodes();

  const allocation = useMemo(() => {
    const lambdaNodes = nodes
      .filter((n) => n.type === "lambda")
      .sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));

    let remainingGBs = FREE_TIER_GB_SECONDS;
    let remainingRequests = FREE_TIER_REQUESTS;
    const map = new Map();

    for (const node of lambdaNodes) {
      const {
        memoryMB = 512,
        durationMs = 200,
        invocationsMonthly = 1_000_000,
      } = node.data || {};

      const mem = Math.max(128, Number(memoryMB) || 128);
      const dur = Math.max(0, Number(durationMs) || 0);
      const inv = Math.max(0, Number(invocationsMonthly) || 0);

      const gbSeconds = inv * (dur / 1000) * (mem / 1024);

      const allocatedGBs = Math.min(remainingGBs, gbSeconds);
      remainingGBs = Math.max(0, remainingGBs - allocatedGBs);

      const allocatedRequests = Math.min(remainingRequests, inv);
      remainingRequests = Math.max(0, remainingRequests - allocatedRequests);

      map.set(node.id, {
        freeTierGBs: allocatedGBs,
        freeTierRequests: allocatedRequests,
      });
    }

    return map;
  }, [nodes]);

  return (
    <LambdaDataContext.Provider value={allocation}>
      {children}
    </LambdaDataContext.Provider>
  );
}

LambdaDataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Returns the free tier allocated to a specific Lambda node.
 * Falls back to zero if the context is not available.
 *
 * @param {string} nodeId
 * @returns {{ freeTierGBs: number, freeTierRequests: number }}
 */
export function useLambdaAllocation(nodeId) {
  const map = useContext(LambdaDataContext);
  if (!map) return { freeTierGBs: 0, freeTierRequests: 0 };
  return map.get(nodeId) ?? { freeTierGBs: 0, freeTierRequests: 0 };
}
