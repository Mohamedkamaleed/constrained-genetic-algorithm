# Constrained Genetic Algorithm (GA) Implementation

A comprehensive JavaScript implementation of a Constrained Genetic Algorithm with adaptive penalty techniques for solving complex optimization problems with inequality and equality constraints.

## 📋 Overview

This project implements a sophisticated genetic algorithm designed to solve constrained optimization problems. The algorithm uses adaptive penalty functions, tournament selection, intelligent crossover, mutation strategies, and local search techniques to efficiently navigate constrained search spaces and find optimal solutions.

## 🎯 Key Features

### Algorithm Components

1. **Adaptive Penalty Technique**
   - Dynamic penalty multipliers that escalate over generations
   - Handles both equality and inequality constraints
   - Effectively balances feasibility and optimality

2. **Population Initialization**
   - Intelligent initialization attempting to generate feasible solutions
   - Fallback mechanism to ensure complete population generation
   - Configurable population size (default K=200)

3. **Tournament Selection**
   - Selects parents based on fitness comparison
   - Preserves diversity while favoring better solutions

4. **Advanced Crossover (Algorithm 2)**
   - Blended crossover with random scaling factor α ∈ [-0.5, 1.5]
   - Creates two children per parent pair
   - Maintains boundary constraints
   - Selective replacement based on feasibility alignment

5. **Adaptive Mutation (Algorithm 3)**
   - **Elite Preservation**: Protects the best solution from mutation
   - **Dual Strategy**:
     - `perturbFeasible()`: For feasible chromosomes - attempts to maintain feasibility
     - `perturb()`: For infeasible chromosomes - unrestricted perturbation
   - Configurable mutation probability (default p_m=0.05)

6. **Local Search (Algorithm 5)**
   - Coordinate pattern search similar to COBYLA
   - Adaptive step size based on dimensionality
   - Tests positive and negative coordinate adjustments
   - Automatic step contraction when no improvement found
   - Only applied to randomly selected individuals (probability p_l=0.01)

### Hyperparameters (from Paper Table 1)

| Parameter | Symbol | Default Value | Description |
|-----------|--------|---------------|-------------|
| Population Size | K | 200 | Number of chromosomes in population |
| Max Iterations | iterMax | 200 | Maximum number of generations |
| Survival Rate | p_s | 0.1 | Percentage of population preserved |
| Mutation Probability | p_m | 0.05 | Probability of gene mutation |
| Local Search Probability | p_l | 0.01 | Probability of local search application |
| Base Penalty Multiplier | λ | 1000.0 | Base penalty weight for constraints |
| Max Perturbation Tries | maxTries | 10 | Attempts to find feasible perturbation |

## 📂 Project Structure

```
.
├── constrainedGA.js          # Core GA implementation
├── runAllBenchmarks.js       # Master benchmark runner
├── testBeam.js              # Welded Beam Design Problem
├── testChootinan1.js        # Chootinan Test Function 1
├── testG15.js               # G15 Test Problem
├── testHimmelblau.js        # Himmelblau's Problem
├── testLevy.js              # Levy Test Function
├── testLin1.js              # Linear Test Problem 1
├── testLin2.js              # Linear Test Problem 2
├── testLin3.js              # Linear Test Problem 3
├── testSalkin.js            # Salkin Test Problem
└── testShittkowski.js       # Shittkowski Test Problem
```

## 🔧 Core Implementation Details

### ConstrainedGA Class

```javascript
class ConstrainedGA {
    constructor({
        objFunc,                    // Objective function to minimize
        inequalityConstraints,      // Array of g(x) ≤ 0 constraints
        equalityConstraints,        // Array of h(x) = 0 constraints
        bounds,                     // [[min1, max1], [min2, max2], ...]
        K = 200,                   // Population size
        iterMax = 200,             // Maximum iterations
        p_s = 0.1,                 // Survival rate
        p_m = 0.05,                // Mutation probability
        p_l = 0.01,                // Local search probability
        lam = 1000.0,              // Base penalty multiplier
        maxTries = 10              // Max perturbation attempts
    })
}
```

### Fitness Evaluation (Section 2.1)

The fitness function combines the objective value with constraint violations:

**Fitness = f(x) + λ_adaptive × (∑h²(x) + ∑max(0, g(x))²)**

Where:
- `f(x)` = objective function value
- `h(x)` = equality constraint violations (squared)
- `g(x)` = inequality constraint violations (positive part squared)
- `λ_adaptive` = λ × (1 + generation × 0.5) for infeasible solutions

### Feasibility Check

A solution is considered feasible if:
1. All variables are within their bounds
2. All inequality constraints g(x) ≤ 1e-5
3. All equality constraints |h(x)| ≤ 1e-5

## 🧪 Benchmark Problems

### 1. **LEVY** (2D)
- **Type**: Nonlinear constrained optimization
- **Variables**: 2
- **Constraints**: 1 inequality
- **Optimal Value**: -1.8730

### 2. **SALKIN** (Linear)
- **Type**: Linear programming
- **Optimal Value**: 320.0000

### 3. **HIMMELBLAU** (6D)
- **Type**: Nonlinear engineering problem
- **Variables**: 6
- **Constraints**: 4 inequalities
- **Optimal Value**: 0.01561

### 4. **SHITTKOWSKI** (Nonlinear)
- **Type**: Standard test problem
- **Optimal Value**: 13.5907

### 5. **CHOOTINAN1** (Nonlinear)
- **Type**: Standard test problem
- **Optimal Value**: -15.0000

### 6. **LIN1, LIN2, LIN3** (Linear)
- **Type**: Linear programming problems
- **Optimal Values**: 0.2500, -5.5080, 5.0000

### 7. **G15** (3D)
- **Type**: Quadratic programming
- **Optimal Value**: 961.71515

### 8. **BEAM** (4D Welded Beam Design)
- **Type**: Structural engineering optimization
- **Variables**: h, l, t, b (weld height, length, beam thickness, width)
- **Constraints**: 7 structural constraints
  - Shear stress limitation
  - Bending stress limitation
  - Buckling constraint
  - Deflection constraint
  - Side constraints
- **Optimal Value**: 1.725934

## 🚀 Usage

### Running Individual Tests

```bash
node testLevy.js
node testBeam.js
node testHimmelblau.js
# ... or any other test file
```

Each test runs 100 independent optimizations and reports:
- Average function evaluations (FEVALS)
- Best objective value found (BEST)
- Mean objective value (MEAN)
- Standard deviation (STD)

### Running All Benchmarks

```bash
node runAllBenchmarks.js
```

This executes all 10 benchmark problems sequentially and generates a comprehensive comparison table against published paper results.

### Example: Beam Design Problem

```javascript
const ConstrainedGA = require('./constrainedGA');

// Define objective function
const beamObjective = (x) => {
    return 1.10471 * x[0]*x[0] * x[1] + 0.04811 * x[2] * x[3] * (14.0 + x[1]);
};

// Define constraints (g(x) <= 0 format)
const g1 = (x) => { /* shear stress constraint */ };
const g2 = (x) => { /* bending stress constraint */ };
// ... more constraints

// Define variable bounds
const beamBounds = [
    [0.1, 2.0],   // h: weld height
    [0.1, 10.0],  // l: weld length
    [0.1, 10.0],  // t: beam thickness
    [0.1, 2.0]    // b: beam width
];

// Create solver instance
const solver = new ConstrainedGA({
    objFunc: beamObjective,
    inequalityConstraints: [g1, g2, g3, g4, g5, g6, g7],
    bounds: beamBounds,
    K: 200,
    iterMax: 200,
    lam: 1000.0
});

// Run optimization
const result = solver.solve();

console.log('Best Solution:', result.best);
console.log('Best Value:', result.value);
console.log('Function Evaluations:', result.fevalsSpent);
console.log('Is Feasible:', result.isFeasible);
```

## 📊 Performance Metrics

The algorithm tracks and reports:

1. **Function Evaluations (fevals)**: Total number of objective function calls
2. **Best Value**: Lowest objective function value found
3. **Mean Value**: Average objective value over multiple runs
4. **Standard Deviation**: Measure of solution consistency
5. **Feasibility**: Whether final solution satisfies all constraints

## 🔬 Algorithm Flow

```
1. Initialize population (K chromosomes)
   ├─ Attempt feasible initialization
   └─ Fallback to random initialization

2. FOR generation = 1 to iterMax:
   │
   ├─ 3. Evaluate fitness for all chromosomes
   │     └─ Apply adaptive penalty for constraint violations
   │
   ├─ 4. Crossover (Algorithm 2)
   │     ├─ Sort population by fitness
   │     ├─ Tournament selection of parents
   │     ├─ Generate children with blended crossover
   │     └─ Replace worst individuals (feasibility-aware)
   │
   ├─ 5. Mutation (Algorithm 3)
   │     ├─ Preserve elite (best solution)
   │     ├─ Apply perturbFeasible() to feasible individuals
   │     └─ Apply perturb() to infeasible individuals
   │
   ├─ 6. Local Search (Algorithm 5)
   │     ├─ Randomly select individuals (probability p_l)
   │     ├─ Coordinate pattern search
   │     └─ Adaptive step size adjustment
   │
   └─ 7. Track convergence
         ├─ Monitor population variance
         └─ Early stopping if converged

8. Return best solution found
```

## 🎓 Theoretical Background

### Constraint Handling

The algorithm uses an **adaptive penalty method** to handle constraints:

- **Equality constraints**: `h(x) = 0` → Penalized as `h(x)²`
- **Inequality constraints**: `g(x) ≤ 0` → Penalized as `max(0, g(x))²`
- **Dynamic adaptation**: Penalty weight increases with generation number to progressively enforce constraints

### Selection Strategy

- **Tournament Selection**: Pairwise comparison selects better parent
- **Elitism**: Best solution always survives to next generation
- **Feasibility Awareness**: Replacement decisions consider feasibility status

### Genetic Operators

- **Crossover Rate**: 90% of population participates (1 - p_s = 0.9)
- **Mutation Rate**: 5% per gene (p_m = 0.05)
- **Local Search Rate**: 1% of population (p_l = 0.01)

## 📈 Expected Results

When running the complete benchmark suite, you should observe results comparable to:

| Problem | Expected Best | Expected Mean | Expected Std Dev |
|---------|---------------|---------------|------------------|
| LEVY | -1.8730 | -1.8730 | 4.82e-6 |
| SALKIN | 320.0000 | 320.0000 | 0.0 |
| HIMMELBLAU | 0.01561 | 0.01563 | 5.71e-5 |
| SHITTKOWSKI | 13.5907 | 13.5937 | 6.61e-3 |
| CHOOTINAN1 | -15.0000 | -14.9999 | 7.59e-3 |
| LIN1 | 0.2500 | 0.2500 | 6.78e-7 |
| LIN2 | -5.5080 | -5.5080 | 2.17e-1 |
| G15 | 961.71515 | 961.71516 | 1.88e-5 |
| LIN3 | 5.0000 | 5.0010 | 2.78e-3 |
| BEAM | 1.725934 | 1.725937 | 3.30e-5 |

## ⚙️ Dependencies

- **Node.js**: Version 12 or higher
- **No external packages required**: Pure JavaScript implementation

## 🔍 Key Implementation Insights

### Adaptive Penalty Escalation

```javascript
let adaptiveLam = this.lam;
if (v2 > 1e-5 || v3 > 1e-5) {
    adaptiveLam = this.lam * (1 + currentGeneration * 0.5);
}
```

This ensures infeasible solutions become increasingly penalized as the algorithm progresses, guiding the population toward feasible regions.

### Feasibility-Aware Replacement

```javascript
const pFeas = this.isFeasible(sortedPop[replaceIdx]);
const cFeas = this.isFeasible(child);

if ((pFeas && cFeas) || (!pFeas && !cFeas)) {
    sortedPop[replaceIdx] = child;
}
```

Only replaces parent with child if both have the same feasibility status, preventing premature loss of feasible solutions.

### Dimension-Adaptive Local Search

```javascript
let stepSize = this.n > 4 ? 0.01 : 0.1;
```

Uses smaller initial steps for high-dimensional problems to avoid inefficient exploration.

## 🛠️ Customization

### Adding New Benchmark Problems

1. Create a new test file (e.g., `testMyProblem.js`)
2. Define objective function, constraints, and bounds
3. Instantiate `ConstrainedGA` with appropriate parameters
4. Run multiple trials and collect statistics
5. Add to `runAllBenchmarks.js` for comprehensive testing

### Tuning Hyperparameters

Adjust parameters based on problem characteristics:

- **High-dimensional problems**: Increase K and iterMax
- **Highly constrained problems**: Increase λ and decrease p_m
- **Smooth landscapes**: Increase p_l for more local search
- **Rugged landscapes**: Increase p_m for more exploration

## 📝 Algorithm Reference

This implementation is based on constrained optimization techniques from evolutionary computation literature, incorporating:

- Adaptive penalty methods
- Elitist selection strategies
- Hybrid genetic-local search approaches
- Feasibility-preserving mutation operators

## 🤝 Contributing

Feel free to:
- Add new benchmark problems
- Optimize algorithm performance
- Enhance visualization capabilities
- Improve documentation

## 📄 License

This project is available for educational and research purposes.

---

**Author**: Implementation of constrained genetic algorithm with adaptive penalty techniques  
**Language**: JavaScript (Node.js)  
**Last Updated**: 2026

