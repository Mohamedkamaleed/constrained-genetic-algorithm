% SALKIN Problem Test

clear; clc;

% Define objective function
salkinObjective = @(x) -5*x(1) - 5*x(2) - 5*x(3) - 5*x(4) + 100;

% Define constraints
g1 = @(x) 2*x(1) + 2*x(2) + x(3) + x(4) - 10;
g2 = @(x) -2*x(1) - 2*x(2) - x(3) - x(4) + 10;

% Variable bounds
salkinBounds = [0 1; 0 1; 0 1; 0 1];

% Number of runs
runsCount = 100;
executionValues = zeros(runsCount, 1);
executionFevals = zeros(runsCount, 1);

fprintf('Starting validation: Running SALKIN optimization %d times...\n', runsCount);

for run = 1:runsCount
    solver = ConstrainedGA('ObjectiveFunction', salkinObjective, ...
                           'InequalityConstraints', {g1, g2}, ...
                           'Bounds', salkinBounds, ...
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
fprintf('          SALKIN PROBLEM BENCHMARK RESULTS             \n');
fprintf('=======================================================\n');
fprintf('Metric       |  Paper Table 2 Data  | MATLAB Run\n');
fprintf('-------------------------------------------------------\n');
fprintf('FEVALS       |  7244                | %d\n', round(avgFevals));
fprintf('BEST         |  320.0000            | %.4f\n', bestValue);
fprintf('MEAN         |  320.0000            | %.4f\n', meanValue);
fprintf('STD          |  0.0                 | %.2e\n', stdDeviation);
fprintf('=======================================================\n');
