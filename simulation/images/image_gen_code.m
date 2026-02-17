% Define common domain
x = linspace(-10, 10, 1000);

% Store all functions in a cell array
functions = {
    struct('name', 'correct_gaussian',       'y', @(x) exp(-x.^2));
    struct('name', 'correct_exponential',    'y', @(x) exp(-abs(x)));
    struct('name', 'correct_triangular',     'y', @(x) max(0, 1 - 0.5*abs(x)));
    struct('name', 'correct_sinc',           'y', @(x) sinc(x));  % MATLAB sinc = sin(pi*x)/(pi*x)

    struct('name', 'error_symmetry_onesided', 'y', @(x) (x >= 0).*exp(-x));
    struct('name', 'error_symmetry_shifted',  'y', @(x) exp(-(x - 2).^2));
    struct('name', 'error_maxlag_twinpeaks',  'y', @(x) exp(-(x - 2).^2) + exp(-(x + 2).^2));
    struct('name', 'error_maxlag_dip',        'y', @(x) 1.2 - exp(-x.^2));
    struct('name', 'error_shape_rectangle',   'y', @(x) double(abs(x) < 2));
    struct('name', 'error_shape_sine',        'y', @(x) sin(x));
    struct('name', 'error_symmetry_ramp',     'y', @(x) x);
    struct('name', 'error_shape_cosine',      'y', @(x) cos(x));
};

% Plot settings
yLimits = [-1.5, 1.5];
xLimits = [-10, 10];
lineWidth = 2;

% Plot all in separate figures
for i = 1:length(functions)
    figure('Name', functions{i}.name, 'NumberTitle', 'off');
    
    y = functions{i}.y(x);
    plot(x, y, 'LineWidth', lineWidth);
    grid on;
    xlabel('\tau');
    ylabel('R(\tau)');
    xlim(xLimits);
    ylim(yLimits);
end
