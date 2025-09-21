<script lang="ts">
    import type { SatExpression } from "./sat";
    import katex from "katex";
    import "katex/dist/katex.min.css";

    let mathElement: HTMLElement;
    
    type Props = { sat: SatExpression, }
    
    let { sat }: Props = $props();
    
    $effect(() => {
        const math = sat.clauses
            .map(clause => "(" + clause.map(literal => literal.replace("!", " \\lnot ")).join(" \\lor ") + ")")
            .join(" \\land ");
        katex.render(math, mathElement);
    })
</script>

<div bind:this={mathElement}></div>
