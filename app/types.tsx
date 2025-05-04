type note = {
    id: string;
    title: string;
    content: string;
    children: Partial<note>[];
}

export type { note };
