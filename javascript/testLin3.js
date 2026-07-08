const ConstrainedGA = require('./constrainedGA');

// Section 3.1: LIN3 Problem Setup
const lin3Objective = (x) => 0.01 * x[0]*x[0] + x[1]*x[1];

// Inverting paper's >= 0 constraints to meet our engine's <= 0 input format
const g1 = (x) => -(x[0] * x[1] - 25);
const g2 = (x) => -(x[0]*x[0] + x[1]*x[1] - 25);

const lin3Bounds = [
    [2.0, 50.0], // x1
    [0.0, 50.0]  // x2
];

const runsCount = 100;
const executionValues = [];
const executionFevals = [];

console.log(`Starting validation: Running LIN3 optimization ${runsCount} times...`);

for (let run = 1; run <= runsCount; run++) {
    const solver = new ConstrainedGA({
        objFunc: lin3Objective,
        inequalityConstraints: [g1, g2],
        bounds: lin3Bounds,
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

const avgFevals = executionFevals.reduce((a, b) => a + b, 0) / runsCount;
const bestValue = Math.min(...executionValues);
const meanValue = executionValues.reduce((a, b) => a + b, 0) / runsCount;
const variance = executionValues.reduce((sum, val) => sum + Math.pow(val - meanValue, 2), 0) / runsCount;
const stdDeviation = Math.sqrt(variance);

console.log("\n=======================================================");
console.log("           LIN3 PROBLEM BENCHMARK RESULTS              ");
console.log("=======================================================");
console.log(`Metric       |  Paper Table 2 Data  | Your Local Run JS`);
console.log("-------------------------------------------------------");
console.log(`FEVALS       |  15516              | ${Math.round(avgFevals)}`);
console.log(`BEST         |  5.0000             | ${bestValue.toFixed(4)}`);
console.log(`MEAN         |  5.0010             | ${meanValue.toFixed(4)}`);
console.log(`STD          |  2.78e-3            | ${stdDeviation.toExponential(2)}`);
console.log("=======================================================");