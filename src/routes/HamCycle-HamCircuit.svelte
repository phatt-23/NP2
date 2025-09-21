<script lang="ts">
    import { graphDemos, getRandomDemo } from "../lib/demos";
    import { formatGraphToInputString, parseGraphInput, parseGraphInstance, verifyGraphInstanceFormat, type Graph } from "../lib/graph";
    import GraphElement from "../lib/GraphElement.svelte";
    import { reduce } from "../lib/reduce";

    let hamCycleInstance = $state(getRandomDemo(graphDemos));
    let hamCycleInput = $state("");
    let hamCircuitInput = $state("");

    let hamCycleGraph = $state<Graph>({ vertices: [], edges: [] }); 
    let hamCircuitGraph = $state<Graph>({ vertices: [], edges: [] }); 

    function onConvertClick() {
        if (!verifyGraphInstanceFormat(hamCycleInstance)) {
            hamCycleInput = "WRONG FORMAT!";
            return;
        }

        hamCycleGraph = parseGraphInstance(hamCycleInstance);
        hamCycleInput = formatGraphToInputString(hamCycleGraph);
    
        hamCircuitInput = reduce("HamCycle-HamCircuit", hamCycleInput);
        hamCircuitGraph = parseGraphInput(hamCircuitInput);
    }
</script>

<main>
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

    <h2>HamCycle Graph</h2>
    <GraphElement layout={"HamCycle"} graph={hamCycleGraph} />

    <h2>HamCircuit Graph</h2>
    <GraphElement layout={"HamCircuit-From-HamCycle"} graph={hamCircuitGraph} />
</main>

<style>
    textarea {
        width: 30em;
        height: 20em;
    }
</style>

