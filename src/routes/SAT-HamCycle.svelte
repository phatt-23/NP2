<script lang="ts">
    import { satDemos, getRandomDemo } from "../lib/demos";
    import { reduce } from "../lib/reduce";
    import { verifySatInstanceFormat, parseSatInstance, formatSatToInputString, type SatExpression } from "../lib/sat";
    import { parseGraphInput, type Graph } from "../lib/graph";
    import BooleanFormula from "../lib/BooleanFormula.svelte";
    import GraphElement from "../lib/GraphElement.svelte";

    let satInstance = $state(getRandomDemo(satDemos));
    let satExpression = $state<SatExpression>({ variables: [], clauses: [] });
    let satInput = $state("");
    let hamCycleInput = $state("");
    let hamCycleInputGraph = $state<Graph>({ vertices: [], edges: [] });

    function onConvertClick() {
        if (!verifySatInstanceFormat(satInstance)) {
            satInput = "WRONG FORMAT :(";
            return;
        }

        satExpression = parseSatInstance(satInstance);
        satInput = formatSatToInputString(satExpression);

        hamCycleInput = reduce("3SAT-HamCycle", satInput);
        hamCycleInputGraph = parseGraphInput(hamCycleInput);
    }
</script>

<main>
    <h1>3SAT to HamCycle</h1>
    <hr />
    <div style="display: flex;">
        <div>
            <h2>3SAT instance</h2>
            <textarea
                bind:value={satInstance}
                placeholder="Instance of 3SAT..."
            >
            </textarea>
        </div>
        <div>
            <h2>3SAT input</h2>
            <textarea
                bind:value={satInput}
                readonly
                placeholder="Content of 'input' file generated from instance..."
            >
            </textarea>
        </div>
        <div>
            <h2>HamCycle input</h2>
            <textarea
                bind:value={hamCycleInput}
                readonly
                placeholder="Reduced HamCycle input..."
            >
            </textarea>
        </div>
    </div>
    <button onclick={onConvertClick}>Convert</button>
    <div>
        <BooleanFormula sat={satExpression}></BooleanFormula>
        <GraphElement layout={"HamCycle-From-3SAT"} graph={hamCycleInputGraph}></GraphElement>
    </div>
</main>



<style>
    textarea {
        width: 30em;
        height: 20em;
    }

</style>
