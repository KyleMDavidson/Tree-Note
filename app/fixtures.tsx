import { Node } from "./types";

const TestRoot: Node = {
        id: 1,
        children: [
            {
                id: 2,
                children: [
                    {
                        id: 3,
                        children: [],
                        title: 'title. depth: 3',
                        content: 'this is a leaf',
                    }
                ],
                title: 'title. depth: 2',
                content: 'this is an internal node',
            }
        ],
        title: 'title. depth: 1',
        content: 'this is a root node',
}

export { TestRoot };
