export type SubsetSum = {
    targetSum: number[];
    numbers: number[][];
};

export function formatSubsetSumToInputString(ssp: SubsetSum): string {
    return ssp.numbers.length + " " + ssp.numbers[0].length +
        "\n\n" + 
        ssp.targetSum.join("") + 
        "\n\n" + 
        ssp.numbers.map(n => n.join("")).join("\n");
}

export function parseSubsetSumInput(input: string): SubsetSum {

    const lines = input.split("\n").filter(line => line.length != 0);

    if (lines.length == 0) {
        throw new Error("SubsetSum input is empty.");
    }

    const [numberCount, digitCount] = lines.shift()!.split(" ").map(a => Number.parseInt(a));

    const targetSum = lines.shift()!.split("").map(a => Number.parseInt(a));
    const numbers = lines.map(line => line.split("").map(a => Number.parseInt(a)));
    
    return {
        targetSum: targetSum,
        numbers: numbers,
    };
}