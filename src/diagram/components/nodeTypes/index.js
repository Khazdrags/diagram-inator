import ServiceNode from './ServiceNode';

/**
 * nodeTypes must be defined outside of any component render function
 * to prevent React Flow from re-mounting nodes on every render.
 */
export const nodeTypes = {
  service: ServiceNode,
};
