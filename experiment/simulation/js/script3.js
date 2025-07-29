// --------------------------------------
// 0. A proper FFT Implementation (to replace the flawed DFT)
// Sourced from: https://github.com/dntj/jsfft (MIT License)
//
// We include it directly here to keep the experiment self-contained.
// --------------------------------------
function FFT(size, sampleRate) {
  this.size = size;
  this.sampleRate = sampleRate;
  this.spectrum = new Float32Array(size / 2);
  this.real = new Float32Array(size);
  this.imag = new Float32Array(size);
  this.reverseTable = new Uint32Array(size);
  let limit = 1, bit = size >> 1;
  while (limit < size) {
    for (let i = 0; i < limit; i++) this.reverseTable[i + limit] = this.reverseTable[i] + bit;
    limit = limit << 1;
    bit = bit >> 1;
  }
  this.sinTable = new Float32Array(size);
  this.cosTable = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    this.sinTable[i] = Math.sin(-Math.PI / i);
    this.cosTable[i] = Math.cos(-Math.PI / i);
  }
}
FFT.prototype.forward = function(buffer) {
  const size = this.size,
        real = this.real,
        imag = this.imag,
        reverseTable = this.reverseTable;
  for (let i = 0; i < size; i++) {
    real[i] = buffer[reverseTable[i]];
    imag[i] = 0;
  }
  let halfSize = 1, phaseShiftStepReal, phaseShiftStepImag, currentPhaseReal, currentPhaseImag, off, tr, ti, tmpReal;
  while (halfSize < size) {
    phaseShiftStepReal = this.cosTable[halfSize];
    phaseShiftStepImag = this.sinTable[halfSize];
    currentPhaseReal = 1;
    currentPhaseImag = 0;
    for (let fftStep = 0; fftStep < halfSize; fftStep++) {
      let i = fftStep;
      while (i < size) {
        off = i + halfSize;
        tr = (currentPhaseReal * real[off]) - (currentPhaseImag * imag[off]);
        ti = (currentPhaseReal * imag[off]) + (currentPhaseImag * real[off]);
        real[off] = real[i] - tr;
        imag[off] = imag[i] - ti;
        real[i] += tr;
        imag[i] += ti;
        i += halfSize << 1;
      }
      tmpReal = currentPhaseReal;
      currentPhaseReal = (tmpReal * phaseShiftStepReal) - (currentPhaseImag * phaseShiftStepImag);
      currentPhaseImag = (tmpReal * phaseShiftStepImag) + (currentPhaseImag * phaseShiftStepReal);
    }
    halfSize = halfSize << 1;
  }
  for (let i = 0, N = size / 2; i < N; i++) {
    this.spectrum[i] = (2 * Math.sqrt(real[i] * real[i] + imag[i] * imag[i])) / size;
  }
};
// --- END of FFT Library ---


// --------------------------------------
// 1. DOM and Chart References
// --------------------------------------
const signalTypeSelector = document.getElementById('signal-type');
const slidersContainer = document.getElementById('parameter-sliders');
const observationsDiv = document.getElementById('observations');

const signalChartCtx = document.getElementById('signalChart').getContext('2d');
const acfChartCtx = document.getElementById('acfChart').getContext('2d');
const psdChartCtx = document.getElementById('psdChart').getContext('2d');

let signalChart, acfChart, psdChart;

// --------------------------------------
// 2. Configuration & State
// --------------------------------------
const N_POINTS = 1024; // More points for a cleaner signal
const SAMPLE_RATE = 1024; // 1024 Hz, makes frequency calcs easy
const ACF_MAX_LAG = 256;
const FFT_SIZE = 1024; // Use a larger FFT size with zero-padding for smooth PSD
let currentParams = {};

const observationsText = {
    sine: "<p>A pure sine wave has all its power concentrated at a single frequency. Notice the <strong>single sharp peak</strong> in the PSD plot. The ACF of a sine wave is a cosine wave at the <strong>same frequency</strong>. What happens to the PSD peak's location and height when you change the frequency and amplitude?</p>",
    square: "<p>A square wave is composed of a fundamental frequency and its odd harmonics (3f, 5f, 7f...). Can you see these <strong>additional, smaller peaks</strong> in the PSD? Its ACF is a triangle wave, showing a different correlation structure than a sine wave.</p>",
    noise: "<p>Ideal white noise has equal power at all frequencies, so its PSD should be flat. Its ACF is a single spike at lag \(\tau=0\), showing a sample is <strong>uncorrelated</strong> with all other samples. What happens to the overall power (height of the PSD) as you change the variance?</p>",
    sum_sines: "<p>By adding two sine waves, the PSD clearly shows <strong>two separate peaks</strong>, one for each frequency component. The resulting ACF is more complex, representing the sum of two cosine waves, which creates a 'beating' pattern.</p>"
};

const fft = new FFT(FFT_SIZE, SAMPLE_RATE);

// --------------------------------------
// 3. Calculation Functions
// --------------------------------------
function calculateACF(data, maxLag) {
    const N = data.length;
    const acf = [];
    if (N === 0) return acf;
    for (let lag = 0; lag <= maxLag; lag++) {
        let sum = 0;
        for (let i = 0; i < N - lag; i++) {
            sum += data[i] * data[i + lag];
        }
        acf.push(sum / N); // Biased estimate for positive semi-definite result
    }
    return acf;
}

// ** CORRECTED and IMPROVED ** PSD Calculation using FFT
function calculatePSD(acfData) {
    // 1. Create the full, symmetric ACF needed for the transform
    const symmetricAcf = [...acfData.slice(1).reverse(), ...acfData];
    
    // 2. Create a buffer and zero-pad it to the FFT_SIZE
    const buffer = new Float32Array(FFT_SIZE).fill(0);
    buffer.set(symmetricAcf); // Copies the ACF into the start of the buffer

    // 3. Perform the FFT
    fft.forward(buffer);
    
    // 4. Return the calculated spectrum (magnitudes)
    return fft.spectrum;
}

// --------------------------------------
// 4. Signal Generation
// --------------------------------------
function generateSignal() {
    const type = signalTypeSelector.value;
    const t = Array.from({ length: N_POINTS }, (_, i) => i / SAMPLE_RATE);

    switch (type) {
        case 'sine':
            const { amp, freq } = currentParams;
            return t.map(ti => amp * Math.sin(2 * Math.PI * freq * ti));
        case 'square':
            const { amp: sq_amp, freq: sq_freq } = currentParams;
            return t.map(ti => sq_amp * Math.sign(Math.sin(2 * Math.PI * sq_freq * ti)));
        case 'noise':
            const { variance } = currentParams;
            const stdDev = Math.sqrt(variance);
            return Array.from({ length: N_POINTS }, () => (Math.random() - 0.5) * 2 * stdDev);
        case 'sum_sines':
            const { amp1, freq1, amp2, freq2 } = currentParams;
            return t.map(ti => amp1 * Math.sin(2 * Math.PI * freq1 * ti) + amp2 * Math.sin(2 * Math.PI * freq2 * ti));
    }
    return new Array(N_POINTS).fill(0);
}

// --------------------------------------
// 5. UI and Plotting
// --------------------------------------
function createSlider(id, label, min, max, value, step) {
    const container = document.createElement('div');
    container.className = 'slider-container';
    const sliderLabel = document.createElement('label');
    sliderLabel.innerHTML = `${label}: <span id="${id}-value" class="slider-value">${value}</span>`;
    const slider = document.createElement('input');
    slider.type = 'range'; slider.id = id; slider.min = min; slider.max = max; slider.value = value; slider.step = step;
    slider.addEventListener('input', (e) => {
        currentParams[id] = parseFloat(e.target.value);
        document.getElementById(`${id}-value`).textContent = e.target.value;
        updatePlots();
    });
    container.appendChild(sliderLabel);
    container.appendChild(slider);
    return container;
}

function setupControls() {
    slidersContainer.innerHTML = '';
    const type = signalTypeSelector.value;
    currentParams = {};

    switch (type) {
        case 'sine':
            slidersContainer.appendChild(createSlider('amp', 'Amplitude', 0.5, 5, 2, 0.1));
            slidersContainer.appendChild(createSlider('freq', 'Frequency (Hz)', 5, 100, 30, 1));
            break;
        case 'square':
            slidersContainer.appendChild(createSlider('amp', 'Amplitude', 0.5, 5, 2, 0.1));
            slidersContainer.appendChild(createSlider('freq', 'Frequency (Hz)', 5, 100, 20, 1));
            break;
        case 'noise':
            slidersContainer.appendChild(createSlider('variance', 'Variance', 0.1, 5, 1, 0.1));
            break;
        case 'sum_sines':
            slidersContainer.appendChild(createSlider('amp1', 'Amplitude 1', 0.5, 5, 2, 0.1));
            slidersContainer.appendChild(createSlider('freq1', 'Frequency 1 (Hz)', 5, 100, 30, 1));
            slidersContainer.appendChild(createSlider('amp2', 'Amplitude 2', 0.5, 5, 1.5, 0.1));
            slidersContainer.appendChild(createSlider('freq2', 'Frequency 2 (Hz)', 5, 100, 70, 1));
            break;
    }
    
    Array.from(slidersContainer.querySelectorAll('input')).forEach(slider => {
        currentParams[slider.id] = parseFloat(slider.value);
    });
    observationsDiv.innerHTML = observationsText[type];
    updatePlots();
}

function updatePlots() {
    const signalData = generateSignal();
    const acfData = calculateACF(signalData, ACF_MAX_LAG);
    const psdData = calculatePSD(acfData);

    signalChart.data.labels = signalData.map((_, i) => (i / SAMPLE_RATE).toFixed(3));
    signalChart.data.datasets[0].data = signalData;
    signalChart.update('none');

    acfChart.data.labels = acfData.map((_, i) => i);
    acfChart.data.datasets[0].data = acfData;
    acfChart.update('none');

    const freqAxis = psdData.map((_, i) => fft.getFrequency(i));
    psdChart.data.labels = freqAxis;
    psdChart.data.datasets[0].data = psdData;
    psdChart.options.scales.x.max = SAMPLE_RATE / 4; // Zoom in on the interesting part
    psdChart.update('none');
}

function initializeCharts() {
    const commonOptions = {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: { legend: { display: false } },
        scales: { x: { ticks: { maxTicksLimit: 8, font: { size: 10 } } } }
    };
    signalChart = new Chart(signalChartCtx, { type: 'line', data: { datasets: [{ data: [], borderColor: '#3273dc', borderWidth: 1.5, pointRadius: 0 }] }, options: { ...commonOptions, scales: { ...commonOptions.scales, x: {...commonOptions.scales.x, title:{display:true, text:'Time (s)'}}}} });
    acfChart = new Chart(acfChartCtx, { type: 'line', data: { datasets: [{ data: [], borderColor: '#23d160', borderWidth: 1.5, pointRadius: 0, fill:true, backgroundColor:'#d4f8de' }] }, options: { ...commonOptions, scales: { ...commonOptions.scales, x: {...commonOptions.scales.x, title:{display:true, text:'Lag (τ)'}}}} });
    psdChart = new Chart(psdChartCtx, { type: 'bar', data: { datasets: [{ data: [], backgroundColor: '#ff3860', barPercentage: 1.1 }] }, options: { ...commonOptions, scales: { ...commonOptions.scales, x: {...commonOptions.scales.x, title:{display:true, text:'Frequency (Hz)'}}}} });
}

FFT.prototype.getFrequency = function(index) {
  return index * this.sampleRate / this.size;
}

// --------------------------------------
// 6. Event Listeners & Initialization
// --------------------------------------
signalTypeSelector.addEventListener('change', setupControls);
window.addEventListener('load', () => {
    initializeCharts();
    setupControls();
});