% LIN2 Problem Test

clear; clc;

% Define objective function
lin2Objective = @(x) -x(1) - x(2);

% Define constraints (inverted from >= 0 to <= 0)
g1 = @(x) -(2*x(1)^4 - 8*x(1)^3 + 8*x(1)^2 - x(2) + 2);
g2 = @(x) -(4*x(1)^4 - 32*x(1)^3 + 88*x(1)^2 - 96*x(1) - x(2) + 36);

% Variable bounds
lin2Bounds = [0.0 3.0; 0.0 4.0];

% Number of runs
runsCount = 100;
executionValues = zeros(runsCount, 1);
executionFevals = zeros(runsCount, 1);

fprintf('Starting validation: Running LIN2 optimization %d times...\n', runsCount);

for run = 1:runsCount
    solver = ConstrainedGA('ObjectiveFunction', lin2Objective, ...
                           'InequalityConstraints', {g1, g2}, ...
                           'Bounds', lin2Bounds, ...
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
fprintf('           LIN2 PROBLEM BENCHMARK RESULTS              \n');
fprintf('=======================================================\n');
fprintf('Metric       |  Paper Table 2 Data  | MATLAB Run\n');
fprintf('-------------------------------------------------------\n');
fprintf('FEVALS       |  2431                | %d\n', round(avgFevals));
fprintf('BEST         |  -5.5080             | %.4f\n', bestValue);
fprintf('MEAN         |  -5.5080             | %.4f\n', meanValue);
fprintf('STD          |  2.17e-1             | %.2e\n', stdDeviation);
fprintf('=======================================================\n');
