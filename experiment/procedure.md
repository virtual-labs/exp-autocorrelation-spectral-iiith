
### Procedure

#### **Identifying Valid Autocorrelation Functions**

This experiment helps us **identify functions that can serve as valid Autocorrelation Functions (ACFs)** by analyzing their mathematical properties. Not every function qualifies as an ACF. A valid ACF must satisfy the following key conditions:

- **Symmetry**: Rₓₓ(τ) = Rₓₓ(–τ)
- **Maximum at Zero**: Rₓₓ(0) ≥ Rₓₓ(τ) for all τ
- **Non-negative Power Spectrum**: The Fourier Transform (PSD) of a valid ACF must be non-negative

Your task is to:

1. **Observe different candidate functions** and analyze whether they are symmetric and peak at τ = 0.
2. **Check for positive definiteness** — some invalid ACFs may "look" symmetric but still violate PSD non-negativity.
3. **Use examples and counterexamples** — for instance, a shifted Gaussian or a signal oscillating with (–1)^⌊τ⌋ may violate symmetry or positive definiteness.
4. **Justify** whether the function could represent the autocorrelation of a real process, based on theoretical principles and visual evidence.

---

#### **Stationary and WSS Process Detection**

This experiment helps you **differentiate between Stationary, Wide-Sense Stationary (WSS), and Non-Stationary processes** using an interactive signal inspector. You analyze real-time properties of a signal by sliding an **"inspector window"** across a long time-series realization.

The mystery signals to analyze include:

- **Signal A (WSS)**: A noisy sine wave with constant amplitude.
- **Signal B (Non-Stationary Mean)**: A signal with slowly varying mean (e.g., sine wave over ramp).
- **Signal C (Non-Stationary ACF)**: A signal with time-varying variance (e.g., modulated noise).

Your task is to:

1. **Select a mystery signal** and observe the waveform.
2. **Use the draggable inspector window** to explore the local statistics across time.
3. **Examine Local Mean (Plot 1)**: A running average calculated in the window. If the mean changes with time, the process is not WSS.
4. **Examine Local ACF (Plot 2)**: Check whether the autocorrelation changes as you move the window.
5. **Conclude the nature of the signal**:
   - If both mean and ACF are time-invariant → **WSS**
   - If either changes → **Non-stationary**

---

#### **Autocorrelation and Power Spectral Density Relationship**

This experiment visually demonstrates the fundamental relationship between **Autocorrelation Function (ACF)** and **Power Spectral Density (PSD)**, linked by the **Wiener–Khinchin Theorem**:

Sₓₓ(f) = 𝔽 { Rₓₓ(τ) }

Where Sₓₓ(f) is the PSD and Rₓₓ(τ) is the autocorrelation function.

You interactively analyze this using different signal types:

- **Sine Wave**
- **Square Wave**
- **White Noise**
- **Sum of Two Sines**

Your task is to:

1. **Select a base signal** using the dropdown menu.
2. **Control signal parameters** using sliders (e.g., frequency, amplitude, variance).
3. **Observe the signal waveform (Top Plot)**: View the signal x(t) in the time domain.
4. **Observe the ACF (Bottom-Left Plot)**:
   - Is it periodic (e.g., sine)?
   - Is it impulsive (e.g., white noise)?
5. **Observe the PSD (Bottom-Right Plot)**:
   - Narrow peaks ↔ periodic signals (pure tones)
   - Flat spectrum ↔ white noise
6. **Understand how changes in the signal** (e.g., increasing variance or frequency) affect both ACF and PSD simultaneously.
7. **Correlate time and frequency domains**: See how time-localized features (like randomness) produce frequency-spread PSDs, and how periodicity in time gives rise to sharp peaks in frequency.
