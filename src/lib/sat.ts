const NEGATION = /(?:not\s+|!\s*)/i;
const LITERAL = new RegExp('(' + NEGATION.source + '?(?:\\w+))', "i");
const OR = /(?:\s+(?:or|OR)\s+|\s*\|\|\s*)/i;
const AND = /(?:\s*(?:and|AND|&&)\s*)/i;
const CLAUSE = new RegExp('\\(\\s*' + '(?:' + LITERAL.source + OR.source + ')?' + '(?:' + LITERAL.source + OR.source + ')?' + LITERAL.source + '\\s*\\)', "i");
const REG_3SAT = new RegExp('^\\s*' + '(?:' + CLAUSE.source + AND.source + ')*' + CLAUSE.source + '\\s*$', "i");

// Verifies the format of the sat formula.
export function verifySatInstanceFormat(instance: string): boolean {
    return REG_3SAT.test(instance);
}

export type SatExpression = {
    variables: string[];
    clauses: string[][];
};

type ParseInstanceOptions = {
    includeNegations: boolean;
    removeDuplicateLiterals: boolean;
};

// Parses the sat formula into an object.
export function parseSatInstance(
    instance: string,
    options: ParseInstanceOptions = {
        includeNegations: false,
        removeDuplicateLiterals: true,
    },
): SatExpression {
    const clausesStr: string[] = instance.split(AND).map(s => s.replace("(", "").replace(")", ""))

    let variables = new Set<string>();
    let clauses = new Array<string[]>();

    // put the clause into data
    for (let clause of clausesStr) {
        let literals = clause
            .split(OR)
            .map(lit => lit.replace(NEGATION, "!"));

        if (options.removeDuplicateLiterals) {
            let uniqueLiterals = new Set<string>();
            literals.forEach(lit => uniqueLiterals.add(lit));
            literals = [...uniqueLiterals.values()];
        }

        // add the clause to data
        clauses.push([...literals]);

        // add literals of the clause into data as well
        for (let lit of literals) {
            if (!options.includeNegations)
              lit = lit.replace("!", "");
            variables.add(lit);
        }
    }

    return { 
        variables: [...variables.values()].sort(), 
        clauses,
    };
}

// Converts the sat formula written in standard way 
// to a format that is easily read by othrer programs/functions.
export function formatSatToInputString(sat: SatExpression): string {
    return (
        sat.variables.length + " " + sat.clauses.length +
        "\n\n" +
        [...sat.variables.values()].join("\n") +
        "\n\n" +
        [...sat.clauses.map((clause) => clause.join(" "))].join("\n")
    );
}

// Parse sat input text back into sat object.
export function parseSatInput(input: string): SatExpression {
    const lines = input.split('\n').filter(line => line.length !== 0);

    if (lines.length === 0) {
        throw new Error("Sat input is empty.");
    }

    // pop front, split by space and map to ints
    const [variableCount, _clauseCount] = lines.shift()!.split(' ').map(n => Number.parseInt(n))

    const variables = lines.splice(0, variableCount);
    const clauses = lines.map(line => line.split(' '));

    return { variables, clauses };
}
