% LIN3 Problem Test

clear; clc;

% Define objective function
lin3Objective = @(x) 0.01 * x(1)^2 + x(2)^2;

% Define constraints (inverted from >= 0 to <= 0)
g1 = @(x) -(x(1) * x(2) - 25);
g2 = @(x) -(x(1)^2 + x(2)^2 - 25);

% Variable bounds
lin3Bounds = [2.0 50.0; 0.0 50.0];

% Number of runs
runsCount = 100;
executionValues = zeros(runsCount, 1);
executionFevals = zeros(runsCount, 1);

fprintf('Starting validation: Running LIN3 optimization %d times...\n', runsCount);

for run = 1:runsCount
    solver = ConstrainedGA('ObjectiveFunction', lin3Objective, ...
                           'InequalityConstraints', {g1, g2}, ...
                           'Bounds', lin3Bounds, ...
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
fprintf('           LIN3 PROBLEM BENCHMARK RESULTS              \n');
fprintf('=======================================================\n');
fprintf('Metric       |  Paper Table 2 Data  | MATLAB Run\n');
fprintf('-------------------------------------------------------\n');
fprintf('FEVALS       |  15516               | %d\n', round(avgFevals));
fprintf('BEST         |  5.0000              | %.4f\n', bestValue);
fprintf('MEAN         |  5.0010              | %.4f\n', meanValue);
fprintf('STD          |  2.78e-3             | %.2e\n', stdDeviation);
fprintf('=======================================================\n');
