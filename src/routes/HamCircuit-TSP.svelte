<script lang="ts">
    import { getRandomDemo, graphDemos } from "../lib/demos";
    import { formatGraphToInputString, parseGraphInput, parseGraphInstance, verifyGraphInstanceFormat, type Graph } from "../lib/graph";
    import GraphElement from "../lib/GraphElement.svelte";
    import { reduce } from "../lib/reduce";
    import ReductionPanel from "../lib/ReductionPanel.svelte";

    
    let hamCircuitInstance = $state(getRandomDemo(graphDemos));
    let hamCircuitInput = $state("");
    let tspInput = $state("");
    let hamCircuitGraph = $state<Graph>({ vertices: [], edges: []});
    let tspGraph = $state<Graph>({ vertices: [], edges: []});

    function onConvertClick() {
        if (!verifyGraphInstanceFormat(hamCircuitInstance)) {
            hamCircuitInput = "WRONG FORMAT!";
            return;
        }

        hamCircuitGraph = parseGraphInstance(hamCircuitInstance);
        hamCircuitInput = formatGraphToInputString(hamCircuitGraph);
    
        tspInput = reduce("HamCircuit-TSP", hamCircuitInput);
        tspGraph = parseGraphInput(tspInput);
    }
</script>

<h1>HamCircuit to TSP</h1>
<hr />
<ReductionPanel
    inProblem={"HamCircuit"}
    outProblem={"TSP"}
    inInstance={hamCircuitInstance}
    inInput={hamCircuitInput}
    outInput={tspInput}
    onConvertClick={onConvertClick}
/>

<h2>HamCircuit Graph</h2>
<GraphElement layout={"HamCircuit"} graph={hamCircuitGraph}/>

<h2>TSP Graph</h2>
<GraphElement layout={"TSP"} graph={tspGraph}/>
