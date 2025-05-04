type Note = {
    id: string;
    title: string;
    content: string;
    children: Partial<Note>[];
}



export type { Note };

