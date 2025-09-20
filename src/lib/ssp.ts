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
