const ConstrainedGA = require('./constrainedGA');

// Section 3.1: CHOOTINAN1 Problem Formulation
// min f(x) = 5*sum_{i=1}^4 x_i - 5*sum_{i=1}^4 x_i^2 - sum_{i=1}^13 x_i
const chootinan1Objective = (x) => {
    let sum1 = 0;
    for (let i = 0; i < 4; i++) {
        sum1 += x[i];
    }
    
    let sum2 = 0;
    for (let i = 0; i < 4; i++) {
        sum2 += x[i] * x[i];
    }
    
    let sum3 = 0;
    for (let i = 0; i < 13; i++) {
        sum3 += x[i];
    }
    
    return 5 * sum1 - 5 * sum2 - sum3;
};

// Math Fix: The constraints must be strictly parsed.
// Original: g_i(x) >= 0. Formatted for engine: -g_i(x) <= 0.
const g1 = (x) => -(10 - (2 * x[0] + 2 * x[1] + x[9] + x[10]));
const g2 = (x) => -(10 - (2 * x[0] + 2 * x[2] + x[9] + x[11]));
const g3 = (x) => -(10 - (2 * x[1] + 2 * x[2] + x[10] + x[11]));
const g4 = (x) => -(8 * x[0] - x[9]);
const g5 = (x) => -(8 * x[1] - x[10]);
const g6 = (x) => -(8 * x[2] - x[11]);
const g7 = (x) => -(2 * x[3] + x[4] - x[9]);
const g8 = (x) => -(2 * x[5] + x[6] - x[10]);
const g9 = (x) => -(2 * x[7] + x[8] - x[11]);

// 13 Dimensions with mixed boundaries 
const chootinan1Bounds = [
    [0.0, 1.0],   // x1 
    [0.0, 1.0],   // x2 
    [0.0, 1.0],   // x3 
    [0.0, 1.0],   // x4 
    [0.0, 1.0],   // x5 
    [0.0, 1.0],   // x6 
    [0.0, 1.0],   // x7 
    [0.0, 1.0],   // x8 
    [0.0, 1.0],   // x9 
    [0.0, 100.0], // x10 
    [0.0, 100.0], // x11 
    [0.0, 100.0], // x12 
    [0.0, 1.0]    // x13 
];

const runsCount = 100; // [cite: 255]
const executionValues = [];
const executionFevals = [];

console.log(`Starting validation: Running CHOOTINAN1 optimization ${runsCount} times...`); // [cite: 255]

for (let run = 1; run <= runsCount; run++) { // [cite: 255]
    const solver = new ConstrainedGA({
        objFunc: chootinan1Objective,
        inequalityConstraints: [g1, g2, g3, g4, g5, g6, g7, g8, g9],
        bounds: chootinan1Bounds,
        K: 200,      // [cite: 259]
        iterMax: 200, // [cite: 259]
        lam: 1000.0   // [cite: 259]
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
console.log("         CHOOTINAN1 PROBLEM BENCHMARK RESULTS          ");
console.log("=======================================================");
console.log(`Metric       |  Paper Table 2 Data  | Your Local Run JS`);
console.log("-------------------------------------------------------");
console.log(`FEVALS       |  21833              | ${Math.round(avgFevals)}`); // 
console.log(`BEST         |  -15.0000           | ${bestValue.toFixed(4)}`); // 
console.log(`MEAN         |  -14.9999           | ${meanValue.toFixed(4)}`); // 
console.log(`STD          |  7.59e-3            | ${stdDeviation.toExponential(2)}`); // 
console.log("=======================================================");