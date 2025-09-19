# NP2

Bachelor project.

The data (input, steps, output) is completely separate from the program (visuals, graphs, formulas).

The basic pipeline of reducing a problem A to B:
    1. A_instance.txt
    2. Parsed into text file, that will be easily read by the visualisation module
    3. Reduction function
    4. Spits out two files: B_instance.txt and A_to_B_steps.txt

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

