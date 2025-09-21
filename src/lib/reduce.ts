import { formatGraphToInputString, parseGraphInput, type Graph } from './graph';
import { ASSERT } from './lib';
import { parseSatInput } from './sat';
import { formatSubsetSumToInputString, type SubsetSum } from './ssp';

export type Reductions = "3SAT-HamCycle" 
                       | "HamCycle-HamCircuit" 
                       | "3SAT-SSP" 
                       | "HamCircuit-TSP"
                       | "3SAT-3DM"
                       ;

// Reduces the problem A to B using the input of problem A and outputing the input for problem B. 
export function reduce(reduction: Reductions, input: string): string {
    switch (reduction) {
        case "3SAT-HamCycle":
            return reduceSatToHamCycle(input);
        case "HamCycle-HamCircuit":
            return reduceHamCycleToHamCircuit(input);
        case "3SAT-SSP":
            return reduceSatToSsp(input);
        case "HamCircuit-TSP":
            return reduceHamCircuitToTsp(input);
        case "3SAT-3DM":
            return reduceSatTo3dm(input);
        default:
            throw new Error("This reduction is not implemented.");
    }
}

function reduceSatToHamCycle(input: string): string {
    const sat = parseSatInput(input);
    let graph: Graph = { vertices: [], edges: [] };
    
    function createInbetweenVertexName(v1: string, v2: string): string { 
        return '[BETWEEN][' + v1 + ',' + v2 + ']';
    }

    function addRowEndsToVertexEdges(layer: number, inbetweenVertexAbove: string) {
        graph.edges.push([sat.variables[layer] + "[0]", inbetweenVertexAbove]);
        graph.edges.push([sat.variables[layer] + lastRowIdx, inbetweenVertexAbove]);
    }
    
    function addVertexToRowEndsEdges(inbetweenVertexAbove: string, layer: number) {
        graph.edges.push([inbetweenVertexAbove, sat.variables[layer] + "[0]"]);
        graph.edges.push([inbetweenVertexAbove, sat.variables[layer] + lastRowIdx]);
    }

    const k = sat.clauses.length;
    const n = sat.variables.length;
    const rowVertexCount = 3*k + 3;
    const lastRowIdx = "[" + (rowVertexCount - 1) + "]";
    const sourceVertexName = "[SOURCE]"
    const targetVertexName = "[TARGET]"

    // for every variable create a gadget with 3k + 3 row nodes and connect them up
    for (let i = 0; i < n; i++) {
        const v = sat.variables[i];

        if (i == 0) {
            // for the first variable, there is no other layer above it
            // add the source vertex
            graph.vertices.push(sourceVertexName); 
            // add edges from source to row ends of this first variable
            addVertexToRowEndsEdges(sourceVertexName, i);
        } else {
            // for other variables there is layer above it that needs to be wired to the inbetween vertex
            const inbetweenVertexAbove = createInbetweenVertexName(sat.variables[i - 1], sat.variables[i]);
            // add the inbetween vertex
            graph.vertices.push(inbetweenVertexAbove); 
            // add edges from above gadget's row ends into the inbetween vertex 
            addRowEndsToVertexEdges(i - 1, inbetweenVertexAbove);
            // add edges from source to row ends of this first variable
            addVertexToRowEndsEdges(inbetweenVertexAbove, i);
        }

        // create row vertices and connect them to each other both ways
        for (let j = 0; j <= rowVertexCount - 2; j++) {
            const currentVertex = v + "[" + j + "]";
            const nextVertex = v + "[" + (j+1) + "]";

            graph.vertices.push(currentVertex); 
            if (j == rowVertexCount - 2) {
                graph.vertices.push(nextVertex); 
            }

            graph.edges.push([currentVertex, nextVertex]);
            graph.edges.push([nextVertex, currentVertex]);
        }

        // the last iteration
        if (i == n - 1) {
            // add the target vertex
            graph.vertices.push(targetVertexName); 
            // add edges going out of the row ends to the target
            addRowEndsToVertexEdges(i, targetVertexName);
        }
    }

    // connect target node to node node
    graph.edges.push([targetVertexName, sourceVertexName]);

    // add clause nodes and connect the row nodes of variables to clauses
    for (let i = 0; i < k; i++) {
        const c = sat.clauses[i];
        const clauseName = '[CLAUSE][' + i + ']';
        
        // add clause to the graph
        graph.vertices.push(clauseName);

        // for every literal in the clause, add the jumps to it and back to the row
        for (const v of c) {
            const v1 = v.replace("!", "") + "[" + (3*i + 2) + "]";
            const v2 = v.replace("!", "") + "[" + (3*i + 3) + "]";

            if (v.search("!") == -1) {
                // x
                graph.edges.push([v1, clauseName, "[T]"]);
                graph.edges.push([clauseName, v2, "[T]"]);
            } else {
                // not x
                graph.edges.push([v2, clauseName, "[F]"]);
                graph.edges.push([clauseName, v1, "[F]"]);
            }
        }
    }

    return formatGraphToInputString(graph);
}

function reduceHamCycleToHamCircuit(input: string): string {
    const inGraph = parseGraphInput(input);
    let vertices: string[] = [];
    let edges: string[][] = [];

    const IN = "[In]";
    const OUT = "[Out]";
    const MIDDLE = "[Mid]";

    for (const vertex of inGraph.vertices) {
        const outVertex = vertex + OUT;
        const inVertex = vertex + IN;
        const middleVertex = vertex + MIDDLE;

        // add a triplet for each variable
        vertices.push(inVertex);
        vertices.push(middleVertex);
        vertices.push(outVertex); 

        // connect this triplet
        edges.push([inVertex, middleVertex]);
        edges.push([middleVertex, outVertex]);

        // connect the edges, this[OUT] -- other[IN]
        // filter edges coming from the vertex and add the edge to the new graph
        inGraph.edges
            .filter(edge => vertex === edge[0])
            .forEach(edge => edges.push([outVertex, edge[1] + IN]));
    }
    
    const outGraph: Graph = { 
        vertices, 
        edges 
    };

    ASSERT(outGraph.vertices.length === 3 * inGraph.vertices.length, 
        "|V(outGraph)| = 3 * |V(inGraph)|");
    ASSERT(outGraph.edges.length === 2 * inGraph.vertices.length + inGraph.edges.length, 
        "|E(outGraph)| = 2 * |V(inGraph)| + |E(inGraph)|");

    return formatGraphToInputString(outGraph);
}

function reduceSatToSsp(input: string): string {
    const sat = parseSatInput(input);
    const n = sat.variables.length;
    const m = sat.clauses.length;

    let numbers = new Map<string, number[]>();

    const digitCount = n + m;

    for (let i = 0; i < n; i++) {
        const variable = sat.variables[i];

        let u = new Array(digitCount).fill(0);
        let notU = new Array(digitCount).fill(0);

        u[i] = 1;
        notU[i] = 1;

        for (let j = 0; j < m; j++) {
            const clause = sat.clauses[j];
            if (clause.includes(variable)) {
                u[n + j] = 1;
            } else if (clause.includes("!" + variable)) {
                notU[n + j] = 1;
            }
        }

        numbers.set("[" + variable + "]", u);
        numbers.set("[[NOT]" + variable + "]", notU);
    }

    for (let i = 0; i < m; i++) {
        let clauseNum = new Array(digitCount).fill(0);
        clauseNum[n + i] = 1;
        numbers.set("[[CLAUSE]" + i + "]", clauseNum);
        numbers.set("[[NOT[CLAUSE]]" + i + "]", clauseNum);
    }

    const targetSum = new Array(digitCount).fill(1, 0, n).fill(3, n);

    const subsetSum: SubsetSum = { 
        targetSum, 
        numbers: [...numbers.values()],
    }

    ASSERT(numbers.size === 2*n + 2*m, "There should be two numbers for every variable and clause.");

    // const outputWithComments = 
    //     numbers.size + " " + digitCount +
    //     "\n\n" + 
    //     targetSum.join("") + 
    //     "\n\n" + 
    //     [...numbers.entries()].map(([name, value]) => value.join("") + "  \/\/ " + name).join("\n");

    return formatSubsetSumToInputString(subsetSum);
}

function reduceHamCircuitToTsp(input: string): string {
    const inGraph = parseGraphInput(input);

    function edgeKey(a: string, b: string, w?: number) {
        let s = a < b ? a + "%" + b : b + "%" + a;
        if (w) s += "%" + w;
        return s;
    }

    const inEdgeSet = new Set(inGraph.edges.map(([a,b]) => edgeKey(a,b)));

    let vertices = [...inGraph.vertices];
    let edgeSet = new Set<string>();

    // make a complete graph
    for (const u of vertices) {
        for (const v of vertices) {
            if (u == v) continue;
            if (inEdgeSet.has(edgeKey(u,v))) {
                edgeSet.add(edgeKey(u, v, 1));
            } else {
                edgeSet.add(edgeKey(u, v, 2));
            }
        }
    }

    const outGraph = {
        vertices, 
        edges: [...edgeSet.values()].map(edge => edge.split("%")),
    };

    return formatGraphToInputString(outGraph);
}

function reduceSatTo3dm(input: string): string {
    const sat = parseSatInput(input);
    
    // even tips are true, odd tips are false
    const k = sat.clauses.length;
    const n = sat.variables.length;
    let vertices = new Array<string>();
    let triplets = new Array<string[]>();
    const tips = new Map<string, boolean>();

    // Boolean assignment gadgets.
    // Add core and tip nodes and make triplets of them.
    for (let i = 0; i < n; i++) {
        const v = sat.variables[i];

        for (let j = 0; j < 2*k; j++) {
            vertices.push(v + "[C][" + j + "]");
        }

        for (let j = 0; j < 2*k; j++) {
            vertices.push(v + "[T][" + j + "]");

            const tip = v + "[T][" + j + "]";
            triplets.push([
                v + "[C][" + j + "]",
                v + "[C][" + ((j+1) % (2*k)) + "]",
                tip
            ]);

            // set to false as this tip wasn't used yet.
            tips.set(tip, false);
        }

        ASSERT(2*2*k*(i+1) === vertices.length && 2*k*(i+1) === triplets.length, 
            "There should be 4k new vertices for every variable (2k core + 2k tips) and 2k new triplets.");
    }

    ASSERT(2*2*k*n === vertices.length && 2*k*n === triplets.length, 
        "There should be 4kn new vertices for every n variables (2k core + 2k tips)" + 
        " and 2k new triplets for each n variables.");

    // Satisfiability gadgets.
    // add clause for every clause and connect it with its tips.
    for (let i = 0; i < k; i++) {
        const clause = sat.clauses[i];

        const c = "[C][" + i + "]";
        const cDash = "[C'][" + i + "]";

        vertices.push(c);
        vertices.push(cDash);

        for (const literal of clause) {
            let tip = undefined;
            if (!literal.includes("!"))
                tip = literal + "[T][" + (2*i) + "]"; // true, take the even 
            else 
                tip = literal.replace("!", "") + "[T][" + (2*i + 1) + "]"; // false, take the odd

            ASSERT(tips.has(tip), "This tip " + tip + " doesn't exist.");

            triplets.push([ c, cDash, tip ]);
            tips.set(tip, true);
        }
    }

    // Garbage collection
    // The tips that weren't used are paired with two new nodes so they are in a triplet.
    const unusedTips = [...tips.entries()]
        .filter(([_tip, used]) => !used)
        .map(([tip, _used]) => tip);

    for (const tip of unusedTips) {
        const q = tip + "[Q]";
        const qDash = tip + "[Q']";
        vertices.push(q);
        vertices.push(qDash);
        triplets.push([tip, q, qDash]);
    }

    ASSERT(vertices.length >= (2*2*k*n + 2*k + 2*unusedTips.length), 
        "There should be at least 4kn vertices for boolean assignment " + 
        "+ 2k clause vertices " + 
        "+ 2*|unusedTips| of garbage collect vertices.");

    ASSERT(triplets.length === (2*k*n + 2*k*n), 
        "There should be 2kn triplets for core and tip boolean assignment" + 
            // 2 for true and false k tips for every clause, for each n variables
        " and 2kn triplets with tip and either clause nodes or garbage collector nodes.");

    const output = 
        vertices.length + " " + triplets.length +
        "\n\n" +
        vertices.join("\n") + 
        "\n\n" +
        triplets.map(t => t.join(" ")).join("\n");

    return output;
}


