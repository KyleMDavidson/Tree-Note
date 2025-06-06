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


export const ContentfulTestRoot: Node = {
  id: 1,
  children: [
    {
      id: 2,
      children: [
        {
          id: 3,
          children: [{ id: 7, children: [], title: "groceries", content: "milk, eggs, flour" }],
          title: "kitchen",
          content: "",
        },
        {
          id: 9,
          children: [{id: 13, children: [], title: "flowers", content: "call james about the tree over fence"}],
          title: "yard",
          content: "",
        },
      ],
      title: "home",
      content: "",
    },
    {
      id: 4,
      children: [
        {id:9, title: "prepare for presentation Friday", content:"papers: Manilov et al 1984, Pushkin 2001, Zenov et al 2024", children: []}
      ],
      title: "work",
      content: "",
    },
    {
      id: 8,
      children: [
        {id:10, title: "rehearsals", content: "Monday 6-9, Saturday 1-6", children: []},
        {id: 11, title: "shows", content: "", children: [
            {id: 12, title: "Spirit", content: "mic check @ 5. They have an M90 amp but we need to bring our own pedals.", children: []}
        ]}
      ],
      title: "band",
      content: "",
    },
  ],
  title: "root",
  content: "this is a root node",
};

// Add default export to satisfy Expo Router
export default {};
