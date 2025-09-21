<script lang="ts">
    import cytoscape from "cytoscape";
    import { type Graph } from "./graph"
    import { DEFAULT_EDGE_STYLE, DEFAULT_NODE_STYLE } from "./graph-styles";

    let graphContainer: HTMLElement;

    type Props = { 
        graph: Graph;
        layout: null | "3SAT-HamCycle"
    };

    let { graph, layout = null }: Props = $props();

    $effect(() => {
        if (!layout) {
            // if no layout is provided fallback to circle layout
            
            // bind container
            let cy = cytoscape({ container: graphContainer });

            // add data
            const clauseVertices = graph.vertices.filter(name => name.includes("[CLAUSE]"));
            const variableVertices = graph.vertices.filter(name => !name.startsWith("["));
            const betweenVertices = graph.vertices.filter(name => name.includes("[BETWEEN]"));
            const clauseCount = clauseVertices.length;
            const rowVertexCount = 3*clauseCount + 3;
            const variableCount = variableVertices.length / rowVertexCount; 
            const sourceVertex = graph.vertices.find(name => name.includes("[SOURCE]"));
            const targetVertex = graph.vertices.find(name => name.includes("[TARGET]"));

            const rowVertexGap = 50;
            const variableGadgetYPadding = 200;
            const clauseVertexXOffset = 200;

            // variable row vertices
            cy.add(variableVertices.map((name, i) => ({
                    data: { id: name },
                    position: {
                        x: rowVertexGap * (i % rowVertexCount),
                        y: variableGadgetYPadding * Math.trunc(i / rowVertexCount), 
                    },
                    classes: (() => {
                        if (i % rowVertexCount == 0) return "end true";
                        if (i % rowVertexCount == rowVertexCount - 1) return "end false"
                        return "row";
                    })(),
                }))
            );
            
            // source and target vertices
            cy.add({
                data: { id: sourceVertex },
                position: { 
                    x: (rowVertexGap * (rowVertexCount - 1)) / 2, 
                    y: -variableGadgetYPadding/2 
                },
                classes: "source",
            });
            cy.add({
                data: { id: targetVertex },
                position: { 
                    x: (rowVertexGap * (rowVertexCount - 1)) / 2, 
                    y: variableGadgetYPadding * variableCount - variableGadgetYPadding/2 
                },
                classes: "target",
            });

            // add between vertices
            cy.add(betweenVertices.map((name, i) => ({
                data: { id: name },
                position: {
                    x: (rowVertexGap * (rowVertexCount - 1)) / 2, 
                    y: variableGadgetYPadding * i + (variableGadgetYPadding/2)
                },
                classes: "between",
            })));
            
            // add clause vertices beside the assignment accordeon
            const spreadOut = 4;
            const assignmentAccordeonHeight = variableGadgetYPadding * (variableCount - 1 + spreadOut);
            const clauseVertexYStep = assignmentAccordeonHeight / (clauseCount - 1);

            cy.add(clauseVertices.map((name, i) => ({
                data: { id: name },
                position: {
                    x: rowVertexGap * (rowVertexCount - 1) + clauseVertexXOffset,
                    y: clauseVertexYStep * i - (variableGadgetYPadding * (spreadOut / 2)),
                },
                classes: "clause",
            })));

            // add directed edges
            cy.add(
                graph.edges.map(([u, v, assignment]) => ({ 
                    data: { 
                        id: u+v, 
                        source: u, 
                        target: v 
                    },
                    classes: (() => {
                        if (u.includes("[CLAUSE]")) return "clause out" + ` ${assignment == "[T]" ? "true" : "false"}`;
                        if (v.includes("[CLAUSE]")) return "clause in" + ` ${assignment == "[T]" ? "true" : "false"}`;
                        return "noise"
                    })(),
                }))
            );

            // style
            cy.style()
                .selector("node").style({
                    'label': 'data(id)',
                    "font-size": 12,
                    "text-valign": "top",
                    'background-color': 'blue',
                    "border-color": "black",
                    "border-style": "solid",
                    "border-width": 2,
                })
                .selector("node.true").style({
                    "background-color": "green"
                })
                .selector("node.false").style({
                    "background-color": "red"
                })
                .selector("node.source,node.between,node.target").style({
                    "background-color": "white",
                    "border-style": "solid",
                    "border-color": "black",
                })
                .selector("node.clause").style({
                    "background-color": "orange"
                })
                .selector("edge").style({
                    "line-color": "black",
                    'target-arrow-color': 'black',
                    'target-arrow-shape': "chevron",
                    'curve-style': 'bezier',
                    "arrow-scale": 1.0,
                })
                .selector("edge.noise").style({
                    "line-opacity": 0.2,
                    "line-color": "black",
                })
                .selector("edge.clause").style({
                    'curve-style': 'bezier',
                    "width": 4,
                    "line-opacity": 1,
                    "arrow-scale": 2.0,
                })
                .selector("edge.clause.true").style({
                    'target-arrow-color': 'green',
                    'line-color': 'green',
                })
                .selector("edge.clause.false").style({
                    'target-arrow-color': 'red',
                    'line-color': 'red',
                })
                .selector("edge.clause.out").style({
                    "line-style": "dashed",
                })
                .update();
        }
    });
</script>

<h2>Graph</h2>
<div id="cy" bind:this={graphContainer}></div>

<style>
    #cy {
        width: 80%;
        height: 50em;
        border: solid black;
    }
</style>
