type Leaf = Node

type Node = {
    title: string;
    content: string;
    id: number;
    children: Node[]
}


export type { Leaf, Node };

