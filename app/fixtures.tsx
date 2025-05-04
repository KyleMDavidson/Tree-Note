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
                        title: 'id3 title. depth: 3',
                        content: 'this is a leaf',
                    }
                ],
                title: 'id2 title. depth: 2',
                content: 'this is an internal node',
            },
    {
                id: 4,
                children: [
                    {
                        id: 5,
                        children: [],
                        title: 'id5 title. depth: 3',
                        content: 'this is a leaf',
                    }
                ],
                title: 'id4 title. depth: 2',
                content: 'this is an internal node',
            },


        ],
        title: 'title. depth: 1',
        content: 'this is a root node',
}

export { TestRoot };
