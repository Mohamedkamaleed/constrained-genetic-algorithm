const ConstrainedGA = require('./constrainedGA');

// Section 3.1: HIMMELBLAU Problem Setup
const himmelblauObjective = (x) => {
    return 4.3 * x[0] + 31.8 * x[1] + 63.3 * x[2] + 15.8 * x[3] + 68.5 * x[4] + 4.7 * x[5];
};

// Inverting paper's >= 0 constraints to meet the code's <= 0 input format
const g1 = (x) => -(17.1 * x[0] + 38.2 * x[1] + 204.2 * x[2] + 212.3 * x[3] + 623.4 * x[4] + 1495.5 * x[5] 
                    - 169 * x[0] * x[2] - 3580 * x[2] * x[4] - 3810 * x[3] * x[4] - 18500 * x[3] * x[5] 
                    - 24300 * x[4] * x[5] - 4.97);

const g2 = (x) => -(1.88 + 17.9 * x[0] + 36.8 * x[1] + 113.9 * x[2] + 169.7 * x[3] + 337.8 * x[4] 
                    + 1385.2 * x[5] - 139 * x[0] * x[2] - 2450 * x[3] * x[4] - 600 * x[3] * x[5] 
                    - 17200 * x[4] * x[5]);

const g3 = (x) => -(429.08 - 273 * x[1] - 70 * x[3] - 819 * x[4] + 26000 * x[3] * x[4]);

const g4 = (x) => -(159.9 * x[0] - 311 * x[1] + 587 * x[3] + 391 * x[4] + 2198 * x[5] - 14000 * x[0] * x[5] + 78.02);

// Variable Bounds from paper (6 Dimensions)
const himmelblauBounds = [
    [0.0, 0.31],
    [0.0, 0.046],
    [0.0, 0.068],
    [0.0, 0.042],
    [0.0, 0.028],
    [0.0, 0.0134]
];

const runsCount = 100;
const executionValues = [];
const executionFevals = [];

console.log(`Starting validation: Running HIMMELBLAU optimization ${runsCount} times...`);

for (let run = 1; run <= runsCount; run++) {
    const solver = new ConstrainedGA({
        objFunc: himmelblauObjective,
        inequalityConstraints: [g1, g2, g3, g4],
        bounds: himmelblauBounds,
        K: 200,       // K = 200
        iterMax: 200, // ITERMAX = 200
        lam: 1000.0   // \lambda = 10^3
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
console.log("         HIMMELBLAU PROBLEM BENCHMARK RESULTS          ");
console.log("=======================================================");
console.log(`Metric       |  Paper Table 2 Data  | Your Local Run JS`);
console.log("-------------------------------------------------------");
console.log(`FEVALS       |  23539              | ${Math.round(avgFevals)}`);
console.log(`BEST         |  0.01561            | ${bestValue.toFixed(5)}`);
console.log(`MEAN         |  0.01563            | ${meanValue.toFixed(5)}`);
console.log(`STD          |  5.71e-5            | ${stdDeviation.toExponential(2)}`);
console.log("=======================================================");