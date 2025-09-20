<script>
    import Router, { link } from "svelte-spa-router";

    import Home from "./routes/Home.svelte";
    import SatToHamCycle from "./routes/SAT-HamCycle.svelte";
    import SatToSsp from "./routes/SAT-SSP.svelte";
    import HamCycleToHamCircuit from "./routes/HamCycle-HamCircuit.svelte";
    import HamCircuitToTsp from "./routes/HamCircuit-TSP.svelte";
    import SatTo3dm from "./routes/SAT-3DM.svelte"

    const routes = {
        "/": Home,
        "/3sat-to-hamcycle": SatToHamCycle,
        "/hamcycle-to-hamcircuit": HamCycleToHamCircuit,
        "/hamcircuit-to-tsp": HamCircuitToTsp,
        "/3sat-to-ssp": SatToSsp,
        "/3sat-to-3dm": SatTo3dm,
    };
</script>

<nav>
    <a use:link href="/">NP2</a>
    <a use:link href="/3sat-to-hamcycle">3SAT to HamCycle</a>
    <a use:link href="/hamcycle-to-hamcircuit">HamCycle to HamCircuit</a>
    <a use:link href="/hamcircuit-to-tsp">HamCircuit to TSP</a>
    <a use:link href="/3sat-to-ssp">3SAT to SSP</a>
    <a use:link href="/3sat-to-3dm">3SAT to 3DM</a>
</nav>

<!-- the current route element gets put here -->
<Router {routes} useHass />

<style>
    a {
        background: gray;
    }
</style>
