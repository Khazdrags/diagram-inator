import {
  Box,
  Divider,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Handle, useReactFlow } from "@xyflow/react";
import PropTypes from "prop-types";
import { useCallback, useMemo } from "react";
import { calcLambdaCost, formatUSD } from "../../helpers/lambdaPricing";
import { useLambdaAllocation } from "../../context/LambdaDataContext";
import { NODE_HANDLES } from "./nodeConfig";
import {
  numberFieldSx,
  resultLabelSx,
  resultRowSx,
  resultValueSx,
  totalCardLabelSx,
  totalCardValueSx,
} from "./nodeStyles";

const MEMORY_OPTIONS = [
  128, 256, 512, 1024, 2048, 3008, 4096, 6144, 8192, 10240,
];

export default function LambdaNode({ data, isConnectable, id }) {
  const { setNodes } = useReactFlow();
  const { freeTierGBs, freeTierRequests } = useLambdaAllocation(id);

  const {
    name = "Lambda Function",
    memoryMB = 512,
    architecture = "x86",
    durationMs = 200,
    invocationsMonthly = 1000000,
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

  const handleNumberChange = useCallback(
    (field) => (e) => {
      const parsed = Math.max(0, Number(e.target.value) || 0);
      update({ [field]: parsed });
    },
    [update],
  );

  const {
    gbSeconds,
    billableGBs,
    billableRequests,
    computeCost,
    requestCost,
    totalCost,
  } = useMemo(
    () =>
      calcLambdaCost({
        memoryMB,
        architecture,
        durationMs,
        invocationsMonthly,
        freeTierGBs,
        freeTierRequests,
      }),
    [
      memoryMB,
      architecture,
      durationMs,
      invocationsMonthly,
      freeTierGBs,
      freeTierRequests,
    ],
  );

  return (
    <Box className="lambda-node diagram-node">
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

      {/* ── Header: icon + editable name ── */}
      <Box className="diagram-node-header">
        <img
          src="https://unpkg.com/aws-icons@latest/icons/architecture-service/AWSLambda.svg"
          alt="AWS Lambda"
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
          placeholder="Function name"
          sx={{ flex: 1 }}
        />
      </Box>

      {/* ── Memory ── */}
      <Box sx={{ mb: "6px" }}>
        <Typography className="diagram-node-section-label">Memory</Typography>
        <Select
          className="nodrag nopan diagram-node-select"
          value={memoryMB}
          onChange={(e) => update({ memoryMB: e.target.value })}
          size="small"
          variant="standard"
          fullWidth
        >
          {MEMORY_OPTIONS.map((mb) => (
            <MenuItem key={mb} value={mb} sx={{ fontSize: "13px" }}>
              {mb >= 1024 ? `${mb / 1024} GB` : `${mb} MB`}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* ── Architecture ── */}
      <Box sx={{ mb: "6px" }}>
        <Typography className="diagram-node-section-label">
          Architecture
        </Typography>
        <Select
          className="nodrag nopan diagram-node-select"
          value={architecture}
          onChange={(e) => update({ architecture: e.target.value })}
          size="small"
          variant="standard"
          fullWidth
        >
          <MenuItem value="x86" sx={{ fontSize: "13px" }}>
            x86_64
          </MenuItem>
          <MenuItem value="arm" sx={{ fontSize: "13px" }}>
            arm64 (Graviton2)
          </MenuItem>
        </Select>
      </Box>

      {/* ── Duration + Invocations ── */}
      <Box sx={{ display: "flex", gap: "8px", mb: "10px" }}>
        <Box sx={{ flex: 1 }}>
          <Typography className="diagram-node-section-label">
            Duration (ms)
          </Typography>
          <TextField
            className="nodrag nopan"
            value={durationMs}
            onChange={handleNumberChange("durationMs")}
            type="number"
            size="small"
            variant="standard"
            inputProps={{ min: 0 }}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography sx={{ fontSize: "10px", color: "#b3b3b3" }}>
                    ms
                  </Typography>
                </InputAdornment>
              ),
            }}
            sx={numberFieldSx}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography className="diagram-node-section-label">
            Invoc/month
          </Typography>
          <TextField
            className="nodrag nopan"
            value={invocationsMonthly}
            onChange={handleNumberChange("invocationsMonthly")}
            type="number"
            size="small"
            variant="standard"
            inputProps={{ min: 0 }}
            fullWidth
            sx={numberFieldSx}
          />
        </Box>
      </Box>

      {/* ── Desglose de costos ── */}
      <Box className="diagram-node-info-card">
        <Typography className="diagram-node-card-heading">
          Cost breakdown
        </Typography>

        {/* GB-seconds */}
        <Box sx={resultRowSx}>
          <Typography sx={resultLabelSx}>GB-s (total)</Typography>
          <Typography
            sx={{ ...resultValueSx, color: "#b3b3b3", fontWeight: 400 }}
          >
            {gbSeconds.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </Typography>
        </Box>
        <Box sx={{ ...resultRowSx, mt: "2px", pl: "8px" }}>
          <Typography sx={{ fontSize: "10px", color: "#666" }}>
            −{" "}
            {freeTierGBs.toLocaleString("en-US", { maximumFractionDigits: 0 })}{" "}
            free tier
          </Typography>
          <Typography sx={{ fontSize: "10px", color: "#666" }}>
            {billableGBs.toLocaleString("en-US", { maximumFractionDigits: 0 })}{" "}
            billable
          </Typography>
        </Box>
        <Box sx={{ ...resultRowSx, mt: "4px" }}>
          <Typography sx={resultLabelSx}>Compute</Typography>
          <Typography sx={resultValueSx}>${computeCost.toFixed(2)}</Typography>
        </Box>

        {/* Requests */}
        <Box sx={{ ...resultRowSx, mt: "6px" }}>
          <Typography sx={resultLabelSx}>Requests (total)</Typography>
          <Typography
            sx={{ ...resultValueSx, color: "#b3b3b3", fontWeight: 400 }}
          >
            {invocationsMonthly.toLocaleString("en-US")}
          </Typography>
        </Box>
        <Box sx={{ ...resultRowSx, mt: "2px", pl: "8px" }}>
          <Typography sx={{ fontSize: "10px", color: "#666" }}>
            − {freeTierRequests.toLocaleString("en-US")} free tier
          </Typography>
          <Typography sx={{ fontSize: "10px", color: "#666" }}>
            {billableRequests.toLocaleString("en-US")} billable
          </Typography>
        </Box>
        <Box sx={{ ...resultRowSx, mt: "4px" }}>
          <Typography sx={resultLabelSx}>Request cost</Typography>
          <Typography sx={resultValueSx}>{formatUSD(requestCost)}</Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: "8px" }} />

      {/* ── Total mensual ── */}
      <Box className="diagram-node-total-card">
        <Typography sx={totalCardLabelSx}>Total cost</Typography>
        <Typography sx={totalCardValueSx}>${totalCost.toFixed(2)}</Typography>
      </Box>
    </Box>
  );
}

LambdaNode.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    memoryMB: PropTypes.number,
    architecture: PropTypes.string,
    durationMs: PropTypes.number,
    invocationsMonthly: PropTypes.number,
  }),
  isConnectable: PropTypes.bool,
  id: PropTypes.string.isRequired,
};
