function [fevals, best, meanVal, stdVal] = testLin1()
% LIN1 Problem Test

% Define objective function
lin1Objective = @(x) 100 * (x(2) - x(1)^2)^2 + (1 - x(1))^2;

% Define constraints (inverted from >= 0 to <= 0)
g1 = @(x) -(x(1) + x(2)^2);
g2 = @(x) -(x(1)^2 + x(2));

% Variable bounds
lin1Bounds = [-0.5 0.5; -2.0 10.0];

% Number of runs
runsCount = 100;
executionValues = zeros(runsCount, 1);
executionFevals = zeros(runsCount, 1);

fprintf('Starting validation: Running LIN1 optimization %d times...\n', runsCount);

for run = 1:runsCount
    solver = ConstrainedGA('ObjectiveFunction', lin1Objective, ...
                           'InequalityConstraints', {g1, g2}, ...
                           'Bounds', lin1Bounds, ...
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
fprintf('           LIN1 PROBLEM BENCHMARK RESULTS              \n');
fprintf('=======================================================\n');
fprintf('Metric       |  Paper Table 2 Data  | MATLAB Run\n');
fprintf('-------------------------------------------------------\n');
fprintf('FEVALS       |  5633                | %d\n', round(avgFevals));
fprintf('BEST         |  0.2500              | %.4f\n', bestValue);
fprintf('MEAN         |  0.2500              | %.4f\n', meanValue);
fprintf('STD          |  6.78e-7             | %.2e\n', stdDeviation);
fprintf('=======================================================\n');

% Return values
fevals = round(avgFevals);
best = bestValue;
meanVal = meanValue;
stdVal = stdDeviation;

end
