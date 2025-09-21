import { type Graph } from "./graph";
import { DIRECTED_GRAPH_DEFAULT_STYLE, GRAPH_HAMCYCLE_FROM_3SAT_STYLESHEET, GRAPH_DEFAULT_STYLE, GRAPH_TSP_FROM_HAMCIRCUIT_STYLE } from "./graph-styles";
import type { ElementDefinition } from "cytoscape";
import { ASSERT } from "./lib";
import type cytoscape from "cytoscape";

export type GraphLayout = "default" 
                        | "HamCycle-From-3SAT" 
                        | "HamCircuit-From-HamCycle"
                        | "HamCycle" 
                        | "HamCircuit"
                        | "TSP"
                        ;


export function layoutGraphToCy(cy: cytoscape.Core, graph: Graph, layout: GraphLayout) {
    const data = layoutGraphToCyElements(graph, layout);
    cy.add(data);
}

export function styleCy(cy: cytoscape.Core, layout: GraphLayout) {
    switch (layout) {
    case "HamCycle-From-3SAT":
        cy.style().append(GRAPH_HAMCYCLE_FROM_3SAT_STYLESHEET);
        break;
    case "HamCircuit-From-HamCycle":
        cy.style().append(GRAPH_DEFAULT_STYLE);
        break;
    case "HamCycle":
        cy.style().append(DIRECTED_GRAPH_DEFAULT_STYLE);
        cy.layout({ name: "circle" }).run();
        break;
    case "HamCircuit":
        cy.style().append(GRAPH_DEFAULT_STYLE);
        cy.layout({ name: "circle" }).run();
        break;
    case "TSP":
        cy.style()
            .append(GRAPH_DEFAULT_STYLE)
            .append(GRAPH_TSP_FROM_HAMCIRCUIT_STYLE);
        cy.layout({ name: "circle" }).run();
    default:
        cy.style().append(GRAPH_DEFAULT_STYLE);
        cy.layout({ name: "circle" }).run();
    }
}


export function layoutGraphToCyElements(graph: Graph, layout: GraphLayout): ElementDefinition[] {
    // if no layout is provided fallback to circle layout
    switch (layout) {
        case "HamCycle-From-3SAT": {
            // destructure graph data
            const clauseVertices = graph.vertices.filter(name => name.includes("[CLAUSE]"));
            const variableVertices = graph.vertices.filter(name => !name.startsWith("["));
            const betweenVertices = graph.vertices.filter(name => name.includes("[BETWEEN]"));
            const clauseCount = clauseVertices.length;
            const rowVertexCount = 3 * clauseCount + 3;
            const variableCount = variableVertices.length / rowVertexCount;
            const sourceVertex = graph.vertices.find(name => name.includes("[SOURCE]"));
            const targetVertex = graph.vertices.find(name => name.includes("[TARGET]"));

            const rowVertexGap = 50;
            const variableGadgetYPadding = 200;
            const clauseVertexXOffset = 200;

            // prepare empty data
            let data: ElementDefinition[] = [];

            // variable row vertices
            data.push(...variableVertices.map((name, i) => ({
                data: { id: name },
                position: {
                    x: rowVertexGap * (i % rowVertexCount),
                    y: variableGadgetYPadding * Math.trunc(i / rowVertexCount),
                },
                classes: (() => {
                    if (i % rowVertexCount == 0) return "end true";
                    if (i % rowVertexCount == rowVertexCount - 1) return "end false"
                    if (i % 3 == 1) return "row guarantee"
                    return "row";
                })(),
            }))
            );

            // source and target vertices
            data.push({
                data: { id: sourceVertex },
                position: {
                    x: (rowVertexGap * (rowVertexCount - 1)) / 2,
                    y: -variableGadgetYPadding / 2
                },
                classes: "source",
            });
            data.push({
                data: { id: targetVertex },
                position: {
                    x: (rowVertexGap * (rowVertexCount - 1)) / 2,
                    y: variableGadgetYPadding * variableCount - variableGadgetYPadding / 2
                },
                classes: "target",
            });

            // add between vertices
            data.push(...betweenVertices.map((name, i) => ({
                data: { id: name },
                position: {
                    x: (rowVertexGap * (rowVertexCount - 1)) / 2,
                    y: variableGadgetYPadding * i + (variableGadgetYPadding / 2)
                },
                classes: "between",
            })));

            // add clause vertices beside the assignment accordeon
            const spreadOut = clauseCount / variableCount;
            const assignmentAccordeonHeight = variableGadgetYPadding * (variableCount - 1 + spreadOut);
            const clauseVertexYStep = assignmentAccordeonHeight / (clauseCount - 1);

            data.push(...clauseVertices.map((name, i) => ({
                data: { id: name },
                position: {
                    x: rowVertexGap * (rowVertexCount - 1) + clauseVertexXOffset,
                    y: clauseVertexYStep * i - (variableGadgetYPadding * (spreadOut / 2)),
                },
                classes: "clause",
            })));

            // add directed edges
            data.push(...graph.edges.map(([u, v, assignment]) => ({
                data: {
                    id: u + v,
                    source: u,
                    target: v
                },
                classes: (() => {
                    if (u.includes("[CLAUSE]")) return "clause out" + ` ${assignment == "[T]" ? "true" : "false"}`;
                    if (v.includes("[CLAUSE]")) return "clause in" + ` ${assignment == "[T]" ? "true" : "false"}`;
                    return "noise"
                })(),
            })));

            return data;
        }
        case "HamCircuit-From-HamCycle": {
            // prepare empty data
            let data: ElementDefinition[] = [];

            // layout into a circle and triplets on a straight horizontal line
            const { vertices, edges } = graph;
            ASSERT(vertices.length % 3 == 0, "There should be multiple of 3 vertices, since every vertex needs IN, MID, OUT vertices.");

            const tripletCount = vertices.length / 3;

            const gapBetweenVertex = 80;
            const distBetweenTriplets = 300;

            // circum = 2*PI*r <=> r = circum / 2*PI
            const circumference = distBetweenTriplets * tripletCount;
            const radius = circumference / (2 * Math.PI);
            const angleStep = 360 / tripletCount;

            function toRad(x: number) {
                return x * Math.PI/180;
            }

            const rot = angleStep / 4;

            // add vertices around a circle in triplets
            for (let i = 0; i < tripletCount; i++) {
                // normalised
                const x = Math.cos(toRad(angleStep * i - rot));
                const y = Math.sin(toRad(angleStep * i - rot));

                const position = { 
                    x: radius * x, 
                    y: radius * y 
                }; 
                
                data.push({ data: { id: vertices[3*i] },     position: { y: position.y, x: position.x - gapBetweenVertex, }});
                data.push({ data: { id: vertices[3*i + 1] }, position: { y: position.y, x: position.x,                    }});
                data.push({ data: { id: vertices[3*i + 2] }, position: { y: position.y, x: position.x + gapBetweenVertex, }});
            }

            data.push(...graph.edges.map(([u, v]) => ({
                data: { id: u + "--" + v, source: u, target: v },
            })))

            return data;
        }
        case "TSP":
            return [
                ...graph.vertices.map(name => ({ data: { id: name } })),
                ...graph.edges.map(([u, v, w]) => ({ data: { 
                    id: u + "--" + v, 
                    source: u, 
                    target: v, 
                    weight: Number.parseInt(w) 
                }}))
            ];    
        default:
            return [
                ...graph.vertices.map(name => ({ data: { id: name } })),
                ...graph.edges.map(([u, v]) => ({ data: { id: u + "--" + v, source: u, target: v } }))
            ];
    }
}
