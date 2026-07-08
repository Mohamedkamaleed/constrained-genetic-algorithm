classdef ConstrainedGA < handle
    % ConstrainedGA - Genetic Algorithm with Adaptive Penalty for Constrained Optimization
    %
    % This class implements a constrained genetic algorithm using adaptive
    % penalty techniques, tournament selection, crossover, mutation, and
    % local search for solving optimization problems with constraints.
    %
    % Usage:
    %   solver = ConstrainedGA('ObjectiveFunction', @(x) sum(x.^2), ...
    %                          'Bounds', [0 1; 0 1], ...
    %                          'InequalityConstraints', {@(x) x(1) + x(2) - 1});
    %   result = solver.solve();
    
    properties
        f                   % Objective function handle
        g                   % Cell array of inequality constraint function handles (g(x) <= 0)
        h                   % Cell array of equality constraint function handles (h(x) = 0)
        bounds              % [n x 2] matrix of bounds [min max] for each variable
        n                   % Number of variables
        
        % Hyperparameters
        K                   % Population size (default: 200)
        iterMax             % Maximum iterations (default: 200)
        p_s                 % Survival rate (default: 0.1)
        p_m                 % Mutation probability (default: 0.05)
        p_l                 % Local search probability (default: 0.01)
        lam                 % Base penalty multiplier (default: 1000.0)
        maxTries            % Max perturbation attempts (default: 10)
        
        % Tracking
        fevals              % Function evaluation counter
    end
    
    methods
        function obj = ConstrainedGA(varargin)
            % Constructor - Initialize the Constrained GA
            %
            % Name-Value Pairs:
            %   'ObjectiveFunction' - Function handle for objective @(x)
            %   'InequalityConstraints' - Cell array of function handles {@(x), ...}
            %   'EqualityConstraints' - Cell array of function handles {@(x), ...}
            %   'Bounds' - [n x 2] matrix of [min max] for each variable
            %   'PopulationSize' - Population size K (default: 200)
            %   'MaxGenerations' - Maximum iterations (default: 200)
            %   'SurvivalRate' - Survival rate p_s (default: 0.1)
            %   'MutationRate' - Mutation probability p_m (default: 0.05)
            %   'LocalSearchRate' - Local search probability p_l (default: 0.01)
            %   'PenaltyMultiplier' - Base penalty λ (default: 1000.0)
            %   'MaxTries' - Max perturbation attempts (default: 10)
            
            p = inputParser;
            addParameter(p, 'ObjectiveFunction', []);
            addParameter(p, 'InequalityConstraints', {});
            addParameter(p, 'EqualityConstraints', {});
            addParameter(p, 'Bounds', []);
            addParameter(p, 'PopulationSize', 200);
            addParameter(p, 'MaxGenerations', 200);
            addParameter(p, 'SurvivalRate', 0.1);
            addParameter(p, 'MutationRate', 0.05);
            addParameter(p, 'LocalSearchRate', 0.01);
            addParameter(p, 'PenaltyMultiplier', 1000.0);
            addParameter(p, 'MaxTries', 10);
            parse(p, varargin{:});
            
            obj.f = p.Results.ObjectiveFunction;
            obj.g = p.Results.InequalityConstraints;
            obj.h = p.Results.EqualityConstraints;
            obj.bounds = p.Results.Bounds;
            obj.n = size(obj.bounds, 1);
            
            obj.K = p.Results.PopulationSize;
            obj.iterMax = p.Results.MaxGenerations;
            obj.p_s = p.Results.SurvivalRate;
            obj.p_m = p.Results.MutationRate;
            obj.p_l = p.Results.LocalSearchRate;
            obj.lam = p.Results.PenaltyMultiplier;
            obj.maxTries = p.Results.MaxTries;
            
            obj.fevals = 0;
        end
        
        function feasible = isFeasible(obj, x)
            % Check if chromosome satisfies bounds and constraints
            feasible = true;
            
            % Check bounds
            for j = 1:obj.n
                if x(j) < obj.bounds(j,1) || x(j) > obj.bounds(j,2)
                    feasible = false;
                    return;
                end
            end
            
            % Check inequality constraints g(x) <= 0
            for i = 1:length(obj.g)
                if obj.g{i}(x) > 1e-5
                    feasible = false;
                    return;
                end
            end
            
            % Check equality constraints h(x) = 0
            for i = 1:length(obj.h)
                if abs(obj.h{i}(x)) > 1e-5
                    feasible = false;
                    return;
                end
            end
        end
        
        function fitness = evaluateFitness(obj, x, currentGeneration)
            % Evaluate fitness using adaptive penalty technique
            if nargin < 3
                currentGeneration = 100;
            end
            
            obj.fevals = obj.fevals + 1;
            
            % Objective value
            v1 = obj.f(x);
            
            % Equality constraint violations (squared sum)
            v2 = 0;
            for i = 1:length(obj.h)
                v2 = v2 + obj.h{i}(x)^2;
            end
            
            % Inequality constraint violations
            v3 = 0;
            for i = 1:length(obj.g)
                v3 = v3 + max(0, obj.g{i}(x))^2;
            end
            
            % Adaptive penalty multiplier
            adaptiveLam = obj.lam;
            if v2 > 1e-5 || v3 > 1e-5
                adaptiveLam = obj.lam * (1 + currentGeneration * 0.5);
            end
            
            % Penalized fitness
            fitness = v1 + adaptiveLam * v2 + adaptiveLam * v3;
        end
        
        function population = initializePopulation(obj)
            % Initialize K chromosomes within bounds
            population = cell(obj.K, 1);
            attempts = 0;
            maxAttempts = obj.K * 10;
            popCount = 0;
            
            % Attempt 1: Try to generate feasible solutions
            while popCount < obj.K && attempts < maxAttempts
                attempts = attempts + 1;
                x = obj.bounds(:,1) + rand(obj.n, 1) .* (obj.bounds(:,2) - obj.bounds(:,1));
                if obj.isFeasible(x)
                    popCount = popCount + 1;
                    population{popCount} = x;
                end
            end
            
            % Attempt 2: Fill remaining with random solutions
            while popCount < obj.K
                x = obj.bounds(:,1) + rand(obj.n, 1) .* (obj.bounds(:,2) - obj.bounds(:,1));
                popCount = popCount + 1;
                population{popCount} = x;
            end
        end
        
        function parent = tournamentSelection(obj, population, fitnesses)
            % Tournament selection
            idx1 = randi(obj.K);
            idx2 = randi(obj.K);
            if fitnesses(idx1) < fitnesses(idx2)
                parent = population{idx1};
            else
                parent = population{idx2};
            end
        end
        
        function population = crossover(obj, population, fitnesses)
            % Crossover procedure (Algorithm 2)
            
            % Sort population by fitness
            [~, indices] = sort(fitnesses);
            sortedPop = population(indices);
            
            % Create children
            children = {};
            numLoops = floor(((1 - obj.p_s) * obj.K) / 2);
            
            for i = 1:numLoops
                p1 = obj.tournamentSelection(sortedPop, fitnesses);
                p2 = obj.tournamentSelection(sortedPop, fitnesses);
                
                % Blended crossover
                alpha = -0.5 + rand * 2; % α ∈ [-0.5, 1.5]
                c1 = alpha * p1 + (1 - alpha) * p2;
                c2 = alpha * p2 + (1 - alpha) * p1;
                
                % Enforce bounds
                c1 = max(obj.bounds(:,1), min(obj.bounds(:,2), c1));
                c2 = max(obj.bounds(:,1), min(obj.bounds(:,2), c2));
                
                children{end+1} = c1;
                children{end+1} = c2;
            end
            
            % Replace worst individuals with feasibility awareness
            replaceLimit = floor((1 - obj.p_s) * obj.K);
            for i = 1:min(replaceLimit, length(children))
                child = children{i};
                replaceIdx = obj.K - i + 1;
                
                pFeas = obj.isFeasible(sortedPop{replaceIdx});
                cFeas = obj.isFeasible(child);
                
                if (pFeas && cFeas) || (~pFeas && ~cFeas)
                    sortedPop{replaceIdx} = child;
                end
            end
            
            population = sortedPop;
        end
        
        function newX = perturb(obj, x)
            % Perturb chromosome (Algorithm 4)
            newX = x;
            for j = 1:obj.n
                if rand <= obj.p_m
                    xi = rand;
                    newX(j) = obj.bounds(j,1) + xi * (obj.bounds(j,2) - obj.bounds(j,1));
                end
            end
        end
        
        function newX = perturbFeasible(obj, x)
            % Perturb chromosome while trying to maintain feasibility (Algorithm 5)
            newX = x;
            for j = 1:obj.n
                if rand <= obj.p_m
                    tries = 0;
                    xOld = newX(j);
                    
                    while tries < obj.maxTries
                        xi = rand;
                        newX(j) = obj.bounds(j,1) + xi * (obj.bounds(j,2) - obj.bounds(j,1));
                        
                        if obj.isFeasible(newX)
                            break;
                        else
                            newX(j) = xOld;
                        end
                        tries = tries + 1;
                    end
                end
            end
        end
        
        function population = mutation(obj, population)
            % Mutation procedure (Algorithm 3)
            % Skip index 1 to preserve elite
            for i = 2:obj.K
                if obj.isFeasible(population{i})
                    population{i} = obj.perturbFeasible(population{i});
                else
                    population{i} = obj.perturb(population{i});
                end
            end
        end
        
        function population = localSearch(obj, population, currentGeneration)
            % Adaptive coordinate pattern search
            for i = 1:obj.K
                if rand <= obj.p_l
                    current = population{i};
                    currentFit = obj.evaluateFitness(current, currentGeneration);
                    
                    % Adaptive step size
                    if obj.n > 4
                        stepSize = 0.01;
                    else
                        stepSize = 0.1;
                    end
                    contractionFactor = 0.5;
                    tolerance = 1e-6;
                    
                    while stepSize > tolerance
                        improved = false;
                        
                        for j = 1:obj.n
                            % Test positive direction
                            candidatePos = current;
                            candidatePos(j) = max(obj.bounds(j,1), min(obj.bounds(j,2), current(j) + stepSize));
                            
                            if obj.isFeasible(candidatePos)
                                fitPos = obj.evaluateFitness(candidatePos, currentGeneration);
                                if fitPos < currentFit
                                    current = candidatePos;
                                    currentFit = fitPos;
                                    improved = true;
                                    continue;
                                end
                            end
                            
                            % Test negative direction
                            candidateNeg = current;
                            candidateNeg(j) = max(obj.bounds(j,1), min(obj.bounds(j,2), current(j) - stepSize));
                            
                            if obj.isFeasible(candidateNeg)
                                fitNeg = obj.evaluateFitness(candidateNeg, currentGeneration);
                                if fitNeg < currentFit
                                    current = candidateNeg;
                                    currentFit = fitNeg;
                                    improved = true;
                                end
                            end
                        end
                        
                        % Contract step size if no improvement
                        if ~improved
                            stepSize = stepSize * contractionFactor;
                        end
                    end
                    
                    population{i} = current;
                end
            end
        end
        
        function result = solve(obj)
            % Main optimization loop (Algorithm 1)
            obj.fevals = 0;
            population = obj.initializePopulation();
            iterCount = 0;
            bestHistory = [];
            windowSize = 15;
            
            while iterCount < obj.iterMax
                % Evaluate fitness
                fitnesses = zeros(obj.K, 1);
                for i = 1:obj.K
                    fitnesses(i) = obj.evaluateFitness(population{i}, iterCount);
                end
                
                % Track best value
                [currentBestVal, minFitIdx] = min(fitnesses);
                bestHistory(end+1) = currentBestVal;
                
                % Check convergence
                if iterCount >= windowSize
                    recentBest = bestHistory(end-windowSize+1:end);
                    currentVariance = var(recentBest);
                    if currentVariance <= 1e-11
                        break;
                    end
                end
                
                % Genetic operations
                population = obj.crossover(population, fitnesses);
                population = obj.mutation(population);
                population = obj.localSearch(population, iterCount);
                
                iterCount = iterCount + 1;
            end
            
            % Final evaluation and selection
            finalFitnesses = zeros(obj.K, 1);
            for i = 1:obj.K
                finalFitnesses(i) = obj.evaluateFitness(population{i}, iterCount);
            end
            
            bestIdx = 1;
            bestIsFeasible = obj.isFeasible(population{bestIdx});
            
            for i = 2:obj.K
                currentIsFeasible = obj.isFeasible(population{i});
                
                % Feasibility-first rule
                if currentIsFeasible && ~bestIsFeasible
                    bestIdx = i;
                    bestIsFeasible = true;
                elseif currentIsFeasible == bestIsFeasible
                    if finalFitnesses(i) < finalFitnesses(bestIdx)
                        bestIdx = i;
                    end
                end
            end
            
            % Return results
            result.coordinates = population{bestIdx};
            result.value = obj.f(population{bestIdx});
            result.fevalsSpent = obj.fevals;
            result.isFeasible = obj.isFeasible(population{bestIdx});
        end
    end
end
