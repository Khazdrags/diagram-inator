import { useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
} from "@xyflow/react";
import { Box, Button, Tooltip } from "@mui/material";
import {
  Minus,
  MoveHorizontal,
  MoveLeft,
  MoveRight,
  Trash2,
} from "lucide-react";

const EDGE_DEFAULT_COLOR = "#888";

const EDGE_COLOR_OPTIONS = [
  "#888",
  "#1ed760",
  "#2f80ed",
  "#f2994a",
  "#eb5757",
  "#bb6bd9",
  "#f2c94c",
  "#ffffff",
];

const getMarkerConfigs = (edgeColor) => ({
  none: { markerStart: undefined, markerEnd: undefined },
  start: {
    markerStart: {
      type: "arrowclosed",
      width: 10,
      height: 10,
      color: edgeColor,
    },
    markerEnd: undefined,
  },
  end: {
    markerStart: undefined,
    markerEnd: {
      type: "arrowclosed",
      width: 10,
      height: 10,
      color: edgeColor,
    },
  },
  both: {
    markerStart: {
      type: "arrowclosed",
      width: 10,
      height: 10,
      color: edgeColor,
    },
    markerEnd: {
      type: "arrowclosed",
      width: 10,
      height: 10,
      color: edgeColor,
    },
  },
});

const markerLabels = {
  none: "None",
  start: "Start",
  end: "End only",
  both: "Both ends",
};

const markerIcons = {
  none: Minus,
  start: MoveLeft,
  end: MoveRight,
  both: MoveHorizontal,
};

export default function EdgeWithToolbar({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerStart,
  markerEnd,
  selected,
}) {
  const { setEdges, deleteElements } = useReactFlow();
  const [isHovering, setIsHovering] = useState(false);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isToolbarVisible = isHovering || selected;

  const currentEdgeColor = style?.stroke || EDGE_DEFAULT_COLOR;

  const handleMarkerChange = (markerType) => {
    const config = getMarkerConfigs(currentEdgeColor)[markerType];
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === id
          ? {
              ...edge,
              markerStart: config.markerStart,
              markerEnd: config.markerEnd,
            }
          : edge,
      ),
    );
  };

  const handleColorChange = (nextColor) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id !== id) {
          return edge;
        }

        return {
          ...edge,
          style: {
            ...edge.style,
            stroke: nextColor,
          },
          markerStart: edge.markerStart
            ? {
                ...edge.markerStart,
                color: nextColor,
              }
            : edge.markerStart,
          markerEnd: edge.markerEnd
            ? {
                ...edge.markerEnd,
                color: nextColor,
              }
            : edge.markerEnd,
        };
      }),
    );
  };

  const handleDeleteEdge = () => {
    deleteElements({ edges: [{ id }] });
  };

  const getCurrentMarkerType = () => {
    if (!markerStart && !markerEnd) {
      return "none";
    } else if (markerStart && !markerEnd) {
      return "start";
    } else if (!markerStart && markerEnd) {
      return "end";
    } else if (markerStart && markerEnd) {
      return "both";
    }
    return "none";
  };

  const currentMarkerType = getCurrentMarkerType();

  const markerButtonSx = (isActive) => ({
    minWidth: "unset",
    height: 28,
    px: 1,
    borderRadius: "9999px",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.8px",
    color: isActive ? "text.primary" : "text.secondary",
    borderColor: isActive ? "primary.main" : "divider",
    backgroundColor: isActive ? "rgba(30,215,96,0.12)" : "transparent",
    "&:hover": {
      borderColor: "primary.main",
      color: "text.primary",
      backgroundColor: "rgba(30,215,96,0.08)",
    },
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{ ...style, stroke: currentEdgeColor }}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <Box
          sx={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            fontWeight: 500,
            pointerEvents: "none",
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {isToolbarVisible && (
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                alignItems: "center",
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px",
                padding: "4px",
                boxShadow: "rgba(0,0,0,0.5) 0px 8px 24px",
                pointerEvents: "auto",
              }}
              className="edge-toolbar"
            >
              {Object.entries(markerLabels).map(([key, label]) => (
                <Tooltip key={key} title={label}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleMarkerChange(key)}
                    sx={markerButtonSx(currentMarkerType === key)}
                    aria-label={`Set marker: ${label}`}
                  >
                    {(() => {
                      const MarkerIcon = markerIcons[key];
                      return <MarkerIcon size={14} strokeWidth={2.25} />;
                    })()}
                  </Button>
                </Tooltip>
              ))}

              <Box
                sx={{
                  width: 1,
                  height: 20,
                  backgroundColor: "divider",
                  mx: 0.5,
                }}
              />

              <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                {EDGE_COLOR_OPTIONS.map((color) => {
                  const isActiveColor =
                    color.toLowerCase() === currentEdgeColor.toLowerCase();

                  return (
                    <Tooltip key={color} title={`Color ${color}`}>
                      <Button
                        size="small"
                        onClick={() => handleColorChange(color)}
                        variant="outlined"
                        sx={{
                          minWidth: "unset",
                          width: 22,
                          height: 22,
                          p: 0,
                          borderRadius: "9999px",
                          borderColor: isActiveColor
                            ? "primary.main"
                            : "divider",
                          backgroundColor: color,
                          boxShadow:
                            color === "#ffffff"
                              ? "inset 0 0 0 1px rgba(0,0,0,0.2)"
                              : "none",
                          "&:hover": {
                            borderColor: "primary.main",
                            opacity: 0.9,
                          },
                        }}
                        aria-label={`Set edge color: ${color}`}
                      />
                    </Tooltip>
                  );
                })}
              </Box>

              <Box
                sx={{
                  width: 1,
                  height: 20,
                  backgroundColor: "divider",
                  mx: 0.5,
                }}
              />

              <Tooltip title="Delete connection">
                <Button
                  size="small"
                  onClick={handleDeleteEdge}
                  variant="outlined"
                  sx={{
                    minWidth: "unset",
                    height: 28,
                    px: 1,
                    borderRadius: "9999px",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.8px",
                    color: "error.main",
                    borderColor: "error.main",
                    "&:hover": {
                      backgroundColor: "rgba(243,114,127,0.14)",
                      color: "error.dark",
                      borderColor: "error.dark",
                    },
                  }}
                  aria-label="Delete connection"
                >
                  <Trash2 size={14} strokeWidth={2.25} />
                </Button>
              </Tooltip>
            </Box>
          )}
        </Box>
      </EdgeLabelRenderer>
    </>
  );
}
