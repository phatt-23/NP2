export const DEFAULT_NODE_STYLE = {
    selector: 'node',
    style: {
        'label': 'data(id)',
        // "text-valign": "center" as "center" | "top" | "bottom",
        'color': '#000',
        'background-color': '#61bffc',
        'text-outline-color': '#fff',
        'text-outline-width': 2
    }
};

export const DEFAULT_EDGE_STYLE = {
    selector: 'edge',
    style: {
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'target-arrow-color': '#000',
        'line-color': '#999',
        'line-cap': 'round',
        'width': 2
    }
};