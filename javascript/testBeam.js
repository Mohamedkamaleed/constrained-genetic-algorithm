const ConstrainedGA = require('./constrainedGA');

// Section 3.1: Welded Beam Design Problem Setup
const beamObjective = (x) => {
    return 1.10471 * x[0]*x[0] * x[1] + 0.04811 * x[2] * x[3] * (14.0 + x[1]);
};

// Structural constraints scaled to matching <= 0 format
const g1 = (x) => {
    const P = 6000; const L = 14; const E = 30e6; const G = 12e6;
    const M = P * (L + x[1] / 2.0);
    const R = Math.sqrt(Math.pow(x[1], 2) / 4.0 + Math.pow((x[0] + x[2]) / 2.0, 2));
    const J = 2 * (Math.sqrt(2) * x[0] * x[1] * (Math.pow(x[1], 2) / 12.0 + Math.pow((x[0] + x[2]) / 2.0, 2)));
    
    const tauPrime = P / (Math.sqrt(2) * x[0] * x[1]);
    const tauDoublePrime = (M * R) / J;
    const tau = Math.sqrt(Math.pow(tauPrime, 2) + 2 * tauPrime * tauDoublePrime * x[1] / (2 * R) + Math.pow(tauDoublePrime, 2));
    return tau - 13600;
};

const g2 = (x) => {
    const P = 6000; const L = 14;
    const sigma = (6 * P * L) / (x[3] * Math.pow(x[2], 2));
    return sigma - 20000;
};

const g3 = (x) => x[0] - x[3];
const g4 = (x) => 0.10471 * Math.pow(x[0], 2) + 0.04811 * x[2] * x[3] * (14.0 + x[1]) - 5.0;
const g5 = (x) => 0.125 - x[0];

const g6 = (x) => {
    const P = 6000; const L = 14; const E = 30e6;
    const delta = (4 * P * Math.pow(L, 3)) / (E * Math.pow(x[2], 3) * x[3]);
    return delta - 0.25;
};

const g7 = (x) => {
    const P = 6000; const L = 14; const E = 30e6; const G = 12e6;
    const Pc = (4.013 * E * Math.sqrt((Math.pow(x[2], 2) * Math.pow(x[3], 6)) / 36.0) / Math.pow(L, 2)) * (1.0 - (x[2] / (2 * L)) * Math.sqrt(E / (4 * G)));
    return P - Pc;
};

const beamBounds = [
    [0.1, 2.0],  // x1 (h)
    [0.1, 10.0], // x2 (l)
    [0.1, 10.0], // x3 (t)
    [0.1, 2.0]   // x4 (b)
];

const runsCount = 100;
const executionValues = [];
const executionFevals = [];

console.log(`Starting validation: Running BEAM optimization ${runsCount} times...`);

for (let run = 1; run <= runsCount; run++) {
    const solver = new ConstrainedGA({
        objFunc: beamObjective,
        inequalityConstraints: [g1, g2, g3, g4, g5, g6, g7],
        bounds: beamBounds,
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
console.log("            BEAM PROBLEM BENCHMARK RESULTS             ");
console.log("=======================================================");
console.log(`Metric       |  Paper Table 2 Data  | Your Local Run JS`);
console.log("-------------------------------------------------------");
console.log(`FEVALS       |  5608               | ${Math.round(avgFevals)}`);
console.log(`BEST         |  1.725934           | ${bestValue.toFixed(6)}`);
console.log(`MEAN         |  1.725937           | ${meanValue.toFixed(6)}`);
console.log(`STD          |  3.30e-5            | ${stdDeviation.toExponential(2)}`);
console.log("=======================================================");