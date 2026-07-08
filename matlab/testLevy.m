% LEVY Problem Test
% Section 3.1: LEVY Problem Setup

clear; clc;

% Define objective function
levyObjective = @(x) -x(1) - x(2);

% Define constraint
levyConstraint = @(x) levyConstraintFunc(x);

% Variable bounds
levyBounds = [0.0 1.0; 0.0 1.0];

% Number of runs
runsCount = 100;
executionValues = zeros(runsCount, 1);
executionFevals = zeros(runsCount, 1);

fprintf('Starting validation: Running LEVY optimization %d times...\n', runsCount);

for run = 1:runsCount
    solver = ConstrainedGA('ObjectiveFunction', levyObjective, ...
                           'InequalityConstraints', {levyConstraint}, ...
                           'Bounds', levyBounds, ...
                           'PopulationSize', 200, ...
                           'MaxGenerations', 200, ...
                           'PenaltyMultiplier', 1000.0);
    
    runResult = solver.solve();
    executionValues(run) = runResult.value;
    executionFevals(run) = runResult.fevalsSpent;
    
    if mod(run, 20) == 0
        fprintf('  > Completed %d/%d runs...\n', run, runsCount);
    end
end

% Compute statistics
avgFevals = mean(executionFevals);
bestValue = min(executionValues);
meanValue = mean(executionValues);
stdDeviation = std(executionValues);

% Display results
fprintf('\n=======================================================\n');
fprintf('            LEVY PROBLEM BENCHMARK RESULTS             \n');
fprintf('=======================================================\n');
fprintf('Metric       |  Paper Table 2 Data  | MATLAB Run\n');
fprintf('-------------------------------------------------------\n');
fprintf('FEVALS       |  4572                | %d\n', round(avgFevals));
fprintf('BEST         |  -1.8730             | %.4f\n', bestValue);
fprintf('MEAN         |  -1.8730             | %.4f\n', meanValue);
fprintf('STD          |  4.82e-6             | %.2e\n', stdDeviation);
fprintf('=======================================================\n');

% Helper function for LEVY constraint
function val = levyConstraintFunc(x)
    a = 2.0;
    b = 0.25;
    term1 = ((x(1) - 1)^2 + (x(2) - 1)) * ((1 / (2 * a^2)) - (1 / (2 * b^2)));
    term2 = (x(1) - 1) * (x(2) - 1) * ((1 / a^2) - (1 / b^2));
    val = -(term1 + term2 - 1);
end
