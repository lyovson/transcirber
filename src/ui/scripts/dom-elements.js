/**
 * DOM Elements Module
 *
 * Centralizes all DOM element references used throughout the application.
 * Exports a single object containing all elements for cleaner imports.
 */

// Create a DOMElements object with all element references
const DOMElements = {
  // File handling elements
  dropArea: document.getElementById('drop-area'),
  fileInput: document.getElementById('file-input'),
  filePreview: document.getElementById('file-preview'),
  fileNameElement: document.getElementById('file-name'),
  fileSizeElement: document.getElementById('file-size'),
  browseButton: document.getElementById('browse-button'),
  waveformContainer: document.getElementById('waveform'),

  // Transcription elements
  languageSelect: document.getElementById('language-select'),
  transcribeButton: document.getElementById('transcribe-button'),
  progressElement: document.getElementById('progress'),

  // Output elements
  outputSection: document.getElementById('output-section'),
  transcriptionContent: document.getElementById('transcription-content'),
  exportButton: document.getElementById('export-button'),
  exportOptions: document.getElementById('export-options'),
  copyButton: document.getElementById('copy-button'),
  clearButton: document.getElementById('clear-button'),

  // Settings elements
  settingsButton: document.getElementById('settings-button'),
  settingsModal: document.getElementById('settings-modal'),
  closeModalButton: document.getElementById('close-modal'),
  saveSettingsButton: document.getElementById('save-settings'),
  apiKeyInput: document.getElementById('api-key'),
  modelSelect: document.getElementById('model'),
  useLocalModelCheckbox: document.getElementById('use-local-model'),

  // Notification elements
  errorMessageElement: document.getElementById('error-message'),
  successMessageElement: document.getElementById('success-message'),
};

export default DOMElements;
