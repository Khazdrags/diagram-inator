import { Box, TextField, Select, MenuItem, ListSubheader } from "@mui/material";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import {
  SERVICE_TECH_CONFIG,
  SERVICE_TECH_GROUPS,
} from "../../../shared/constants/languageConfig";

export default function ServiceNode({ data, isConnectable, id }) {
  const { setNodes } = useReactFlow();
  const { name = "Service", language = "nodejs" } = data || {};

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

  const handleLanguageChange = useCallback(
    (event) => {
      const newLanguage = event.target.value;
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, language: newLanguage } }
            : node,
        ),
      );
    },
    [id, setNodes],
  );

  const languageConfig =
    SERVICE_TECH_CONFIG[language] || SERVICE_TECH_CONFIG.nodejs;

  return (
    <Box className="service-node">
      {/* TOP */}
      <Handle
        type="source"
        position={Position.Top}
        id="target-top"
        isConnectable={isConnectable}
      />

      {/* BOTTOM */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        isConnectable={isConnectable}
      />

      {/* LEFT */}
      <Handle
        type="target"
        position={Position.Left}
        id="target-left"
        isConnectable={isConnectable}
        style={{ left: -5 }}
      />

      {/* RIGHT */}
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        isConnectable={isConnectable}
        style={{ left: "auto", right: -5 }}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 1,
          alignItems: "center",
        }}
      >
        {/* Columna 1: icono ocupa las 2 filas */}
        <Box
          sx={{
            gridRow: "1 / 3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pr: 0.5,
          }}
        >
          <img
            src={languageConfig.icon}
            alt={languageConfig.label}
            style={{ width: 36, height: 36, flexShrink: 0 }}
          />
        </Box>

        {/* Columna 2, fila 1: nombre */}
        <TextField
          className="nodrag nopan"
          value={name}
          onChange={handleNameChange}
          size="small"
          variant="standard"
          placeholder="Service name"
          sx={{
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

        {/* Columna 2, fila 2: selector */}
        <Select
          className="nodrag nopan"
          value={language}
          onChange={handleLanguageChange}
          size="small"
          variant="standard"
          fullWidth
          sx={{
            fontSize: "8px",
            color: "text.secondary",
            "& .MuiSelect-standard": { paddingBottom: 0.25 },
          }}
        >
          {SERVICE_TECH_GROUPS.flatMap((group) => [
            <ListSubheader key={`${group.label}-header`}>
              {group.label}
            </ListSubheader>,
            ...Object.entries(group.options).map(([key, config]) => (
              <MenuItem key={key} value={key}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {config.label}
                </Box>
              </MenuItem>
            )),
          ])}
        </Select>
      </Box>
    </Box>
  );
}
