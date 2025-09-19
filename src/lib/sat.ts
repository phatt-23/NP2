const NEGATION = /(?:not\s+|!\s*)/i;
const LITERAL = new RegExp('(' + NEGATION.source + '?(?:\\w+))', "i");
const OR = /(?:\s+(?:or|OR)\s+|\s*\|\|\s*)/i;
const AND = /(?:\s+(?:and|AND)\s+|\s*&&\s*)/i;
const CLAUSE = new RegExp('\\(\\s*' + '(?:' + LITERAL.source + OR.source + ')?' + '(?:' + LITERAL.source + OR.source + ')?' + LITERAL.source + '\\s*\\)', "i");
const REG_3SAT = new RegExp('^\\s*' + '(?:' + CLAUSE.source + AND.source + ')*' + CLAUSE.source + '\\s*$' , "i");

export function verify3SatFormat(inputText: string): boolean {
  return REG_3SAT.test(inputText);
}

export type SatExpression = {
  clauses: string[][];
  variables: Set<string>;
};

export function parseInput(text: string, includeNegations = false): SatExpression {
  let data: SatExpression = {
    clauses: [],
    variables: new Set(),
  };

  const clauses: string[] = text.split(AND).map(s => s.replace("(", "").replace(")", ""))

  for (let clause of clauses) {
    const literals = clause.split(OR);

    for (let lit of literals) {
      if (!includeNegations)
        lit = lit.replace(NEGATION, "");
      data.variables.add(lit);
    };

    data.clauses.push([...literals]);
  }
  
  return data;
}

