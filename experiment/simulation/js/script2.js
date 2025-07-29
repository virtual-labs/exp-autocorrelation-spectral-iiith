// --------------------------------------
// 1. DOM and Chart References
// --------------------------------------
const signalSelectorContainer = document.getElementById('signal-selector-container');
const submitBtn = document.getElementById('submitBtn');
const userGuess = document.getElementById('user-guess');
const submissionFeedback = document.getElementById('submission-feedback');

const mainPlotWrapper = document.getElementById('main-plot-wrapper');
const inspectorWindow = document.getElementById('inspector-window');
const observationsDiv = document.getElementById('observations');
const meanDisplay = document.querySelector('#mean-display p');

const mainChartCtx = document.getElementById('mainSignalChart').getContext('2d');
const acfChartCtx = document.getElementById('acfChart').getContext('2d');

// --------------------------------------
// 2. Configuration & State
// --------------------------------------
const TOTAL_POINTS = 1000;
const WINDOW_POINTS = 200;
const ACF_MAX_LAG = 50;
let isDragging = false;
let currentSignalData = [];
let mainChart, acfChart;
let currentSignal; // Will hold the object of the currently displayed signal

const signalDefinitions = [
    {
        type: 'wss',
        generator: generateWSS,
        explanation: `<strong>This is a Wide-Sense Stationary (WSS) signal.</strong><br>The correct analysis shows that the <strong>Local Mean</strong> stays close to zero and the overall shape and peak of the <strong>Local ACF</strong> plot remains consistent, regardless of where the inspector window is placed. This indicates that its statistical properties are not changing over time.`
    },
    {
        type: 'nonStatMean',
        generator: generateNonStationaryMean,
        explanation: `<strong>This signal has a Non-Stationary Mean.</strong><br>The correct analysis shows that as you drag the inspector window from left to right, the <strong>Local Mean</strong> value increases, following the upward trend (ramp) of the signal. Because the mean is not constant, the process is non-stationary.`
    },
    {
        type: 'nonStatAcf',
        generator: generateNonStationaryACF,
        explanation: `<strong>This signal has a Non-Stationary Autocorrelation.</strong><br>The correct analysis shows that while the <strong>Local Mean</strong> stays near zero, the <strong>Local ACF</strong>'s peak value (representing local variance) changes significantly. The peak gets larger and smaller as you move the window, corresponding to the parts of the signal where the amplitude is wide and narrow. Since the ACF changes with time, the process is non-stationary.`
    }
];

// --------------------------------------
// 3. Signal Generation (Functions are the same as before)
// --------------------------------------
function generateWhiteNoise(n, amp=1) { return Array.from({length: n}, () => (Math.random() - 0.5) * 2 * amp); }
function generateWSS() {
    const data = []; const noise = generateWhiteNoise(TOTAL_POINTS, 0.5);
    for (let i=0; i<TOTAL_POINTS; i++) data.push(2*Math.cos(2*Math.PI*10*(i/TOTAL_POINTS)) + noise[i]);
    return data;
}
function generateNonStationaryMean() {
    const data = [];
    for (let i=0; i<TOTAL_POINTS; i++) data.push(2*Math.sin(2*Math.PI*15*(i/TOTAL_POINTS)) + 10*(i/TOTAL_POINTS));
    return data;
}
function generateNonStationaryACF() {
    const data = []; const noise = generateWhiteNoise(TOTAL_POINTS, 1.5);
    for (let i=0; i<TOTAL_POINTS; i++) data.push((1 + 1.5*Math.cos(2*Math.PI*3*(i/TOTAL_POINTS))) * noise[i]);
    return data;
}


// --------------------------------------
// 4. Calculation Functions (Functions are the same as before)
// --------------------------------------
function calculateMean(dataSlice) {
    if (dataSlice.length === 0) return 0;
    return dataSlice.reduce((a, b) => a + b, 0) / dataSlice.length;
}
function calculateACF(dataSlice, maxLag) {
    const N = dataSlice.length;
    if (N === 0) return [];
    const acf = [];
    // Negative lags
    for (let lag = -maxLag; lag <= maxLag; lag++) {
        let sum = 0;
        for (let i = 0; i < N - Math.abs(lag); i++) {
            if (lag < 0) {
                sum += dataSlice[i] * dataSlice[i - lag];
            } else {
                sum += dataSlice[i] * dataSlice[i + lag];
            }
        }
        acf.push(sum / N);
    }
    return acf;
}

// --------------------------------------
// 5. Plotting & UI Update
// --------------------------------------
function initializeCharts() {
    mainChart = new Chart(mainChartCtx, {
        type: 'line',
        data: {
            datasets: [{
                data: [],
                borderColor: '#3273dc',
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { display: false },
                y: { ticks: { font: { size: 10 } } }
            },
            plugins: { legend: { display: false }, tooltip: { enabled: false } }
        }
    });
    acfChart = new Chart(acfChartCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                data: [],
                borderColor: '#23d160',
                backgroundColor: '#23d160',
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#23d160',
                fill: false,
                showLine: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Lag (τ)' } },
                y: { title: { display: true, text: 'R(τ)' } }
            },
            plugins: { legend: { display: false }, tooltip: { enabled: true } }
        }
    });
}

function updateAnalysis() {
    const plotWidth = mainPlotWrapper.clientWidth;
    const windowLeft = inspectorWindow.offsetLeft;
    const startIndex = Math.floor((windowLeft / plotWidth) * TOTAL_POINTS);
    const dataSlice = currentSignalData.slice(startIndex, startIndex + WINDOW_POINTS);
    meanDisplay.textContent = calculateMean(dataSlice).toFixed(2);
    const acfData = calculateACF(dataSlice, ACF_MAX_LAG);
    // Labels from -maxLag to +maxLag
    const acfLabels = Array.from({length: acfData.length}, (_, i) => i - ACF_MAX_LAG);
    acfChart.data.labels = acfLabels;
    acfChart.data.datasets[0].data = acfData;
    acfChart.options.scales.x.display = true;
    acfChart.options.scales.y.display = true;
    acfChart.update();
}

function resetUI() {
    userGuess.value = "";
    userGuess.disabled = false;
    submitBtn.disabled = false;
    submissionFeedback.style.display = 'none';
    submissionFeedback.className = '';
    observationsDiv.innerHTML = '<p class="initial-text">Analyze the signal and submit your answer.</p>';
}

function selectSignal(signal) {
    currentSignal = signal;
    currentSignalData = signal.generator();
    
    // Plot signal and reset UI
    mainChart.data.labels = currentSignalData.map((_, i) => i);
    mainChart.data.datasets[0].data = currentSignalData;
    mainChart.update();
    inspectorWindow.style.left = '0px';
    resetUI();
    updateAnalysis();
}

// --------------------------------------
// 6. Event Listeners & Initialization
// --------------------------------------
function handleSubmit() {
    const guess = userGuess.value;
    if (!guess) {
        alert("Please select an answer from the dropdown first.");
        return;
    }

    userGuess.disabled = true;
    submitBtn.disabled = true;

    let feedbackText = '';
    let feedbackClass = '';
    let observationHtml = '';

    // Determine correct answer category
    let correctCategory = (currentSignal.type === 'wss') ? 'wss' : 'nonStat';

    if (guess === correctCategory) {
        feedbackText = 'Correct!';
        feedbackClass = 'correct';
        observationHtml = `<div class="observation-content"><strong>Your answer is correct.</strong><br>${currentSignal.explanation}</div>`;
    } else {
        feedbackText = 'Incorrect.';
        feedbackClass = 'incorrect';
        // Show generic explanation for user's guess
        let userExplanation = '';
        if (guess === 'wss') {
            userExplanation = signalDefinitions.find(s => s.type === 'wss').explanation;
        } else if (guess === 'nonStat') {
            // For nonStat, show both non-stationary explanations
            userExplanation = `<ul style='margin-left:1em;'>
                <li>${signalDefinitions.find(s => s.type === 'nonStatMean').explanation}</li>
                <li>${signalDefinitions.find(s => s.type === 'nonStatAcf').explanation}</li>
            </ul>`;
        }
        observationHtml = `<div class="observation-content"><strong>Your answer is incorrect.</strong><br><u>What you selected:</u><br>${userExplanation}<br><br><u>Correct analysis:</u><br>${currentSignal.explanation}</div>`;
    }

    submissionFeedback.textContent = feedbackText;
    submissionFeedback.className = feedbackClass;
    observationsDiv.innerHTML = observationHtml;
}

inspectorWindow.addEventListener('mousedown', (e) => { isDragging = true; e.preventDefault(); });
document.addEventListener('mouseup', () => { isDragging = false; });
mainPlotWrapper.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = mainPlotWrapper.getBoundingClientRect();
    let x = e.clientX - rect.left - (inspectorWindow.offsetWidth / 2);
    x = Math.max(0, Math.min(rect.width - inspectorWindow.offsetWidth, x));
    inspectorWindow.style.left = `${x}px`;
    updateAnalysis();
});
submitBtn.addEventListener('click', handleSubmit);

window.addEventListener('load', () => {
    initializeCharts();

    // Shuffle signals for randomness and create buttons
    const shuffledSignals = signalDefinitions.sort(() => Math.random() - 0.5);
    shuffledSignals.forEach((sig, index) => {
        const btn = document.createElement('button');
        btn.className = 'button is-primary is-medium';
        btn.textContent = `Mystery Signal ${index + 1}`;
        btn.onclick = () => {
            // De-select other buttons
            document.querySelectorAll('#signal-selector-container button').forEach(b => b.classList.remove('is-light'));
            btn.classList.add('is-light');
            selectSignal(sig);
        };
        signalSelectorContainer.appendChild(btn);
    });

    // Change dropdown to only 2 options
    userGuess.innerHTML = `
        <option value="">-- Select your answer --</option>
        <option value="wss">Wide-Sense Stationary (WSS)</option>
        <option value="nonStat">Non-Stationary</option>
    `;

    // Set inspector window width and select first signal by default
    const windowWidth = (WINDOW_POINTS / TOTAL_POINTS) * mainPlotWrapper.clientWidth;
    inspectorWindow.style.width = `${windowWidth}px`;
    signalSelectorContainer.firstChild.click(); // Auto-click the first button
});