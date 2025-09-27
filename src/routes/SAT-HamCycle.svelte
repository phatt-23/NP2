<script lang="ts">
    import { satDemos, getRandomDemo, graphDemos } from "../lib/demos";
    import { reduce } from "../lib/reduce";
    import { verifySatInstanceFormat, parseSatInstance, formatSatToInputString, type SatExpression } from "../lib/sat";
    import { parseGraphInput, type Graph } from "../lib/graph";
    import SatFormula from "../lib/SatFormula.svelte";
    import GraphElement from "../lib/GraphElement.svelte";
    import ReductionPanel from "../lib/ReductionPanel.svelte";

    let satInstance = $state(getRandomDemo(satDemos));
    let sat = $state<SatExpression>({ variables: [], clauses: [] });
    let satInput = $state("");
    let hamCycleInput = $state("");
    let hamCycleInputGraph = $state<Graph>({ vertices: [], edges: [] });

    function onConvertClick() {
        if (!verifySatInstanceFormat(satInstance)) {
            satInput = "WRONG FORMAT :(";
            return;
        }

        sat = parseSatInstance(satInstance);
        satInput = formatSatToInputString(sat);

        hamCycleInput = reduce("3SAT-HamCycle", satInput);
        hamCycleInputGraph = parseGraphInput(hamCycleInput);
    }
</script>

<h1>3SAT to HamCycle</h1>
<hr />

<ReductionPanel 
    inProblem={"3SAT"}
    outProblem={"HamCycle"}
    bind:inInstance={satInstance}
    inInput={satInput}
    outInput={hamCycleInput}
    onConvertClick={onConvertClick}
    demoInstances={satDemos}
/>

<h2>Boolean Formula</h2>
<SatFormula {sat} />

<h2>HamCycle Graph</h2>
<GraphElement layout={"HamCycle-From-3SAT"} graph={hamCycleInputGraph}></GraphElement>


