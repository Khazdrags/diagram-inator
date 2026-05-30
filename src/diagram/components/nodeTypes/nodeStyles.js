/** Shared MUI sx objects for diagram node components */

export const numberFieldSx = {
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

export const resultRowSx = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
};

export const resultLabelSx = { fontSize: "11px", color: "#b3b3b3" };
export const resultValueSx = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#1ed760",
};

export const totalCardLabelSx = { fontSize: "11px", color: "#b3b3b3" };
export const totalCardValueSx = {
  fontSize: "15px",
  fontWeight: 800,
  color: "#1ed760",
};
