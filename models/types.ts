type Leaf = Node

type Node = {
    title: string;
    content: string;
    id: number;
    children: Node[]
}

type ComponentBounds = {
    x: number;
    y: number;
}

type TouchState = {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    isTracking: boolean;
}

type HoverState = {
    isHovering: boolean;
    hoverStartTime: number | null;
    hoveredNodeId: number | null;
}

export type { ComponentBounds, HoverState, Leaf, Node, TouchState };

// Add default export to satisfy Expo Router
export default {};

