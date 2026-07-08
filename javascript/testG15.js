const ConstrainedGA = require('./constrainedGA');

// Section 3.1: G15 Problem Setup
const g15Objective = (x) => {
    return 1000 - x[0]*x[0] - 2*x[1]*x[1] - x[2]*x[2] - x[0]*x[1] - x[0]*x[2];
};

// Equality constraints h_j(x) = 0
const h1 = (x) => Math.pow(x[0], 2) + Math.pow(x[1], 2) + Math.pow(x[2], 2) - 25;
const h2 = (x) => 8*x[0] + 14*x[1] + 7*x[2] - 56;

const g15Bounds = [
    [0.0, 10.0], // x1
    [0.0, 10.0], // x2
    [0.0, 10.0]  // x3
];

const runsCount = 100;
const executionValues = [];
const executionFevals = [];

console.log(`Starting validation: Running G15 optimization ${runsCount} times...`);

for (let run = 1; run <= runsCount; run++) {
    const solver = new ConstrainedGA({
        objFunc: g15Objective,
        inequalityConstraints: [],
        equalityConstraints: [h1, h2], // Handled via our engine's h array
        bounds: g15Bounds,
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
console.log("            G15 PROBLEM BENCHMARK RESULTS              ");
console.log("=======================================================");
console.log(`Metric       |  Paper Table 2 Data  | Your Local Run JS`);
console.log("-------------------------------------------------------");
console.log(`FEVALS       |  3593               | ${Math.round(avgFevals)}`);
console.log(`BEST         |  961.71515          | ${bestValue.toFixed(5)}`);
console.log(`MEAN         |  961.71516          | ${meanValue.toFixed(5)}`);
console.log(`STD          |  1.88e-5            | ${stdDeviation.toExponential(2)}`);
console.log("=======================================================");