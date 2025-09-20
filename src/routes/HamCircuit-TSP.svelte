<script lang="ts">
    import { getRandomDemo, graphDemos } from "../lib/demos";
    import { formatGraphToInputString, parseGraphInstance, verifyGraphInstanceFormat } from "../lib/graph";
    import { reduce } from "../lib/reduce";

    
    let hamCircuitInstance = $state(getRandomDemo(graphDemos));
    let hamCircuitInput = $state("");
    let tspInput = $state("");

    function onConvertClick() {
        if (!verifyGraphInstanceFormat(hamCircuitInstance)) {
            hamCircuitInput = "WRONG FORMAT!";
            return;
        }

        const graph = parseGraphInstance(hamCircuitInstance);
        hamCircuitInput = formatGraphToInputString(graph);
    
        const reduction = reduce("HamCircuit-TSP", hamCircuitInput);
        tspInput = reduction;
    }
</script>


<div>
    <h1>HamCircuit to TSP</h1>
    <hr />
    <div style="display: flex;">
        <div>
            <h2>HamCircuit instance</h2>
            <textarea
                bind:value={hamCircuitInstance}
                placeholder="Instance of HamCircuit..."
            >
            </textarea>
        </div>
        <div>
            <h2>HamCircuit input</h2>
            <textarea
                bind:value={hamCircuitInput}
                readonly
                placeholder="Content of 'input' file generated from instance..."
            >
            </textarea>
        </div>
        <div>
            <h2>TSP input</h2>
            <textarea
                bind:value={tspInput}
                readonly
                placeholder="Reduced TSP input..."
            >
            </textarea>
        </div>
    </div>
    <button onclick={onConvertClick}>Convert</button>
</div>

<style>
    textarea {
        width: 30em;
        height: 20em;
    }
</style>
