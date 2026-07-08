const ConstrainedGA = require('./constrainedGA');

// Section 3.1: LEVY Problem Setup
const levyObjective = (x) => -x[0] - x[1];
const levyConstraint = (x) => {
    const a = 2.0;
    const b = 0.25;
    const term1 = (Math.pow(x[0] - 1, 2) + (x[1] - 1)) * ((1 / (2 * Math.pow(a, 2))) - (1 / (2 * Math.pow(b, 2))));
    const term2 = (x[0] - 1) * (x[1] - 1) * ((1 / Math.pow(a, 2)) - (1 / Math.pow(b, 2)));
    return -(term1 + term2 - 1);
};
const levyBounds = [[0.0, 1.0], [0.0, 1.0]];

const runsCount = 100;
const executionValues = [];
const executionFevals = [];

console.log(`Starting validation: Running LEVY optimization ${runsCount} times...`);

for (let run = 1; run <= runsCount; run++) {
    const solver = new ConstrainedGA({
        objFunc: levyObjective,
        inequalityConstraints: [levyConstraint],
        bounds: levyBounds,
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
console.log("            LEVY PROBLEM BENCHMARK RESULTS             ");
console.log("=======================================================");
console.log(`Metric       |  Paper Table 2 Data  | Your Local Run JS`);
console.log("-------------------------------------------------------");
console.log(`FEVALS       |  4572               | ${Math.round(avgFevals)}`);
console.log(`BEST         |  -1.8730            | ${bestValue.toFixed(4)}`);
console.log(`MEAN         |  -1.8730            | ${meanValue.toFixed(4)}`);
console.log(`STD          |  4.82e-6            | ${stdDeviation.toExponential(2)}`);
console.log("=======================================================");