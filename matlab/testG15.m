% G15 Problem Test

clear; clc;

% Define objective function
g15Objective = @(x) 1000 - x(1)^2 - 2*x(2)^2 - x(3)^2 - x(1)*x(2) - x(1)*x(3);

% Define equality constraints h(x) = 0
h1 = @(x) x(1)^2 + x(2)^2 + x(3)^2 - 25;
h2 = @(x) 8*x(1) + 14*x(2) + 7*x(3) - 56;

% Variable bounds
g15Bounds = [0.0 10.0; 0.0 10.0; 0.0 10.0];

% Number of runs
runsCount = 100;
executionValues = zeros(runsCount, 1);
executionFevals = zeros(runsCount, 1);

fprintf('Starting validation: Running G15 optimization %d times...\n', runsCount);

for run = 1:runsCount
    solver = ConstrainedGA('ObjectiveFunction', g15Objective, ...
                           'EqualityConstraints', {h1, h2}, ...
                           'Bounds', g15Bounds, ...
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
fprintf('            G15 PROBLEM BENCHMARK RESULTS              \n');
fprintf('=======================================================\n');
fprintf('Metric       |  Paper Table 2 Data  | MATLAB Run\n');
fprintf('-------------------------------------------------------\n');
fprintf('FEVALS       |  3593                | %d\n', round(avgFevals));
fprintf('BEST         |  961.71515           | %.5f\n', bestValue);
fprintf('MEAN         |  961.71516           | %.5f\n', meanValue);
fprintf('STD          |  1.88e-5             | %.2e\n', stdDeviation);
fprintf('=======================================================\n');
