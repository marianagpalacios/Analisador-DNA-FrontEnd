document.getElementById('dnaForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const sequence = document.getElementById('dnaSequence').value.trim().toUpperCase();
  const pattern  = document.getElementById('dnaPattern').value.trim().toUpperCase();

  if (!isValidSequence(sequence)) {
    alert('Sequência inválida! Use apenas A, T, C ou G.');
    return;
  }

  const results = analyzeDNA(sequence, pattern);
  displayResults(results, sequence); // <-- passamos a sequência aqui
});

function isValidSequence(seq) {
  if (seq.length === 0) {
    alert('Por favor, insira uma sequência de DNA');
    return false;
  }
  if (!/^[ATCG]+$/.test(seq)) {
    const invalidChars = [...new Set(seq.replace(/[ATCG]/gi, ''))];
    alert(`Caracteres inválidos: ${invalidChars.join(', ')}\nUse apenas A, T, C ou G.`);
    return false;
  }
  return true;
}

function analyzeDNA(sequence, pattern = '') {
  const counts = {
    A: (sequence.match(/A/g) || []).length,
    T: (sequence.match(/T/g) || []).length,
    C: (sequence.match(/C/g) || []).length,
    G: (sequence.match(/G/g) || []).length,
    total: sequence.length
  };

  const gcContent = ((counts.G + counts.C) / counts.total * 100).toFixed(2);

 
  let patternCount = 0;
  if (pattern) {
    const re = new RegExp(escapeRegExp(pattern), 'g');
    patternCount = (sequence.match(re) || []).length;
  }

  return { counts, gcContent, pattern, patternCount };
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createSequenceVisualization(sequence) {
  const vizContainer = document.createElement('div');
  vizContainer.className = 'sequence-viz';
  vizContainer.style.textAlign = 'center';

  sequence.split('').forEach(nuc => {
    const span = document.createElement('span');
    span.className = `nucleotide ${nuc}`;
    span.textContent = nuc;
    vizContainer.appendChild(span);
  });

  return vizContainer;
}

let chartInstance = null; 

function displayResults(results, sequence) {
  const resultsDiv = document.getElementById('results');

  
  resultsDiv.innerHTML = `
    <h3>Resultados da Análise</h3>
    <div class="result-stats">
      <p><strong>Tamanho da sequência:</strong> ${results.counts.total} nucleotídeos</p>
      <p><strong>Conteúdo GC:</strong> ${results.gcContent}%</p>
      ${results.pattern ? `<p><strong>Padrão "${results.pattern}":</strong> encontrado ${results.patternCount} vez(es)</p>` : ''}
    </div>
    <div class="nucleotide-counts">
      <h4>Distribuição de Nucleotídeos:</h4>
      <p>A: ${results.counts.A} | T: ${results.counts.T} | C: ${results.counts.C} | G: ${results.counts.G}</p>
    </div>
  `;

  
  const viz = createSequenceVisualization(sequence);
  resultsDiv.appendChild(viz);

  // Canvas do gráfico
  const chartCanvas = document.createElement('canvas');
  chartCanvas.id = 'dnaChart';
  chartCanvas.style.marginTop = '1rem';
  resultsDiv.appendChild(chartCanvas);

  // Destroi gráfico anterior se existir
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  // Cria gráfico
  const ctx = chartCanvas.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['A', 'T', 'C', 'G'],
      datasets: [{
        label: 'Distribuição de Nucleotídeos',
        data: [results.counts.A, results.counts.T, results.counts.C, results.counts.G],
        backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12']
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Quantidade' } },
        x: { title: { display: true, text: 'Nucleotídeos' } }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });

  // exibe a área de resultados
  resultsDiv.classList.remove('hidden');
}
