type Leaf = Node

type Node = {
    title: string;
    content: string;
    id: number;
    children: Node[]
}

type MarkedNode = Node & {
  isOnPathToFocused?: boolean;
};


type TouchState = {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    isTracking: boolean;
}

type NodeTouchableBounds = {
    [id: number]:{
    x: number;
    y: number;
    width: number;
    height: number;
    }
}

type HoverState = {
    isHovering: boolean;
    hoverStartTime: number | null;
    hoveredNodeId: number | null;
}

export type { HoverState, Leaf, MarkedNode, Node, NodeTouchableBounds, TouchState };

// Add default export to satisfy Expo Router
export default {};

