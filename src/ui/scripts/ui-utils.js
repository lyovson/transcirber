import DOMElements from './dom-elements.js';

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Create a simple waveform visualization
 * @param {HTMLElement} container - Container element for the waveform
 */
export function createWaveformVisualization(container) {
  // Clear the container
  container.innerHTML = '';

  // Create a simple placeholder visualization
  const canvas = document.createElement('canvas');
  canvas.width = container.clientWidth;
  canvas.height = 60;
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(124, 77, 255, 0.3)';

  // Draw random bars to simulate a waveform
  const barWidth = 3;
  const barGap = 1;
  const barCount = Math.floor(canvas.width / (barWidth + barGap));

  for (let i = 0; i < barCount; i++) {
    const barHeight = Math.random() * canvas.height * 0.8;
    const x = i * (barWidth + barGap);
    const y = (canvas.height - barHeight) / 2;

    ctx.fillRect(x, y, barWidth, barHeight);
  }
}

/**
 * Show an error message
 * @param {string} message - Error message to display
 */
export function showError(message) {
  DOMElements.errorMessageElement.textContent = message;
  DOMElements.errorMessageElement.classList.remove('hidden');
  DOMElements.successMessageElement.classList.add('hidden');
}

/**
 * Show a success message
 * @param {string} message - Success message to display
 */
export function showSuccess(message) {
  DOMElements.successMessageElement.textContent = message;
  DOMElements.successMessageElement.classList.remove('hidden');
  DOMElements.errorMessageElement.classList.add('hidden');
}

/**
 * Hide all messages
 */
export function hideMessages() {
  DOMElements.errorMessageElement.classList.add('hidden');
  DOMElements.successMessageElement.classList.add('hidden');
}

/**
 * Pad a number with leading zeros
 * @param {number} num - Number to pad
 * @param {number} size - Desired length
 * @returns {string} Padded number
 */
export function padZero(num, size = 2) {
  let s = num.toString();
  while (s.length < size) s = '0' + s;
  return s;
}
