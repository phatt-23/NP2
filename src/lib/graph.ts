export type Graph = {
    vertices: string[],
    edges: string[][],
};

export function verifyGraphInstanceFormat(instance: string): boolean {
    const lines = instance.split("\n").filter(line => line.length !== 0);
    for (const line of lines) {
        const vertices = line.split(" ");
        if (vertices.length === 3) {
            throw new Error('Not implemented: 3 words per line is either for weighted edges or edge triplets (for 3DM problem).');
        } else if (vertices.length > 3) {
            throw new Error('Error: There may not be more than three words per line.');
        }
    }
    return true;
}

export function parseGraphInstance(instance: string): Graph {
    const lines = instance.split("\n").filter(line => line.length !== 0);
    let vertices = new Set<string>();
    let edges = new Set<string[]>();

    for (const line of lines) {
        const words = line.split(" ");

        if (words.length === 1) {
            vertices.add(words[0]);
        } else if (words.length === 2) {
            vertices.add(words[0]);
            vertices.add(words[1]);
            edges.add([...words]);
        } else {
            throw new Error('Not implemented: 3 words per line is either for weighted edges or edge triplets (for 3DM problem).');
        }
    }

    return {
        vertices: [...vertices.values()].sort(), 
        edges: [...edges.values()],
    };
}

export function formatGraphToInputString(g: Graph): string {
    return (
        g.vertices.length + ' ' + g.edges.length + 
        '\n\n' + 
        g.vertices.join('\n') +
        '\n\n' + 
        g.edges.map(e => e.join(' ')).join('\n')
    )
}

export function parseGraphInput(input: string): Graph {
    const lines = input.split("\n").filter(line => line.length !== 0);

    if (lines.length === 0) {
        throw new Error("Graph input is empty.");
    }

    // remove the first line with numbers for vertex count and edge count
    const [vertexCount, _edgeCount] = lines.shift()!.split(" ").map(n => Number.parseInt(n)); 

    let vertices = lines.splice(0, vertexCount);
    let edges = lines.map(line => line.split(" "));
    
    return { vertices, edges };
}
