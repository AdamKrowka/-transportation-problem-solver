## :truck: Transportation problem calculator :truck:

### What to use this program for:grey_question:

With this program you can easly calculate the cheapest cost of delivery products "Transportation Problem" using potentials method.

### Geting started :hammer:

To use this module you only have to install it via npm :relaxed:

```javascript
    npm install transportation-problem
```

or

```javascript
    npm i transportation-problem
```

### How to use:grey_question:

```javascript
import { TransportProblem } from "transportation-problem";

const tP = new TransportProblem();

const exampleDataTable = [
  [1, 3, 6, 4, 10],
  [3, 4, 5, 2, 20],
  [4, 4, 2, 1, 10],
  [6, 4, 2, 4, 10],
  [20, 20, 1, 9, 50]
];

tP.create(exampleDataTable);
```

## Possible usage

There is two possible ways to use this program:

1. One method to get solution

```javascript
const solution = tp.solution();
// solution = [
//  [10,   null, null],
//  [null, 10,   null],
//  [null, null, 10  ]
//];
```

2. The second way is to use the step by step method so that you can study how the minimum transport cost is calculated

```javascript
const nextStep = tp.nextStep();

// nextStep = {
//  data: [],
//  caseIndex = number,
//  desc =String a brief description of what was calculated in this step
// }
```
