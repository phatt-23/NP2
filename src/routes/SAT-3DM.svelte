<script lang="ts">
    import { satDemos, getRandomDemo } from "../lib/demos";
    import { parseGraphInput, type Graph } from "../lib/graph";
    import GraphElement from "../lib/GraphElement.svelte";
    import { reduce } from "../lib/reduce";
    import ReductionPanel from "../lib/ReductionPanel.svelte";
    import { type SatExpression } from "../lib/sat";
    import { verifySatInstanceFormat, parseSatInstance, formatSatToInputString } from "../lib/sat";
    import SatFormula from "../lib/SatFormula.svelte";

    let satInstance = $state(getRandomDemo(satDemos));
    let satInput = $state("");
    let sat = $state<SatExpression>({ variables: [], clauses: [] });
    let threeDmInput = $state("");
    let threeDmGraph = $state<Graph>({ vertices: [], edges: [] });

    function onConvertClick() {
        if (!verifySatInstanceFormat(satInstance)) {
            satInput = "WRONG FORMAT :(";
            return;
        }

        sat = parseSatInstance(satInstance);
        satInput = formatSatToInputString(sat);

        threeDmInput = reduce("3SAT-3DM", satInput);
        threeDmGraph = parseGraphInput(threeDmInput);
    }
</script>

<h1>3SAT to 3DM</h1>
<hr/>

<ReductionPanel
    inProblem={"3SAT"}
    outProblem={"3DM"}
    bind:inInstance={satInstance}
    inInput={satInput}
    outInput={threeDmInput}
    onConvertClick={onConvertClick}
    demoInstances={satDemos}
></ReductionPanel>

<h2>3SAT Formula</h2>
<SatFormula {sat}></SatFormula>

<h2>3DM Graph</h2>
<GraphElement graph={threeDmGraph} layout={"3DM-From-3SAT"}></GraphElement>


