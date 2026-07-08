const ConstrainedGA = require('./constrainedGA');

// Section 3.1: SALKIN Problem Setup
// Maximize: 3x1 + x2 + 2x3 + x4 - x5 -> Inverted to Minimize for the GA engine
const salkinObjective = (x) => -(3 * x[0] + x[1] + 2 * x[2] + x[3] - x[4]);

// Re-formulating g_i(x) <= Constant into g_i(x) - Constant <= 0
const g1 = (x) => (25 * x[0] - 40 * x[1] + 16 * x[2] + 21 * x[3] + x[4]) - 300;
const g2 = (x) => (x[0] + 20 * x[1] - 50 * x[2] + x[3] - x[4]) - 200;
const g3 = (x) => (60 * x[0] + x[1] - x[2] + 2 * x[3] + x[4]) - 600;
const g4 = (x) => (-7 * x[0] + 4 * x[1] + 15 * x[2] - x[3] + 65 * x[4]) - 700;

// Variable Bounds from paper: 5 dimensions
const salkinBounds = [
    [1.0, 4.0],     // x1
    [80.0, 88.0],   // x2
    [30.0, 35.0],   // x3
    [145.0, 150.0], // x4
    [0.0, 2.0]      // x5
];

const runsCount = 100;
const executionValues = [];
const executionFevals = [];

console.log(`Starting validation: Running SALKIN optimization ${runsCount} times...`);

for (let run = 1; run <= runsCount; run++) {
    const solver = new ConstrainedGA({
        objFunc: salkinObjective,
        inequalityConstraints: [g1, g2, g3, g4],
        bounds: salkinBounds,
        K: 200,       // K = 200
        iterMax: 200, // ITERMAX = 200
        lam: 1000.0   // \lambda = 10^3
    });

    const runResult = solver.solve();
    
    // Convert back to maximization scale by multiplying by -1
    executionValues.push(-runResult.value);
    executionFevals.push(runResult.fevalsSpent);
    
    if (run % 20 === 0) {
        console.log(`  > Completed ${run}/${runsCount} runs...`);
    }
}

// Compute statistics
const avgFevals = executionFevals.reduce((a, b) => a + b, 0) / runsCount;
const bestValue = Math.max(...executionValues); // Looking for max value now
const meanValue = executionValues.reduce((a, b) => a + b, 0) / runsCount;
const variance = executionValues.reduce((sum, val) => sum + Math.pow(val - meanValue, 2), 0) / runsCount;
const stdDeviation = Math.sqrt(variance);

// Benchmark Table Output
console.log("\n=======================================================");
console.log("           SALKIN PROBLEM BENCHMARK RESULTS            ");
console.log("=======================================================");
console.log(`Metric       |  Paper Table 2 Data  | Your Local Run JS`);
console.log("-------------------------------------------------------");
console.log(`FEVALS       |  7244               | ${Math.round(avgFevals)}`);
console.log(`BEST         |  320.0000           | ${bestValue.toFixed(4)}`);
console.log(`MEAN         |  320.0000           | ${meanValue.toFixed(4)}`);
console.log(`STD          |  0.0                | ${stdDeviation.toExponential(2)}`);
console.log("=======================================================");