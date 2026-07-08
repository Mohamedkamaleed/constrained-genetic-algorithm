const ConstrainedGA = require('./constrainedGA');

// Section 3.1: SHITTKOWSKI Problem Setup
const shittkowskiObjective = (x) => {
    return Math.pow(Math.pow(x[0], 2) + x[1] - 11, 2) + Math.pow(x[0] + Math.pow(x[1], 2) - 7, 2);
};

// Inverting paper's >= 0 constraints to meet our engine's <= 0 input format
const g1 = (x) => -(4.84 - Math.pow(x[0] - 0.05, 2) - Math.pow(x[1] - 2.5, 2));
const g2 = (x) => -(Math.pow(x[0], 2) + Math.pow(x[1] - 2.5, 2) - 4.84);

const shittkowskiBounds = [
    [0.0, 6.0], // x1
    [0.0, 6.0]  // x2
];

const runsCount = 100;
const executionValues = [];
const executionFevals = [];

console.log(`Starting validation: Running SHITTKOWSKI optimization ${runsCount} times...`);

for (let run = 1; run <= runsCount; run++) {
    const solver = new ConstrainedGA({
        objFunc: shittkowskiObjective,
        inequalityConstraints: [g1, g2],
        bounds: shittkowskiBounds,
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
console.log("        SHITTKOWSKI PROBLEM BENCHMARK RESULTS          ");
console.log("=======================================================");
console.log(`Metric       |  Paper Table 2 Data  | Your Local Run JS`);
console.log("-------------------------------------------------------");
console.log(`FEVALS       |  17483              | ${Math.round(avgFevals)}`);
console.log(`BEST         |  13.5907            | ${bestValue.toFixed(4)}`);
console.log(`MEAN         |  13.5937            | ${meanValue.toFixed(4)}`);
console.log(`STD          |  6.61e-3            | ${stdDeviation.toExponential(2)}`);
console.log("=======================================================");