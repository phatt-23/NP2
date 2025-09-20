<script>
  import Router, { link } from "svelte-spa-router";

  import Home from "./routes/Home.svelte";
  import SatToHamCycle from "./routes/SAT-HamCycle.svelte";
  import SatToSsp from "./routes/SAT-SSP.svelte";
  import HamCycleToHamCircuit from "./routes/HamCycle-HamCircuit.svelte";

  const routes = {
    "/": Home,
    "/3sat-to-hamcycle": SatToHamCycle,
    "/hamcycle-to-hamcircuit": HamCycleToHamCircuit,
    "/3sat-to-ssp": SatToSsp, 
  };
</script>

<nav>
  <a use:link href="/">NP2</a>
  <a use:link href="/3sat-to-hamcycle">3SAT to HamCycle</a>
  <a use:link href="/hamcycle-to-hamcircuit">HamCycle to HamCircuit</a>
  <a use:link href="/3sat-to-ssp">3SAT to SSP</a>
</nav>

<!-- the current route element gets put here -->
<Router {routes} useHass/> 

