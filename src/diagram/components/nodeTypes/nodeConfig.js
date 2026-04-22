import { Position } from "@xyflow/react";

export const NODE_STYLE = {
  minWidth: 180,
  padding: "8px 12px",
  handle: {
    base: "#ffffff6e",
    hover: "#ffffff",
    connecting: "orange",
    valid: "#22c55e",
  },
};

export const NODE_HANDLES = [
  {
    key: "top",
    type: "source",
    position: Position.Top,
    id: "target-top",
  },
  {
    key: "bottom",
    type: "source",
    position: Position.Bottom,
    id: "source-bottom",
  },
  {
    key: "left",
    type: "target",
    position: Position.Left,
    id: "target-left",
    style: { left: -5 },
  },
  {
    key: "right",
    type: "source",
    position: Position.Right,
    id: "source-right",
    style: { left: "auto", right: -5 },
  },
];
