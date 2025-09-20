# NP2

Bachelor project.

## Questions to bring up during the next Consultation

> Ve specifikaci zadani je:
> "b) Zadat libovolnou instanci každého z problémů vyskytujících se v těchto převodech."
> Znamena to, ze jestli mam prevod od A do B, musim implementovat obe tak, 
> aby mohl uzivatel k obema problemum zadat vlastni instanci a dostat odpoved?

## What can it do?

- Solve user given instances of problems that occur in this project.
- Reduce instances of problems to instances of other problems (only some reductions are implemented).

The basic pipeline of reducing a problem A to B:

1. **A instance** string - in a way a human would write it
2. Parsed into **input** string - easily parsable, readable but more verbose
3. Reduction function 
    - given input string of problem A it outputs the input string of problem B
    - gives data about how the reduction was achieved, so the reduction can be explained step by step
4. Program solving problem B reads the input string and gives an answer.
    - if the answer is positive, a solution to problem A can be built from it

## Instance and Input Format

<details>
<summary>3SAT</summary>

Formula written normally with ORs and ANDs and groupings.

```
(x1 OR NOT x2 OR x3) AND (x2 OR x3)
(x1 || !x2 || x3) && (x2 || x3)
```

This formula gets parsed into a string that is easily parsable by other programs.

```
n m   // n = number of variables, m = number of clauses

x1    // n variables written below one another
x2
...
xn

x1 !x2 !x4 // m clauses with negation specified by "!" prefix
x2 x3
...
```
</details>

<details>
<summary>Graph</summary>

Instance consists of vertices and edges. If vertices are present in edges, they don't have to be specified by the user explicitely.
However if there is a singleton vertex, it must be written out as a single word on a line.
Edges can also be triplets if the problems requires it, i.e 3DM.
Edges can be weighted.

```
x_0
x_6
x_7
x_0 x_2
x_0 x_4 3   // weight 3
x_0 x_5 2   // weight 2
x_1 x_4
x_1 x_5
x_2 x_3
x_2 x_4
x_4 x_5
```

This instance gets converted into input string.

```
6 8  // number of vertices n and edges m

x_0  // vertices listed on n lines
x_1
x_2
x_3
x_4
x_5

x_0 x_2 // edges listed on m lines
x_0 x_4
x_0 x_5
x_1 x_4
x_1 x_5
x_2 x_3
x_2 x_4
x_4 x_5
```
</details>

<details>
<summary>SSP</summary>

Instance consists of the target sum as the first number. Next up are numbers in the (multi)set S.

```
1111333 

1000100 
1000010
100111
100000
10101
10010
1001
1000
100
100
10
10
1
1
```

Input is consistent with the number of digits on each line.

```
14 7    // n = number of numbers in the set S; m = number of digits they have 

1111333 // the target sum with m digits

1000100 // n numbers in set S with m digits
1000010
0100111
0100000
0010101
0010010
0001001
0001000
0000100
0000100
0000010
0000010
0000001
0000001
```
</details>

