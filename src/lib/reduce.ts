import { formatGraphToInputString, parseGraphInput, type Graph } from './graph';
import { ASSERT } from './lib';
import { parseSatInput } from './sat';
import { formatSubsetSumToInputString, type SubsetSum } from './ssp';

export type Reductions = "3SAT-HamCycle" | "HamCycle-HamCircuit" | "3SAT-SSP"

// Reduces the problem A to B using the input of problem A and outputing the input for problem B. 
export function reduce(reduction: Reductions, input: string): string {
    switch (reduction) {
        case "3SAT-HamCycle":
            return reduceSatToHamCycle(input);
        case "HamCycle-HamCircuit":
            return reduceHamCycleToHamCircuit(input);
        case "3SAT-SSP":
            return reduceSatToSsp(input);
        default:
            throw new Error("This reduction is not implemented.");
    }
}

function reduceSatToHamCycle(input: string): string {
    const sat = parseSatInput(input);
    let graph: Graph = { vertices: [], edges: [] };
    
    function createInbetweenVertexName(v1: string, v2: string): string { 
        return '[BETWEEN[' + v1 + ',' + v2 + ']]';
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
    const sourceVertexName = sat.variables[0] + '[SOURCE]';
    const targetVertexName = sat.variables[n - 1] + '[TARGET]';

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
            addVertexToRowEndsEdges(sourceVertexName, i);
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
    graph.edges.push([sat.variables[n - 1] + "[TARGET]", sat.variables[0] + "[SOURCE]"]);

    // add clause nodes and connect the row nodes of variables to clauses
    for (let i = 0; i < k; i++) {
        const c = sat.clauses[i];
        const clauseName = '[CLAUSE[' + i + ']]';
        
        // add clause to the graph
        graph.vertices.push(clauseName);

        // for every literal in the clause, add the jumps to it and back to the row
        for (const v of c) {
            const v1 = v.replace("!", "") + "[" + (3*i + 2) + "]";
            const v2 = v.replace("!", "") + "[" + (3*i + 3) + "]";

            if (v.search("!") == -1) {
                // x
                graph.edges.push([v1, clauseName]);
                graph.edges.push([clauseName, v2]);
            } else {
                // not x
                graph.edges.push([v2, clauseName]);
                graph.edges.push([clauseName, v1]);
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
