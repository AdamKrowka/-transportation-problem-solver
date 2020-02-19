export class TransportProblem {
  constructor() {
    this.entryTable = [];
    this.solution = [];
    this.cost = [];
    this.demand = [];
    this.supply = [];
    this.optimalCost = 0;
    this.isOptimal = false;
    this.cycle = [];
    this.cycleEnded = false;
    this.next = 1;
    this.return = 0;
    this.notBaseCell = { X: [], Y: [] };
    this.notBaseCells = [];
    this.T = 0;
  }

  create = table => {
    this.entryTable = table;

    // Filling supply table with last column from this.entryTable table
    for (let i = 0; i < this.entryTable.length - 1; i++) {
      this.supply.push(this.entryTable[i][this.entryTable[i].length - 1]);
    }

    // filling demand table with last row from this.entryTable table
    for (let i = 0; i < this.entryTable[this.entryTable.length - 1].length - 1; i++) {
      this.demand.push(this.entryTable[this.entryTable.length - 1][i]);
    }

    let sumOfDemand = 0;
    let sumOfSupply = 0;

    this.demand.forEach(amount => (sumOfDemand += amount));
    this.demand.forEach(amount => (sumOfSupply += amount));

    // If Problem is Unbalanced create a new demand or supply for creating balanced Trransportation Problem
    if (sumOfSupply !== sumOfDemand) {
      let diff = Math.abs(sumOfSupply - sumOfDemand);
      if (sumOfDemand < sumOfSupply) {
        this.demand.push(diff);
        this.entryTable.forEach((row, index) => {
          if (index === this.entryTable.length - 1) row.splice(row.length - 1, 0, diff);
          else row.splice(row.length - 1, 0, 0);
        });
      } else if (sumOfDemand > sumOfSupply) {
        let temptable = this.entryTable[0].map((cell, index) =>
          index === this.entryTable[0].length - 1 ? diff : 0
        );
        this.entryTable.splice(this.entryTable.length - 1, 0, temptable);
        this.supply.push(diff);
      }
    }

    // Filling cost table
    this.cost = [];
    for (let i = 0; i < this.entryTable.length - 1; i++) {
      let row = [];
      for (let j = 0; j < this.entryTable[i].length - 1; j++) row.push(this.entryTable[i][j]);
      this.cost.push(row);
    }
  };

  // 1. North west corner method

  northWestCorner = () => {
    let result = this.cost.map(wiersz => wiersz.map(() => null));
    let supply = this.supply.map(elem => elem);
    let demand = this.demand.map(elem => elem);

    result.forEach((row, x) =>
      row.forEach((cell, y) => {
        if (result[x][y] == null)
          if (supply[x] !== 0 && demand[y] !== 0) {
            let value = supply[x] > demand[y] ? demand[y] : supply[x];
            result[x][y] = value;
            supply[x] -= value;
            demand[y] -= value;
          }
        if (supply[x] === 0 && demand[y] === 0) {
          if (x < result.length - 1) result[x + 1][y] = 0;
          else if (y < result[x].length - 1) result[x][y + 1] = 0;
        }
      })
    );
    this.solution = result;
  };

  // 2. Method of potentials

  basePotentials = () => {
    let Y = this.supply.map(() => null);
    let X = this.demand.map(() => null);

    Y[0] = 0;
    let flag = false;
    while (this.hasEmpty(Y) || this.hasEmpty(X)) {
      flag = false;
      for (let y = 0; y <= this.solution.length; y++) {
        for (let x = 0; x <= this.solution[y].length; x++) {
          if (this.solution[y][x] != null) {
            if (X[x] != null ? Y[y] == null : Y[y] != null) {
              if (X[x] == null) X[x] = this.cost[y][x] - Y[y];
              else if (Y[y] == null) Y[y] = this.cost[y][x] - X[x];
              flag = true;
              break;
            }
          }
        }
        if (flag) break;
      }
    }
    this.notBaseCell.Y = Y.map(e => e);
    this.notBaseCell.X = X.map(e => e);
    return { Y, X };
  };

  // 3. Potential methods for not base cells
  notBasePotentials = () => {
    const { X, Y } = this.return;
    let potentials = this.cost.map(row => row.map(cell => cell));

    this.solution.forEach((row, y) =>
      row.forEach((cell, x) => {
        if (this.solution[y][x] == null) {
          potentials[y][x] = X[x] + Y[y];
        }
      })
    );
    return potentials;
  };

  // 3. Checking if its optimal solution
  isOptimal = () => {
    let moreThanZero = false;
    let potential = this.return;
    potential.forEach((wiersz, y) =>
      wiersz.forEach((elem, x) => {
        potential[y][x] = potential[y][x] - this.cost[y][x];
        if (potential[y][x] > 0) moreThanZero = true;
      })
    );
    if (!moreThanZero) {
      this.isOptimal = true;
      return true;
    } else {
      return false;
    }
  };

  largestNumber = potentials => {
    let maxVal = 0;
    let max = [];
    let newMax;
    let start;
    potentials.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === maxVal) max.push({ y, x });
        else if (cell > maxVal) {
          max = [];
          maxVal = cell;
          max.push({ y, x });
        }
      });
    });
    if (max.length === 1) {
      start = max[0];
    } else {
      let minCost = max[0].cost;
      newMax = max[0];
      max.forEach(e => {
        if (e.cost < minCost) newMax = e;
      });
      start = newMax;
    }
    return start;
  };

  cycle = () => {
    let start = this.return;
    this.solution[start.y][start.x] = 0;
    this.cycle = [];
    this.cycleEnded = false;
    for (let i = 0; i < this.cost[start.y].length; i++) {
      if (this.solution[start.y][i] != null && i !== start.x && !this.cycleEnded)
        this.path(
          start,
          { y: start.y, x: i },
          this.cost.length + this.cost[start.y].length - 1,
          "col",
          start
        );
    }
  };

  hasInRow = elem => {
    let flag = false;
    for (let x = 0; x < this.solution[elem.y].length; x++) {
      if (this.solution[elem.y][x] != null) {
        flag = true;
      }
    }
    return flag;
  };

  hasInCol = elem => {
    let flag = false;
    for (let y = 0; y < this.solution.length; y++) {
      if (this.solution[y][elem.x] != null) {
        flag = true;
      }
    }
    return flag;
  };

  path = (start, actual, depth, dir, prev) => {
    let path = [];
    if (actual.y === start.y && actual.x === start.x) {
      this.cycle.push({
        y: actual.y,
        x: actual.x,
        value: this.solution[actual.y][actual.x]
      });
      this.cycleEnded = true;
      return [prev];
    }
    if (depth < 0) return null;
    else if (!this.cycleEnded) {
      if (dir === "col") {
        if (this.hasInCol(actual)) {
          for (let i = 0; i < this.solution.length; i++) {
            if (this.solution[i][actual.x] != null && i !== actual.y)
              path.push(this.path(start, { x: actual.x, y: i }, depth - 1, "row", actual));
          }
        }
      } else if (dir === "row") {
        if (this.hasInRow(actual)) {
          for (let i = 0; i < this.solution[actual.y].length; i++) {
            if (this.solution[actual.y][i] != null && i !== actual.x)
              path.push(this.path(start, { x: i, y: actual.y }, depth - 1, "col", actual));
          }
        }
      }
      if (this.cycleEnded) {
        this.cycle.push({
          y: actual.y,
          x: actual.x,
          value: this.solution[actual.y][actual.x]
        });
      }
      return path;
    }
  };

  minimallElementOfCycle = () => {
    let min = { x: undefined, y: undefined, value: Infinity };
    for (let i = 0; i < this.cycle.length; i++) {
      if (i % 2 === 1) {
        if (
          min.value > this.cycle[i].value ||
          (min.value === this.cycle[i].value &&
            this.cost[min.y][min.x] < this.cost[this.cycle[i].y][this.cycle[i].x])
        )
          min = {
            x: this.cycle[i].x,
            y: this.cycle[i].y,
            value: this.cycle[i].value
          };
      }
    }
    return min;
  };

  moveTValue = () => {
    let min = this.minimallElementOfCycle();

    for (let i = 0; i < this.cycle.length; i++) {
      if (i % 2 === 0) this.solution[this.cycle[i].y][this.cycle[i].x] += min.value;
      if (i % 2 === 1) this.solution[this.cycle[i].y][this.cycle[i].x] -= min.value;
    }
    this.solution[min.y][min.x] = null;
  };

  hasEmpty = table => {
    for (let i = 0; i < table.length; i++) {
      if (table[i] == null) return true;
    }
    return false;
  };

  getResolution = () => {
    let table = this.entryTable.map(row => row.map(e => e));
    for (let i = 0; i < this.solution.length; i++)
      for (let j = 0; j < this.solution[i].length; j++) table[i][j] = this.solution[i][j];

    return table;
  };

  getNotBaseCells = () => {
    let table = this.entryTable.map(row => row.map(e => e));
    for (let i = 0; i < this.return.length; i++)
      for (let j = 0; j < this.return[i].length; j++)
        if (this.solution[i][j] === null) table[i][j] = this.return[i][j] - this.cost[i][j];
        else table[i][j] = null;

    for (let i = 0; i < this.notBaseCell.Y.length; i++)
      table[i][table[i].length - 1] = this.notBaseCell.Y[i];

    for (let i = 0; i < this.notBaseCell.X.length; i++)
      table[table.length - 1][i] = this.notBaseCell.X[i];
    this.notBaseCells = table.map(e => e.map(ee => ee));
    return table;
  };

  getBaseCells = () => {
    let table = this.entryTable.map(row => row.map(e => e));
    for (let i = 0; i < table.length - 1; i++)
      for (let j = 0; j < table[i].length - 1; j++)
        if (this.solution[i][j] !== null) table[i][j] = this.cost[i][j];
        else table[i][j] = null;
    for (let i = 0; i < this.return.Y.length; i++) table[i][table[i].length - 1] = this.return.Y[i];

    for (let i = 0; i < this.return.X.length; i++) table[table.length - 1][i] = this.return.X[i];

    return table;
  };

  solution = () => {
    while (!this.isOptimal) {
      this.nextStep();
    }
    return this.getResolution();
  };

  nextStep = () => {
    switch (this.next) {
      case 0:
        for (let i = 0; i < this.solution.length; i++) {
          for (let j = 0; j < this.solution[i].length; j++) {
            this.optimalCost += this.solution[i][j] * this.cost[i][j];
          }
        }
        return {
          data: this.getResolution(),
          caseIndex: 0,
          desc: "Optimal Resolution"
        };
      case 1:
        this.northWestCorner();
        this.next = 2;
        return {
          data: this.getResolution(),
          caseIndex: 1,
          desc: "North West Cornet Method"
        };
      case 2:
        this.return = this.basePotentials();
        this.next = 3;
        return {
          data: this.getBaseCells(),
          caseIndex: 2,
          desc: "Calculating base potentials"
        };

      case 3:
        this.return = this.notBasePotentials();
        this.next = 4;
        return {
          data: this.getNotBaseCells(),
          caseIndex: 3,
          desc: "Calculating not base potentials"
        };
      case 4:
        if (this.isOptimal()) {
          this.next = 0;
          return this.nextStep();
        } else {
          this.next = 5;
          return {
            data: this.nextStep(),
            caseIndex: 5,
            desc: "not optimal resolution"
          };
        }
      case 5:
        this.return = this.largestNumber(this.return);
        this.next = 6;
        return this.return;

      case 6:
        this.cycle();
        this.next = 7;
        this.T = this.minimallElementOfCycle();
        return {
          data: {
            cycle: this.cycle,
            t: this.T
          },
          caseIndex: 6,
          desc: " Creating cycle"
        };
      case 7:
        this.moveTValue();
        this.next = 2;
        return {
          data: this.getResolution(),
          caseIndex: 7,
          desc: "Moving T value in the cycle"
        };
      default:
        break;
    }
  };
}
