% SHITTKOWSKI Problem Test

clear; clc;

% Define objective function
shittkowskiObjective = @(x) (x(1)^2 + x(2) - 11)^2 + (x(1) + x(2)^2 - 7)^2;

% Define constraints (inverted from >= 0 to <= 0)
g1 = @(x) -(4.84 - (x(1) - 0.05)^2 - (x(2) - 2.5)^2);
g2 = @(x) -(x(1)^2 + (x(2) - 2.5)^2 - 4.84);

% Variable bounds
shittkowskiBounds = [0.0 6.0; 0.0 6.0];

% Number of runs
runsCount = 100;
executionValues = zeros(runsCount, 1);
executionFevals = zeros(runsCount, 1);

fprintf('Starting validation: Running SHITTKOWSKI optimization %d times...\n', runsCount);

for run = 1:runsCount
    solver = ConstrainedGA('ObjectiveFunction', shittkowskiObjective, ...
                           'InequalityConstraints', {g1, g2}, ...
                           'Bounds', shittkowskiBounds, ...
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
fprintf('        SHITTKOWSKI PROBLEM BENCHMARK RESULTS          \n');
fprintf('=======================================================\n');
fprintf('Metric       |  Paper Table 2 Data  | MATLAB Run\n');
fprintf('-------------------------------------------------------\n');
fprintf('FEVALS       |  17483               | %d\n', round(avgFevals));
fprintf('BEST         |  13.5907             | %.4f\n', bestValue);
fprintf('MEAN         |  13.5937             | %.4f\n', meanValue);
fprintf('STD          |  6.61e-3             | %.2e\n', stdDeviation);
fprintf('=======================================================\n');
