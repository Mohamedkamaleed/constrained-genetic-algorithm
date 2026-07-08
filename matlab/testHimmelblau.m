function [fevals, best, meanVal, stdVal] = testHimmelblau()
% HIMMELBLAU Problem Test

% Define objective function
himmelblauObjective = @(x) 4.3*x(1) + 31.8*x(2) + 63.3*x(3) + 15.8*x(4) + 68.5*x(5) + 4.7*x(6);

% Define constraints (inverted from >= 0 to <= 0)
g1 = @(x) -(17.1*x(1) + 38.2*x(2) + 204.2*x(3) + 212.3*x(4) + 623.4*x(5) + 1495.5*x(6) ...
            - 169*x(1)*x(3) - 3580*x(3)*x(5) - 3810*x(4)*x(5) - 18500*x(4)*x(6) ...
            - 24300*x(5)*x(6) - 4.97);

g2 = @(x) -(1.88 + 17.9*x(1) + 36.8*x(2) + 113.9*x(3) + 169.7*x(4) + 337.8*x(5) ...
            + 1385.2*x(6) - 139*x(1)*x(3) - 2450*x(4)*x(5) - 600*x(4)*x(6) ...
            - 17200*x(5)*x(6));

g3 = @(x) -(429.08 - 273*x(2) - 70*x(4) - 819*x(5) + 26000*x(4)*x(5));

g4 = @(x) -(159.9*x(1) - 311*x(2) + 587*x(4) + 391*x(5) + 2198*x(6) ...
            - 14000*x(1)*x(6) + 78.02);

% Variable bounds
himmelblauBounds = [
    0.0 0.31;
    0.0 0.046;
    0.0 0.068;
    0.0 0.042;
    0.0 0.028;
    0.0 0.0134
];

% Number of runs
runsCount = 100;
executionValues = zeros(runsCount, 1);
executionFevals = zeros(runsCount, 1);

fprintf('Starting validation: Running HIMMELBLAU optimization %d times...\n', runsCount);

for run = 1:runsCount
    solver = ConstrainedGA('ObjectiveFunction', himmelblauObjective, ...
                           'InequalityConstraints', {g1, g2, g3, g4}, ...
                           'Bounds', himmelblauBounds, ...
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
fprintf('         HIMMELBLAU PROBLEM BENCHMARK RESULTS          \n');
fprintf('=======================================================\n');
fprintf('Metric       |  Paper Table 2 Data  | MATLAB Run\n');
fprintf('-------------------------------------------------------\n');
fprintf('FEVALS       |  23539               | %d\n', round(avgFevals));
fprintf('BEST         |  0.01561             | %.5f\n', bestValue);
fprintf('MEAN         |  0.01563             | %.5f\n', meanValue);
fprintf('STD          |  5.71e-5             | %.2e\n', stdDeviation);
fprintf('=======================================================\n');

% Return values
fevals = round(avgFevals);
best = bestValue;
meanVal = meanValue;
stdVal = stdDeviation;

end
