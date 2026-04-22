import { useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
} from "@xyflow/react";
import { Box, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import TuneIcon from "@mui/icons-material/Tune";

const markerConfigs = {
  none: { markerStart: undefined, markerEnd: undefined },
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
  end: "End only",
  both: "Both ends",
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
  const [anchorEl, setAnchorEl] = useState(null);

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
    setAnchorEl(null);
  };

  const handleDeleteEdge = () => {
    deleteElements({ edges: [{ id }] });
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getCurrentMarkerType = () => {
    if (!markerStart && !markerEnd) {
      return "none";
    } else if (!markerStart && markerEnd) {
      return "end";
    } else if (markerStart && markerEnd) {
      return "both";
    }
    return "end";
  };

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
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                pointerEvents: "auto",
              }}
              className="edge-toolbar"
            >
              <Tooltip title="Change edge marker">
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                  sx={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "&:hover": { backgroundColor: "action.hover" },
                  }}
                  aria-label="Change edge marker"
                >
                  <TuneIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
              >
                {Object.entries(markerLabels).map(([key, label]) => (
                  <MenuItem
                    key={key}
                    onClick={() => handleMarkerChange(key)}
                    selected={getCurrentMarkerType() === key}
                  >
                    {label}
                  </MenuItem>
                ))}
              </Menu>

              <Tooltip title="Delete connection">
                <IconButton
                  size="small"
                  onClick={handleDeleteEdge}
                  sx={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "error.main",
                    "&:hover": {
                      backgroundColor: "error.lighter",
                      color: "error.dark",
                    },
                  }}
                  aria-label="Delete connection"
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </EdgeLabelRenderer>
    </>
  );
}
