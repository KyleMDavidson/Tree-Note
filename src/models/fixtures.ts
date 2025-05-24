import { Node } from "./types";

export const TestRoot: Node = {
        id: 1,
        children: [
            {
                id: 2,
                children: [
                    {
                        id: 3,
                        children: [
                            {id: 7, children: [], title: "node 7 depth 4", content: "this is a leaf"}
                        ],
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
                        children: [{
                            id: 6,
                            children: [{id: 7, children: [], title: "node 7 depth 4", content: "this is a leaf"}],
                            title: "node 6 depth 3",
                            content: "this is an internal node"

                        }],
                        title: 'node 5 depth: 3',
                        content: 'this is an internal node',
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
