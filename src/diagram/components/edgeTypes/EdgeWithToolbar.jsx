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

const markerConfigs = {
  none: { markerStart: undefined, markerEnd: undefined },
  start: {
    markerStart: { type: "arrowclosed", width: 10, height: 10, color: "#888" },
    markerEnd: undefined,
  },
  end: {
    markerStart: undefined,
    markerEnd: { type: "arrowclosed", width: 10, height: 10, color: "#888" },
  },
  both: {
    markerStart: { type: "arrowclosed", width: 10, height: 10, color: "#888" },
    markerEnd: { type: "arrowclosed", width: 10, height: 10, color: "#888" },
  },
};

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

  const handleMarkerChange = (markerType) => {
    const config = markerConfigs[markerType];
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
        style={style}
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
