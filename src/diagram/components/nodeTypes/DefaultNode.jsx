import { Box, TextField } from "@mui/material";
import { Handle, useReactFlow } from "@xyflow/react";
import PropTypes from "prop-types";
import { useCallback } from "react";
import { NODE_HANDLES } from "./nodeConfig";

export default function DefaultNode({ data, isConnectable, id }) {
  const { setNodes } = useReactFlow();
  const { name = "Node" } = data || {};

  const handleNameChange = useCallback(
    (event) => {
      const newName = event.target.value;

      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, name: newName } }
            : node,
        ),
      );
    },
    [id, setNodes],
  );

  return (
    <Box className="default-node diagram-node">
      {NODE_HANDLES.map((handleConfig) => (
        <Handle
          key={handleConfig.key}
          type={handleConfig.type}
          position={handleConfig.position}
          id={handleConfig.id}
          isConnectable={isConnectable}
          style={handleConfig.style}
        />
      ))}

      <TextField
        className="nodrag nopan"
        value={name}
        onChange={handleNameChange}
        size="small"
        variant="standard"
        placeholder="Node name"
        sx={{
          width: "100%",
          "& .MuiInput-root": {
            fontSize: "16px",
            fontWeight: 600,
            lineHeight: 1.2,
          },
          "& .MuiInput-underline:before": {
            borderBottomColor: "transparent",
          },
          "& .MuiInput-underline:hover:before": {
            borderBottomColor: "transparent",
          },
          "& .MuiInput-underline.Mui-focused:after": {
            borderBottomColor: "currentColor",
          },
        }}
      />
    </Box>
  );
}

DefaultNode.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
  }),
  isConnectable: PropTypes.bool,
  id: PropTypes.string.isRequired,
};
