The **Autocorrelation Function (ACF)**, denoted $ R_X(\tau) $ quantifies how a random process $ X(t) $ correlates with a time-shifted version of itself:

$$
\begin{equation}
R_X(\tau) = \mathbb{E}[X(t) \, X(t + \tau)]
\end{equation}
$$

If the process has a non-zero mean $\mu_X = \mathbb{E}[X(t)] $, then:

$$
\begin{equation}
C_X(\tau) = \mathbb{E}[(X(t) - \mu_X)(X(t + \tau) - \mu_X)] = R_X(\tau) - \mu_X^2
\end{equation}
$$

### **1 Key Properties of a Valid ACF (for a real-valued WSS process):**

1. **Maximum at Zero Lag:**

   $$
   \begin{equation}
   |R_X(\tau)| \le R_X(0)
   \end{equation}
   $$
2. **Even Symmetry:**

   $$
   \begin{equation}
   R_X(\tau) = R_X(-\tau)
   \end{equation}
   $$
3. **Non-Negative Power Spectrum:**

   $$
   \begin{equation}
   S_X(f) \ge 0 \quad \forall f
   \end{equation}
   $$

---

### **2 Power Spectral Density (PSD)**

The **Power Spectral Density (PSD)** describes how the power of a random process is distributed over frequency.

Defined as:

$$
\begin{equation}
S_X(f) = \int_{-\infty}^{\infty} R_X(\tau) e^{-j 2\pi f \tau} \, d\tau
\end{equation}
$$

Inverse relation:

$$
\begin{equation}
R_X(\tau) = \int_{-\infty}^{\infty} S_X(f) e^{j 2\pi f \tau} \, df
\end{equation}
$$

---

### **3 The Wiener–Khinchin Theorem**

$$
\begin{equation}
\boxed{S_X(f) = \mathcal{F}\{R_X(\tau)\}} \quad \text{and} \quad \boxed{R_X(\tau) = \mathcal{F}^{-1}\{S_X(f)\}}
\end{equation}
$$

---

### **4 Stationarity**

**Stationarity** describes how the statistical properties of a random process behave over time.
It tells us whether the process’s behavior is consistent (time-invariant) or whether it changes (time-varying).

A random process \( X(t) \) is said to be **stationary** if its statistical characteristics — such as mean, variance, and correlation — do **not change with time**. Otherwise, it is **non-stationary**.

#### **i. Strict-Sense Stationary (SSS)**

A random process $X(t)$ is **Strict-Sense Stationary** if **all** its joint probability distributions are invariant under time shifts.

That is, for any integer $ n \,$ time instants $ t_1, t_2, \ldots, t_n $, and any time shift $T $\:

$$
\begin{equation}
f_{X(t_1), X(t_2), \ldots, X(t_n)}(x_1, x_2, \ldots, x_n)
= f_{X(t_1 + T), X(t_2 + T), \ldots, X(t_n + T)}(x_1, x_2, \ldots, x_n)
\end{equation}
$$

This means **the entire probabilistic behavior** of the process looks the same no matter when you observe it.

**In simple terms:**
Shifting the observation window in time does **not** change the statistics of the process — not just the mean or variance, but all higher-order moments and dependencies too.

**Examples:**

- A pure sinusoid  $X(t) = A \cos(\omega t + \phi) $ where $ \phi $ is a uniform random variable over $[0, 2\pi)$→ SSS because its distribution is independent of time.

#### **ii. Wide-Sense Stationary (WSS)**

Since verifying full strict-sense stationarity is often impractical, we use a weaker but very useful notion: **Wide-Sense Stationarity (WSS).**

A process $ X(t) $ is **WSS** if it satisfies:

1. **Constant Mean:**

   $$
   \begin{equation}
   \mathbb{E}[X(t)] = \mu_X = \text{constant}
   \end{equation}
   $$
2. **Autocorrelation depends only on time lag:**

   $$
   \begin{equation}
   R_X(t_1, t_2) = R_X(t_1 - t_2) = R_X(\tau)
   \end{equation}
   $$

This means that the correlation between two values of $ X(t) $ depends only on **how far apart** they are in time (the lag $ \tau )$, not **when** they were measured.

**In other words:**

- The process has a stable average value.
- The level of similarity between samples depends only on time separation.

**Examples:**

- A zero-mean white noise process (flat PSD).
- A stationary Gaussian process with constant variance.

#### **iii. Non-Stationary Processes**

A process is **non-stationary** if it violates the WSS conditions:

- Mean is not constant, i.e. $ \mathbb{E}[X(t)] \neq \mu $.
- Autocorrelation depends on the absolute time instants, not just the lag.

**Examples:**

- $ X(t) = t + W(t) $: mean grows linearly with time.
- $ X(t) = A(t) \cos(\omega t) $: amplitude envelope $ A(t) $ changes with time.
- Speech signals, stock prices, and weather patterns are typically non-stationary.

---

### **5 Relationship Between SSS and WSS**

- Every **Strict-Sense Stationary** process is also **Wide-Sense Stationary**.
- The converse is **not necessarily true** — a process may have constant mean and lag-dependent autocorrelation but still have higher-order moments that vary with time.

**Hierarchy:**

$$
\text{Strict-Sense Stationary} \implies \text{Wide-Sense Stationary}
$$

---

### **6 Why Stationarity Matters**

Stationarity is crucial in signal processing and stochastic analysis because many analytical tools — such as the **Power Spectral Density (PSD)**, **Fourier Transform relationships**, and **filtering techniques** — assume that the process is WSS.

If the process is **non-stationary**, these tools may not be valid or may give misleading results.

**In practice:**

- Real-world signals (e.g., EEG, seismic data, audio) are often **locally stationary** — approximately WSS within short time windows.
  → This is why **Short-Time Fourier Transform (STFT)** and **wavelet analysis** are used for time-varying spectral analysis.

---

### **7 Summary Table**

| Type                                    | Definition                                             | Examples                                             | Remarks                                      |
| --------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------- | -------------------------------------------- |
| **Strict-Sense Stationary (SSS)** | All joint distributions are invariant under time shift | Sinusoid with random phase, white noise              | Hard to verify; strongest form               |
| **Wide-Sense Stationary (WSS)**   | Mean constant, ACF depends only on lag                 | Gaussian noise, AR(1) process with stable parameters | Most common assumption in practice           |
| **Non-Stationary**                | Mean or correlation changes with time                  | Speech, climate data, trends                         | Often approximated as “locally stationary” |
