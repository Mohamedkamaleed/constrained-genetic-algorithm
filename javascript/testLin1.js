const ConstrainedGA = require('./constrainedGA');

// Section 3.1: LIN1 Problem Setup
// min f(x) = 100*(x2 - x1^2)^2 + (1 - x1)^2
const lin1Objective = (x) => {
    return 100 * Math.pow(x[1] - Math.pow(x[0], 2), 2) + Math.pow(1 - x[0], 2);
};

// Inverting paper's >= 0 constraints to meet our engine's <= 0 input format
const g1 = (x) => -(x[0] + Math.pow(x[1], 2));
const g2 = (x) => -(Math.pow(x[0], 2) + x[1]);

const lin1Bounds = [
    [-0.5, 0.5], // x1 bounds
    [-2.0, 10.0] // x2 bounds (x2 <= 10, lower bound handled by initialization safety)
];

const runsCount = 100;
const executionValues = [];
const executionFevals = [];

console.log(`Starting validation: Running LIN1 optimization ${runsCount} times...`);

for (let run = 1; run <= runsCount; run++) {
    const solver = new ConstrainedGA({
        objFunc: lin1Objective,
        inequalityConstraints: [g1, g2],
        bounds: lin1Bounds,
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
console.log("           LIN1 PROBLEM BENCHMARK RESULTS              ");
console.log("=======================================================");
console.log(`Metric       |  Paper Table 2 Data  | Your Local Run JS`);
console.log("-------------------------------------------------------");
console.log(`FEVALS       |  5633               | ${Math.round(avgFevals)}`);
console.log(`BEST         |  0.2500             | ${bestValue.toFixed(4)}`);
console.log(`MEAN         |  0.2500             | ${meanValue.toFixed(4)}`);
console.log(`STD          |  6.78e-7            | ${stdDeviation.toExponential(2)}`);
console.log("=======================================================");