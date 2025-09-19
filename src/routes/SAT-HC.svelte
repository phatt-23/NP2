<script>
  import { verify3SatFormat, parseInput } from "../lib/sat";

  let inputText = $state('(a or b or c) and (not a or b or not c)');
  let outputText = $state('');

  function onConvertClick() {
    if (!verify3SatFormat(inputText)) {
      console.error("WRONG FORMAT: " + inputText);
      return;
    }

    const data = parseInput(inputText);
    outputText = [...data.variables.values()] + '\n\n' + data.clauses.join('\n');
  }
</script>

<div>
  <h1>
    3SAT to HC
  </h1>

  <textarea bind:value={inputText}>
  </textarea>

  <button onclick={onConvertClick}>
    Convert
  </button>

  <textarea bind:value={outputText} readonly>
  </textarea>
</div>

<style>
  textarea {
    width: 30em; 
    height: 10em;
  }
</style>
