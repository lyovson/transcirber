import DOMElements from './dom-elements.js';
import { handleDrop, handleFiles, highlight, preventDefaults, unhighlight } from './file-processing.js';
import { transcribeAudio, updateLanguageDisplay } from './transcription.js';
import { saveSettings } from './settings.js';
import { exportTranscription, copyTranscription } from './export.js';
import { resetState } from './state.js';
import { hideMessages } from './ui-utils.js';

/**
 * Set up all event listeners
 */
export function setupEventListeners() {
  console.log('Setting up event listeners...');

  // File Drop Area
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    DOMElements.dropArea.addEventListener(eventName, preventDefaults, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    DOMElements.dropArea.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    DOMElements.dropArea.addEventListener(eventName, unhighlight, false);
  });

  DOMElements.dropArea.addEventListener('drop', handleDrop, false);

  // File Input
  DOMElements.fileInput.addEventListener('change', handleFiles);

  // Browse Button
  DOMElements.browseButton.addEventListener('click', () => {
    DOMElements.fileInput.click();
  });

  // Language selection
  DOMElements.languageSelect.addEventListener('change', updateLanguageDisplay);

  // Transcribe Button
  DOMElements.transcribeButton.addEventListener('click', transcribeAudio);

  // Settings Modal
  DOMElements.settingsButton.addEventListener('click', () => {
    DOMElements.settingsModal.style.display = 'block';
  });

  DOMElements.closeModalButton.addEventListener('click', () => {
    DOMElements.settingsModal.style.display = 'none';
  });

  DOMElements.saveSettingsButton.addEventListener('click', saveSettings);

  // Export Options
  DOMElements.exportButton.addEventListener('click', () => {
    DOMElements.exportOptions.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!DOMElements.exportButton.contains(e.target) && !DOMElements.exportOptions.contains(e.target)) {
      DOMElements.exportOptions.classList.remove('show');
    }
  });

  // Export Actions
  document.getElementById('export-txt').addEventListener('click', () => exportTranscription('txt'));
  document.getElementById('export-srt').addEventListener('click', () => exportTranscription('srt'));
  document.getElementById('export-vtt').addEventListener('click', () => exportTranscription('vtt'));

  // Copy Button
  DOMElements.copyButton.addEventListener('click', copyTranscription);

  // Clear Button
  DOMElements.clearButton.addEventListener('click', clearTranscription);

  console.log('Event listeners set up successfully');
}

/**
 * Clear the transcription and reset the UI
 */
export function clearTranscription() {
  // Reset state
  resetState();

  // Clear UI
  DOMElements.fileInput.value = '';
  DOMElements.filePreview.style.display = 'none';
  DOMElements.outputSection.style.display = 'none';
  DOMElements.transcriptionContent.textContent = '';

  // Hide messages
  hideMessages();

  // Disable transcribe button
  DOMElements.transcribeButton.disabled = true;
}
