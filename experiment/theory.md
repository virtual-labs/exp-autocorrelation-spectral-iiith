### Autocorrelation Function (ACF)

The Autocorrelation Function (ACF), denoted `R(τ)`, describes the correlation of a signal with a delayed (or time-shifted) copy of itself as a function of the delay `τ`. It is a powerful tool that reveals the internal "memory" or repetitive structure of a random process.

For a function to be a valid ACF of a real-valued Wide-Sense Stationary process, it must satisfy several key properties:

1.  **Maximum at Zero Lag:** The value of the ACF at the origin must be its maximum absolute value. This means the process is most correlated with itself at no time delay.
    *   Mathematically: `|R(τ)| ≤ R(0)` for all `τ`.

2.  **Even Symmetry:** The ACF must be an even function, meaning it is perfectly symmetric about the vertical axis. The correlation at a positive lag `τ` is the same as at a negative lag `-τ`.
    *   Mathematically: `R(τ) = R(-τ)`.

3.  **Non-Negative Power Spectrum:** The Fourier transform of a valid ACF, known as the Power Spectral Density (PSD), must be non-negative for all frequencies. This property is less obvious visually but excludes functions with certain shapes (like a perfect rectangle) whose transforms have negative lobes.

---

### Power Spectral Density (PSD)

The Power Spectral Density (PSD), denoted `S(f)`, describes how the power of a signal is distributed across the different frequencies that compose it. It reveals the frequency content of the process.

*   A process with a periodic or repetitive structure in time (like a sine wave) will have a PSD with sharp peaks at specific frequencies.
*   A process with no "memory" where each sample is random (like white noise) will have a flat PSD, indicating that its power is spread evenly across all frequencies.

---

### The Wiener-Khinchin Theorem

The ACF and PSD are fundamentally linked through the **Wiener-Khinchin Theorem**. This theorem states that the **Power Spectral Density is the Fourier transform of the Autocorrelation Function**.

*   Mathematically: `S(f) = ℱ{R(τ)}`

This relationship is crucial because it connects the time-domain characteristics (correlation and memory, described by the ACF) to the frequency-domain characteristics (power distribution, described by the PSD).

---

### Stationarity

A random process is defined by its statistical properties over time. Stationarity is a key classification that describes whether these properties are time-invariant.

1.  **Strict-Sense Stationary (SSS):** This is the strongest form of stationarity. A process is SSS if the joint probability distribution of any set of its samples is invariant with respect to a shift in time. In simple terms, the process's statistical "character" is identical at all points in time.

2.  **Wide-Sense Stationary (WSS):** This is a weaker but often more practical form of stationarity. A process is WSS if it meets two conditions:
    *   The **mean** of the process is constant (not a function of time).
        `E[X(t)] = μ`
    *   The **autocorrelation** function depends only on the time lag `τ`, not on absolute time.
        `E[X(t)X(t+τ)] = R(τ)`

3.  **Non-Stationary:** A process that is not WSS is considered non-stationary. This can happen if its mean changes over time or if its autocorrelation structure (e.g., its variance) changes over time.

**Relationship:** All SSS processes are also WSS. However, a process can be WSS without being SSS if its higher-order statistics (like skewness) change over time.