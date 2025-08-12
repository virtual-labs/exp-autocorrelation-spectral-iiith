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
    { src: 'images/correct_gaussian.png', property: 'correct', explanation: 'VALID: This Gaussian function is symmetric, and its maximum value occurs at τ=0.' },
    { src: 'images/correct_exponential.png', property: 'correct', explanation: 'VALID: This exponential decay function is symmetric and has its maximum value at τ=0.' },
    { src: 'images/correct_triangular.png', property: 'correct', explanation: 'VALID: This triangular function satisfies all properties.' },
    { src: 'images/correct_sinc.png', property: 'correct', explanation: 'VALID: The Sinc function is a valid ACF, as its Fourier transform is a non-negative rectangular pulse.' }
  ],
  incorrect: [
    // Violates Symmetry
    { src: 'images/error_symmetry_onesided.png', property: 'violatesSymmetry', explanation: 'INVALID: This function is not symmetric. A valid ACF must be an even function.' },
    { src: 'images/error_symmetry_shifted.png', property: 'violatesSymmetry', explanation: 'INVALID: This function lacks symmetry about the y-axis.' },
    { src: 'images/error_symmetry_ramp.png', property: 'violatesSymmetry', explanation: 'INVALID: This ramp function is not an even function.' },
    { src: 'images/error_shape_sine.png', property: 'violatesShape', explanation: 'INVALID: A sine wave is an odd function, not an even function, so it violates the symmetry property.' },
    // Violates Max Lag
    { src: 'images/error_maxlag_twinpeaks.png', property: 'violatesMaxLag', explanation: 'INVALID: The maximum value is not at the origin (τ=0).' },
    { src: 'images/error_maxlag_dip.png', property: 'violatesMaxLag', explanation: 'INVALID: This function has a dip at τ=0, violating the max-at-origin rule.' },
    // Violates Shape / PSD Property
    { src: 'images/error_shape_rectangle.png', property: 'violatesShape', explanation: 'INVALID: A rectangular function is not a valid ACF as its Fourier Transform (a Sinc function) has negative values.' },
    { src: 'images/error_shape_cosine.png', property: 'violatesShape', explanation: 'INVALID: A non-decaying cosine is the ACF of a deterministic sinusoid, not a general WSS random process.' }
  ]
};

// --------------------------------------
// 3. Utility Functions
// --------------------------------------
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// --------------------------------------
// 4. Core Logic
// --------------------------------------
function setupProblem() {
  // 1. Clear previous state
  graphContainer.innerHTML = '';
  observationsDiv.innerHTML = '<p class="initial-text">Select a graph above to see the analysis.</p>';
  graphContainer.classList.remove('disabled');

  // 2. Use a Set to ensure we have 4 unique graphs for the problem
  let problemGraphs = new Set();
  
  // 3. Add exactly ONE random correct graph
  problemGraphs.add(getRandomElement(graphData.correct));
  
  // 4. Add THREE unique incorrect graphs from the larger pool
  while(problemGraphs.size < 4) {
      problemGraphs.add(getRandomElement(graphData.incorrect));
  }

  // 5. Shuffle the chosen graphs so the correct one's position is random
  const shuffledGraphs = shuffleArray(Array.from(problemGraphs));

  // 6. Create and display graph cards in the DOM
  shuffledGraphs.forEach((graph) => {
    const card = document.createElement('div');
    card.className = 'graph-card';
    card.dataset.property = graph.property;
    card.dataset.explanation = graph.explanation;

    const img = document.createElement('img');
    img.src = graph.src;
    img.alt = `Graph representing a function`;
    card.appendChild(img);
    card.addEventListener('click', handleGraphClick);
    graphContainer.appendChild(card);
  });
}

function handleGraphClick(event) {
  if (graphContainer.classList.contains('disabled')) return; 

  graphContainer.classList.add('disabled');
  const selectedCard = event.currentTarget;
  selectedCard.classList.add('selected');
  const selectedProperty = selectedCard.dataset.property;

  const correctCard = graphContainer.querySelector('[data-property="correct"]');

  // Provide visual feedback
  if (selectedProperty === 'correct') {
      selectedCard.classList.add('correct-choice');
  } else {
      selectedCard.classList.add('incorrect-choice');
      if (correctCard) {
          correctCard.classList.add('correct-choice');
      }
  }
  
  displayFeedback(selectedCard, correctCard);
}

function displayFeedback(selectedCard, correctCard) {
    const selectedProperty = selectedCard.dataset.property;
    let feedbackHTML = '';

    if (selectedProperty === 'correct') {
        feedbackHTML = `
            <h5 class="feedback-correct">Correct!</h5>
            <div class="analysis-item correct">
                <p><strong>Your selection is a valid ACF.</strong> ${selectedCard.dataset.explanation.replace('VALID: ','')}</p>
            </div>
        `;
    } else {
        feedbackHTML = `
            <h5 class="feedback-incorrect">Incorrect.</h5>
            <div class="analysis-item incorrect">
                <p><strong>Your Selection:</strong> ${selectedCard.dataset.explanation}</p>
            </div>
            <div class="analysis-item correct">
                <p><strong>The Correct Answer was valid because:</strong> ${correctCard.dataset.explanation.replace('VALID: ','')}</p>
            </div>
        `;
    }

    observationsDiv.innerHTML = feedbackHTML;
}

// --------------------------------------
// 5. Initial Load & Event Listeners
// --------------------------------------
window.addEventListener('load', setupProblem);
generateBtn.addEventListener('click', setupProblem);