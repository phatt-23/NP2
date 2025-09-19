<script>
  import Router, { link } from "svelte-spa-router";
  import wrap from "svelte-spa-router/wrap";

  import Home from "./routes/Home.svelte";
  import SATtoHC from "./routes/SAT-HC.svelte";
  import SATtoSSP from "./routes/SAT-SSP.svelte";
  import HCtoHK from "./routes/HC-HK.svelte";

  const routes = {
    "/": Home,
    "/sat-to-hc": SATtoHC,
    "/hc-to-hk": HCtoHK,
    "/sat-to-ssp": SATtoSSP, 
  };
</script>

<nav>
  <a use:link href="/">Home</a>
  <a use:link href="/sat-to-hc">SAT to HC</a>
  <a use:link href="/hc-to-hk">HC to HK</a>
  <a use:link href="/sat-to-ssp">SAT to SSP</a>
</nav>

<Router {routes} useHass/>
