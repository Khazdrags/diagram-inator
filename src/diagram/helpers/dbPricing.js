import { formatUSD } from "./bedrockPricing";

const HOURS_PER_MONTH = 720; // 30 × 24

// ── RDS ───────────────────────────────────────────────────────────────────────
export function calcRDSCost({
  instanceEntry,
  multiAZ,
  storageGB,
  storageType,
  hoursPerDay,
  prices,
}) {
  if (!instanceEntry || !prices?.rds) return null;
  const priceHr = multiAZ
    ? instanceEntry.multiAZPriceHr
    : instanceEntry.priceHr;
  const storagePricePerGB =
    storageType === "gp2"
      ? prices.rds.storage_gp2_per_gb
      : prices.rds.storage_gp3_per_gb;
  const instanceCost = priceHr * (hoursPerDay ?? 24) * 30;
  const storageCost = (storageGB ?? 20) * storagePricePerGB;
  const totalCost = instanceCost + storageCost;
  return {
    instanceCost,
    storageCost,
    totalCost,
    formatted: formatUSD(totalCost),
  };
}

// ── Aurora ────────────────────────────────────────────────────────────────────
export function calcAuroraCost({
  instanceEntry,
  instanceCount,
  storageGB,
  ioMillions,
  hoursPerDay,
  prices,
}) {
  if (!instanceEntry || !prices?.aurora) return null;
  const instanceCost =
    instanceEntry.priceHr * (instanceCount ?? 1) * (hoursPerDay ?? 24) * 30;
  const storageCost = (storageGB ?? 20) * prices.aurora.storage_per_gb;
  const ioCost = (ioMillions ?? 0) * prices.aurora.io_per_million;
  const totalCost = instanceCost + storageCost + ioCost;
  return {
    instanceCost,
    storageCost,
    ioCost,
    totalCost,
    formatted: formatUSD(totalCost),
  };
}

// ── DynamoDB ──────────────────────────────────────────────────────────────────
export function calcDynamoCost({
  mode,
  wru,
  rru,
  wcu,
  rcu,
  storageGB,
  prices,
}) {
  if (!prices?.dynamodb) return null;
  const p = prices.dynamodb;
  let writeCost, readCost;
  if (mode === "on_demand") {
    writeCost = ((wru ?? 0) / 1_000_000) * p.on_demand.write_per_million;
    readCost = ((rru ?? 0) / 1_000_000) * p.on_demand.read_per_million;
  } else {
    writeCost = (wcu ?? 0) * p.provisioned.wcu_per_hr * HOURS_PER_MONTH;
    readCost = (rcu ?? 0) * p.provisioned.rcu_per_hr * HOURS_PER_MONTH;
  }
  const storageCost = (storageGB ?? 0) * p.storage_per_gb;
  const totalCost = writeCost + readCost + storageCost;
  return {
    writeCost,
    readCost,
    storageCost,
    totalCost,
    formatted: formatUSD(totalCost),
  };
}

// ── ElastiCache ───────────────────────────────────────────────────────────────
export function calcElastiCacheCost({
  nodeEntry,
  nodeCount,
  hoursPerDay,
  prices,
}) {
  if (!nodeEntry || !prices?.elasticache) return null;
  const nodeCost =
    nodeEntry.priceHr * (nodeCount ?? 1) * (hoursPerDay ?? 24) * 30;
  return { nodeCost, totalCost: nodeCost, formatted: formatUSD(nodeCost) };
}

// ── DocumentDB ────────────────────────────────────────────────────────────────
export function calcDocumentDBCost({
  instanceEntry,
  instanceCount,
  storageGB,
  ioMillions,
  hoursPerDay,
  prices,
}) {
  if (!instanceEntry || !prices?.documentdb) return null;
  const instanceCost =
    instanceEntry.priceHr * (instanceCount ?? 1) * (hoursPerDay ?? 24) * 30;
  const storageCost = (storageGB ?? 20) * prices.documentdb.storage_per_gb;
  const ioCost = (ioMillions ?? 0) * prices.documentdb.io_per_million;
  const totalCost = instanceCost + storageCost + ioCost;
  return {
    instanceCost,
    storageCost,
    ioCost,
    totalCost,
    formatted: formatUSD(totalCost),
  };
}

// ── Neptune ───────────────────────────────────────────────────────────────────
export function calcNeptuneCost({
  instanceEntry,
  storageGB,
  ioMillions,
  hoursPerDay,
  prices,
}) {
  if (!instanceEntry || !prices?.neptune) return null;
  const instanceCost = instanceEntry.priceHr * (hoursPerDay ?? 24) * 30;
  const storageCost = (storageGB ?? 20) * prices.neptune.storage_per_gb;
  const ioCost = (ioMillions ?? 0) * prices.neptune.io_per_million;
  const totalCost = instanceCost + storageCost + ioCost;
  return {
    instanceCost,
    storageCost,
    ioCost,
    totalCost,
    formatted: formatUSD(totalCost),
  };
}

// ── Keyspaces ─────────────────────────────────────────────────────────────────
export function calcKeyspacesCost({
  writesPerMonth,
  readsPerMonth,
  storageGB,
  prices,
}) {
  if (!prices?.keyspaces) return null;
  const p = prices.keyspaces;
  const writeCost = ((writesPerMonth ?? 0) / 1_000_000) * p.write_per_million;
  const readCost = ((readsPerMonth ?? 0) / 1_000_000) * p.read_per_million;
  const storageCost = (storageGB ?? 0) * p.storage_per_gb;
  const totalCost = writeCost + readCost + storageCost;
  return {
    writeCost,
    readCost,
    storageCost,
    totalCost,
    formatted: formatUSD(totalCost),
  };
}

// ── Timestream ────────────────────────────────────────────────────────────────
export function calcTimestreamCost({
  writesPerMonth,
  memStoreGB,
  magStoreGB,
  queryGB,
  prices,
}) {
  if (!prices?.timestream) return null;
  const p = prices.timestream;
  const writeCost = ((writesPerMonth ?? 0) / 1_000_000) * p.writes_per_million;
  const memCost = (memStoreGB ?? 0) * p.memory_store_gb_hr * HOURS_PER_MONTH;
  const magCost = (magStoreGB ?? 0) * p.magnetic_store_gb_mo;
  const queryCost = (queryGB ?? 0) * p.query_per_gb_scanned;
  const totalCost = writeCost + memCost + magCost + queryCost;
  return {
    writeCost,
    memCost,
    magCost,
    queryCost,
    totalCost,
    formatted: formatUSD(totalCost),
  };
}

export { formatUSD };
