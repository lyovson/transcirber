// DOM Elements
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const filePreview = document.getElementById('file-preview');
const fileNameElement = document.getElementById('file-name');
const fileSizeElement = document.getElementById('file-size');
const languageSelect = document.getElementById('language-select');
const chunkSizeSlider = document.getElementById('chunk-size');
const chunkSizeValue = document.getElementById('chunk-size-value');
const outputPathElement = document.getElementById('output-path');
const browseOutputButton = document.getElementById('browse-output');
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
let currentLanguage = 'en';
let outputFolder = '';
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

  // Update chunk size display
  updateChunkSizeDisplay();

  // Load languages
  loadLanguages();

  // Load output locations
  loadOutputLocations();
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

  // Chunk Size Slider
  chunkSizeSlider.addEventListener('input', updateChunkSizeDisplay);

  // Browse Button
  document.getElementById('browse-button').addEventListener('click', () => {
    fileInput.click();
  });

  // Output folder selection
  browseOutputButton.addEventListener('click', showFolderSelector);

  // Language selection
  languageSelect.addEventListener('change', (e) => {
    currentLanguage = e.target.value;
    updateLanguageDisplay();
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

      // Enable transcribe button if we have an output folder
      checkTranscribeButtonState();

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

function updateChunkSizeDisplay() {
  const value = chunkSizeSlider.value;
  chunkSizeValue.textContent = value + ' seconds';
}

function checkTranscribeButtonState() {
  // Enable transcribe button only if we have a file and output location
  transcribeButton.disabled = !(currentFile && outputFolder);
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

    // Set default language
    currentLanguage = languageSelect.value;
    updateLanguageDisplay();
  } catch (error) {
    console.error('Error loading languages:', error);
    showError('Failed to load languages. Using English as default.');
  }
}

async function loadOutputLocations() {
  try {
    const response = await window.Bridge.selectOutputFolder();

    // Set default output folder
    outputFolder = response.current;
    outputPathElement.textContent = outputFolder;

    // Enable transcribe button if we have a file
    checkTranscribeButtonState();
  } catch (error) {
    console.error('Error loading output locations:', error);
    showError('Failed to load output locations.');
  }
}

async function showFolderSelector() {
  try {
    const response = await window.Bridge.selectOutputFolder();

    // Create a modal for folder selection
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Select Output Folder</h2>
        <select id="folder-select" class="folder-select">
          ${response.folders.map(folder => `<option value="${folder}">${folder}</option>`).join('')}
        </select>
        <div class="modal-buttons">
          <button id="select-folder-button" class="button">Select</button>
          <button id="cancel-folder-button" class="button button-secondary">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Set current folder as selected
    const select = document.getElementById('folder-select');
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].value === outputFolder) {
        select.selectedIndex = i;
        break;
      }
    }

    // Add event listeners
    document.querySelector('.close').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    document.getElementById('cancel-folder-button').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    document.getElementById('select-folder-button').addEventListener('click', async () => {
      const selectedFolder = select.value;

      try {
        const result = await window.Bridge.setOutputFolder(selectedFolder);

        if (result.success) {
          outputFolder = selectedFolder;
          outputPathElement.textContent = outputFolder;
          checkTranscribeButtonState();
        } else {
          showError(`Failed to set output folder: ${result.error}`);
        }
      } catch (error) {
        showError(`Error setting output folder: ${error.message}`);
      }

      document.body.removeChild(modal);
    });

  } catch (error) {
    console.error('Error showing folder selector:', error);
    showError(`Error showing folder selector: ${error.message}`);
  }
}

function updateLanguageDisplay() {
  const selectedOption = languageSelect.options[languageSelect.selectedIndex];
  document.getElementById('selected-language').textContent = selectedOption.textContent;
}

async function transcribeAudio() {
  if (!currentFile) {
    showError('Please select an audio file first.');
    return;
  }

  if (!outputFolder) {
    showError('Please select an output folder.');
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
      outputFolder: outputFolder,
      chunkDuration: parseInt(chunkSizeSlider.value, 10),
      apiKey: settings.apiKey,
      model: settings.model,
      useLocalModel: settings.useLocalModel
    });

    if (response.success) {
      // Show success message with Markdown file information
      let successMessage = `Transcription completed successfully!`;

      if (response.markdownPath) {
        successMessage += ` Saved as Markdown to: ${response.markdownPath}`;
      } else if (response.result && response.result.outputPath) {
        successMessage += ` Saved as Markdown to: ${response.result.outputPath}`;
      }

      successMessageElement.textContent = successMessage;
      successMessageElement.classList.remove('hidden');
      errorMessageElement.classList.add('hidden');

      // Display transcription result
      transcriptionResult = response.result.text || '';
      transcriptionContent.textContent = transcriptionResult;
      outputSection.style.display = 'block';
    } else {
      showError(`Transcription failed: ${response.error}`);
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

