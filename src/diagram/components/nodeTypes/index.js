import BedrockNode from "./BedrockNode";
import DefaultNode from "./DefaultNode";
import EC2Node from "./EC2Node";
import ServiceNode from "./ServiceNode";

/**
 * nodeTypes must be defined outside of any component render function
 * to prevent React Flow from re-mounting nodes on every render.
 */
export const nodeTypes = {
  default: DefaultNode,
  service: ServiceNode,
  ec2: EC2Node,
  bedrock: BedrockNode,
};
