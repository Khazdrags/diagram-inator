import { createContext, useContext, useMemo } from "react";
import PropTypes from "prop-types";
import rawPrices from "../../shared/constants/prices/db/db_prices.json";

const DBDataContext = createContext(null);

const RDS_ENGINES = [
  "MySQL",
  "PostgreSQL",
  "MariaDB",
  "SQL Server SE2",
  "Oracle SE2 BYOL",
];
const AURORA_ENGINES = ["MySQL-compatible", "PostgreSQL-compatible"];
const CACHE_ENGINES = ["Redis OSS", "Valkey", "Memcached"];

export function DBDataProvider({ children }) {
  const value = useMemo(() => {
    function getRDSInstances(engine) {
      if (!rawPrices?.rds) return [];
      if (["MySQL", "PostgreSQL", "MariaDB"].includes(engine))
        return rawPrices.rds.standard_instances ?? [];
      if (engine === "SQL Server SE2")
        return rawPrices.rds.sqlserver_instances ?? [];
      if (engine === "Oracle SE2 BYOL")
        return rawPrices.rds.oracle_instances ?? [];
      return [];
    }

    function getElastiCacheInstances(engine) {
      if (!rawPrices?.elasticache) return [];
      if (engine === "Redis OSS")
        return rawPrices.elasticache.redis_instances ?? [];
      if (engine === "Valkey")
        return rawPrices.elasticache.valkey_instances ?? [];
      if (engine === "Memcached")
        return rawPrices.elasticache.memcached_instances ?? [];
      return [];
    }

    return {
      prices: rawPrices,
      rdsEngines: RDS_ENGINES,
      auroraEngines: AURORA_ENGINES,
      cacheEngines: CACHE_ENGINES,
      getRDSInstances,
      auroraInstances: rawPrices?.aurora?.instances ?? [],
      getElastiCacheInstances,
      documentdbInstances: rawPrices?.documentdb?.instances ?? [],
      neptuneInstances: rawPrices?.neptune?.instances ?? [],
    };
  }, []);

  return (
    <DBDataContext.Provider value={value}>{children}</DBDataContext.Provider>
  );
}

DBDataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useDBData() {
  const ctx = useContext(DBDataContext);
  if (!ctx) throw new Error("useDBData must be used inside DBDataProvider");
  return ctx;
}
