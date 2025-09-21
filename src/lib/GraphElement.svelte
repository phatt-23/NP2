<script lang="ts">
    import cytoscape, { type ElementDefinition } from "cytoscape";
    import { type Graph } from "./graph"
    import { layoutGraphToCy, styleCy, type GraphLayout } from "./cy-graph";

    type Props = { 
        graph: Graph;
        layout?: GraphLayout
    };

    let { graph, layout = "default" }: Props = $props();

    let graphContainer: HTMLElement;

    $effect(() => {
        // get layout of the graph, positioned vertices
        // bind the html container 
        let cy = cytoscape({ 
            container: graphContainer, 
        });

        layoutGraphToCy(cy, graph, layout);
        styleCy(cy, layout);
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
