<script lang="ts">
    import cytoscape, { type ElementDefinition } from "cytoscape";
    import { type Graph } from "./graph"
    import { drawConvexHullsFor3DM, layoutGraphToCy, styleCy, type GraphLayout } from "./cy-graph";

    import hull from "hull.js"; // npm install hull.js
    import cyCanvas from "cytoscape-canvas"

    type Props = { 
        graph: Graph;
        layout?: GraphLayout
    };

    let { graph, layout = "default" }: Props = $props();

    let graphContainer: HTMLElement;

    $effect(() => {
        // get layout of the graph, positioned vertices
        // bind the html container 

        if (layout == "3DM-From-3SAT") {
            cyCanvas(cytoscape);
        }

        let cy = cytoscape({ 
            container: graphContainer, 
        });

        layoutGraphToCy(cy, graph, layout);
        styleCy(cy, layout);

        if (layout == "3DM-From-3SAT") {
            drawConvexHullsFor3DM(cy, graph);
        }

    });
</script>

<div id="cy" bind:this={graphContainer}></div>

<style>
    #cy {
        width: 80%;
        height: 50em;
        border: solid black;
    }
</style>
