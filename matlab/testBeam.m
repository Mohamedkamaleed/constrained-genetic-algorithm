function [fevals, best, meanVal, stdVal] = testBeam()
% BEAM (Welded Beam Design) Problem Test

% Constants
P = 6000; L = 14; E = 30e6; G = 12e6;

% Define objective function
beamObjective = @(x) 1.10471 * x(1)^2 * x(2) + 0.04811 * x(3) * x(4) * (14.0 + x(2));

% Define constraints
g1 = @(x) beamG1(x, P, L, E, G);
g2 = @(x) beamG2(x, P, L);
g3 = @(x) x(1) - x(4);
g4 = @(x) 0.10471 * x(1)^2 + 0.04811 * x(3) * x(4) * (14.0 + x(2)) - 5.0;
g5 = @(x) 0.125 - x(1);
g6 = @(x) beamG6(x, P, L, E);
g7 = @(x) beamG7(x, P, L, E, G);

% Variable bounds
beamBounds = [
    0.1 2.0;   % x1 (h)
    0.1 10.0;  % x2 (l)
    0.1 10.0;  % x3 (t)
    0.1 2.0    % x4 (b)
];

% Number of runs
runsCount = 100;
executionValues = zeros(runsCount, 1);
executionFevals = zeros(runsCount, 1);

fprintf('Starting validation: Running BEAM optimization %d times...\n', runsCount);

for run = 1:runsCount
    solver = ConstrainedGA('ObjectiveFunction', beamObjective, ...
                           'InequalityConstraints', {g1, g2, g3, g4, g5, g6, g7}, ...
                           'Bounds', beamBounds, ...
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
fprintf('            BEAM PROBLEM BENCHMARK RESULTS             \n');
fprintf('=======================================================\n');
fprintf('Metric       |  Paper Table 2 Data  | MATLAB Run\n');
fprintf('-------------------------------------------------------\n');
fprintf('FEVALS       |  5608                | %d\n', round(avgFevals));
fprintf('BEST         |  1.725934            | %.6f\n', bestValue);
fprintf('MEAN         |  1.725937            | %.6f\n', meanValue);
fprintf('STD          |  3.30e-5             | %.2e\n', stdDeviation);
fprintf('=======================================================\n');

% Helper functions for beam constraints
fuReturn values
fevals = round(avgFevals);
best = bestValue;
meanVal = meanValue;
stdVal = stdDeviation;

end

% nction val = beamG1(x, P, L, E, G)
    M = P * (L + x(2) / 2.0);
    R = sqrt((x(2)^2 / 4.0) + ((x(1) + x(3)) / 2.0)^2);
    J = 2 * (sqrt(2) * x(1) * x(2) * (x(2)^2 / 12.0 + ((x(1) + x(3)) / 2.0)^2));
    
    tauPrime = P / (sqrt(2) * x(1) * x(2));
    tauDoublePrime = (M * R) / J;
    tau = sqrt(tauPrime^2 + 2 * tauPrime * tauDoublePrime * x(2) / (2 * R) + tauDoublePrime^2);
    val = tau - 13600;
end

function val = beamG2(x, P, L)
    sigma = (6 * P * L) / (x(4) * x(3)^2);
    val = sigma - 20000;
end

function val = beamG6(x, P, L, E)
    delta = (4 * P * L^3) / (E * x(3)^3 * x(4));
    val = delta - 0.25;
end

function val = beamG7(x, P, L, E, G)
    Pc = (4.013 * E * sqrt((x(3)^2 * x(4)^6) / 36.0) / L^2) * ...
         (1.0 - (x(3) / (2 * L)) * sqrt(E / (4 * G)));
    val = P - Pc;
end
