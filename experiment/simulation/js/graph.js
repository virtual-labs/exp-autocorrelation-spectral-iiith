// --------------------------------------
// 1. DOM References
// --------------------------------------
const generateBtn = document.getElementById("generateBtn");
const graphContainer = document.getElementById("graph-container");
const observationsDiv = document.getElementById("observations");

// --------------------------------------
// 2. Graph Data Store
// --------------------------------------
const graphData = {
  correct: [
    { src: 'images/correct_e1_1.png', property: 'correct', explanation: 'This function is a valid ACF. It is symmetric about τ=0 and its maximum value occurs at τ=0.' },
    { src: 'images/correct_e2_1.png', property: 'correct', explanation: 'This function is a valid ACF. It is symmetric, has its maximum value at τ=0, and decays over time.' }
  ],
  violatesSymmetry: [
    { src: 'images/symmetry_e1_1.png', property: 'violatesSymmetry', explanation: 'INVALID: This function is not symmetric about the y-axis. A valid ACF must satisfy R(τ) = R(-τ).' },
    { src: 'images/symmetry_e1_2.png', property: 'violatesSymmetry', explanation: 'INVALID: This function is not an even function (it lacks symmetry). A valid ACF must satisfy R(τ) = R(-τ).' }
  ],
  violatesMaxLag: [
    { src: 'images/max_lag_e1_1.png', property: 'violatesMaxLag', explanation: 'INVALID: The maximum value of this function is not at the origin (τ=0). A valid ACF must satisfy |R(τ)| ≤ R(0).' },
    { src: 'images/max_lag_e1_2.png', property: 'violatesMaxLag', explanation: 'INVALID: This function peaks at a non-zero lag, violating the property that the maximum must be at τ=0.' }
  ],
  violatesShape: [
    { src: 'images/diff_e1_1.png', property: 'violatesShape', explanation: 'INVALID: The sharp corners and linear decay suggest this is not a valid ACF from a physical process (it is not positive semi-definite).' },
    { src: 'images/diff_e1_2.png', property: 'violatesShape', explanation: 'INVALID: This triangular shape is not a valid ACF for any standard random process as its Fourier Transform is not non-negative everywhere.' }
  ]
};

// --------------------------------------
// 3. Utility Functions
// --------------------------------------

/**
 * Shuffles an array in place.
 * @param {Array} array The array to shuffle.
 * @returns {Array} The shuffled array.
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Gets a random element from an array.
 * @param {Array} array The array to select from.
 * @returns A random element from the array.
 */
function getRandomElement(array) {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}


// --------------------------------------
// 4. Core Logic
// --------------------------------------

/**
 * Sets up a new problem by selecting, shuffling, and displaying graphs.
 */
function setupProblem() {
  // 1. Clear previous state
  graphContainer.innerHTML = '';
  observationsDiv.innerHTML = '<p class="initial-text">Select a graph above to see the analysis.</p>';
  graphContainer.classList.remove('disabled');

  // Remove retry button if present
  const oldRetry = document.getElementById('retryBtn');
  if (oldRetry) oldRetry.remove();

  // 2. Gather all graphs from all categories
  let allGraphs = [];
  Object.keys(graphData).forEach(category => {
    graphData[category].forEach(graph => {
      allGraphs.push(graph);
    });
  });

  // 3. Shuffle and pick 4 unique graphs
  allGraphs = shuffleArray(allGraphs);
  let problemGraphs = allGraphs.slice(0, 4);

  // 4. Create and display graph cards in the DOM
  problemGraphs.forEach((graph, index) => {
    const card = document.createElement('div');
    card.className = 'graph-card';
    card.dataset.property = graph.property;
    card.dataset.explanation = graph.explanation;
    card.dataset.src = graph.src;
    card.dataset.id = `graph-${index}`; // Unique ID for feedback

    const img = document.createElement('img');
    img.src = graph.src;
    img.alt = `Graph ${index + 1}`;
    card.appendChild(img);
    card.addEventListener('click', handleGraphClick);
    graphContainer.appendChild(card);
  });
}

/**
 * Handles the user clicking on a graph.
 * @param {Event} event The click event.
 */
function handleGraphClick(event) {
  if (graphContainer.classList.contains('disabled')) return; // Prevent clicking after a choice is made

  // Disable further clicks
  graphContainer.classList.add('disabled');

  const selectedCard = event.currentTarget;
  selectedCard.classList.add('selected');
  const selectedProperty = selectedCard.dataset.property;

  // Provide visual feedback
  // Do NOT reveal the correct answer
  if (selectedProperty !== 'correct') {
      selectedCard.classList.add('incorrect-choice');
  }

  displayFeedback(selectedCard, selectedProperty);

  // Add retry button only if incorrect
  if (selectedProperty !== 'correct') {
    addRetryButton();
  }
}

function addRetryButton() {
    if (!document.getElementById('retryBtn')) {
        const retryBtn = document.createElement('button');
        retryBtn.id = 'retryBtn';
        retryBtn.className = 'button is-warning is-medium';
        retryBtn.textContent = 'Retry';
        retryBtn.style.marginTop = '1.5rem';
        retryBtn.onclick = setupProblem;
        observationsDiv.appendChild(retryBtn);
    }
}

/**
 * Displays feedback in the observations panel.
 * @param {HTMLElement} selectedCard The card the user selected.
 * @param {string} selectedProperty The 'property' of the graph the user selected.
 */
function displayFeedback(selectedCard, selectedProperty) {
    let feedbackHTML = '';

    // Main feedback message
    if (selectedProperty === 'correct') {
        feedbackHTML += '<h5 class="feedback-correct">Correct!</h5>';
        feedbackHTML += '<p class="has-text-centered">You have correctly identified the valid Autocorrelation Function.</p>';
    } else {
        feedbackHTML += '<h5 class="feedback-incorrect">Incorrect.</h5>';
        feedbackHTML += `<p class="has-text-centered">${selectedCard.dataset.explanation}</p>`;
    }

    observationsDiv.innerHTML = feedbackHTML;
}

// --------------------------------------
// 5. Initial Load & Event Listeners
// --------------------------------------
window.addEventListener('load', setupProblem);
generateBtn.addEventListener('click', setupProblem);