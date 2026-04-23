import {
  Box,
  Divider,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Handle, useReactFlow } from "@xyflow/react";
import PropTypes from "prop-types";
import { useCallback, useMemo } from "react";
import { useBedrockData } from "../../context/BedrockDataContext";
import {
  calcVolumeCost,
  formatUSD,
  pricePerMillion,
} from "../../helpers/bedrockPricing";
import { NODE_HANDLES } from "./nodeConfig";

const numberFieldSx = {
  "& .MuiInput-root": { fontSize: "13px" },
  "& .MuiInput-underline:before": {
    borderBottomColor: "rgba(255,255,255,0.15)",
  },
  "& .MuiInput-underline:hover:before": {
    borderBottomColor: "rgba(255,255,255,0.4) !important",
  },
  "& .MuiInput-underline:after": { borderBottomColor: "#1ed760" },
  "& input[type=number]": { MozAppearance: "textfield" },
  "& input[type=number]::-webkit-outer-spin-button": {
    WebkitAppearance: "none",
  },
  "& input[type=number]::-webkit-inner-spin-button": {
    WebkitAppearance: "none",
  },
};

const resultRowSx = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
};

const resultLabelSx = { fontSize: "11px", color: "#b3b3b3" };
const resultValueSx = { fontSize: "13px", fontWeight: 700, color: "#1ed760" };

export default function BedrockNode({ data, isConnectable, id }) {
  const { setNodes } = useReactFlow();
  const { providers, modelsByProvider, getPrice } = useBedrockData();

  const {
    name = "Bedrock Model",
    provider = providers[0] ?? "",
    model = modelsByProvider[providers[0]]?.[0] ?? "",
    messageCount = 10000,
    avgInputTokens = 500,
    avgOutputTokens = 200,
  } = data || {};

  const update = useCallback(
    (patch) => {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, ...patch } } : node,
        ),
      );
    },
    [id, setNodes],
  );

  // Safe cascaded values
  const safeProvider = providers.includes(provider)
    ? provider
    : (providers[0] ?? "");
  const modelsForProvider = modelsByProvider[safeProvider] ?? [];
  const safeModel = modelsForProvider.includes(model)
    ? model
    : (modelsForProvider[0] ?? "");

  // Price entry from context
  const entry = useMemo(
    () => getPrice(safeProvider, safeModel),
    [getPrice, safeProvider, safeModel],
  );

  // Block A: price per 1M tokens
  const { inputPerM, outputPerM } = useMemo(
    () => pricePerMillion(entry),
    [entry],
  );

  // Block B: volume cost
  const { totalCost, totalInputTokens, totalOutputTokens } = useMemo(
    () =>
      calcVolumeCost({
        messageCount,
        avgInputTokens,
        avgOutputTokens,
        entry,
      }),
    [messageCount, avgInputTokens, avgOutputTokens, entry],
  );

  /** When provider changes, reset model to first available in that provider */
  const handleProviderChange = useCallback(
    (e) => {
      const newProvider = e.target.value;
      const firstModel = modelsByProvider[newProvider]?.[0] ?? "";
      update({ provider: newProvider, model: firstModel });
    },
    [modelsByProvider, update],
  );

  const handleNumberChange = useCallback(
    (field) => (e) => {
      const raw = e.target.value;
      const parsed = Math.max(0, Number(raw) || 0);
      update({ [field]: parsed });
    },
    [update],
  );

  return (
    <Box className="bedrock-node diagram-node">
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

      {/* ── Header: editable name ── */}
      <Box className="diagram-node-header">
        <img
          src="https://unpkg.com/aws-icons@latest/icons/architecture-service/AmazonBedrock.svg"
          alt="Amazon Bedrock"
          style={{ width: 30, height: 30, flexShrink: 0 }}
        />
        <TextField
          className="nodrag nopan diagram-node-title-field diagram-node-title-field--accent"
          value={name}
          onChange={(e) => update({ name: e.target.value })}
          size="small"
          variant="standard"
          placeholder="Model name"
          sx={{ flex: 1 }}
        />
      </Box>

      {/* ── Provider ── */}
      <Box sx={{ mb: "6px" }}>
        <Typography className="diagram-node-section-label">Provider</Typography>
        <Select
          className="nodrag nopan diagram-node-select"
          value={safeProvider}
          onChange={handleProviderChange}
          size="small"
          variant="standard"
          fullWidth
        >
          {providers.map((p) => (
            <MenuItem key={p} value={p} sx={{ fontSize: "13px" }}>
              {p}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* ── Model ── */}
      <Box sx={{ mb: "10px" }}>
        <Typography className="diagram-node-section-label">Model</Typography>
        <Select
          className="nodrag nopan diagram-node-select"
          value={safeModel}
          onChange={(e) => update({ model: e.target.value })}
          size="small"
          variant="standard"
          fullWidth
        >
          {modelsForProvider.map((m) => (
            <MenuItem key={m} value={m} sx={{ fontSize: "13px" }}>
              {m}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* ── Block A: Price per 1M tokens ── */}
      <Box className="diagram-node-info-card">
        <Typography className="diagram-node-card-heading">
          Price per 1M tokens
        </Typography>
        <Box sx={resultRowSx}>
          <Typography sx={resultLabelSx}>Input</Typography>
          <Tooltip title="per 1M input tokens" placement="left">
            <Typography sx={resultValueSx}>{formatUSD(inputPerM)}</Typography>
          </Tooltip>
        </Box>
        <Box sx={{ ...resultRowSx, mt: "4px" }}>
          <Typography sx={resultLabelSx}>Output</Typography>
          <Tooltip title="per 1M output tokens" placement="left">
            <Typography sx={resultValueSx}>{formatUSD(outputPerM)}</Typography>
          </Tooltip>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: "10px" }} />

      {/* ── Block B: Volume cost calculator ── */}
      <Typography
        sx={{
          fontSize: "10px",
          color: "#b3b3b3",
          textTransform: "uppercase",
          letterSpacing: "1px",
          mb: "8px",
        }}
      >
        Cost calculator
      </Typography>

      <Box sx={{ display: "flex", gap: "8px", mb: "8px" }}>
        {/* Messages */}
        <Box sx={{ flex: 1 }}>
          <Typography className="diagram-node-section-label">
            Msg count
          </Typography>
          <TextField
            className="nodrag nopan"
            value={messageCount}
            onChange={handleNumberChange("messageCount")}
            type="number"
            size="small"
            variant="standard"
            inputProps={{ min: 0 }}
            fullWidth
            sx={numberFieldSx}
          />
        </Box>

        {/* Avg input */}
        <Box sx={{ flex: 1 }}>
          <Typography className="diagram-node-section-label">
            input tokens
          </Typography>
          <TextField
            className="nodrag nopan"
            value={avgInputTokens}
            onChange={handleNumberChange("avgInputTokens")}
            type="number"
            size="small"
            variant="standard"
            inputProps={{ min: 0 }}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography sx={{ fontSize: "10px", color: "#b3b3b3" }}>
                    tk
                  </Typography>
                </InputAdornment>
              ),
            }}
            sx={numberFieldSx}
          />
        </Box>

        {/* Avg output */}
        <Box sx={{ flex: 1 }}>
          <Typography className="diagram-node-section-label">
            output tokens
          </Typography>
          <TextField
            className="nodrag nopan"
            value={avgOutputTokens}
            onChange={handleNumberChange("avgOutputTokens")}
            type="number"
            size="small"
            variant="standard"
            inputProps={{ min: 0 }}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography sx={{ fontSize: "10px", color: "#b3b3b3" }}>
                    tk
                  </Typography>
                </InputAdornment>
              ),
            }}
            sx={numberFieldSx}
          />
        </Box>
      </Box>

      {/* Token totals (transparency) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: "6px",
          px: "2px",
        }}
      >
        <Typography sx={{ fontSize: "10px", color: "#666" }}>
          ↑ {totalInputTokens.toLocaleString("en-US")} tk
        </Typography>
        <Typography sx={{ fontSize: "10px", color: "#666" }}>
          ↓ {totalOutputTokens.toLocaleString("en-US")} tk
        </Typography>
      </Box>

      {/* Total cost */}
      <Box className="diagram-node-total-card">
        <Typography sx={{ fontSize: "11px", color: "#b3b3b3" }}>
          Total cost
        </Typography>
        <Typography
          sx={{ fontSize: "15px", fontWeight: 800, color: "#1ed760" }}
        >
          {formatUSD(totalCost)}
        </Typography>
      </Box>
    </Box>
  );
}

BedrockNode.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    provider: PropTypes.string,
    model: PropTypes.string,
    messageCount: PropTypes.number,
    avgInputTokens: PropTypes.number,
    avgOutputTokens: PropTypes.number,
  }),
  isConnectable: PropTypes.bool,
  id: PropTypes.string.isRequired,
};
