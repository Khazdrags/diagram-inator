import { Box } from "@mui/material";
import {
  Background,
  ConnectionMode,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useMemo, useRef } from "react";
import NodePalette from "./NodePalette";
import { nodeTypes } from "./nodeTypes";
import { edgeTypes } from "./edgeTypes";

/** Default data factory per node type */
const NODE_DEFAULTS = {
  default: (id) => ({ name: `Node ${id}` }),
  service: (id) => ({ name: "Service", language: "nodejs", id }),
  ec2: (id) => ({
    name: `EC2 Instance ${id}`,
    os: "Amazon Linux 2",
    family: "t3",
    size: "micro",
    hours: 24,
  }),
};

function DiagramCanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const flowWrapperRef = useRef(null);
  const nodeIdRef = useRef(1);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleDropNode = useCallback(
    ({ clientX, clientY, type }) => {
      const wrapper = flowWrapperRef.current;

      if (!wrapper) {
        return;
      }

      const bounds = wrapper.getBoundingClientRect();
      const isInside =
        clientX >= bounds.left &&
        clientX <= bounds.right &&
        clientY >= bounds.top &&
        clientY <= bounds.bottom;

      if (!isInside) {
        return;
      }

      const position = screenToFlowPosition({ x: clientX, y: clientY });
      const nextId = String(nodeIdRef.current);
      nodeIdRef.current += 1;

      const dataFactory = NODE_DEFAULTS[type] ?? NODE_DEFAULTS.default;
      setNodes((currentNodes) =>
        currentNodes.concat({
          id: nextId,
          type,
          position,
          data: dataFactory(nextId),
        }),
      );
    },
    [screenToFlowPosition, setNodes],
  );

  const flowProps = useMemo(
    () => ({
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      nodeTypes,
      edgeTypes,
      fitView: true,
      colorMode: "system",
      connectionMode: ConnectionMode.Loose,
      defaultEdgeOptions: {
        type: "edgeWithToolbar",
        style: { stroke: "#888", strokeWidth: 4 },
      },
    }),
    [edges, nodes, onConnect, onEdgesChange, onNodesChange],
  );

  return (
    <Box className="diagram-page-layout">
      <NodePalette onDropNode={handleDropNode} />

      <Box ref={flowWrapperRef} className="diagram-canvas-wrapper">
        <ReactFlow {...flowProps}>
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </Box>
    </Box>
  );
}

export default function DiagramCanvas() {
  return (
    <ReactFlowProvider>
      <DiagramCanvasInner />
    </ReactFlowProvider>
  );
}
