const ConstrainedGA = require('./constrainedGA');

// Section 3.1: LIN2 Problem Setup
// min f(x) = -x1 - x2
const lin2Objective = (x) => -x[0] - x[1];

// Inverting paper's >= 0 constraints to meet our engine's <= 0 input format
const g1 = (x) => -(2 * Math.pow(x[0], 4) - 8 * Math.pow(x[0], 3) + 8 * Math.pow(x[0], 2) - x[1] + 2);
const g2 = (x) => -(4 * Math.pow(x[0], 4) - 32 * Math.pow(x[0], 3) + 88 * Math.pow(x[0], 2) - 96 * x[0] - x[1] + 36);

const lin2Bounds = [
    [0.0, 3.0], // x1 bounds
    [0.0, 4.0]  // x2 bounds
];

const runsCount = 100;
const executionValues = [];
const executionFevals = [];

console.log(`Starting validation: Running LIN2 optimization ${runsCount} times...`);

for (let run = 1; run <= runsCount; run++) {
    const solver = new ConstrainedGA({
        objFunc: lin2Objective,
        inequalityConstraints: [g1, g2],
        bounds: lin2Bounds,
        K: 200,
        iterMax: 200,
        lam: 1000.0
    });

    const runResult = solver.solve();
    executionValues.push(runResult.value);
    executionFevals.push(runResult.fevalsSpent);
    
    if (run % 20 === 0) {
        console.log(`  > Completed ${run}/${runsCount} runs...`);
    }
}

// Compute statistics
const avgFevals = executionFevals.reduce((a, b) => a + b, 0) / runsCount;
const bestValue = Math.min(...executionValues);
const meanValue = executionValues.reduce((a, b) => a + b, 0) / runsCount;
const variance = executionValues.reduce((sum, val) => sum + Math.pow(val - meanValue, 2), 0) / runsCount;
const stdDeviation = Math.sqrt(variance);

// Benchmark Table Output
console.log("\n=======================================================");
console.log("           LIN2 PROBLEM BENCHMARK RESULTS              ");
console.log("=======================================================");
console.log(`Metric       |  Paper Table 2 Data  | Your Local Run JS`);
console.log("-------------------------------------------------------");
console.log(`FEVALS       |  2431               | ${Math.round(avgFevals)}`);
console.log(`BEST         |  -5.5080            | ${bestValue.toFixed(4)}`);
console.log(`MEAN         |  -5.5080            | ${meanValue.toFixed(4)}`);
console.log(`STD          |  2.17e-1            | ${stdDeviation.toExponential(2)}`);
console.log("=======================================================");