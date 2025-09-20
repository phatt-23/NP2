# NP2

Bachelor project.

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

## 3SAT Instance

Formula written normally with ORs and ANDs and groupings.

```
(x1 OR NOT x2 OR x3) AND (x2 OR x3)
(x1 || !x2 || x3) && (x2 || x3)
```

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

