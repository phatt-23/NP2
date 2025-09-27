<script lang="ts">
    let { 
        inProblem,
        outProblem,
        inInstance = $bindable(), 
        inInput, 
        outInput, 
        onConvertClick,
        demoInstances,
    } = $props();
</script>

<div style="display: flex;">
    <div>
        <h2>{inProblem} instance</h2>
        <textarea
            bind:value={inInstance}
            placeholder="Original instance to this problem..."
        >
        </textarea>
    </div>
    <div>
        <h2>{inProblem} input</h2>
        <textarea
            bind:value={inInput}
            readonly
            placeholder="Input generated from instance..."
        >
        </textarea>
    </div>
    <div>
        <h2>{outProblem} input</h2>
        <textarea
            bind:value={outInput}
            readonly
            placeholder="Reduced input..."
        >
        </textarea>
    </div>
</div>

<button onclick={onConvertClick}>Convert</button>

<select bind:value={inInstance}>
    {#each demoInstances as value, index}
        <option {value}>{index}</option>
    {/each}
</select>

<style>
    textarea {
        width: 30em;
        height: 20em;
    }

</style>
