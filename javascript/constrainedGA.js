class ConstrainedGA {
    constructor({ objFunc, inequalityConstraints, equalityConstraints, bounds, 
                  K = 200, iterMax = 200, p_s = 0.1, p_m = 0.05, p_l = 0.01, lam = 1000.0, maxTries = 10 }) {
        this.f = objFunc;
        this.g = inequalityConstraints || [];
        this.h = equalityConstraints || [];
        this.bounds = bounds; // Format: [[min1, max1], [min2, max2], ...]
        this.n = bounds.length;

        // Hyperparameters from the paper (Table 1)
        this.K = K;
        this.iterMax = iterMax;
        this.p_s = p_s;
        this.p_m = p_m;
        this.p_l = p_l;
        this.lam = lam; // Base penalty multiplier parameter \lambda
        this.maxTries = maxTries;
        
        // Function evaluation tracker
        this.fevals = 0; 
    }

    // Checks if a chromosome satisfies boundary envelopes and constraints
    isFeasible(x) {
        for (let j = 0; j < this.n; j++) {
            if (x[j] < this.bounds[j][0] || x[j] > this.bounds[j][1]) return false;
        }
        for (let gi of this.g) {
            if (gi(x) > 1e-5) return false;
        }
        for (let hj of this.h) {
            if (Math.abs(hj(x)) > 1e-5) return false;
        }
        return true;
    }

    // Section 2.1: Fitness Evaluation using Adaptive Penalty Technique
    evaluateFitness(x, currentGeneration = 100) {
        this.fevals++; // Increment evaluation counter
        
        const v1 = this.f(x);
        
        // v2: Equality constraint violations (squared sum) [Eq. 3]
        const v2 = this.h.reduce((sum, hj) => sum + Math.pow(hj(x), 2), 0);
        
        // v3: Inequality constraint violations where G(x) = max(0, x) [Eq. 4 & 5]
        const v3 = this.g.reduce((sum, gi) => sum + Math.pow(Math.max(0, gi(x)), 2), 0);
        
        // Dynamic adaptive multiplier scale: Escalates penalty weight over generational progress
        // to forcefully reject infeasible individuals out of highly restrictive search spaces.
        let adaptiveLam = this.lam;
        if (v2 > 1e-5 || v3 > 1e-5) {
            adaptiveLam = this.lam * (1 + currentGeneration * 0.5);
        }
        
        // Final penalized fitness function mapping [Eq. 6]
        return v1 + adaptiveLam * v2 + adaptiveLam * v3;
    }

    // Step 3: Initialize K chromosomes inside the bounds
    initializePopulation() {
        const population = [];
        let attempts = 0;
        const maxAttempts = this.K * 10; 

        // Attempt 1: Try to pull strictly feasible spaces if problem configuration allows easily
        while (population.length < this.K && attempts < maxAttempts) {
            attempts++;
            let x = [];
            for (let j = 0; j < this.n; j++) {
                const [min, max] = this.bounds[j];
                x.push(min + Math.random() * (max - min));
            }
            if (this.isFeasible(x)) {
                population.push(x);
            }
        }

        // Attempt 2: Instant Fallback to complete initialization immediately
        while (population.length < this.K) {
            let x = [];
            for (let j = 0; j < this.n; j++) {
                const [min, max] = this.bounds[j];
                x.push(min + Math.random() * (max - min));
            }
            population.push(x);
        }
        
        return population;
    }

    // Tournament Selection helper for crossover
    tournamentSelection(population, fitnesses) {
        const idx1 = Math.floor(Math.random() * this.K);
        const idx2 = Math.floor(Math.random() * this.K);
        return fitnesses[idx1] < fitnesses[idx2] ? population[idx1] : population[idx2];
    }

    // Algorithm 2: Crossover Procedure
    crossover(population, fitnesses) {
        // 1. Sort chromosomes based on fitness (best to worst)
        const indices = Array.from({ length: this.K }, (_, i) => i);
        indices.sort((a, b) => fitnesses[a] - fitnesses[b]);
        let sortedPop = indices.map(i => population[i]);

        // 3. Create children
        const children = [];
        const numLoops = Math.floor(((1 - this.p_s) * this.K) / 2);

        for (let i = 0; i < numLoops; i++) {
            const p1 = this.tournamentSelection(sortedPop, fitnesses);
            const p2 = this.tournamentSelection(sortedPop, fitnesses);

            let c1 = [], c2 = [];
            for (let j = 0; j < this.n; j++) {
                const a = -0.5 + Math.random() * 2; // Random scale alpha in [-0.5, 1.5]
                c1.push(a * p1[j] + (1 - a) * p2[j]);
                c2.push(a * p2[j] + (1 - a) * p1[j]);
                
                // Keep coordinates within explicit boundaries
                c1[j] = Math.max(this.bounds[j][0], Math.min(this.bounds[j][1], c1[j]));
                c2[j] = Math.max(this.bounds[j][0], Math.min(this.bounds[j][1], c2[j]));
            }
            children.push(c1, c2);
        }

        // 5. Replace worst individuals if feasibility states align
        const replaceLimit = Math.floor((1 - this.p_s) * this.K);
        for (let i = 0; i < replaceLimit; i++) {
            if (i >= children.length) break;
            const child = children[i];
            const replaceIdx = this.K - i - 1;

            const pFeas = this.isFeasible(sortedPop[replaceIdx]);
            const cFeas = this.isFeasible(child);

            if ((pFeas && cFeas) || (!pFeas && !cFeas)) {
                sortedPop[replaceIdx] = child;
            }
        }
        return sortedPop;
    }

    // Algorithm 4: Procedure perturb(x)
    perturb(x) {
        let newX = [...x];
        for (let j = 0; j < this.n; j++) {
            if (Math.random() <= this.p_m) {
                const xi = Math.random();
                newX[j] = this.bounds[j][0] + xi * (this.bounds[j][1] - this.bounds[j][0]);
            }
        }
        return newX;
    }

    // Algorithm 5: Procedure perturbFeasible(x)
    perturbFeasible(x) {
        let newX = [...x];
        for (let j = 0; j < this.n; j++) {
            if (Math.random() <= this.p_m) {
                let tries = 0;
                const xOld = newX[j];
                
                while (tries < this.maxTries) {
                    const xi = Math.random();
                    newX[j] = this.bounds[j][0] + xi * (this.bounds[j][1] - this.bounds[j][0]);
                    
                    if (this.isFeasible(newX)) {
                        break;
                    } else {
                        newX[j] = xOld;
                    }
                    tries++;
                }
            }
        }
        return newX;
    }

    // Algorithm 3: Mutation Procedure
    mutation(population) {
        // Skip index 0 to preserve elite structural chromosome
        for (let i = 1; i < this.K; i++) {
            if (this.isFeasible(population[i])) {
                population[i] = this.perturbFeasible(population[i]);
            } else {
                population[i] = this.perturb(population[i]);
            }
        }
        return population;
    }

    // Section 2.3: Adaptive Coordinate Pattern Search (COBYLA Function Substitute)
    localSearch(population, currentGeneration) {
        for (let i = 0; i < this.K; i++) {
            if (Math.random() <= this.p_l) {
                let current = [...population[i]];
                let currentFit = this.evaluateFitness(current, currentGeneration);
                
                // Adaptive step allocation: narrow search window for high dimensions
                let stepSize = this.n > 4 ? 0.01 : 0.1; 
                const contractionFactor = 0.5;
                const tolerance = 1e-6; 

                while (stepSize > tolerance) {
                    let improved = false;

                    for (let j = 0; j < this.n; j++) {
                        // Test positive coordinate drift
                        let candidatePositive = [...current];
                        candidatePositive[j] = Math.max(this.bounds[j][0], Math.min(this.bounds[j][1], current[j] + stepSize));
                        
                        if (this.isFeasible(candidatePositive)) {
                            let fitPos = this.evaluateFitness(candidatePositive, currentGeneration);
                            if (fitPos < currentFit) {
                                current = candidatePositive;
                                currentFit = fitPos;
                                improved = true;
                                continue;
                            }
                        }

                        // Test negative coordinate drift
                        let candidateNegative = [...current];
                        candidateNegative[j] = Math.max(this.bounds[j][0], Math.min(this.bounds[j][1], current[j] - stepSize));
                        
                        if (this.isFeasible(candidateNegative)) {
                            let fitNeg = this.evaluateFitness(candidateNegative, currentGeneration);
                            if (fitNeg < currentFit) {
                                current = candidateNegative;
                                currentFit = fitNeg;
                                improved = true;
                            }
                        }
                    }

                    // Contract vector steps if local coordinates fail optimization
                    if (!improved) {
                        stepSize *= contractionFactor;
                    }
                }
                population[i] = current;
            }
        }
        return population;
    }

    // Statistical mathematical variance processing helper
    calculateVariance(arr) {
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        return arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
    }

    // Main Run Step Orchestration Loop (Algorithm 1)
    solve() {
        this.fevals = 0; // Reset runtime counter metric
        let population = this.initializePopulation();
        let iterCount = 0;

        let bestHistory = []; 
        const windowSize = 15; // Generation window frame observing variance flatlining

        while (iterCount < this.iterMax) {
            // Step 4: Evaluate generation fitness
            const fitnesses = population.map(chrom => this.evaluateFitness(chrom, iterCount));

            // Select global optimum candidate
            let minFitIdx = 0;
            for (let i = 1; i < this.K; i++) {
                if (fitnesses[i] < fitnesses[minFitIdx]) minFitIdx = i;
            }
            const currentBestVal = fitnesses[minFitIdx];
            bestHistory.push(currentBestVal);

            // --- Section 2.4: Asymptotic Variance History Stopping Rule ---
            if (iterCount >= windowSize) {
                const recentBestValues = bestHistory.slice(-windowSize);
                const currentVariance = this.calculateVariance(recentBestValues);
                
                // Explicit breakout condition mapping flat progression
                if (currentVariance <= 1e-11) {
                    break; 
                }
            }

            // Step 5 & 6: Vector Genetic Operations and Stochastic Exploitation Local Step
            population = this.crossover(population, fitnesses);
            population = this.mutation(population);
            population = this.localSearch(population, iterCount);

            iterCount++;
        }

        // Run absolute final evaluation cleanup array maps
        const finalFitnesses = population.map(chrom => this.evaluateFitness(chrom, iterCount));
        
        let bestIdx = 0;
        let bestIsFeasible = this.isFeasible(population[bestIdx]);

        for (let i = 1; i < this.K; i++) {
            const currentIsFeasible = this.isFeasible(population[i]);

            // Feasibility-First Rule:
            // 1. If this candidate is valid but our current best is invalid, the valid one wins instantly.
            // 2. If both share the same feasibility state, choose the one with the better fitness score.
            if (currentIsFeasible && !bestIsFeasible) {
                bestIdx = i;
                bestIsFeasible = true;
            } else if (currentIsFeasible === bestIsFeasible) {
                if (finalFitnesses[i] < finalFitnesses[bestIdx]) {
                    bestIdx = i;
                }
            }
        }

        return {
            coordinates: population[bestIdx],
            value: this.f(population[bestIdx]),
            fevalsSpent: this.fevals 
        };
    }
}

if (typeof module !== 'undefined') {
    module.exports = ConstrainedGA;
}