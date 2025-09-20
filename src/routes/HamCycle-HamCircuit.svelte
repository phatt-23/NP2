<script lang="ts">
    import { hamCycleDemos, getRandomDemo } from "../lib/demos";
    import { formatGraphToInputString, parseGraphInstance, verifyGraphInstanceFormat } from "../lib/graph";
    import { reduce } from "../lib/reduce";

    // let hamCycleInstance = $state(getRandomDemo(hamCycleDemos));
    let hamCycleInstance = $state(hamCycleDemos[4]);
    let hamCycleInput = $state("");
    let hamCircuitInput = $state("");

    function onConvertClick() {
        if (!verifyGraphInstanceFormat(hamCycleInstance)) {
            hamCycleInput = "WRONG FORMAT!";
            return;
        }

        const graph = parseGraphInstance(hamCycleInstance);
        hamCycleInput = formatGraphToInputString(graph);
    
        const reduction = reduce("HamCycle-HamCircuit", hamCycleInput);
        hamCircuitInput = reduction;
    }
</script>

<div>
    <h1>HamCycle to HamCircuit</h1>
    <p>
        Hamiltonian Cycle Problem uses directed graph. 
        Meanwhile Hamiltonian Circuit Problem uses undirected graph.
    </p>

    <hr />
    <div style="display: flex;">
        <div>
            <h2>HamCycle instance</h2>
            <textarea
                bind:value={hamCycleInstance}
                placeholder="Instance of HamCycle..."
            >
            </textarea>
        </div>
        <div>
            <h2>HamCycle input</h2>
            <textarea
                bind:value={hamCycleInput}
                readonly
                placeholder="Input generated from HamCycle instance..."
            >
            </textarea>
        </div>
        
        <div>
            <h2>HamCircuit input</h2>
            <textarea
                bind:value={hamCircuitInput}
                readonly
                placeholder="Input of HamCircuit..."
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

