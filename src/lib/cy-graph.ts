import { type Graph } from "./graph";
import { DIRECTED_GRAPH_DEFAULT_STYLE, GRAPH_HAMCYCLE_FROM_3SAT_STYLESHEET, GRAPH_DEFAULT_STYLE, GRAPH_TSP_FROM_HAMCIRCUIT_STYLE } from "./graph-styles";
import type { ElementDefinition } from "cytoscape";
import { ASSERT } from "./lib";
import type cytoscape from "cytoscape";
import hull from "hull.js";


export type GraphLayout = "default" 
                        | "HamCycle-From-3SAT" 
                        | "HamCircuit-From-HamCycle"
                        | "HamCycle" 
                        | "HamCircuit"
                        | "TSP"
                        | "3DM-From-3SAT"
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
    case "3DM-From-3SAT":
        cy.style().append(GRAPH_DEFAULT_STYLE)
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
        break;
    default:
        cy.style().append(GRAPH_DEFAULT_STYLE);
        cy.layout({ name: "circle" }).run();
    }
}


export function layoutGraphToCyElements(graph: Graph, layout: GraphLayout): ElementDefinition[] {
    // if no layout is provided fallback to circle layout
    switch (layout) {
        case "3DM-From-3SAT": {
            const { vertices, edges } = graph;

            let data: ElementDefinition[] = [];

            const variableVertices = vertices.filter(v => !v.startsWith("[")); 
            const clauseVertices = vertices.filter(v => v.startsWith("[C]") || v.startsWith("[C']"))
            const garbageVertices = vertices.filter(v => v.startsWith("[Q]") || v.startsWith("[Q']"))

            //                     4kn => n = 4kn / k / 4 = 4kn / 4k
            const clauseCount = clauseVertices.length / 2;
            const variableCount = variableVertices.length / (4 * clauseCount);

            const nodesPerVariable = 4*clauseCount;

            const distBetweenVertices = 80;

            const coreNodeCountPerVarGadget = 2 * clauseCount;
            const circumference = distBetweenVertices * coreNodeCountPerVarGadget;
            const radius = circumference / (2 * Math.PI);
            const angleStep = 360 / coreNodeCountPerVarGadget;
            const variableGadgetYPadding = 5 * radius;

            // create variable gadgets
            for (let i = 0; i < variableCount; i++) {
                const node = variableVertices[i * nodesPerVariable];
                const varName = node.substring(0, node.indexOf("["));
                const varNodes = variableVertices.filter(v => v.startsWith(varName))
                const varCoreNodes = varNodes.filter(v => v.includes("[C]"));
                const varTipNodes = varNodes.filter(v => v.includes("[T]"));

                ASSERT(varCoreNodes.length == varTipNodes.length);
                
                const toRad = (x: number) => x * Math.PI / 180;

                for (let j = 0; j < varCoreNodes.length; j++) {
                    let x = Math.cos(toRad(j * angleStep));
                    let y = Math.sin(toRad(j * angleStep));

                    data.push({
                        data: { id: varCoreNodes[j] },
                        position: {
                            x: radius * x,
                            y: radius * y + i*variableGadgetYPadding
                        }
                    });

                    x = Math.cos(toRad(j * angleStep + angleStep/2));
                    y = Math.sin(toRad(j * angleStep + angleStep/2));

                    data.push({
                        data: { id: varTipNodes[j] },
                        position: {
                            x: (radius + distBetweenVertices) * x,
                            y: (radius + distBetweenVertices) * y + i*variableGadgetYPadding,
                        }
                    });
                }

            }

            ASSERT(variableGadgetYPadding !== undefined)

            const variableGadgetsHeight = variableGadgetYPadding * (variableCount - 1);
            const clauseYOffset = variableGadgetsHeight / (clauseCount - 1);

            // create satifiability gadgets
            for (let i = 0; i < clauseCount; i++) {
                const c = clauseVertices[2*i];
                const cDash = clauseVertices[2*i + 1];

                data.push({
                    data: { id: c },
                    position: {
                        x: variableGadgetYPadding,
                        y: i * clauseYOffset - distBetweenVertices/2,
                    },
                });

                data.push({
                    data: { id: cDash },
                    position: {
                        x: variableGadgetYPadding,
                        y: i * clauseYOffset + distBetweenVertices/2,
                    },
                });

            }

            const garbageCollectionCount = variableVertices.length / 4 - clauseCount;
            ASSERT(garbageVertices.length/2 == garbageCollectionCount);

            const garbageYOffset = variableGadgetsHeight / (garbageCollectionCount - 1);

            // create garbage collectors
            for (let i = 0; i < garbageCollectionCount; i++) {
                const q = garbageVertices[2*i];
                const qDash = garbageVertices[2*i + 1];

                data.push({
                    data: { id: q },
                    position: {
                        x: -variableGadgetYPadding - distBetweenVertices,
                        y: i * garbageYOffset,
                    },
                });

                data.push({
                    data: { id: qDash },
                    position: {
                        x: -variableGadgetYPadding,
                        y: i * garbageYOffset,
                    },
                });
            }

            return data;
        }
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
            const yOffset = variableGadgetYPadding * (spreadOut / 2);

            data.push(...clauseVertices.map((name, i) => ({
                data: { id: name },
                position: {
                    x: rowVertexGap * (rowVertexCount - 1) + clauseVertexXOffset,
                    y: clauseVertexYStep * i - yOffset,
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

export function drawConvexHullsFor3DM(cy: cytoscape.Core, graph: Graph) {
    // draw convex hulls
    const layer = cy.cyCanvas({ zIndex: -1 });
    const ctx = layer.getCanvas().getContext("2d")!;

    function createCirclePoints(pos: number[], radius: number, resolution: number): number[][] {
        const circum = 2 * Math.PI * radius;
        const dist = circum / resolution;
        const angleStep = 360 / resolution;
        let points = [];

        const toRad = (x: number) => x * Math.PI/180;

        for (let i = 0; i < resolution; i++) {
            const x = Math.cos(toRad(angleStep * i));
            const y = Math.sin(toRad(angleStep * i));

            points.push([pos[0] + x * radius, pos[1] + y * radius]);
        }

        return points;
    }

    function drawHulls() {
        const nodesByVar: Record<string, cytoscape.NodeSingular[]> = {};
        cy.nodes().forEach(n => {
            const id = n.id();
            const varName = id.substring(0, id.indexOf("[")); 
            if (!nodesByVar[varName]) nodesByVar[varName] = [];
            nodesByVar[varName].push(n);
        });

        // clear and sync transform
        // --- key part ---
        layer.resetTransform(ctx);  // reset any old transforms
        layer.clear(ctx);           // clear background
        layer.setTransform(ctx);    // <--- apply Cytoscape’s pan/zoom transform
        // -----------------

        Object.entries(nodesByVar).forEach(([varName, nodes]) => {
            if (nodes.length < 3) return;

            const tipNodes = nodes.filter(n => n.id().includes("[T]"));
            const coreNodes = nodes.filter(n => n.id().includes("[C]"));

            tipNodes.forEach((tipNode, index) => {
                const c = coreNodes[index];
                const cDash = coreNodes[(index+1) % coreNodes.length];

                const points: number[][] = [
                    [tipNode.position("x"), tipNode.position("y")],
                    [c.position("x"), c.position("y")],
                    [cDash.position("x"), cDash.position("y")],
                ];
                const surroundPoints = points.flatMap(([x, y]) => createCirclePoints([x,y], 24, 32))
                const hullPoints = hull(surroundPoints, Infinity) as number[][]; // concavity

                ctx.beginPath();
                ctx.moveTo(hullPoints[0][0], hullPoints[0][1]);
                for (let i = 1; i < hullPoints.length; i++) {
                    ctx.lineTo(hullPoints[i][0], hullPoints[i][1]);
                }
                ctx.closePath();

                if (index % 2 == 0) {
                    ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
                    ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
                } else {
                    ctx.fillStyle = "rgba(0, 200, 0, 0.1)";
                    ctx.strokeStyle = "rgba(0, 200, 0, 0.8)";
                }
                ctx.lineWidth = 2;
                ctx.fill();
                ctx.stroke();tipNodes

                // optional label
                const center = points.reduce(
                    (acc, p) => [acc[0] + p[0] / points.length, acc[1] + p[1] / points.length],
                    [0, 0]
                );
            });

            const clauseTriplets = graph.edges.filter(([clause, clauseDash, tip]) => clause.startsWith("[C]") && clauseDash.startsWith("[C']"));
            clauseTriplets.forEach(([x,y,z]) => {
                const nodeX = cy.getElementById(x);
                const nodeY = cy.getElementById(y);
                const nodeZ = cy.getElementById(z);


                const points: number[][] = [
                    [nodeX.position("x"), nodeX.position("y")],
                    [nodeY.position("x"), nodeY.position("y")],
                    [nodeZ.position("x"), nodeZ.position("y")],
                ];
                const surroundPoints = points.flatMap(([x, y]) => createCirclePoints([x,y], 24, 32))
                const hullPoints = hull(surroundPoints, Infinity) as number[][]; // concavity

                ctx.beginPath();
                ctx.moveTo(hullPoints[0][0], hullPoints[0][1]);
                for (let i = 1; i < hullPoints.length; i++) {
                    ctx.lineTo(hullPoints[i][0], hullPoints[i][1]);
                }
                ctx.closePath();

                ctx.fillStyle = "rgba(255, 150, 255, 0.05)";
                ctx.strokeStyle = "rgba(255, 150, 255, 1.0)";
                ctx.lineWidth = 2;
                ctx.fill();
                ctx.stroke();tipNodes

                // optional label
                const center = points.reduce(
                    (acc, p) => [acc[0] + p[0] / points.length, acc[1] + p[1] / points.length],
                    [0, 0]
                );
            });
            

            const garbageTriplets = graph.edges.filter(([q, qDash, tip]) => q.startsWith("[Q]") && qDash.startsWith("[Q']"));
            garbageTriplets.forEach(([x, y, z]) => {
                const nodeX = cy.getElementById(x);
                const nodeY = cy.getElementById(y);
                const nodeZ = cy.getElementById(z);

                const points: number[][] = [
                    [nodeX.position("x"), nodeX.position("y")],
                    [nodeY.position("x"), nodeY.position("y")],
                    [nodeZ.position("x"), nodeZ.position("y")],
                ];
                const surroundPoints = points.flatMap(([x, y]) => createCirclePoints([x,y], 24, 32))
                const hullPoints = hull(surroundPoints, Infinity) as number[][]; // concavity

                ctx.beginPath();
                ctx.moveTo(hullPoints[0][0], hullPoints[0][1]);
                for (let i = 1; i < hullPoints.length; i++) {
                    ctx.lineTo(hullPoints[i][0], hullPoints[i][1]);
                }
                ctx.closePath();

                ctx.fillStyle = "rgba(0, 0, 0, 0.000)";
                ctx.strokeStyle = "rgba(0, 0, 0, 0.01)";
                ctx.lineWidth = 2;
                ctx.fill();
                ctx.stroke();

                // optional label
                const center = points.reduce(
                    (acc, p) => [acc[0] + p[0] / points.length, acc[1] + p[1] / points.length],
                    [0, 0]
                );

            })
        });
    }

    cy.on("render", drawHulls);
}