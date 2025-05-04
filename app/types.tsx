type Leaf = Node & {
    title: string;
    content: string;
}

type Node = {
    id: number;
    children: Node[]
}


export type { Leaf, Node };

