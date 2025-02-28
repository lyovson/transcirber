import DOMElements from './dom-elements.js';
import { setCurrentFile } from './state.js';
import { formatFileSize, createWaveformVisualization, showError } from './ui-utils.js';
import Bridge from './bridge.js';

/**
 * Process a file after it's been selected or dropped
 * @param {File} file - The file to process
 */
export async function processFile(file) {
  // Check if it's an audio file
  if (!file.type.startsWith('audio/')) {
    showError('Please select an audio file.');
    return;
  }

  try {
    // Upload file to server
    const result = await Bridge.uploadFile(file);

    if (result.success) {
      setCurrentFile(result.filePath);

      // Update UI
      DOMElements.fileNameElement.textContent = file.name;
      DOMElements.fileSizeElement.textContent = formatFileSize(file.size);
      DOMElements.filePreview.style.display = 'block';

      // Create waveform visualization
      createWaveformVisualization(DOMElements.waveformContainer);

      // Enable transcribe button
      DOMElements.transcribeButton.disabled = false;
    } else {
      showError(`Failed to upload file: ${result.error}`);
    }
  } catch (error) {
    showError(`Error processing file: ${error.message}`);
  }
}

/**
 * Handle file selection from input
 * @param {Event} event - The change event
 */
export async function handleFiles(event) {
  const files = event.target.files;
  if (files.length > 0) {
    try {
      await processFile(files[0]);
    } catch (error) {
      showError(`Error processing file: ${error.message}`);
    }
  }
}

/**
 * Handle file drop
 * @param {DragEvent} event - The drop event
 */
export async function handleDrop(event) {
  const dt = event.dataTransfer;
  const files = dt.files;

  if (files.length > 0) {
    try {
      await processFile(files[0]);
    } catch (error) {
      showError(`Error processing file: ${error.message}`);
    }
  }
}

/**
 * Prevent default behavior for drag and drop events
 * @param {Event} e - The event
 */
export function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

/**
 * Highlight drop area when dragging over
 */
export function highlight() {
  DOMElements.dropArea.classList.add('active');
}

/**
 * Remove highlight from drop area
 */
export function unhighlight() {
  DOMElements.dropArea.classList.remove('active');
}
