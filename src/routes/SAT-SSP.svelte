<script lang="ts">
    import BooleanFormula from "../lib/SatFormula.svelte";
    import { satDemos, getRandomDemo, graphDemos } from "../lib/demos";
    import { reduce } from "../lib/reduce";
    import ReductionPanel from "../lib/ReductionPanel.svelte";
    import { type SatExpression, verifySatInstanceFormat, parseSatInstance, formatSatToInputString } from "../lib/sat";
    import { type SubsetSum, parseSubsetSumInput } from "../lib/ssp";

    let satInstance = $state(getRandomDemo(satDemos));
    let sat = $state<SatExpression>({ variables: [], clauses: [] });
    let satInput = $state("");
    let sspInput = $state("");
    let subsetSum = $state<SubsetSum>({ targetSum: [], numbers: [] });

    function onConvertClick() {
        if (!verifySatInstanceFormat(satInstance)) {
            satInput = "WRONG FORMAT :(";
            return;
        }

        sat = parseSatInstance(satInstance);
        satInput = formatSatToInputString(sat);

        sspInput = reduce("3SAT-SSP", satInput);
        subsetSum = parseSubsetSumInput(sspInput);
    }
</script>

<h1>3SAT to SSP</h1>
<hr />
<ReductionPanel
    inProblem={"3SAT"}
    outProblem={"SSP"}
    bind:inInstance={satInstance}
    inInput={satInput}
    outInput={sspInput}
    onConvertClick={onConvertClick}
    demoInstances={satDemos}
></ReductionPanel>

<h2>3SAT Formula</h2>
<BooleanFormula {sat} />

<h2>SubsetSum Table</h2>

<table>
    <colgroup>
        <col style="background-color:tomato">
        <col span={sat.variables.length} style="background-color:DodgerBlue">
        <col span={sat.clauses.length} style="background-color:aquamarine">
    </colgroup>
    <thead>
        <tr>
            {#if subsetSum.targetSum.length != 0}
                <th></th>
            {/if}
            {#each sat.variables as varName}
                <th>{varName}</th>
            {/each}
            {#each sat.clauses as clause,index}
                <th>{clause}</th>
            {/each}
        </tr>
    </thead>
    <tbody>
        {#each subsetSum.numbers as num, index}
            <tr>
                {#if index < (2 * sat.variables.length)}
                    <th>
                        v{Math.trunc(index / 2)}{#if index % 2 == 1}'{/if}
                    </th>
                {:else}
                    <th>s{Math.trunc((index / 2) - sat.variables.length)}{#if index % 2 == 1}'{/if}</th>
                {/if}
                {#each num as digit}
                    <td>{digit}</td>
                {/each}
            </tr>
        {/each}
        <tr>
            {#if subsetSum.targetSum.length != 0}
                <th>Target</th>
                {#each subsetSum.targetSum as digit}
                    <th>{digit}</th>
                {/each}
            {/if}
        </tr>
    </tbody>
</table>

<style>
    th {
        min-width: 32pt;
    }
    tr {
        text-align: center;
    }
</style>