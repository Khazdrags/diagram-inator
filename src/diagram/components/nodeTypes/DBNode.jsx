import PropTypes from "prop-types";
import { useCallback, useMemo } from "react";
import { Handle, useReactFlow } from "@xyflow/react";
import {
  Box,
  Divider,
  MenuItem,
  Select,
  Slider,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { NODE_HANDLES } from "./nodeConfig";
import {
  numberFieldSx,
  resultLabelSx,
  resultRowSx,
  resultValueSx,
  totalCardLabelSx,
  totalCardValueSx,
} from "./nodeStyles";
import { useDBData } from "../../context/DBDataContext";
import {
  calcAuroraCost,
  calcDocumentDBCost,
  calcDynamoCost,
  calcElastiCacheCost,
  calcKeyspacesCost,
  calcNeptuneCost,
  calcRDSCost,
  calcTimestreamCost,
} from "../../helpers/dbPricing";

// ─── Iconos por servicio ──────────────────────────────────────────────────────
const SERVICE_ICONS = {
  RDS: "https://unpkg.com/aws-icons@latest/icons/architecture-service/AmazonRDS.svg",
  Aurora:
    "https://unpkg.com/aws-icons@latest/icons/architecture-service/AmazonAurora.svg",
  DynamoDB:
    "https://unpkg.com/aws-icons@latest/icons/architecture-service/AmazonDynamoDB.svg",
  ElastiCache:
    "https://unpkg.com/aws-icons@latest/icons/architecture-service/AmazonElastiCache.svg",
  DocumentDB:
    "https://unpkg.com/aws-icons@latest/icons/architecture-service/AmazonDocumentDB.svg",
  Neptune:
    "https://unpkg.com/aws-icons@latest/icons/architecture-service/AmazonNeptune.svg",
  Keyspaces:
    "https://unpkg.com/aws-icons@latest/icons/architecture-service/AmazonKeyspaces.svg",
  Timestream:
    "https://unpkg.com/aws-icons@latest/icons/architecture-service/AmazonTimestream.svg",
};

// ─── Defaults al cambiar servicio ─────────────────────────────────────────────
const SERVICE_DEFAULTS = {
  RDS: {
    engine: "MySQL",
    instanceType: "db.t3.micro",
    multiAZ: false,
    storageGB: 20,
    storageType: "gp3",
    hoursPerDay: 24,
  },
  Aurora: {
    auroraEngine: "MySQL-compatible",
    instanceType: "db.t3.medium",
    instanceCount: 1,
    storageGB: 20,
    ioMillions: 0,
    hoursPerDay: 24,
  },
  DynamoDB: {
    dynamoMode: "on_demand",
    wru: 1000000,
    rru: 5000000,
    wcu: 5,
    rcu: 10,
    dynamoStorageGB: 5,
  },
  ElastiCache: {
    cacheEngine: "Redis OSS",
    nodeType: "cache.t3.micro",
    nodeCount: 1,
    hoursPerDay: 24,
  },
  DocumentDB: {
    instanceType: "db.t3.medium",
    instanceCount: 1,
    storageGB: 20,
    ioMillions: 0,
    hoursPerDay: 24,
  },
  Neptune: {
    instanceType: "db.t3.medium",
    storageGB: 20,
    ioMillions: 0,
    hoursPerDay: 24,
  },
  Keyspaces: {
    writesPerMonth: 1000000,
    readsPerMonth: 5000000,
    ksStorageGB: 5,
  },
  Timestream: {
    tsWritesPerMonth: 1000000,
    memStoreGB: 5,
    magStoreGB: 20,
    queryScannedGB: 10,
  },
};

const SLIDER_SX = {
  color: "#1ed760",
  py: "6px",
  "& .MuiSlider-thumb": {
    width: 12,
    height: 12,
    "&:hover, &.Mui-focusVisible": {
      boxShadow: "0 0 0 6px rgba(30,215,96,0.18)",
    },
  },
  "& .MuiSlider-rail": { bgcolor: "#4d4d4d", opacity: 1 },
  "& .MuiSlider-track": { bgcolor: "#1ed760", border: "none" },
};

const SWITCH_SX = {
  "& .MuiSwitch-switchBase.Mui-checked": { color: "#1ed760" },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    bgcolor: "#1ed760",
  },
};

// ─── Componente ───────────────────────────────────────────────────────────────
export default function DBNode({ data, isConnectable, id }) {
  const { setNodes } = useReactFlow();
  const {
    prices,
    rdsEngines,
    auroraEngines,
    cacheEngines,
    getRDSInstances,
    auroraInstances,
    getElastiCacheInstances,
    documentdbInstances,
    neptuneInstances,
  } = useDBData();

  const {
    name = "Database",
    service = "RDS",
    // RDS
    engine = "MySQL",
    instanceType = "db.t3.micro",
    multiAZ = false,
    storageGB = 20,
    storageType = "gp3",
    hoursPerDay = 24,
    // Aurora
    auroraEngine = "MySQL-compatible",
    instanceCount = 1,
    ioMillions = 0,
    // DynamoDB
    dynamoMode = "on_demand",
    wru = 1000000,
    rru = 5000000,
    wcu = 5,
    rcu = 10,
    dynamoStorageGB = 5,
    // ElastiCache
    cacheEngine = "Redis OSS",
    nodeType = "cache.t3.micro",
    nodeCount = 1,
    // Keyspaces
    writesPerMonth = 1000000,
    readsPerMonth = 5000000,
    ksStorageGB = 5,
    // Timestream
    tsWritesPerMonth = 1000000,
    memStoreGB = 5,
    magStoreGB = 20,
    queryScannedGB = 10,
  } = data || {};

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const update = useCallback(
    (patch) =>
      setNodes((nodes) =>
        nodes.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
        ),
      ),
    [id, setNodes],
  );

  const handleServiceChange = useCallback(
    (newService) =>
      update({ service: newService, ...SERVICE_DEFAULTS[newService] }),
    [update],
  );

  const handleNumber = useCallback(
    (field) => (e) => {
      const val = Number.parseFloat(e.target.value);
      if (!Number.isNaN(val) && val >= 0) update({ [field]: val });
    },
    [update],
  );

  const handleInt = useCallback(
    (field) => (e) => {
      const val = Number.parseInt(e.target.value, 10);
      if (!Number.isNaN(val) && val >= 0) update({ [field]: val });
    },
    [update],
  );

  // ─── Listas de instancias ────────────────────────────────────────────────────
  const rdsInstances = useMemo(
    () => getRDSInstances(engine),
    [getRDSInstances, engine],
  );
  const cacheInstanceList = useMemo(
    () => getElastiCacheInstances(cacheEngine),
    [getElastiCacheInstances, cacheEngine],
  );

  const rdsInstance = useMemo(
    () =>
      rdsInstances.find((i) => i.instance === instanceType) ??
      rdsInstances[0] ??
      null,
    [rdsInstances, instanceType],
  );
  const auroraInstance = useMemo(
    () =>
      auroraInstances.find((i) => i.instance === instanceType) ??
      auroraInstances[0] ??
      null,
    [auroraInstances, instanceType],
  );
  const cacheNode = useMemo(
    () =>
      cacheInstanceList.find((i) => i.node === nodeType) ??
      cacheInstanceList[0] ??
      null,
    [cacheInstanceList, nodeType],
  );
  const docdbInstance = useMemo(
    () =>
      documentdbInstances.find((i) => i.instance === instanceType) ??
      documentdbInstances[0] ??
      null,
    [documentdbInstances, instanceType],
  );
  const neptuneInstance = useMemo(
    () =>
      neptuneInstances.find((i) => i.instance === instanceType) ??
      neptuneInstances[0] ??
      null,
    [neptuneInstances, instanceType],
  );

  // ─── Cálculo de costos ──────────────────────────────────────────────────────
  const cost = useMemo(() => {
    switch (service) {
      case "RDS":
        return calcRDSCost({
          instanceEntry: rdsInstance,
          multiAZ,
          storageGB,
          storageType,
          hoursPerDay,
          prices,
        });
      case "Aurora":
        return calcAuroraCost({
          instanceEntry: auroraInstance,
          instanceCount,
          storageGB,
          ioMillions,
          hoursPerDay,
          prices,
        });
      case "DynamoDB":
        return calcDynamoCost({
          mode: dynamoMode,
          wru,
          rru,
          wcu,
          rcu,
          storageGB: dynamoStorageGB,
          prices,
        });
      case "ElastiCache":
        return calcElastiCacheCost({
          nodeEntry: cacheNode,
          nodeCount,
          hoursPerDay,
          prices,
        });
      case "DocumentDB":
        return calcDocumentDBCost({
          instanceEntry: docdbInstance,
          instanceCount,
          storageGB,
          ioMillions,
          hoursPerDay,
          prices,
        });
      case "Neptune":
        return calcNeptuneCost({
          instanceEntry: neptuneInstance,
          storageGB,
          ioMillions,
          hoursPerDay,
          prices,
        });
      case "Keyspaces":
        return calcKeyspacesCost({
          writesPerMonth,
          readsPerMonth,
          storageGB: ksStorageGB,
          prices,
        });
      case "Timestream":
        return calcTimestreamCost({
          writesPerMonth: tsWritesPerMonth,
          memStoreGB,
          magStoreGB,
          queryGB: queryScannedGB,
          prices,
        });
      default:
        return null;
    }
  }, [
    service,
    rdsInstance,
    multiAZ,
    storageGB,
    storageType,
    hoursPerDay,
    prices,
    auroraInstance,
    instanceCount,
    ioMillions,
    dynamoMode,
    wru,
    rru,
    wcu,
    rcu,
    dynamoStorageGB,
    cacheNode,
    nodeCount,
    docdbInstance,
    neptuneInstance,
    writesPerMonth,
    readsPerMonth,
    ksStorageGB,
    tsWritesPerMonth,
    memStoreGB,
    magStoreGB,
    queryScannedGB,
  ]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box className="db-node diagram-node">
      {NODE_HANDLES.map((h) => (
        <Handle
          key={h.key}
          type={h.type}
          position={h.position}
          id={h.id}
          isConnectable={isConnectable}
          style={h.style}
        />
      ))}

      {/* ── Header ── */}
      <Box className="diagram-node-header">
        <img
          src={SERVICE_ICONS[service] ?? SERVICE_ICONS.RDS}
          alt={service}
          style={{ width: 30, height: 30, flexShrink: 0 }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        <TextField
          className="nodrag nopan diagram-node-title-field diagram-node-title-field--accent"
          value={name}
          onChange={(e) => update({ name: e.target.value })}
          size="small"
          variant="standard"
          placeholder="Database name"
          sx={{ flex: 1 }}
        />
      </Box>

      {/* ── Servicio ── */}
      <Box sx={{ mb: "6px" }}>
        <Typography className="diagram-node-section-label">Service</Typography>
        <Select
          className="nodrag nopan diagram-node-select"
          value={service}
          onChange={(e) => handleServiceChange(e.target.value)}
          size="small"
          variant="standard"
          fullWidth
        >
          {[
            "RDS",
            "Aurora",
            "DynamoDB",
            "ElastiCache",
            "DocumentDB",
            "Neptune",
            "Keyspaces",
            "Timestream",
          ].map((s) => (
            <MenuItem key={s} value={s} sx={{ fontSize: "13px" }}>
              {s}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: "8px" }} />

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* RDS */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {service === "RDS" && (
        <>
          <Box sx={{ mb: "6px" }}>
            <Typography className="diagram-node-section-label">
              Engine
            </Typography>
            <Select
              className="nodrag nopan diagram-node-select"
              value={engine}
              onChange={(e) =>
                update({
                  engine: e.target.value,
                  instanceType: SERVICE_DEFAULTS.RDS.instanceType,
                })
              }
              size="small"
              variant="standard"
              fullWidth
            >
              {rdsEngines.map((eng) => (
                <MenuItem key={eng} value={eng} sx={{ fontSize: "13px" }}>
                  {eng}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box sx={{ mb: "6px" }}>
            <Typography className="diagram-node-section-label">
              Instance
            </Typography>
            <Select
              className="nodrag nopan diagram-node-select"
              value={rdsInstance?.instance ?? ""}
              onChange={(e) => update({ instanceType: e.target.value })}
              size="small"
              variant="standard"
              fullWidth
            >
              {rdsInstances.map((i) => (
                <MenuItem
                  key={i.instance}
                  value={i.instance}
                  sx={{
                    fontSize: "13px",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <span>{i.instance}</span>
                  <Typography
                    component="span"
                    sx={{ fontSize: "11px", color: "#b3b3b3" }}
                  >
                    ${i.priceHr}/hr
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box
            sx={{
              mb: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography className="diagram-node-section-label">
              Multi-AZ
            </Typography>
            <Switch
              className="nodrag nopan"
              size="small"
              checked={multiAZ}
              onChange={(e) => update({ multiAZ: e.target.checked })}
              sx={SWITCH_SX}
            />
          </Box>

          <Box sx={{ mb: "6px" }}>
            <Typography className="diagram-node-section-label">
              Storage type
            </Typography>
            <Select
              className="nodrag nopan diagram-node-select"
              value={storageType}
              onChange={(e) => update({ storageType: e.target.value })}
              size="small"
              variant="standard"
              fullWidth
            >
              {["gp3", "gp2"].map((st) => (
                <MenuItem key={st} value={st} sx={{ fontSize: "13px" }}>
                  {st.toUpperCase()} — $
                  {prices?.rds?.[`storage_${st}_per_gb`] ?? "—"}/GB
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box sx={{ mb: "6px" }}>
            <Typography className="diagram-node-section-label">
              Storage (GB)
            </Typography>
            <TextField
              className="nodrag nopan"
              type="number"
              value={storageGB}
              onChange={handleNumber("storageGB")}
              size="small"
              variant="standard"
              fullWidth
              inputProps={{ min: 20, step: 10 }}
              sx={numberFieldSx}
            />
          </Box>

          <Box sx={{ mb: "10px" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                mb: "2px",
              }}
            >
              <Typography className="diagram-node-section-label">
                Hours / day
              </Typography>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "text.primary",
                }}
              >
                {hoursPerDay}h
              </Typography>
            </Box>
            <Slider
              className="nodrag nopan"
              value={hoursPerDay}
              onChange={(_, v) => update({ hoursPerDay: v })}
              min={1}
              max={24}
              step={1}
              size="small"
              sx={SLIDER_SX}
            />
          </Box>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* Aurora */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {service === "Aurora" && (
        <>
          <Box sx={{ mb: "6px" }}>
            <Typography className="diagram-node-section-label">
              Engine
            </Typography>
            <Select
              className="nodrag nopan diagram-node-select"
              value={auroraEngine}
              onChange={(e) => update({ auroraEngine: e.target.value })}
              size="small"
              variant="standard"
              fullWidth
            >
              {auroraEngines.map((eng) => (
                <MenuItem key={eng} value={eng} sx={{ fontSize: "13px" }}>
                  {eng}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box sx={{ mb: "6px" }}>
            <Typography className="diagram-node-section-label">
              Instance
            </Typography>
            <Select
              className="nodrag nopan diagram-node-select"
              value={auroraInstance?.instance ?? ""}
              onChange={(e) => update({ instanceType: e.target.value })}
              size="small"
              variant="standard"
              fullWidth
            >
              {auroraInstances.map((i) => (
                <MenuItem
                  key={i.instance}
                  value={i.instance}
                  sx={{
                    fontSize: "13px",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <span>{i.instance}</span>
                  <Typography
                    component="span"
                    sx={{ fontSize: "11px", color: "#b3b3b3" }}
                  >
                    ${i.priceHr}/hr
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box sx={{ mb: "6px" }}>
            <Typography className="diagram-node-section-label">
              Instance count
            </Typography>
            <TextField
              className="nodrag nopan"
              type="number"
              value={instanceCount}
              onChange={handleInt("instanceCount")}
              size="small"
              variant="standard"
              fullWidth
              inputProps={{ min: 1, step: 1 }}
              sx={numberFieldSx}
            />
          </Box>

          <Box sx={{ mb: "6px" }}>
            <Typography className="diagram-node-section-label">
              Storage (GB)
            </Typography>
            <TextField
              className="nodrag nopan"
              type="number"
              value={storageGB}
              onChange={handleNumber("storageGB")}
              size="small"
              variant="standard"
              fullWidth
              inputProps={{ min: 10, step: 10 }}
              sx={numberFieldSx}
            />
          </Box>

          <Box sx={{ mb: "10px" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                mb: "2px",
              }}
            >
              <Typography className="diagram-node-section-label">
                Hours / day
              </Typography>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "text.primary",
                }}
              >
                {hoursPerDay}h
              </Typography>
            </Box>
            <Slider
              className="nodrag nopan"
              value={hoursPerDay}
              onChange={(_, v) => update({ hoursPerDay: v })}
              min={1}
              max={24}
              step={1}
              size="small"
              sx={SLIDER_SX}
            />
          </Box>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* DynamoDB */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {service === "DynamoDB" && (
        <>
          <Box sx={{ mb: "6px" }}>
            <Typography className="diagram-node-section-label">
              Billing mode
            </Typography>
            <Select
              className="nodrag nopan diagram-node-select"
              value={dynamoMode}
              onChange={(e) => update({ dynamoMode: e.target.value })}
              size="small"
              variant="standard"
              fullWidth
            >
              <MenuItem value="on_demand" sx={{ fontSize: "13px" }}>
                On-Demand
              </MenuItem>
              <MenuItem value="provisioned" sx={{ fontSize: "13px" }}>
                Provisioned
              </MenuItem>
            </Select>
          </Box>

          {dynamoMode === "on_demand" ? (
            <>
              <Box sx={{ mb: "6px" }}>
                <Typography className="diagram-node-section-label">
                  Write Request Units / month
                </Typography>
                <TextField
                  className="nodrag nopan"
                  type="number"
                  value={wru}
                  onChange={handleInt("wru")}
                  size="small"
                  variant="standard"
                  fullWidth
                  inputProps={{ min: 0, step: 1000000 }}
                  sx={numberFieldSx}
                />
              </Box>
              <Box sx={{ mb: "6px" }}>
                <Typography className="diagram-node-section-label">
                  Read Request Units / month
                </Typography>
                <TextField
                  className="nodrag nopan"
                  type="number"
                  value={rru}
                  onChange={handleInt("rru")}
                  size="small"
                  variant="standard"
                  fullWidth
                  inputProps={{ min: 0, step: 1000000 }}
                  sx={numberFieldSx}
                />
              </Box>
            </>
          ) : (
            <>
              <Box sx={{ mb: "6px" }}>
                <Typography className="diagram-node-section-label">
                  Write Capacity Units (WCU)
                </Typography>
                <TextField
                  className="nodrag nopan"
                  type="number"
                  value={wcu}
                  onChange={handleInt("wcu")}
                  size="small"
                  variant="standard"
                  fullWidth
                  inputProps={{ min: 1, step: 1 }}
                  sx={numberFieldSx}
                />
              </Box>
              <Box sx={{ mb: "6px" }}>
                <Typography className="diagram-node-section-label">
                  Read Capacity Units (RCU)
                </Typography>
                <TextField
                  className="nodrag nopan"
                  type="number"
                  value={rcu}
                  onChange={handleInt("rcu")}
                  size="small"
                  variant="standard"
                  fullWidth
                  inputProps={{ min: 1, step: 1 }}
                  sx={numberFieldSx}
                />
              </Box>
            </>
          )}

          <Box sx={{ mb: "10px" }}>
            <Typography className="diagram-node-section-label">
              Storage (GB)
            </Typography>
            <TextField
              className="nodrag nopan"
              type="number"
              value={dynamoStorageGB}
              onChange={handleNumber("dynamoStorageGB")}
              size="small"
              variant="standard"
              fullWidth
              inputProps={{ min: 0, step: 5 }}
              sx={numberFieldSx}
            />
          </Box>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ElastiCache */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {service === "ElastiCache" && (
        <>
          <Box sx={{ mb: "6px" }}>
            <Typography className="diagram-node-section-label">
              Engine
            </Typography>
            <Select
              className="nodrag nopan diagram-node-select"
              value={cacheEngine}
              onChange={(e) =>
                update({
                  cacheEngine: e.target.value,
                  nodeType: SERVICE_DEFAULTS.ElastiCache.nodeType,
                })
              }
              size="small"
              variant="standard"
              fullWidth
            >
              {cacheEngines.map((eng) => (
                <MenuItem key={eng} value={eng} sx={{ fontSize: "13px" }}>
                  {eng}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box sx={{ mb: "6px" }}>
            <Typography className="diagram-node-section-label">
              Node type
            </Typography>
            <Select
              className="nodrag nopan diagram-node-select"
              value={cacheNode?.node ?? ""}
              onChange={(e) => update({ nodeType: e.target.value })}
              size="small"
              variant="standard"
              fullWidth
            >
              {cacheInstanceList.map((i) => (
                <MenuItem
                  key={i.node}
                  value={i.node}
                  sx={{
                    fontSize: "13px",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <span>{i.node}</span>
                  <Typography
                    component="span"
                    sx={{ fontSize: "11px", color: "#b3b3b3" }}
                  >
                    ${i.priceHr}/hr
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box sx={{ mb: "6px" }}>
            <Typography className="diagram-node-section-label">
              Node count
            </Typography>
            <TextField
              className="nodrag nopan"
              type="number"
              value={nodeCount}
              onChange={handleInt("nodeCount")}
              size="small"
              variant="standard"
              fullWidth
              inputProps={{ min: 1, step: 1 }}
              sx={numberFieldSx}
            />
          </Box>

          <Box sx={{ mb: "10px" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                mb: "2px",
              }}
            >
              <Typography className="diagram-node-section-label">
                Hours / day
              </Typography>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "text.primary",
                }}
              >
                {hoursPerDay}h
              </Typography>
            </Box>
            <Slider
              className="nodrag nopan"
              value={hoursPerDay}
              onChange={(_, v) => update({ hoursPerDay: v })}
              min={1}
              max={24}
              step={1}
              size="small"
              sx={SLIDER_SX}
            />
          </Box>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* DocumentDB */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {service === "DocumentDB" && (
        <>
          <Box sx={{ mb: "6px" }}>
            <Typography className="diagram-node-section-label">
              Instance
            </Typography>
            <Select
              className="nodrag nopan diagram-node-select"
              value={docdbInstance?.instance ?? ""}
              onChange={(e) => update({ instanceType: e.target.value })}
              size="small"
              variant="standard"
              fullWidth
            >
              {documentdbInstances.map((i) => (
                <MenuItem
                  key={i.instance}
                  value={i.instance}
                  sx={{
                    fontSize: "13px",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <span>{i.instance}</span>
                  <Typography
                    component="span"
                    sx={{ fontSize: "11px", color: "#b3b3b3" }}
                  >
                    ${i.priceHr}/hr
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box sx={{ mb: "6px" }}>
            <Typography className="diagram-node-section-label">
              Instance count
            </Typography>
            <TextField
              className="nodrag nopan"
              type="number"
              value={instanceCount}
              onChange={handleInt("instanceCount")}
              size="small"
              variant="standard"
              fullWidth
              inputProps={{ min: 1, step: 1 }}
              sx={numberFieldSx}
            />
          </Box>

          <Box sx={{ mb: "6px" }}>
            <Typography className="diagram-node-section-label">
              Storage (GB)
            </Typography>
            <TextField
              className="nodrag nopan"
              type="number"
              value={storageGB}
              onChange={handleNumber("storageGB")}
              size="small"
              variant="standard"
              fullWidth
              inputProps={{ min: 10, step: 10 }}
              sx={numberFieldSx}
            />
          </Box>

          <Box sx={{ mb: "6px" }}>
            <Typography className="diagram-node-section-label">
              I/O (millions/month)
            </Typography>
            <TextField
              className="nodrag nopan"
              type="number"
              value={ioMillions}
              onChange={handleNumber("ioMillions")}
              size="small"
              variant="standard"
              fullWidth
              inputProps={{ min: 0, step: 1 }}
              sx={numberFieldSx}
            />
          </Box>

          <Box sx={{ mb: "10px" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                mb: "2px",
              }}
            >
              <Typography className="diagram-node-section-label">
                Hours / day
              </Typography>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "text.primary",
                }}
              >
                {hoursPerDay}h
              </Typography>
            </Box>
            <Slider
              className="nodrag nopan"
              value={hoursPerDay}
              onChange={(_, v) => update({ hoursPerDay: v })}
              min={1}
              max={24}
              step={1}
              size="small"
              sx={SLIDER_SX}
            />
          </Box>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* Neptune */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {service === "Neptune" && (
        <>
          <Box sx={{ mb: "6px" }}>
            <Typography className="diagram-node-section-label">
              Instance
            </Typography>
            <Select
              className="nodrag nopan diagram-node-select"
              value={neptuneInstance?.instance ?? ""}
              onChange={(e) => update({ instanceType: e.target.value })}
              size="small"
              variant="standard"
              fullWidth
            >
              {neptuneInstances.map((i) => (
                <MenuItem
                  key={i.instance}
                  value={i.instance}
                  sx={{
                    fontSize: "13px",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <span>{i.instance}</span>
                  <Typography
                    component="span"
                    sx={{ fontSize: "11px", color: "#b3b3b3" }}
                  >
                    ${i.priceHr}/hr
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box sx={{ mb: "6px" }}>
            <Typography className="diagram-node-section-label">
              Storage (GB)
            </Typography>
            <TextField
              className="nodrag nopan"
              type="number"
              value={storageGB}
              onChange={handleNumber("storageGB")}
              size="small"
              variant="standard"
              fullWidth
              inputProps={{ min: 10, step: 10 }}
              sx={numberFieldSx}
            />
          </Box>

          <Box sx={{ mb: "6px" }}>
            <Typography className="diagram-node-section-label">
              I/O (millions/month)
            </Typography>
            <TextField
              className="nodrag nopan"
              type="number"
              value={ioMillions}
              onChange={handleNumber("ioMillions")}
              size="small"
              variant="standard"
              fullWidth
              inputProps={{ min: 0, step: 1 }}
              sx={numberFieldSx}
            />
          </Box>

          <Box sx={{ mb: "10px" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                mb: "2px",
              }}
            >
              <Typography className="diagram-node-section-label">
                Hours / day
              </Typography>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "text.primary",
                }}
              >
                {hoursPerDay}h
              </Typography>
            </Box>
            <Slider
              className="nodrag nopan"
              value={hoursPerDay}
              onChange={(_, v) => update({ hoursPerDay: v })}
              min={1}
              max={24}
              step={1}
              size="small"
              sx={SLIDER_SX}
            />
          </Box>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* Keyspaces */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {service === "Keyspaces" && (
        <>
          <Box sx={{ mb: "6px" }}>
            <Tooltip
              title="$0.65 per million write request units"
              placement="top"
            >
              <Typography className="diagram-node-section-label">
                Writes / month (WRU)
              </Typography>
            </Tooltip>
            <TextField
              className="nodrag nopan"
              type="number"
              value={writesPerMonth}
              onChange={handleInt("writesPerMonth")}
              size="small"
              variant="standard"
              fullWidth
              inputProps={{ min: 0, step: 1000000 }}
              sx={numberFieldSx}
            />
          </Box>

          <Box sx={{ mb: "6px" }}>
            <Tooltip
              title="$0.13 per million read request units"
              placement="top"
            >
              <Typography className="diagram-node-section-label">
                Reads / month (RRU)
              </Typography>
            </Tooltip>
            <TextField
              className="nodrag nopan"
              type="number"
              value={readsPerMonth}
              onChange={handleInt("readsPerMonth")}
              size="small"
              variant="standard"
              fullWidth
              inputProps={{ min: 0, step: 1000000 }}
              sx={numberFieldSx}
            />
          </Box>

          <Box sx={{ mb: "10px" }}>
            <Typography className="diagram-node-section-label">
              Storage (GB)
            </Typography>
            <TextField
              className="nodrag nopan"
              type="number"
              value={ksStorageGB}
              onChange={handleNumber("ksStorageGB")}
              size="small"
              variant="standard"
              fullWidth
              inputProps={{ min: 0, step: 1 }}
              sx={numberFieldSx}
            />
          </Box>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* Timestream */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {service === "Timestream" && (
        <>
          <Box sx={{ mb: "6px" }}>
            <Typography className="diagram-node-section-label">
              Writes / month (millions)
            </Typography>
            <TextField
              className="nodrag nopan"
              type="number"
              value={tsWritesPerMonth}
              onChange={handleInt("tsWritesPerMonth")}
              size="small"
              variant="standard"
              fullWidth
              inputProps={{ min: 0, step: 1000000 }}
              sx={numberFieldSx}
            />
          </Box>

          <Box sx={{ mb: "6px" }}>
            <Tooltip
              title="Retención rápida, más costosa · $0.036/GB-hr"
              placement="top"
            >
              <Typography className="diagram-node-section-label">
                Memory Store (GB)
              </Typography>
            </Tooltip>
            <TextField
              className="nodrag nopan"
              type="number"
              value={memStoreGB}
              onChange={handleNumber("memStoreGB")}
              size="small"
              variant="standard"
              fullWidth
              inputProps={{ min: 0, step: 1 }}
              sx={numberFieldSx}
            />
          </Box>

          <Box sx={{ mb: "6px" }}>
            <Tooltip
              title="Retención de largo plazo · $0.03/GB-month"
              placement="top"
            >
              <Typography className="diagram-node-section-label">
                Magnetic Store (GB)
              </Typography>
            </Tooltip>
            <TextField
              className="nodrag nopan"
              type="number"
              value={magStoreGB}
              onChange={handleNumber("magStoreGB")}
              size="small"
              variant="standard"
              fullWidth
              inputProps={{ min: 0, step: 10 }}
              sx={numberFieldSx}
            />
          </Box>

          <Box sx={{ mb: "10px" }}>
            <Tooltip
              title="GB escaneados por queries · $0.01/GB"
              placement="top"
            >
              <Typography className="diagram-node-section-label">
                Query Scanned (GB/month)
              </Typography>
            </Tooltip>
            <TextField
              className="nodrag nopan"
              type="number"
              value={queryScannedGB}
              onChange={handleNumber("queryScannedGB")}
              size="small"
              variant="standard"
              fullWidth
              inputProps={{ min: 0, step: 1 }}
              sx={numberFieldSx}
            />
          </Box>
        </>
      )}

      {/* ── Desglose de costos ── */}
      {cost && (
        <Box className="diagram-node-info-card" sx={{ mb: "6px" }}>
          <Typography className="diagram-node-card-heading">
            Cost breakdown
          </Typography>

          {service === "RDS" && (
            <>
              <Box sx={resultRowSx}>
                <Typography sx={resultLabelSx}>
                  Instance ({multiAZ ? "Multi-AZ" : "Single-AZ"})
                </Typography>
                <Typography sx={resultValueSx}>
                  ${cost.instanceCost.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={resultRowSx}>
                <Typography sx={resultLabelSx}>
                  Storage ({storageGB} GB {storageType.toUpperCase()})
                </Typography>
                <Typography sx={resultValueSx}>
                  ${cost.storageCost.toFixed(2)}
                </Typography>
              </Box>
            </>
          )}

          {service === "Aurora" && (
            <>
              <Box sx={resultRowSx}>
                <Typography sx={resultLabelSx}>
                  Instance × {instanceCount}
                </Typography>
                <Typography sx={resultValueSx}>
                  ${cost.instanceCost.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={resultRowSx}>
                <Typography sx={resultLabelSx}>
                  Storage ({storageGB} GB)
                </Typography>
                <Typography sx={resultValueSx}>
                  ${cost.storageCost.toFixed(2)}
                </Typography>
              </Box>
              {cost.ioCost > 0 && (
                <Box sx={resultRowSx}>
                  <Typography sx={resultLabelSx}>
                    I/O ({ioMillions}M ops)
                  </Typography>
                  <Typography sx={resultValueSx}>
                    ${cost.ioCost.toFixed(2)}
                  </Typography>
                </Box>
              )}
            </>
          )}

          {service === "DynamoDB" && (
            <>
              <Box sx={resultRowSx}>
                <Typography sx={resultLabelSx}>
                  {dynamoMode === "on_demand"
                    ? "Writes (WRU)"
                    : "Write capacity"}
                </Typography>
                <Typography sx={resultValueSx}>
                  ${cost.writeCost.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={resultRowSx}>
                <Typography sx={resultLabelSx}>
                  {dynamoMode === "on_demand" ? "Reads (RRU)" : "Read capacity"}
                </Typography>
                <Typography sx={resultValueSx}>
                  ${cost.readCost.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={resultRowSx}>
                <Typography sx={resultLabelSx}>
                  Storage ({dynamoStorageGB} GB)
                </Typography>
                <Typography sx={resultValueSx}>
                  ${cost.storageCost.toFixed(2)}
                </Typography>
              </Box>
            </>
          )}

          {service === "ElastiCache" && (
            <Box sx={resultRowSx}>
              <Typography sx={resultLabelSx}>
                {nodeCount} node{nodeCount === 1 ? "" : "s"}
              </Typography>
              <Typography sx={resultValueSx}>
                ${cost.nodeCost.toFixed(2)}
              </Typography>
            </Box>
          )}

          {(service === "DocumentDB" || service === "Neptune") && (
            <>
              <Box sx={resultRowSx}>
                <Typography sx={resultLabelSx}>
                  Instance
                  {service === "DocumentDB" ? ` × ${instanceCount}` : ""}
                </Typography>
                <Typography sx={resultValueSx}>
                  ${cost.instanceCost.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={resultRowSx}>
                <Typography sx={resultLabelSx}>
                  Storage ({storageGB} GB)
                </Typography>
                <Typography sx={resultValueSx}>
                  ${cost.storageCost.toFixed(2)}
                </Typography>
              </Box>
              {cost.ioCost > 0 && (
                <Box sx={resultRowSx}>
                  <Typography sx={resultLabelSx}>
                    I/O ({ioMillions}M ops)
                  </Typography>
                  <Typography sx={resultValueSx}>
                    ${cost.ioCost.toFixed(2)}
                  </Typography>
                </Box>
              )}
            </>
          )}

          {service === "Keyspaces" && (
            <>
              <Box sx={resultRowSx}>
                <Typography sx={resultLabelSx}>Writes</Typography>
                <Typography sx={resultValueSx}>
                  ${cost.writeCost.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={resultRowSx}>
                <Typography sx={resultLabelSx}>Reads</Typography>
                <Typography sx={resultValueSx}>
                  ${cost.readCost.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={resultRowSx}>
                <Typography sx={resultLabelSx}>
                  Storage ({ksStorageGB} GB)
                </Typography>
                <Typography sx={resultValueSx}>
                  ${cost.storageCost.toFixed(2)}
                </Typography>
              </Box>
            </>
          )}

          {service === "Timestream" && (
            <>
              <Box sx={resultRowSx}>
                <Typography sx={resultLabelSx}>Writes</Typography>
                <Typography sx={resultValueSx}>
                  ${cost.writeCost.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={resultRowSx}>
                <Typography sx={resultLabelSx}>Memory Store</Typography>
                <Typography sx={resultValueSx}>
                  ${cost.memCost.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={resultRowSx}>
                <Typography sx={resultLabelSx}>Magnetic Store</Typography>
                <Typography sx={resultValueSx}>
                  ${cost.magCost.toFixed(2)}
                </Typography>
              </Box>
              {cost.queryCost > 0 && (
                <Box sx={resultRowSx}>
                  <Typography sx={resultLabelSx}>Queries</Typography>
                  <Typography sx={resultValueSx}>
                    ${cost.queryCost.toFixed(2)}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {/* ── Total 30 días ── */}
      <Box className="diagram-node-total-card">
        <Typography sx={totalCardLabelSx}>Total cost (30 days)</Typography>
        <Typography sx={totalCardValueSx}>
          {cost ? `$${cost.totalCost.toFixed(2)}` : "—"}
        </Typography>
      </Box>
    </Box>
  );
}

DBNode.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    service: PropTypes.string,
    engine: PropTypes.string,
    instanceType: PropTypes.string,
    multiAZ: PropTypes.bool,
    storageGB: PropTypes.number,
    storageType: PropTypes.string,
    hoursPerDay: PropTypes.number,
    auroraEngine: PropTypes.string,
    instanceCount: PropTypes.number,
    ioMillions: PropTypes.number,
    dynamoMode: PropTypes.string,
    wru: PropTypes.number,
    rru: PropTypes.number,
    wcu: PropTypes.number,
    rcu: PropTypes.number,
    dynamoStorageGB: PropTypes.number,
    cacheEngine: PropTypes.string,
    nodeType: PropTypes.string,
    nodeCount: PropTypes.number,
    writesPerMonth: PropTypes.number,
    readsPerMonth: PropTypes.number,
    ksStorageGB: PropTypes.number,
    tsWritesPerMonth: PropTypes.number,
    memStoreGB: PropTypes.number,
    magStoreGB: PropTypes.number,
    queryScannedGB: PropTypes.number,
  }),
  isConnectable: PropTypes.bool,
  id: PropTypes.string.isRequired,
};
