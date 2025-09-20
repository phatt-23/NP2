<script>
    import { satDemos, getRandomDemo } from "../lib/demos";
    import { reduce } from "../lib/reduce";
    import { verifySatInstanceFormat, parseSatInstance, formatSatToInputString } from "../lib/sat";

    let satInstance = $state(getRandomDemo(satDemos));
    let satInput = $state("");
    let hamCycleInput = $state("");

    function onConvertClick() {
        if (!verifySatInstanceFormat(satInstance)) {
            satInput = "WRONG FORMAT :(";
            return;
        }

        const sat = parseSatInstance(satInstance);
        satInput = formatSatToInputString(sat);

        hamCycleInput = reduce("3SAT-HamCycle", satInput);
    }
</script>

<div>
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
</div>

<style>
    textarea {
        width: 30em;
        height: 20em;
    }
</style>
