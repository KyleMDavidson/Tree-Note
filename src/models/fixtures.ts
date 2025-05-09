import { Node } from "./types";

export const TestRoot: Node = {
        id: 1,
        children: [
            {
                id: 2,
                children: [
                    {
                        id: 3,
                        children: [],
                        title: 'node 3 depth: 3',
                        content: 'this is a leaf',
                    }
                ],
                title: 'node 2 depth: 2',
                content: 'this is an internal node',
            },
    {
                id: 4,
                children: [
                    {
                        id: 5,
                        children: [],
                        title: 'node 5 depth: 3',
                        content: 'this is a leaf',
                    }
                ],
                title: 'node 4 depth: 2',
                content: 'this is an internal node',
            },


        ],
        title: 'node 1 depth: 1',
        content: 'this is a root node',
}

// Add default export to satisfy Expo Router
export default {};
