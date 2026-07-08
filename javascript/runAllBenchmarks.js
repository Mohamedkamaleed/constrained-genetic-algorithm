const { execSync } = require('child_process');

const testFiles = [
    { name: 'LEVY', file: 'testlevy.js', paperEvals: 4572, paperBest: -1.8730, paperMean: -1.8730, paperStd: '4.82e-6' },
    { name: 'SALKIN', file: 'testSalkin.js', paperEvals: 7244, paperBest: 320.0000, paperMean: 320.0000, paperStd: '0.0' },
    { name: 'HIMMELBLAU', file: 'testHimmelblau.js', paperEvals: 23539, paperBest: 0.01561, paperMean: 0.01563, paperStd: '5.71e-5' },
    { name: 'SHITTKOWSKI', file: 'testShittkowski.js', paperEvals: 17483, paperBest: 13.5907, paperMean: 13.5937, paperStd: '6.61e-3' },
    { name: 'CHOOTINAN1', file: 'testChootinan1.js', paperEvals: 21833, paperBest: -15.0000, paperMean: -14.9999, paperStd: '7.59e-3' },
    { name: 'LIN1', file: 'testLin1.js', paperEvals: 5633, paperBest: 0.2500, paperMean: 0.2500, paperStd: '6.78e-7' },
    { name: 'LIN2', file: 'testLin2.js', paperEvals: 2431, paperBest: -5.5080, paperMean: -5.5080, paperStd: '2.17e-1' },
    { name: 'G15', file: 'testG15.js', paperEvals: 3593, paperBest: 961.71515, paperMean: 961.71516, paperStd: '1.88e-5' },
    { name: 'LIN3', file: 'testLin3.js', paperEvals: 15516, paperBest: 5.0000, paperMean: 5.0010, paperStd: '2.78e-3' },
    { name: 'BEAM', file: 'testBeam.js', paperEvals: 5608, paperBest: 1.725934, paperMean: 1.725937, paperStd: '3.30e-5' }
];

console.log("=======================================================");
console.log("       STARTING MASTER BENCHMARK EXECUTION SUITE       ");
console.log("=======================================================\n");

const summaryRows = [];

testFiles.forEach((problem) => {
    console.log(`Running 100 iterations of ${problem.name}...`);
    try {
        // Execute the script and capture console output
        const output = execSync(`node ${problem.file}`, { encoding: 'utf-8' });
        
        // Parse the metrics out of the individual console tables using regex
        const lines = output.split('\n');
        let localEvals = '-', localBest = '-', localMean = '-', localStd = '-';

        lines.forEach(line => {
            if (line.toUpperCase().includes('FEVALS')) {
                localEvals = line.split('|')[2].trim();
            }
            if (line.toUpperCase().includes('BEST')) {
                localBest = parseFloat(line.split('|')[2].trim()).toFixed(4);
            }
            if (line.toUpperCase().includes('MEAN')) {
                localMean = parseFloat(line.split('|')[2].trim()).toFixed(4);
            }
            if (line.toUpperCase().includes('STD')) {
                localStd = line.split('|')[2].trim();
            }
        });

        summaryRows.push({
            name: problem.name,
            pEvals: problem.paperEvals, lEvals: localEvals,
            pBest: problem.paperBest.toFixed(4), lBest: localBest,
            pMean: problem.paperMean.toFixed(4), lMean: localMean,
            pStd: problem.paperStd, lStd: localStd
        });

    } catch (error) {
        console.error(`❌ Failed to execute or parse ${problem.file}:`, error.message);
    }
});

// Print out the absolute final unified master benchmark chart
console.log("\n==========================================================================================================");
console.log("                                    FINAL UNIFIED BENCHMARK DATA TABLE                                     ");
console.log("==========================================================================================================");
console.log("Problem      |  Paper FEVALS  |  Local FEVALS  |   Paper BEST   |   Local BEST   |   Paper MEAN   |   Local MEAN   ");
console.log("----------------------------------------------------------------------------------------------------------");
summaryRows.forEach(row => {
    const pad = (str, len) => str.toString().padEnd(len, ' ');
    console.log(
        `${pad(row.name, 12)} | ${pad(row.pEvals, 14)} | ${pad(row.lEvals, 14)} | ${pad(row.pBest, 14)} | ${pad(row.lBest, 14)} | ${pad(row.pMean, 14)} | ${pad(row.lMean, 14)}`
    );
});
console.log("==========================================================================================================\n");