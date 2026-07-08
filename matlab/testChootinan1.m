function [fevals, best, meanVal, stdVal] = testChootinan1()
% CHOOTINAN1 Problem Test

% Define objective function
chootinan1Objective = @(x) chootinanObj(x);

% Define constraints (inverted from >= 0 to <= 0)
g1 = @(x) -(10 - (2*x(1) + 2*x(2) + x(10) + x(11)));
g2 = @(x) -(10 - (2*x(1) + 2*x(3) + x(10) + x(12)));
g3 = @(x) -(10 - (2*x(2) + 2*x(3) + x(11) + x(12)));
g4 = @(x) -(8*x(1) - x(10));
g5 = @(x) -(8*x(2) - x(11));
g6 = @(x) -(8*x(3) - x(12));
g7 = @(x) -(2*x(4) + x(5) - x(10));
g8 = @(x) -(2*x(6) + x(7) - x(11));
g9 = @(x) -(2*x(8) + x(9) - x(12));

% Variable bounds (13 dimensions)
chootinan1Bounds = [
    0.0 1.0;     % x1
    0.0 1.0;     % x2
    0.0 1.0;     % x3
    0.0 1.0;     % x4
    0.0 1.0;     % x5
    0.0 1.0;     % x6
    0.0 1.0;     % x7
    0.0 1.0;     % x8
    0.0 1.0;     % x9
    0.0 100.0;   % x10
    0.0 100.0;   % x11
    0.0 100.0;   % x12
    0.0 1.0      % x13
];

% Number of runs
runsCount = 100;
executionValues = zeros(runsCount, 1);
executionFevals = zeros(runsCount, 1);

fprintf('Starting validation: Running CHOOTINAN1 optimization %d times...\n', runsCount);

for run = 1:runsCount
    solver = ConstrainedGA('ObjectiveFunction', chootinan1Objective, ...
                           'InequalityConstraints', {g1, g2, g3, g4, g5, g6, g7, g8, g9}, ...
                           'Bounds', chootinan1Bounds, ...
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
fprintf('         CHOOTINAN1 PROBLEM BENCHMARK RESULTS          \n');
fprintf('=======================================================\n');
fprintf('Metric       |  Paper Table 2 Data  | MATLAB Run\n');
fprintf('-------------------------------------------------------\n');
fprintf('FEVALS       |  21833               | %d\n', round(avgFevals));
fprintf('BEST         |  -15.0000            | %.4f\n', bestValue);
fprintf('MEAN         |  -14.9999            | %.4f\n', meanValue);
fprintf('STD          |  7.59e-3             | %.2e\n', stdDeviation);
fprintf('=======================================================\n');

% Return values
fevals = round(avgFevals);
best = bestValue;
meanVal = meanValue;
stdVal = stdDeviation;

end

% Helper function for Chootinan1 objective
function val = chootinanObj(x)
    sum1 = sum(x(1:4));
    sum2 = sum(x(1:4).^2);
    sum3 = sum(x(1:13));
    val = 5*sum1 - 5*sum2 - sum3;
end
