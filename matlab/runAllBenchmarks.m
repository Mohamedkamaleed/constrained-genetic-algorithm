% Run All Benchmarks - Master Test Suite
% Executes all 10 benchmark problems and generates comparison table

clear; clc;

fprintf('=======================================================\n');
fprintf('       STARTING MASTER BENCHMARK EXECUTION SUITE       \n');
fprintf('=======================================================\n\n');

% Define test problems with expected paper results
problems = {
    struct('name', 'LEVY', 'file', 'testLevy', 'paperEvals', 4572, ...
           'paperBest', -1.8730, 'paperMean', -1.8730, 'paperStd', 4.82e-6);
    struct('name', 'SALKIN', 'file', 'testSalkin', 'paperEvals', 7244, ...
           'paperBest', 320.0000, 'paperMean', 320.0000, 'paperStd', 0.0);
    struct('name', 'HIMMELBLAU', 'file', 'testHimmelblau', 'paperEvals', 23539, ...
           'paperBest', 0.01561, 'paperMean', 0.01563, 'paperStd', 5.71e-5);
    struct('name', 'SHITTKOWSKI', 'file', 'testShittkowski', 'paperEvals', 17483, ...
           'paperBest', 13.5907, 'paperMean', 13.5937, 'paperStd', 6.61e-3);
    struct('name', 'CHOOTINAN1', 'file', 'testChootinan1', 'paperEvals', 21833, ...
           'paperBest', -15.0000, 'paperMean', -14.9999, 'paperStd', 7.59e-3);
    struct('name', 'LIN1', 'file', 'testLin1', 'paperEvals', 5633, ...
           'paperBest', 0.2500, 'paperMean', 0.2500, 'paperStd', 6.78e-7);
    struct('name', 'LIN2', 'file', 'testLin2', 'paperEvals', 2431, ...
           'paperBest', -5.5080, 'paperMean', -5.5080, 'paperStd', 2.17e-1);
    struct('name', 'G15', 'file', 'testG15', 'paperEvals', 3593, ...
           'paperBest', 961.71515, 'paperMean', 961.71516, 'paperStd', 1.88e-5);
    struct('name', 'LIN3', 'file', 'testLin3', 'paperEvals', 15516, ...
           'paperBest', 5.0000, 'paperMean', 5.0010, 'paperStd', 2.78e-3);
    struct('name', 'BEAM', 'file', 'testBeam', 'paperEvals', 5608, ...
           'paperBest', 1.725934, 'paperMean', 1.725937, 'paperStd', 3.30e-5);
};

% Store results
results = struct('name', {}, 'paperEvals', {}, 'localEvals', {}, ...
                 'paperBest', {}, 'localBest', {}, ...
                 'paperMean', {}, 'localMean', {}, ...
                 'paperStd', {}, 'localStd', {});

% Run each test
for i = 1:length(problems)
    problem = problems{i};
    problemName = problem.name;
    fprintf('Running 100 iterations of %s...\n', problemName);
    
    try
        % Call the test function directly
        testFunc = str2func(problem.file);
        [localEvals, localBest, localMean, localStd] = testFunc();
        
        % Store results
        results(i).name = problemName;
        results(i).paperEvals = problem.paperEvals;
        results(i).localEvals = localEvals;
        results(i).paperBest = problem.paperBest;
        results(i).localBest = localBest;
        results(i).paperMean = problem.paperMean;
        results(i).localMean = localMean;
        results(i).paperStd = problem.paperStd;
        results(i).localStd = localStd;
        
        fprintf('✓ Completed %s\n\n', problemName);
        
    catch ME
        fprintf('✗ Error running %s: %s\n\n', problemName, ME.message);
        % Still store partial results
        results(i).name = problemName;
        results(i).paperEvals = problem.paperEvals;
        results(i).localEvals = NaN;
        results(i).paperBest = problem.paperBest;
        results(i).localBest = NaN;
        results(i).paperMean = problem.paperMean;
        results(i).localMean = NaN;
        results(i).paperStd = problem.paperStd;
        results(i).localStd = NaN;
    end
end

% Print comprehensive comparison table
fprintf('\n\n');
fprintf('=======================================================================================================\n');
fprintf('                              COMPREHENSIVE BENCHMARK COMPARISON TABLE                                  \n');
fprintf('=======================================================================================================\n');
fprintf('Problem        | Paper Evals | MATLAB Evals | Paper Best | MATLAB Best | Paper Mean | MATLAB Mean | Paper Std  | MATLAB Std\n');
fprintf('-------------------------------------------------------------------------------------------------------\n');

for i = 1:length(results)
    r = results(i);
    fprintf('%-14s | %11d | %12d | %10.4f | %11.4f | %10.4f | %11.4f | %10.2e | %10.2e\n', ...
            r.name, r.paperEvals, r.localEvals, r.paperBest, r.localBest, ...
            r.paperMean, r.localMean, r.paperStd, r.localStd);
end

fprintf('=======================================================================================================\n\n');

fprintf('Benchmark suite completed successfully!\n');
