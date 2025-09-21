<script lang="ts">
    import BooleanFormula from "../lib/SatFormula.svelte";
    import { satDemos, getRandomDemo } from "../lib/demos";
    import { reduce } from "../lib/reduce";
    import ReductionPanel from "../lib/ReductionPanel.svelte";
    import { type SatExpression, verifySatInstanceFormat, parseSatInstance, formatSatToInputString } from "../lib/sat";

    let satInstance = $state(getRandomDemo(satDemos));
    let sat = $state<SatExpression>({ variables: [], clauses: [] });
    let satInput = $state("");
    let sspInput = $state("");

    function onConvertClick() {
        if (!verifySatInstanceFormat(satInstance)) {
            satInput = "WRONG FORMAT :(";
            return;
        }

        sat = parseSatInstance(satInstance);
        satInput = formatSatToInputString(sat);

        sspInput = reduce("3SAT-SSP", satInput);
    }
</script>

<h1>3SAT to SSP</h1>
<hr />
<ReductionPanel
    inProblem={"3SAT"}
    outProblem={"SSP"}
    inInstance={satInstance}
    inInput={satInput}
    outInput={sspInput}
    onConvertClick={onConvertClick}
></ReductionPanel>

<h2>3SAT Formula</h2>
<BooleanFormula {sat}/>