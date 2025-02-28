// DOM Elements
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const filePreview = document.getElementById('file-preview');
const fileNameElement = document.getElementById('file-name');
const fileSizeElement = document.getElementById('file-size');
const languageSelect = document.getElementById('language-select');
const transcribeButton = document.getElementById('transcribe-button');
const progressElement = document.getElementById('progress');
const outputSection = document.getElementById('output-section');
const transcriptionContent = document.getElementById('transcription-content');
const settingsButton = document.getElementById('settings-button');
const settingsModal = document.getElementById('settings-modal');
const closeModalButton = document.getElementById('close-modal');
const saveSettingsButton = document.getElementById('save-settings');
const exportButton = document.getElementById('export-button');
const exportOptions = document.getElementById('export-options');
const copyButton = document.getElementById('copy-button');
const clearButton = document.getElementById('clear-button');
const apiKeyInput = document.getElementById('api-key');
const modelSelect = document.getElementById('model');
const errorMessageElement = document.getElementById('error-message');
const successMessageElement = document.getElementById('success-message');

// State
let currentFile = null;
let currentFileData = null;
let currentLanguage = 'hy';
let outputFolder = ''; // Will be set to Downloads folder automatically
let transcriptionInProgress = false;
let transcriptionResult = '';
let settings = {
  apiKey: '',
  model: 'whisper-1',
  useLocalModel: false
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Load settings from localStorage if available
  loadSettings();

  // Set up event listeners
  setupEventListeners();

  // Load languages
  loadLanguages();

  // Load default output location (Downloads folder)
  loadDefaultOutputFolder();
});

// Event Listeners
function setupEventListeners() {
  // File Drop Area
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });

  dropArea.addEventListener('drop', handleDrop, false);

  // File Input
  fileInput.addEventListener('change', handleFiles);

  // Browse Button
  document.getElementById('browse-button').addEventListener('click', () => {
    fileInput.click();
  });

  // Language selection
  languageSelect.addEventListener('change', (e) => {
    currentLanguage = e.target.value;
  });

  // Transcribe Button
  transcribeButton.addEventListener('click', transcribeAudio);

  // Settings Modal
  settingsButton.addEventListener('click', () => {
    settingsModal.style.display = 'block';
  });

  closeModalButton.addEventListener('click', () => {
    settingsModal.style.display = 'none';
  });

  saveSettingsButton.addEventListener('click', saveSettings);

  // Export Options
  exportButton.addEventListener('click', () => {
    exportOptions.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!exportButton.contains(e.target) && !exportOptions.contains(e.target)) {
      exportOptions.classList.remove('show');
    }
  });

  // Export Actions
  document.getElementById('export-txt').addEventListener('click', () => exportTranscription('txt'));
  document.getElementById('export-srt').addEventListener('click', () => exportTranscription('srt'));
  document.getElementById('export-vtt').addEventListener('click', () => exportTranscription('vtt'));

  // Copy Button
  copyButton.addEventListener('click', copyTranscription);

  // Clear Button
  clearButton.addEventListener('click', clearTranscription);
}

// Utility Functions
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight() {
  dropArea.classList.add('active');
}

function unhighlight() {
  dropArea.classList.remove('active');
}

async function handleFiles(event) {
  const files = event.target.files;
  if (files.length > 0) {
    try {
      await processFile(files[0]);
    } catch (error) {
      showError(`Error processing file: ${error.message}`);
    }
  }
}

async function handleDrop(event) {
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

async function processFile(file) {
  // Check if it's an audio file
  if (!file.type.startsWith('audio/')) {
    showError('Please select an audio file.');
    return;
  }

  try {
    // Upload file to server
    const result = await window.Bridge.uploadFile(file);

    if (result.success) {
      currentFile = result.filePath;

      // Update UI
      fileNameElement.textContent = file.name;
      fileSizeElement.textContent = formatFileSize(file.size);
      filePreview.style.display = 'block';

      // Create waveform visualization
      createWaveformVisualization();

      // Enable transcribe button
      transcribeButton.disabled = false;

      // Hide error message if any
      errorMessageElement.classList.add('hidden');
    } else {
      showError(`Failed to upload file: ${result.error}`);
    }
  } catch (error) {
    showError(`Error processing file: ${error.message}`);
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function createWaveformVisualization() {
  // This is a placeholder for actual waveform visualization
  // In a real implementation, you would use a library like wavesurfer.js
  const waveformContainer = document.getElementById('waveform');
  waveformContainer.innerHTML = '';

  // Create a simple placeholder visualization
  const canvas = document.createElement('canvas');
  canvas.width = waveformContainer.clientWidth;
  canvas.height = 60;
  waveformContainer.appendChild(canvas);

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

async function loadLanguages() {
  try {
    const languages = await window.Bridge.getAvailableLanguages();

    // Clear existing options
    languageSelect.innerHTML = '';

    for (const lang of languages) {
      const nameResponse = await window.Bridge.getLanguageName(lang);

      const option = document.createElement('option');
      option.value = lang;
      option.textContent = nameResponse;
      languageSelect.appendChild(option);
    }

    // Set default language (Armenian)
    languageSelect.value = 'hy';
    currentLanguage = languageSelect.value;
  } catch (error) {
    console.error('Error loading languages:', error);

    // Add a fallback option for Armenian if loading fails
    languageSelect.innerHTML = '';
    const option = document.createElement('option');
    option.value = 'hy';
    option.textContent = 'Armenian';
    languageSelect.appendChild(option);

    currentLanguage = 'hy';
    showError('Failed to load languages. Using Armenian as default.');
  }
}

async function loadDefaultOutputFolder() {
  try {
    // Get default folder
    const response = await window.Bridge.getDefaultFolder();

    if (response.success) {
      // Set default output folder
      outputFolder = response.folder;
    } else {
      console.error('Failed to get default folder');
      showError('Failed to load default output location.');
    }
  } catch (error) {
    console.error('Error loading default output folder:', error);
    showError('Failed to load default output location.');
  }
}

function updateLanguageDisplay() {
  const selectedOption = languageSelect.options[languageSelect.selectedIndex];
  currentLanguage = selectedOption.value;
}

async function transcribeAudio() {
  if (!currentFile) {
    showError('Please select an audio file first.');
    return;
  }

  if (transcriptionInProgress) {
    return;
  }

  transcriptionInProgress = true;

  // Show loading state
  const transcribeButton = document.getElementById('transcribe-button');
  const originalText = transcribeButton.textContent;
  transcribeButton.textContent = 'Transcribing...';
  transcribeButton.disabled = true;

  // Show progress indicator
  progressElement.classList.remove('hidden');

  try {
    const response = await window.Bridge.transcribeAudio(currentFile, {
      languageCode: currentLanguage,
      outputFolder: outputFolder, // Use the default Downloads folder
      chunkDuration: 30, // Fixed at 30 seconds
      apiKey: settings.apiKey,
      model: settings.model,
      useLocalModel: settings.useLocalModel
    });

    if (response.success) {
      // Show success message with Markdown file information
      let successMessage = `Transcription completed successfully!`;

      if (response.outputPath) {
        successMessage += ` Saved as Markdown to: ${response.outputPath}`;
      }

      successMessageElement.textContent = successMessage;
      successMessageElement.classList.remove('hidden');
      errorMessageElement.classList.add('hidden');

      // Display transcription result
      transcriptionResult = response.result || '';
      transcriptionContent.textContent = transcriptionResult;
      outputSection.style.display = 'block';
    } else {
      showError(`Transcription failed: ${response.error}`);
      // Hide the output section when there's an error
      outputSection.style.display = 'none';
    }
  } catch (error) {
    showError(`Error during transcription: ${error.message}`);
  } finally {
    // Reset UI
    transcribeButton.textContent = originalText;
    transcribeButton.disabled = false;
    progressElement.classList.add('hidden');
    transcriptionInProgress = false;
  }
}

function saveSettings() {
  // Update settings object
  settings.apiKey = apiKeyInput.value;
  settings.model = modelSelect.value;
  settings.useLocalModel = document.getElementById('use-local-model').checked;

  // Save to localStorage
  localStorage.setItem('transcriber_settings', JSON.stringify(settings));

  // Close modal
  settingsModal.style.display = 'none';
}

function loadSettings() {
  const savedSettings = localStorage.getItem('transcriber_settings');

  if (savedSettings) {
    try {
      settings = JSON.parse(savedSettings);

      // Apply settings to form elements
      apiKeyInput.value = settings.apiKey;
      modelSelect.value = settings.model;
      document.getElementById('use-local-model').checked = settings.useLocalModel;
    } catch (error) {
      console.error('Error parsing saved settings:', error);
    }
  }
}

function exportTranscription(format) {
  if (!transcriptionResult) {
    showError('No transcription to export.');
    return;
  }

  let content = transcriptionResult;
  let mimeType = 'text/plain';
  let extension = 'txt';

  // Format the content based on the selected format
  if (format === 'srt') {
    content = convertToSRT(transcriptionResult);
    extension = 'srt';
  } else if (format === 'vtt') {
    content = convertToVTT(transcriptionResult);
    mimeType = 'text/vtt';
    extension = 'vtt';
  }

  // Create a blob and download it
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transcription.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Hide export options
  exportOptions.classList.remove('show');
}

function convertToSRT(text) {
  // This is a simplified conversion for demo purposes
  // In a real implementation, you would need proper timing information
  const lines = text.split('\n\n');
  let srt = '';

  lines.forEach((line, index) => {
    if (line.trim()) {
      const startTime = formatSRTTime(index * 5);
      const endTime = formatSRTTime(index * 5 + 4.9);

      srt += `${index + 1}\n${startTime} --> ${endTime}\n${line}\n\n`;
    }
  });

  return srt;
}

function formatSRTTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)},${padZero(ms, 3)}`;
}

function convertToVTT(text) {
  // This is a simplified conversion for demo purposes
  // In a real implementation, you would need proper timing information
  const lines = text.split('\n\n');
  let vtt = 'WEBVTT\n\n';

  lines.forEach((line, index) => {
    if (line.trim()) {
      const startTime = formatVTTTime(index * 5);
      const endTime = formatVTTTime(index * 5 + 4.9);

      vtt += `${startTime} --> ${endTime}\n${line}\n\n`;
    }
  });

  return vtt;
}

function formatVTTTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}.${padZero(ms, 3)}`;
}

function padZero(num, size = 2) {
  let s = num.toString();
  while (s.length < size) s = '0' + s;
  return s;
}

function copyTranscription() {
  if (!transcriptionResult) {
    showError('No transcription to copy.');
    return;
  }

  navigator.clipboard.writeText(transcriptionResult)
    .then(() => {
      // Show a temporary success message
      const originalText = copyButton.innerHTML;
      copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg> Copied!';

      setTimeout(() => {
        copyButton.innerHTML = originalText;
      }, 2000);
    })
    .catch(err => {
      console.error('Failed to copy: ', err);
      showError('Failed to copy to clipboard.');
    });
}

function clearTranscription() {
  // Reset state
  currentFile = null;
  transcriptionResult = '';

  // Clear UI
  fileInput.value = '';
  filePreview.style.display = 'none';
  outputSection.style.display = 'none';
  transcriptionContent.textContent = '';
  successMessageElement.classList.add('hidden');
  errorMessageElement.classList.add('hidden');

  // Disable transcribe button
  transcribeButton.disabled = true;
}

function showError(message) {
  errorMessageElement.textContent = message;
  errorMessageElement.classList.remove('hidden');
  successMessageElement.classList.add('hidden');
}

