// --------------------------------------
// 1. DOM and Chart References
// --------------------------------------
const signalSelectorContainer = document.getElementById('signal-selector-container');
const submitBtn = document.getElementById('submitBtn');
const userGuess = document.getElementById('user-guess');
const submissionFeedback = document.getElementById('submission-feedback');
const equationContainer = document.getElementById('equation-container');
const variableDefinitions = document.getElementById('variable-definitions');
const explanationPanel = document.getElementById('explanation-panel');
const explanationContent = document.getElementById('explanation-content');


// --------------------------------------
// 2. Configuration & State
// --------------------------------------
let currentProcess; // Will hold the object of the currently displayed process

// --- Process Definitions Database ---
const processDefinitions = {
    sss: [
        {
            type: 'sss',
            equation: `<math><mi>X</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mi>A</mi><mo>⁡</mo><mrow><mi>cos</mi><mo>⁡</mo><mrow><mo>(</mo><mn>2</mn><mi>π</mi><msub><mi>f</mi><mn>0</mn></msub><mi>t</mi><mo>+</mo><mi>Θ</mi><mo>)</mo></mrow></mrow></math>`,
            variables: `<ul>
                <li><i>A</i> and <i>f<sub>0</sub></i> are constants.</li>
                <li><i>Θ</i> is a random variable uniformly distributed in [0, 2π].</li>
            </ul>`,
            explanation: `
                <p><strong>This is a Strict-Sense Stationary (SSS) process.</strong></p>
                <h4>SSS Proof (Conceptual):</h4>
                <p>For a process to be SSS, its joint probability distribution must be invariant to time shifts. Let's analyze the process after a time shift <i>ε</i>:
                <br><math style="display: block; margin-top: 1rem;"><mi>X</mi><mo>(</mo><mi>t</mi><mo>+</mo><mi>ε</mi><mo>)</mo><mo>=</mo><mi>A</mi><mo>⁡</mo><mrow><mi>cos</mi><mo>⁡</mo><mrow><mo>(</mo><mn>2</mn><mi>π</mi><msub><mi>f</mi><mn>0</mn></msub><mo>(</mo><mi>t</mi><mo>+</mo><mi>ε</mi><mo>)</mo><mo>+</mo><mi>Θ</mi><mo>)</mo></mrow></mrow><mo>=</mo><mi>A</mi><mo>⁡</mo><mrow><mi>cos</mi><mo>⁡</mo><mrow><mo>(</mo><mn>2</mn><mi>π</mi><msub><mi>f</mi><mn>0</mn></msub><mi>t</mi><mo>+</mo><mo>(</mo><mi>Θ</mi><mo>+</mo><mn>2</mn><mi>π</mi><msub><mi>f</mi><mn>0</mn></msub><mi>ε</mi><mo>)</mo><mo>)</mo></mrow></mrow></math></p>
                <p>Let <math><msup><mi>Θ</mi><mo>′</mo></msup><mo>=</mo><mo>(</mo><mi>Θ</mi><mo>+</mo><mn>2</mn><mi>π</mi><msub><mi>f</mi><mn>0</mn></msub><mi>ε</mi><mo>)</mo><mo> mod </mo><mn>2</mn><mi>π</mi></math>. Since <i>Θ</i> is a random variable uniformly distributed over a full cycle [0, 2π], shifting it by a constant amount and taking the modulo does not change its probability distribution. The distribution of <i>Θ'</i> is identical to the distribution of <i>Θ</i>. Because all statistical properties of the process are derived from this single random variable, and its distribution is unaffected by a time shift, the process is SSS.</p>
                <h4>WSS Proof (Mathematical):</h4>
                <p>Since the process is SSS, it must also be WSS.
                <br><strong>Mean:</strong> <math><mi>E</mi><mo>[</mo><mi>X</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>]</mo><mo>=</mo><mn>0</mn></math>. (Constant)</p>
                <p><strong>Autocorrelation:</strong> <math><msub><mi>R</mi><mrow><mi>X</mi><mi>X</mi></mrow></msub><mo>(</mo><mi>τ</mi><mo>)</mo><mo>=</mo><mfrac><msup><mi>A</mi><mn>2</mn></msup><mn>2</mn></mfrac><mi>cos</mi><mo>(</mo><mn>2</mn><mi>π</mi><msub><mi>f</mi><mn>0</mn></msub><mi>τ</mi><mo>)</mo></math>, which only depends on the time lag τ.</p>`,
            sampleGenerator: (labels) => 2 * Math.cos(2 * Math.PI * 1 * labels.t + Math.random() * 2 * Math.PI),
            proofPlot: { type: 'acf', data: (labels) => labels.map(tau => 2 * Math.cos(2 * Math.PI * 1 * tau)) }
        },
        {
            type: 'sss',
            equation: `<math><mi>X</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>=</mo><mi>W</mi><mo>[</mo><mi>n</mi><mo>]</mo></math>`,
            variables: `<ul>
                <li>This is a discrete-time process (<strong>discrete white noise</strong>).</li>
                <li><i>W[n]</i> is a sequence of <strong>Independent and Identically Distributed</strong> random variables with mean E[<i>W[n]</i>] = 0 and variance E[<i>W[n]<sup>2</sup></i>] = σ<sup>2</sup>.</li>
            </ul>`,
            explanation: `
                <p><strong>This is a Strict-Sense Stationary (SSS) process by definition.</strong></p>
                <h4>SSS Proof (Conceptual):</h4>
                <p>The term <strong>Independent and Identically Distributed</strong> provides the proof directly:</p>
                <ul style="list-style: disc; margin-left: 20px;">
                    <li><strong>Identically Distributed:</strong> The probability distribution of any single sample <i>X[n]</i> is the same, regardless of the time index <i>n</i>.</li>
                    <li><strong>Independent:</strong> The joint probability distribution of any set of samples is the product of their individual distributions.</li>
                </ul>
                <p>Consider a set of samples at times <math><msub><mi>n</mi><mn>1</mn></msub><mo>,</mo><mo>...</mo><mo>,</mo><msub><mi>n</mi><mi>k</mi></msub></math>. Their joint Probability Density Function is <math><mi>f</mi><mo>(</mo><msub><mi>x</mi><mn>1</mn></msub><mo>,</mo><mo>...</mo><mo>,</mo><msub><mi>x</mi><mi>k</mi></msub><mo>)</mo><mo>=</mo><munderover><mo>∏</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>k</mi></munderover><msub><mi>f</mi><mi>W</mi></msub><mo>(</mo><msub><mi>x</mi><mi>i</mi></msub><mo>)</mo></math>. If we shift all time indices by <i>m</i>, the new set of samples is still Independent and Identically Distributed, so its joint Probability Density Function is identical. This directly satisfies the condition for SSS.</p>
                <h4>WSS Proof (Mathematical):</h4>
                <p><strong>Mean:</strong> <math><mi>E</mi><mo>[</mo><mi>X</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>]</mo><mo>=</mo><mi>E</mi><mo>[</mo><mi>W</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>]</mo><mo>=</mo><mn>0</mn></math>. (Constant)</p>
                <p><strong>Autocorrelation:</strong> <math><msub><mi>R</mi><mrow><mi>X</mi><mi>X</mi></mrow></msub><mo>[</mo><mi>k</mi><mo>]</mo><mo>=</mo><mi>E</mi><mo>[</mo><mi>W</mi><mo>[</mo><mi>n</mi><mo>]</mo><mi>W</mi><mo>[</mo><mi>n</mi><mo>-</mo><mi>k</mi><mo>]</mo><mo>]</mo><mo>=</mo><msup><mi>σ</mi><mn>2</mn></msup><mi>δ</mi><mo>[</mo><mi>k</mi><mo>]</mo></math>. This only depends on the lag <i>k</i>, not on time <i>n</i>.</p>`,
            sampleGenerator: () => (Math.random() - 0.5) * 2,
            proofPlot: { type: 'acf', data: (labels) => labels.map(k => k === 0 ? 1 : 0) }
        },
    ],
    wss: [
        {
            type: 'wss',
            equation: `<math><mi>X</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mi>A</mi><mo>⁡</mo><mrow><mi>cos</mi><mo>⁡</mo><mrow><mo>(</mo><mi>ω</mi><mi>t</mi><mo>)</mo></mrow></mrow><mo>+</mo><mi>B</mi><mo>⁡</mo><mrow><mi>sin</mi><mo>⁡</mo><mrow><mo>(</mo><mi>ω</mi><mi>t</mi><mo>)</mo></mrow></mrow></math>`,
            variables: `<ul>
                <li><i>ω</i> is a constant frequency.</li>
                <li><i>A</i> and <i>B</i> are uncorrelated random variables with E[<i>A</i>] = E[<i>B</i>] = 0 and E[<i>A²</i>] = E[<i>B²</i>] = σ².</li>
            </ul>`,
            explanation: `
                <p><strong>This is a Wide-Sense Stationary (WSS) process.</strong> Its first and second moments (mean and autocorrelation) are time-invariant.</p>
                <h4>WSS Proof:</h4>
                <p><strong>Mean:</strong> <math><mi>E</mi><mo>[</mo><mi>X</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>]</mo><mo>=</mo><mi>E</mi><mo>[</mo><mi>A</mi><mo>]</mo><mi>cos</mi><mo>(</mo><mi>ω</mi><mi>t</mi><mo>)</mo><mo>+</mo><mi>E</mi><mo>[</mo><mi>B</mi><mo>]</mo><mi>sin</mi><mo>(</mo><mi>ω</mi><mi>t</mi><mo>)</mo><mo>=</mo><mn>0</mn></math>. (Constant)</p>
                <p><strong>Autocorrelation:</strong> <math><msub><mi>R</mi><mrow><mi>X</mi><mi>X</mi></mrow></msub><mo>(</mo><mi>τ</mi><mo>)</><mo>=</mo><msup><mi>σ</mi><mn>2</mn></msup><mi>cos</mi><mo>(</mo><mi>ω</mi><mi>τ</mi><mo>)</mo></math>. This only depends on the time lag τ.</p>
                <h4 style="margin-top:1.5rem">Why is it not SSS?</h4>
                <p>This process is not guaranteed to be Strict-Sense Stationary. For a process to be SSS, all of its statistical properties must be time-invariant. Here, while the mean and autocorrelation are constant, the higher-order moments (like skewness or kurtosis) might not be. The problem states A and B are uncorrelated but does not specify their distributions. If, for example, A had a uniform distribution and B had a triangular distribution, the overall probability distribution of X(t) would change with time, even if the first two moments do not. Therefore, without knowing more about A and B, we can only classify it as WSS.</p>`,
            sampleGenerator: (labels) => {
                const A = (Math.random() - 0.5) * 2.5; const B = (Math.random() - 0.5) * 2.5;
                return A * Math.cos(2 * Math.PI * 1 * labels.t) + B * Math.sin(2 * Math.PI * 1 * labels.t);
            },
            proofPlot: { type: 'acf', data: (labels) => labels.map(tau => 1.5 * Math.cos(2 * Math.PI * 1 * tau)) }
        },
        {
            type: 'wss',
            equation: `<math><mi>X</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>=</mo><mn>0.8</mn><mo>⁢</mo><mi>X</mi><mo>[</mo><mi>n</mi><mo>-</mo><mn>1</mn><mo>]</mo><mo>+</mo><mi>W</mi><mo>[</mo><mi>n</mi><mo>]</mo></math>`,
            variables: `<ul>
                <li>This is a discrete-time <strong>Autoregressive (AR)</strong> process.</li>
                <li><i>W[n]</i> is a zero-mean white noise process.</li>
            </ul>`,
            explanation: `
                <p><strong>This is a Wide-Sense Stationary (WSS) process.</strong> Provided the process started in the infinite past (or has run long enough to reach a steady state), it is stationary.</p>
                <h4>WSS Proof:</h4>
                <p><strong>Mean:</strong> In steady state, <math><mi>E</mi><mo>[</mo><mi>X</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>]</mo><mo>=</mo><mn>0</mn></math>. (Constant)</p>
                <p><strong>Autocorrelation:</strong> <math><msub><mi>R</mi><mrow><mi>X</mi><mi>X</mi></mrow></msub><mo>[</mo><mi>k</mi><mo>]</mo><mo>=</mo><msubsup><mi>σ</mi><mi>X</mi><mn>2</mn></msubsup><mo>(</mo><mn>0.8</mn><msup><mo>)</mo><mrow><mo>|</mo><mi>k</mi><mo>|</mo></mrow></msup></math>. This depends only on the lag <i>k</i>.</p>
                <h4 style="margin-top:1.5rem">Why is it not SSS?</h4>
                <p>Similar to other linear processes, this Autoregressive process is only guaranteed to be SSS if the driving noise <i>W[n]</i> is SSS (for example, if it is Gaussian Independent and Identically Distributed noise). Since the definition of <i>W[n]</i> only imposes conditions on its mean and variance, we can only prove that the resulting process <i>X[n]</i> is WSS.</p>`,
            sampleGenerator: (labels, past) => 0.8 * past.x1 + labels.w,
            proofPlot: { type: 'acf', data: (labels) => labels.map(k => Math.pow(0.8, Math.abs(k)) * 2) }
        }
    ],
    nonStat: [
        {
            type: 'nonStat',
            equation: `<math><mi>X</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mi>A</mi><mo>⁢</mo><mi>t</mi><mo>+</mo><mi>B</mi></math>`,
            variables: `<ul>
                <li><i>A</i> and <i>B</i> are independent random variables with means E[<i>A</i>] = μ<sub>A</sub> ≠ 0 and E[<i>B</i>] = μ<sub>B</sub>.</li>
                <li><i>t</i> represents time.</li>
            </ul>`,
            explanation: `
                <p><strong>This is a Non-Stationary process because its mean is a function of time.</strong></p>
                <h4>Proof:</h4>
                <p><strong>Mean:</strong> <math><mi>E</mi><mo>[</mo><mi>X</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>]</mo><mo>=</mo><mi>E</mi><mo>[</mo><mi>A</mi><mo>]</mo><mo>⁢</mo><mi>t</mi><mo>+</mo><mi>E</mi><mo>[</mo><mi>B</mi><mo>]</mo><mo>=</mo><msub><mi>μ</mi><mi>A</mi></msub><mi>t</mi><mo>+</mo><msub><mi>μ</mi><mi>B</mi></msub></math>.</p>
                <p>Since the mean depends linearly on time <i>t</i>, the process is non-stationary. A process must at least be WSS to be considered stationary.</p>`,
            sampleGenerator: (labels) => (0.5 * labels.t) + (Math.random() - 0.5) * 2,
            proofPlot: { type: 'mean', data: (labels) => labels.map(t => 0.5 * t + 0) }
        },
        {
            type: 'nonStat',
            equation: `<math><mi>X</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>=</mo><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi></munderover><mi>W</mi><mo>[</mo><mi>i</mi><mo>]</mo></math>`,
            variables: `<ul>
                <li>This is a discrete-time <strong>Random Walk</strong> process, with X[0]=0.</li>
                <li><i>W[n]</i> is a zero-mean white noise process with variance σ².</li>
            </ul>`,
            explanation: `
                <p><strong>This is a Non-Stationary process because its variance (and thus autocorrelation) is a function of time.</strong></p>
                <h4>Proof:</h4>
                <p><strong>Mean:</strong> <math><mi>E</mi><mo>[</mo><mi>X</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>]</mo><mo>=</mo><mn>0</mn></math>. The mean is constant, so this condition for stationarity is met.</p>
                <p>The <strong>Variance</strong>, however, is: <math><mi>Var</mi><mo>(</mo><mi>X</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>)</mo><mo>=</mo><mi>E</mi><mo>[</mo><msup><mrow><mo>(</mo><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi></munderover><mi>W</mi><mo>[</mo><mi>i</mi><mo>]</mo><mo>)</mo></mrow><mn>2</mn></msup><mo>]</mo><mo>=</mo><mi>n</mi><msup><mi>σ</mi><mn>2</mn></msup></math>.</p>
                <p>Because the variance depends on time <i>n</i>, the process is non-stationary.</p>`,
            sampleGenerator: (labels, past) => past.x1 + labels.w,
            proofPlot: { type: 'variance', data: (labels) => labels.map(t => t) }
        },
    ]
};


// --------------------------------------
// 3. Plotting & UI Update
// --------------------------------------
function renderPlots(process) {
    // Add containers for the plots BEFORE trying to get their context
    explanationContent.innerHTML += `
        <div class="plot-container"><canvas id="plot1"></canvas></div>
        <div class="plot-container"><canvas id="plot2"></canvas></div>`;

    // Plot 1: Sample Realizations
    const ctx1 = document.getElementById('plot1').getContext('2d');
    const datasets1 = [];
    const timeLabels = Array.from({length: 100}, (_, i) => i / 50); // Time from 0 to 2

    for(let i = 0; i < 3; i++) { // Generate 3 sample paths
        const data = [];
        let w_history = [0, 0];
        let x_history = [0, 0];
        const A_const = (Math.random() - 0.5) * 4; // For processes that use a single random var

        for (const t of timeLabels) {
            const w = (Math.random() - 0.5) * 2;
            let val = process.sampleGenerator({ t: t, w: w }, { w1: w_history[0], x1: x_history[0] });
            if (process.equation.includes('<mi>X</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mi>A</mi>')) {
                 val = A_const;
            }
            data.push(val);
            w_history.unshift(w); w_history.pop();
            x_history.unshift(val); x_history.pop();
        }

        datasets1.push({
            label: `Realization ${i+1}`,
            data: data,
            borderColor: `hsl(${i * 120}, 70%, 50%)`,
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
            tension: 0.1
        });
    }

    new Chart(ctx1, {
        type: 'line',
        data: { labels: timeLabels, datasets: datasets1 },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { title: { display: true, text: 'Sample Realizations of the Process' }, legend: { position: 'bottom'}},
            scales: { x: { title: { display: true, text: 'Time (t or n)' } } }
        }
    });

    // Plot 2: Proof Illustration (ACF, Mean, or Variance)
    const ctx2 = document.getElementById('plot2').getContext('2d');
    const proofPlot = process.proofPlot;
    let plot2Labels, plot2Title, plot2XAxis, plot2Color;

    if (proofPlot.type === 'acf') {
        plot2Title = 'Autocorrelation Function R(τ)';
        plot2XAxis = 'Lag (τ or k)';
        plot2Color = '#23d160';
        plot2Labels = Array.from({length: 101}, (_, i) => (i-50)/10); // Lags
    } else if (proofPlot.type === 'mean') {
        plot2Title = 'Mean E[X(t)] vs. Time';
        plot2XAxis = 'Time (t)';
        plot2Color = '#ff3860';
        plot2Labels = timeLabels;
    } else { // variance
        plot2Title = 'Variance Var(X(t)) vs. Time';
        plot2XAxis = 'Time (n)';
        plot2Color = '#ffae42';
        plot2Labels = timeLabels;
    }

    const plot2Data = [{
        label: plot2Title,
        data: proofPlot.data(plot2Labels),
        borderColor: plot2Color,
        borderWidth: 2.5,
        pointRadius: 0,
        fill: false,
    }];

     new Chart(ctx2, {
        type: 'line',
        data: { labels: plot2Labels, datasets: plot2Data },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { title: { display: true, text: plot2Title }, legend: { display: false }},
            scales: { x: { title: { display: true, text: plot2XAxis } } }
        }
    });
}


function resetUI() {
    userGuess.value = "";
    userGuess.disabled = false;
    submitBtn.disabled = false;
    submissionFeedback.style.display = 'none';
    submissionFeedback.className = '';
    explanationPanel.style.display = 'none';
    explanationContent.innerHTML = ''; // Clear previous explanation
}

function selectProcess(process) {
    currentProcess = process;
    
    equationContainer.innerHTML = currentProcess.equation;
    variableDefinitions.innerHTML = currentProcess.variables;
    
    resetUI();
}

// --------------------------------------
// 4. Event Listeners & Initialization
// --------------------------------------
function handleSubmit() {
    const guess = userGuess.value;
    if (!guess) {
        alert("Please select an answer from the dropdown first.");
        return;
    }

    userGuess.disabled = true;
    submitBtn.disabled = true;

    let feedbackText;
    let feedbackClass;

    if (guess === currentProcess.type) {
        feedbackText = 'Correct!';
        feedbackClass = 'correct';
    } else if (guess === 'wss' && currentProcess.type === 'sss') {
        feedbackText = "You're on the right track! The process is indeed WSS, but an even stronger condition applies. See the proof below.";
        feedbackClass = 'partial';
    } else {
        feedbackText = 'Incorrect.';
        feedbackClass = 'incorrect';
    }

    submissionFeedback.textContent = feedbackText;
    submissionFeedback.className = feedbackClass;
    submissionFeedback.style.display = 'block';

    explanationContent.innerHTML = currentProcess.explanation;
    explanationPanel.style.display = 'block';
    renderPlots(currentProcess); 
}


window.addEventListener('load', () => {
    // --- UPDATED LOGIC ---
    // Randomly select exactly one process from each category
    const sssProcess = processDefinitions.sss[Math.floor(Math.random() * processDefinitions.sss.length)];
    const wssProcess = processDefinitions.wss[Math.floor(Math.random() * processDefinitions.wss.length)];
    const nonStatProcess = processDefinitions.nonStat[Math.floor(Math.random() * processDefinitions.nonStat.length)];

    const processes = [sssProcess, wssProcess, nonStatProcess];
    
    // Shuffle the selected processes so their order is random
    const shuffledProcesses = processes.sort(() => Math.random() - 0.5);
    // --- END UPDATED LOGIC ---

    // Create buttons for the selected mystery processes
    shuffledProcesses.forEach((proc, index) => {
        const btn = document.createElement('button');
        btn.className = 'button is-primary is-medium';
        btn.textContent = `Mystery Process ${index + 1}`;
        btn.onclick = () => {
            document.querySelectorAll('#signal-selector-container button').forEach(b => b.classList.remove('is-light'));
            btn.classList.add('is-light');
            selectProcess(proc);
        };
        signalSelectorContainer.appendChild(btn);
    });
    
    submitBtn.addEventListener('click', handleSubmit);

    // Auto-click the first button to load a process on start
    if (signalSelectorContainer.firstChild) {
        signalSelectorContainer.firstChild.click();
    }
});