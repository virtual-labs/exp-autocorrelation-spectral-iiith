// --------------------------------------
// 1. DOM References
// --------------------------------------
const processDescription = document.getElementById('process-description');
const equationOptionsContainer = document.getElementById('equation-options');
const acfPlotsContainer = document.getElementById('acf-plots');
const psdPlotsContainer = document.getElementById('psd-plots');

const task1Panel = document.getElementById('task1-equation-inference');
const task2Panel = document.getElementById('task2-acf-identification');
const task3Panel = document.getElementById('task3-psd-identification');
const task4Panel = document.getElementById('task4-final-explanation');

const submitTask1Btn = document.getElementById('submit-task1');
const submitTask2Btn = document.getElementById('submit-task2');
const submitTask3Btn = document.getElementById('submit-task3');
const restartBtn = document.getElementById('restart-btn');

const feedback1 = document.getElementById('feedback-task1');
const feedback2 = document.getElementById('feedback-task2');
const feedback3 = document.getElementById('feedback-task3');

const finalExplanationContent = document.getElementById('final-explanation-content');

// --------------------------------------
// 2. Process Database
// --------------------------------------
const processDatabase = [
    {
        id: 'sine_random_phase',
        description: "A pure tone from a stable oscillator whose starting phase is random between measurements.",
        correctEquation: { id: 'eq_sine', math: `<math><mi>X</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mi>A</mi><mo>⁡</mo><mrow><mi>cos</mi><mo>⁡</mo><mrow><mo>(</mo><msub><mi>ω</mi><mn>0</mn></msub><mi>t</mi><mo>+</mo><mi>Θ</mi><mo>)</mo></mrow></mrow></math>` },
        distractorEquations: [
            { id: 'eq_noise', math: `<math><mi>X</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>=</mo><mi>W</mi><mo>[</mo><mi>n</mi><mo>]</mo></math>` },
            // --- CHANGED --- Using the new formal equation as a distractor
            { id: 'eq_telegraph', math: `<math><mi>X</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mo>(</mo><mo>-</mo><mn>1</mn><msup><mo>)</mo><mrow><mi>N</mi><mo>(</mo><mi>t</mi><mo>)</mo></mrow></msup></math>` }
        ],
        acf: { id: 'acf_cosine', title: 'ACF: Cosine', generator: (labels) => labels.map(tau => Math.cos(2 * Math.PI * 0.5 * tau)) },
        psd: {
            id: 'psd_impulses', title: 'PSD: Frequency Impulses', generator: (labels) => {
                const data = Array(labels.length).fill(0);
                const posFreqIndex = labels.findIndex(f => f >= 0.5);
                const negFreqIndex = labels.findIndex(f => f >= -0.5);
                if (posFreqIndex !== -1) data[posFreqIndex] = 1;
                if (negFreqIndex !== -1) data[negFreqIndex] = 1;
                return data;
            }
        },
        explanation: `
            <div class="explanation-section"><h4>1. The Equation</h4><p>A "pure tone" implies a sinusoidal function like cosine or sine. The key is that the "starting phase is random." This randomness is captured by the random variable <i>Θ</i> inside the cosine argument. This makes the process stationary.</p></div>
            <div class="explanation-section"><h4>2. The Autocorrelation Function (ACF)</h4><p>The ACF for a sinusoidal process with random phase is a cosine wave at the same frequency that does not decay. This indicates perfect correlation when the time lag <i>τ</i> is a multiple of the period, reflecting the process's perfectly repetitive nature.</p><div class="final-plot-container"><canvas id="final-acf-plot"></canvas></div></div>
            <div class="explanation-section"><h4>3. The Power Spectral Density (PSD)</h4><p>The Wiener-Khinchin theorem states the PSD is the Fourier Transform of the ACF. The transform of a non-decaying cosine is a pair of impulses (delta functions) at the positive and negative frequencies of the sinusoid. This shows that all the process's power is concentrated at a single frequency <i>ω₀</i>.</p><div class="final-plot-container"><canvas id="final-psd-plot"></canvas></div></div>`
    },
    {
        id: 'white_noise',
        description: "A signal where each sample is a completely random, independent value from a consistent source, like thermal noise in a resistor.",
        correctEquation: { id: 'eq_noise', math: `<math><mi>X</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>=</mo><mi>W</mi><mo>[</mo><mi>n</mi><mo>]</mo></math>` },
        distractorEquations: [
            { id: 'eq_sine', math: `<math><mi>X</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mi>A</mi><mo>⁡</mo><mrow><mi>cos</mi><mo>⁡</mo><mrow><mo>(</mo><msub><mi>ω</mi><mn>0</mn></msub><mi>t</mi><mo>+</mo><mi>Θ</mi><mo>)</mo></mrow></mrow></math>` },
            { id: 'eq_telegraph', math: `<math><mi>X</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mo>(</mo><mo>-</mo><mn>1</mn><msup><mo>)</mo><mrow><mi>N</mi><mo>(</mo><mi>t</mi><mo>)</mo></mrow></msup></math>` }
        ],
        acf: { id: 'acf_impulse', title: 'ACF: Impulse', generator: (labels) => labels.map(tau => Math.abs(tau) < 0.01 ? 1 : 0) },
        psd: { id: 'psd_constant', title: 'PSD: Constant (Flat)', generator: (labels) => Array(labels.length).fill(0.5) },
        explanation: `
            <div class="explanation-section"><h4>1. The Equation</h4><p>This describes discrete white noise. The value at any time <i>n</i>, denoted <i>W[n]</i>, is an independent random variable. There is no dependency on past values.</p></div>
            <div class="explanation-section"><h4>2. The Autocorrelation Function (ACF)</h4><p>Because each sample is independent of all others, the process is only correlated with itself at a time lag of zero (<i>τ</i>=0). At all other lags, the correlation is zero. This results in an ACF that is a single impulse (a delta function).</p><div class="final-plot-container"><canvas id="final-acf-plot"></canvas></div></div>
            <div class="explanation-section"><h4>3. The Power Spectral Density (PSD)</h4><p>The Fourier transform of an impulse function is a constant. This means that white noise has equal power at all frequencies. Its spectrum is completely flat.</p><div class="final-plot-container"><canvas id="final-psd-plot"></canvas></div></div>`
    },
    {
        id: 'telegraph_signal',
        description: "A signal that randomly flips between +1V and -1V. The time between flips follows a Poisson distribution.",
        // --- CHANGED --- Replaced the descriptive text with a formal equation.
        correctEquation: { id: 'eq_telegraph', math: `<math><mi>X</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mo>(</mo><mo>-</mo><mn>1</mn><msup><mo>)</mo><mrow><mi>N</mi><mo>(</mo><mi>t</mi><mo>)</mo></mrow></msup></math>` },
        distractorEquations: [
            { id: 'eq_noise', math: `<math><mi>X</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>=</mo><mi>W</mi><mo>[</mo><mi>n</mi><mo>]</mo></math>`},
            { id: 'eq_sine', math: `<math><mi>X</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mi>A</mi><mo>⁡</mo><mrow><mi>cos</mi><mo>⁡</mo><mrow><mo>(</mo><msub><mi>ω</mi><mn>0</mn></msub><mi>t</mi><mo>+</mo><mi>Θ</mi><mo>)</mo></mrow></mrow></math>` }
        ],
        acf: { id: 'acf_exponential', title: 'ACF: Exponential Decay', generator: (labels) => labels.map(tau => Math.exp(-2 * Math.abs(tau))) },
        psd: { id: 'psd_lowpass', title: 'PSD: Lorentzian Shape', generator: (labels) => labels.map(f => 4 / (4 + Math.pow(2 * Math.PI * f, 2))) },
        // --- CHANGED --- Updated the explanation to reference the new equation.
        explanation: `
            <div class="explanation-section"><h4>1. The Equation</h4><p>This is the formal equation for a Random Telegraph Signal. <i>N(t)</i> is a Poisson counting process, which counts the number of random "flips" that have occurred up to time <i>t</i>. The term (-1)<sup>N(t)</sup> causes the signal's value to flip between +1 and -1 each time a Poisson event occurs.</p></div>
            <div class="explanation-section"><h4>2. The Autocorrelation Function (ACF)</h4><p>The signal is perfectly correlated with itself at lag zero. As the lag <i>τ</i> increases, the probability of one or more flips occurring increases, causing the correlation to decay. This decay is exponential, reflecting the memoryless property of the Poisson switching times.</p><div class="final-plot-container"><canvas id="final-acf-plot"></canvas></div></div>
            <div class="explanation-section"><h4>3. The Power Spectral Density (PSD)</h4><p>The Fourier transform of a two-sided exponential decay has a Lorentzian shape. This is a type of low-pass spectrum, meaning the process has more power in its lower frequencies (slower switching) and less power in its higher frequencies (faster switching).</p><div class="final-plot-container"><canvas id="final-psd-plot"></canvas></div></div>`
    },
];

// --------------------------------------
// 3. State Management
// --------------------------------------
let currentProcess = null;
let distractorPool = [];
let selectedPlotId = null;
let chartInstances = [];

// --------------------------------------
// 4. Core Logic
// --------------------------------------
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function renderPlot(canvasElement, plotData, labels, title, axisLabel) {
    if (!canvasElement) return;
    const ctx = canvasElement.getContext('2d');
    
    const existingChart = chartInstances.find(c => c.canvas === canvasElement);
    if(existingChart) {
        chartInstances = chartInstances.filter(c => c.canvas !== canvasElement);
        existingChart.destroy();
    }

    const newChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{ data: plotData, borderColor: '#3273dc', borderWidth: 2.5, pointRadius: 0, fill: false, tension: 0.1 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { title: { display: true, text: title, font: {size: 14} }, legend: { display: false } },
            scales: { x: { title: { display: true, text: axisLabel } } }
        }
    });
    chartInstances.push(newChart);
}

function setupTask1() {
    processDescription.textContent = currentProcess.description;
    const options = shuffle([currentProcess.correctEquation, ...currentProcess.distractorEquations]);
    equationOptionsContainer.innerHTML = '';
    options.forEach(eq => {
        const div = document.createElement('div');
        div.className = 'equation-option';
        div.innerHTML = `<input type="radio" name="equation-choice" value="${eq.id}" id="radio-${eq.id}"><label for="radio-${eq.id}">${eq.math}</label>`;
        equationOptionsContainer.appendChild(div);
    });
    if (window.MathJax) {
        MathJax.typesetPromise([equationOptionsContainer]);
    }
}

// --- UPDATED FUNCTION ---
function setupPlots(container, plots, axisLabel) {
    container.innerHTML = '';
    selectedPlotId = null;
    
    // Increased the number of points from 101 to 201 for much smoother plots.
    const labels = axisLabel === 'Lag (τ)' ? 
                   Array.from({length: 201}, (_, i) => ((i - 100) / 20).toFixed(2)) : // Range: -5 to 5
                   Array.from({length: 201}, (_, i) => ((i - 100) / 50).toFixed(2)); // Range: -2 to 2

    plots.forEach(plot => {
        const wrapper = document.createElement('div');
        wrapper.className = 'plot-wrapper';
        wrapper.dataset.plotId = plot.id;
        const canvas = document.createElement('canvas');
        wrapper.appendChild(canvas);
        
        wrapper.onclick = () => {
            document.querySelectorAll(`#${container.id} .plot-wrapper`).forEach(w => w.classList.remove('selected'));
            wrapper.classList.add('selected');
            selectedPlotId = plot.id;
        };
        container.appendChild(wrapper);
        setTimeout(() => {
            renderPlot(canvas, plot.generator(labels), labels, plot.title, axisLabel);
        }, 0);
    });
}

function setupTask2() {
    const recapContainer = document.getElementById('recap-task1');
    recapContainer.innerHTML = `
        <h4>Correct! The process equation is:</h4>
        <div class="equation-box">${currentProcess.correctEquation.math}</div>
    `;
    if (window.MathJax) {
        MathJax.typesetPromise([recapContainer]);
    }

    const correctPlot = currentProcess.acf;
    const distractorPlots = distractorPool.map(p => p.acf).filter(p => p.id !== correctPlot.id);
    const plotOptions = shuffle([correctPlot, ...distractorPlots.slice(0, 2)]);
    setupPlots(acfPlotsContainer, plotOptions, 'Lag (τ)');
}

function setupTask3() {
    const recapContainer = document.getElementById('recap-task2');
    recapContainer.innerHTML = `
        <h4>Excellent! Here are the results so far:</h4>
        <div class="recap-grid">
            <div>
                <p><strong>Equation:</strong></p>
                <div class="equation-box">${currentProcess.correctEquation.math}</div>
            </div>
            <div>
                <p><strong>Autocorrelation (ACF):</strong></p>
                <div class="recap-plot-container">
                    <canvas id="recap-acf-canvas"></canvas>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        const recapCanvas = document.getElementById('recap-acf-canvas');
        const lagLabels = Array.from({length: 101}, (_, i) => ((i - 50) / 10).toFixed(1)); // Lower res for recap is fine
        renderPlot(recapCanvas, currentProcess.acf.generator(lagLabels), lagLabels, currentProcess.acf.title, 'Lag (τ)');

        if (window.MathJax) {
            MathJax.typesetPromise([recapContainer]);
        }
    }, 0);

    const correctPlot = currentProcess.psd;
    const distractorPlots = distractorPool.map(p => p.psd).filter(p => p.id !== correctPlot.id);
    const plotOptions = shuffle([correctPlot, ...distractorPlots.slice(0, 2)]);
    setupPlots(psdPlotsContainer, plotOptions, 'Frequency (f)');
}

function setupTask4() {
    finalExplanationContent.innerHTML = currentProcess.explanation;
    setTimeout(() => {
        const lagLabels = Array.from({length: 201}, (_, i) => ((i - 100) / 20).toFixed(2));
        const freqLabels = Array.from({length: 201}, (_, i) => ((i - 100) / 50).toFixed(2));
        const finalAcfCanvas = document.getElementById('final-acf-plot');
        const finalPsdCanvas = document.getElementById('final-psd-plot');
        renderPlot(finalAcfCanvas, currentProcess.acf.generator(lagLabels), lagLabels, `Correct ACF: ${currentProcess.acf.title}`, 'Lag (τ)');
        renderPlot(finalPsdCanvas, currentProcess.psd.generator(freqLabels), freqLabels, `Correct PSD: ${currentProcess.psd.title}`, 'Frequency (f)');
        if(window.MathJax) {
             MathJax.typesetPromise([finalExplanationContent]);
        }
    }, 0);
}

function showFeedback(feedbackEl, isCorrect) {
    feedbackEl.style.display = 'block';
    feedbackEl.textContent = isCorrect ? 'Correct!' : 'Not quite, try again.';
    feedbackEl.className = `feedback-message ${isCorrect ? 'correct' : 'incorrect'}`;
}

function startExperiment() {
    chartInstances.forEach(chart => chart.destroy());
    chartInstances = [];
    [task1Panel, task2Panel, task3Panel, task4Panel].forEach(p => p.style.display = 'none');
    [feedback1, feedback2, feedback3].forEach(f => { f.style.display = 'none'; f.className = 'feedback-message'; });

    const lastProcessId = currentProcess ? currentProcess.id : null;
    let availableProcesses = processDatabase.filter(p => p.id !== lastProcessId);
    if (availableProcesses.length === 0) {
        availableProcesses = processDatabase;
    }
    
    currentProcess = availableProcesses[Math.floor(Math.random() * availableProcesses.length)];
    distractorPool = processDatabase.filter(p => p.id !== currentProcess.id);
    
    setupTask1();
    task1Panel.style.display = 'block';
}

// --------------------------------------
// 5. Event Listeners
// --------------------------------------
function handleSubmission(btn, feedbackEl, isCorrect, nextStepFn) {
    if (isCorrect) {
        showFeedback(feedbackEl, true);
        btn.disabled = true;
        setTimeout(() => {
            btn.parentElement.parentElement.style.display = 'none';
            nextStepFn();
            btn.disabled = false;
        }, 1200);
    } else {
        showFeedback(feedbackEl, false);
    }
}

submitTask1Btn.addEventListener('click', () => {
    const selected = document.querySelector('input[name="equation-choice"]:checked');
    if (!selected) { alert("Please select an equation."); return; }
    const isCorrect = selected.value === currentProcess.correctEquation.id;
    handleSubmission(submitTask1Btn, feedback1, isCorrect, () => {
        task2Panel.style.display = 'block';
        setupTask2();
    });
});

submitTask2Btn.addEventListener('click', () => {
    if (!selectedPlotId) { alert("Please select a plot."); return; }
    const isCorrect = selectedPlotId === currentProcess.acf.id;
    handleSubmission(submitTask2Btn, feedback2, isCorrect, () => {
        task3Panel.style.display = 'block';
        setupTask3();
    });
});

submitTask3Btn.addEventListener('click', () => {
    if (!selectedPlotId) { alert("Please select a plot."); return; }
    const isCorrect = selectedPlotId === currentProcess.psd.id;
    handleSubmission(submitTask3Btn, feedback3, isCorrect, () => {
        task4Panel.style.display = 'block';
        setupTask4();
    });
});

restartBtn.addEventListener('click', startExperiment);
window.addEventListener('load', startExperiment);