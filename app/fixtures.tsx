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
                        title: 'Hello',
                        content: 'World',
                    }
                ],
                title: 'Hello',
                content: 'World',
            }
        ],
        title: 'Hello',
        content: 'World',
}

export { TestRoot };
