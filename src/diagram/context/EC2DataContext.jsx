import { createContext, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

const EC2DataContext = createContext(null);

/**
 * Fetches EC2 instance data from the runs-on API for us-east-1
 * and provides structured family/size/pricing data to the diagram.
 */
export function EC2DataProvider({ children }) {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("https://go.runs-on.com/api/finder?region=us-east-1", {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setInstances(data.results ?? []);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  /** Unique instance families, alphabetically sorted */
  const families = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const inst of instances) {
      if (!seen.has(inst.instanceFamily)) {
        seen.add(inst.instanceFamily);
        result.push(inst.instanceFamily);
      }
    }
    return result.sort((a, b) => a.localeCompare(b));
  }, [instances]);

  /**
   * Map of instanceFamily → array of instance sizes with base + per-platform pricing
   * sorted by base on-demand price ascending within each family.
   */
  const sizesByFamily = useMemo(() => {
    const map = {};
    for (const inst of instances) {
      const { instanceFamily, instanceType, avgOnDemandPrice, pricing } = inst;
      const dotIdx = instanceType.indexOf(".");
      const size =
        dotIdx === -1 ? instanceType : instanceType.slice(dotIdx + 1);
      if (!map[instanceFamily]) map[instanceFamily] = [];

      const linuxOnDemand = pricing?.["Linux/UNIX"]?.avgOnDemand;
      const baseOnDemandPrice =
        typeof linuxOnDemand === "number" && linuxOnDemand > 0
          ? linuxOnDemand
          : (avgOnDemandPrice ?? 0);

      map[instanceFamily].push({
        size,
        instanceType,
        avgOnDemandPrice: baseOnDemandPrice,
        pricing: pricing ?? {},
      });
    }
    for (const fam of Object.keys(map)) {
      map[fam].sort((a, b) => a.avgOnDemandPrice - b.avgOnDemandPrice);
    }
    return map;
  }, [instances]);

  const value = useMemo(
    () => ({ instances, loading, error, families, sizesByFamily }),
    [instances, loading, error, families, sizesByFamily],
  );

  return (
    <EC2DataContext.Provider value={value}>{children}</EC2DataContext.Provider>
  );
}

EC2DataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useEC2Data() {
  const ctx = useContext(EC2DataContext);
  if (!ctx) throw new Error("useEC2Data must be used within EC2DataProvider");
  return ctx;
}
