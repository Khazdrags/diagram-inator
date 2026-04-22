import { Box, Paper, Typography } from "@mui/material";
import { useRef, useState } from "react";

function DraggableNode({ label, caption, type, onDropNode }) {
  const [isDragging, setIsDragging] = useState(false);
  const pointerIdRef = useRef(null);

  const handlePointerDown = (event) => {
    pointerIdRef.current = event.pointerId;
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!isDragging || pointerIdRef.current !== event.pointerId) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event) => {
    if (!isDragging || pointerIdRef.current !== event.pointerId) {
      return;
    }
    setIsDragging(false);
    pointerIdRef.current = null;
    onDropNode({ type, clientX: event.clientX, clientY: event.clientY });
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    pointerIdRef.current = null;
  };

  return (
    <Box
      role="button"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      aria-label={`Drag ${label}`}
      sx={{
        userSelect: "none",
        touchAction: "none",
        cursor: isDragging ? "grabbing" : "grab",
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 2,
        px: 1.5,
        py: 1,
        bgcolor: "background.default",
        transition: "border-color 160ms ease, transform 160ms ease",
        transform: isDragging ? "scale(0.98)" : "scale(1)",
        "&:hover": {
          borderColor: "primary.main",
        },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" sx={{ color: "text.primary" }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {caption}
      </Typography>
    </Box>
  );
}

export default function NodePalette({ onDropNode }) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: { xs: "100%", md: 240 },
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        borderRadius: 2,
        p: 2,
        "& > :not(:first-of-type)": {
          mt: 1,
        },
      }}
    >
      <Typography variant="h3" sx={{ mb: 1.5 }}>
        Nodes
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <DraggableNode
          label="Service"
          caption="Microservice with language config"
          type="service"
          onDropNode={onDropNode}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <DraggableNode
          label="Default node"
          caption="Press, drag and release over canvas"
          type="default"
          onDropNode={onDropNode}
        />
      </Box>
    </Paper>
  );
}
