<script lang="ts">
    import { graphDemos, getRandomDemo } from "../lib/demos";
    import { formatGraphToInputString, parseGraphInput, parseGraphInstance, verifyGraphInstanceFormat, type Graph } from "../lib/graph";
    import GraphElement from "../lib/GraphElement.svelte";
    import { reduce } from "../lib/reduce";
    import ReductionPanel from "../lib/ReductionPanel.svelte";

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

<h1>HamCycle to HamCircuit</h1>
<p>
    Hamiltonian Cycle Problem uses directed graph. 
    Meanwhile Hamiltonian Circuit Problem uses undirected graph.
</p>

<hr />
<ReductionPanel
    inProblem={"HamCycle"}
    outProblem={"HamCircuit"}
    bind:inInstance={hamCycleInstance}
    inInput={hamCycleInput}
    outInput={hamCircuitInput}
    onConvertClick={onConvertClick}
    demoInstances={graphDemos}
/>

<h2>HamCycle Graph</h2>
<GraphElement layout={"HamCycle"} graph={hamCycleGraph} />

<h2>HamCircuit Graph</h2>
<GraphElement layout={"HamCircuit-From-HamCycle"} graph={hamCircuitGraph} />

