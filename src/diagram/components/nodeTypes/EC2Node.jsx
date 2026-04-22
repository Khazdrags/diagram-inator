import {
  Box,
  CircularProgress,
  MenuItem,
  Select,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { Handle, useReactFlow } from "@xyflow/react";
import PropTypes from "prop-types";
import { useCallback, useMemo } from "react";
import EC2Icon from "../../../shared/assets/aws/EC2.svg";
import { useEC2Data } from "../../context/EC2DataContext";
import { NODE_HANDLES } from "./nodeConfig";

const OS_OPTIONS = [
  "Amazon Linux 2",
  "Ubuntu 22.04",
  "Windows Server",
  "Red Hat",
  "Debian",
];

const OS_TO_PLATFORMS = {
  "Amazon Linux 2": ["Linux/UNIX"],
  "Ubuntu 22.04": ["Linux/UNIX"],
  Debian: ["Linux/UNIX"],
  "Windows Server": ["Windows"],
  "Red Hat": ["Red Hat Enterprise Linux", "RHEL", "Linux/UNIX"],
};

const normalizePlatform = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const labelSx = {
  fontSize: "10px",
  color: "#b3b3b3",
  mb: "2px",
  textTransform: "uppercase",
  letterSpacing: "1px",
  lineHeight: 1,
};

const selectSx = {
  fontSize: "13px",
  color: "text.primary",
  "& .MuiSelect-standard": { pb: "2px" },
  "& .MuiSelect-icon": { color: "#b3b3b3" },
  "&:before": { borderBottomColor: "rgba(255,255,255,0.15)" },
  "&:hover:not(.Mui-disabled):before": {
    borderBottomColor: "rgba(255,255,255,0.4) !important",
  },
  "&:after": { borderBottomColor: "#1ed760" },
};

export default function EC2Node({ data, isConnectable, id }) {
  const { setNodes } = useReactFlow();
  const { families, sizesByFamily, loading } = useEC2Data();

  const {
    name = "EC2 Instance",
    os = "Amazon Linux 2",
    family = "t3",
    size = "micro",
    hours = 24,
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

  /** Sizes available for the currently selected family */
  const sizes = useMemo(
    () => sizesByFamily[family] ?? [],
    [sizesByFamily, family],
  );

  /** Safe Select value: fall back to first option if stored value is not in list */
  const safeFamily = families.includes(family) ? family : (families[0] ?? "");
  const sizeExists = sizes.some((s) => s.size === size);
  let safeSize = "";
  if (sizes.length > 0) {
    safeSize = sizeExists ? size : sizes[0].size;
  }

  const getOnDemandPriceForOs = useCallback(
    (entry) => {
      if (!entry) {
        return null;
      }

      const platformCandidates = OS_TO_PLATFORMS[os] ?? [];
      const pricingEntries = Object.entries(entry.pricing ?? {});
      for (const platform of platformCandidates) {
        const normalizedCandidate = normalizePlatform(platform);
        const matchedPlatform = pricingEntries.find(([platformKey]) => {
          const normalizedKey = normalizePlatform(platformKey);
          return (
            normalizedKey === normalizedCandidate ||
            normalizedKey.includes(normalizedCandidate)
          );
        });
        const platformPrice = matchedPlatform?.[1]?.avgOnDemand;
        if (typeof platformPrice === "number" && platformPrice > 0) {
          return platformPrice;
        }
      }

      return entry.avgOnDemandPrice ?? null;
    },
    [os],
  );

  /** Price per hour for the currently selected size */
  const pricePerHour = useMemo(() => {
    const entry = sizes.find((s) => s.size === size);
    return getOnDemandPriceForOs(entry);
  }, [sizes, size, getOnDemandPriceForOs]);

  const total30 = pricePerHour === null ? null : pricePerHour * hours * 30;

  /** When family changes, reset size to the cheapest option in that family */
  const handleFamilyChange = useCallback(
    (e) => {
      const newFamily = e.target.value;
      const newSizes = sizesByFamily[newFamily] ?? [];
      update({ family: newFamily, size: newSizes[0]?.size ?? "" });
    },
    [sizesByFamily, update],
  );

  return (
    <Box className="ec2-node diagram-node">
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: "4px" }}>
        <img
          src={EC2Icon}
          alt="EC2"
          style={{ width: 30, height: 30, flexShrink: 0 }}
        />
        <TextField
          className="nodrag nopan"
          value={name}
          onChange={(e) => update({ name: e.target.value })}
          size="small"
          variant="standard"
          placeholder="Instance name"
          sx={{
            flex: 1,
            "& .MuiInput-root": {
              fontSize: "15px",
              fontWeight: 700,
              lineHeight: 1.2,
            },
            "& .MuiInput-underline:before": {
              borderBottomColor: "transparent",
            },
            "& .MuiInput-underline:hover:before": {
              borderBottomColor: "transparent",
            },
            "& .MuiInput-underline.Mui-focused:after": {
              borderBottomColor: "#1ed760",
            },
          }}
        />
      </Box>

      {/* ── OS ── */}
      <Box sx={{ mb: "4px" }}>
        <Typography sx={labelSx}>OS</Typography>
        <Select
          className="nodrag nopan"
          value={os}
          onChange={(e) => update({ os: e.target.value })}
          size="small"
          variant="standard"
          fullWidth
          sx={selectSx}
        >
          {OS_OPTIONS.map((o) => (
            <MenuItem key={o} value={o} sx={{ fontSize: "13px" }}>
              {o}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* ── Instance type (family) ── */}
      <Box sx={{ mb: "4px" }}>
        <Typography sx={labelSx}>Type</Typography>
        {loading ? (
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1, py: "4px" }}
          >
            <CircularProgress size={12} sx={{ color: "#1ed760" }} />
            <Typography sx={{ fontSize: "12px", color: "#b3b3b3" }}>
              Loading…
            </Typography>
          </Box>
        ) : (
          <Select
            className="nodrag nopan"
            value={safeFamily}
            onChange={handleFamilyChange}
            size="small"
            variant="standard"
            fullWidth
            sx={selectSx}
          >
            {families.map((f) => (
              <MenuItem key={f} value={f} sx={{ fontSize: "13px" }}>
                {f}
              </MenuItem>
            ))}
          </Select>
        )}
      </Box>

      {/* ── Size ── */}
      <Box sx={{ mb: "4px" }}>
        <Typography sx={labelSx}>Size</Typography>
        <Select
          className="nodrag nopan"
          value={safeSize}
          onChange={(e) => update({ size: e.target.value })}
          renderValue={(selected) => selected}
          size="small"
          variant="standard"
          fullWidth
          disabled={loading || sizes.length === 0}
          sx={selectSx}
        >
          {sizes.map((entry) => {
            const s = entry.size;
            const p = getOnDemandPriceForOs(entry);

            return (
              <MenuItem
                key={s}
                value={s}
                sx={{
                  fontSize: "13px",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <span>{s}</span>
                {p === null ? null : (
                  <Typography
                    component="span"
                    sx={{ fontSize: "11px", color: "#b3b3b3" }}
                  >
                    ${p.toFixed(4)}/hr
                  </Typography>
                )}
              </MenuItem>
            );
          })}
        </Select>
      </Box>

      {/* ── Hours/day slider ── */}
      <Box sx={{ mb: "2px" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            mb: "2px",
          }}
        >
          <Typography sx={labelSx}>Hours / day</Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
            <Typography
              sx={{ fontSize: "13px", fontWeight: 700, color: "text.primary" }}
            >
              {hours}h
            </Typography>
            {pricePerHour !== null && (
              <Typography sx={{ fontSize: "11px", color: "#b3b3b3" }}>
                · ${pricePerHour.toFixed(4)}/hr
              </Typography>
            )}
          </Box>
        </Box>
        <Slider
          className="nodrag nopan"
          value={hours}
          onChange={(_, val) => update({ hours: val })}
          min={1}
          max={24}
          step={1}
          size="small"
          sx={{
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
          }}
        />
      </Box>

      {/* ── Monthly total ── */}
      <Box
        sx={{
          pt: "8px",
          mt: "2px",
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <Typography
          sx={{
            fontSize: "10px",
            color: "#b3b3b3",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          30-day total
        </Typography>
        <Typography
          sx={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#1ed760",
            lineHeight: 1,
          }}
        >
          {total30 === null ? "—" : `$${total30.toFixed(2)}`}
        </Typography>
      </Box>
    </Box>
  );
}

EC2Node.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    os: PropTypes.string,
    family: PropTypes.string,
    size: PropTypes.string,
    hours: PropTypes.number,
  }),
  isConnectable: PropTypes.bool,
  id: PropTypes.string.isRequired,
};
