# NP2

Bachelor project.

## What can it do?

- Solve user given instances of problems that occur in this project.
- Reduce instances of problems to instances of other problems (only some reductions are implemented).

The basic pipeline of reducing a problem A to B:

1. **A instance** string - in a way that human would write it
2. Parsed into **input** string - easily parsable
3. Reduction function 
    - given input string it outputs the input string of the other problem
    - gives data about how the reduction was achieved, so the reduction can be explained step by step
4. Program solving problem B read the input string and gives an answer.
    - if the answer is positive, we can find solution to problem A

## 3SAT Instance

Formula written normally with ORs and ANDs and groupings.

## 3SAT Input

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

## 3SAT to HC

Pipeline: 3SAT formula -> input.txt -> Reduction(3SAT, HC) -> (output.txt, steps.txt).

The graph and TeX visualisation of the input instance, reduction steps and output instance
is done with by reading in the input.txt, steps.txt and output.txt.

### Conversion from 3SAT formula to text file

Given:

```
(a or b or c) and (not a or b or not c)
```

The program converts this into a text file:

```
3 2
a,b,c
a,b,c
not a,b,not c
```

The first line contains the number of variables **m** and clauses **n**.

The next line contains **m** names of the variables.

The next **n** lines are the clauses. Specifically the literals in every 3CNF clause.
Therefore, on each of these **n** lines, there are at most 3 literals.

