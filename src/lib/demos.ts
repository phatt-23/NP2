export function getRandomDemo(demos: string[]) {
    return demos[Math.trunc(Math.random() * demos.length)];
}

export const satDemos = [
    "(a or b ||c) and (not a or b OR !c) &&(a or b ||c) and (not e or b OR !d)",
    "(a or b or c) and (not a or b or not c)",
    "(a or a or c) and (not a or b or not b)", // multiple occurences of the same variable in a single clause, parser will get rid of duplicates in a single clause
    "(a OR b OR c) AND (NOT a OR b OR NOT c) AND (c OR b OR d)",
];

// user can provide vertices by writing one node name on a line, edges by writing two nodes on a line
// when writing edges, user doesn't have to write vertex before it, as it will automatically add the vertex to the graph
// if the vertex exists only by itself is not part of any other edge, it is be a singleton vertex
export const graphDemos = [
// vertices + edges
`0
1
2
3
4
5
6
7
0 2
0 4
0 5
1 4
1 5
2 3
2 4
4 5
`,
// singleton vertices + edges
`6
7
0 2
0 4
0 5
1 4
1 5
2 3
2 4
4 5
`,
// vertices only
`0
1
2
3
4
5
6
7
`,
// edges only
`
0 2
0 4
0 5
1 4
1 5
2 3
2 4
4 5
`,
`
x_0 x_2
x_0 x_4
x_0 x_5
x_1 x_4
x_1 x_5
x_2 x_3
x_2 x_4
x_4 x_5
`
];
