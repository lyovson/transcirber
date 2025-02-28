import DOMElements from './dom-elements.js';
import {
  getCurrentFile,
  getOutputFolder,
  getCurrentLanguage,
  getSettings,
  isTranscriptionInProgress,
  setTranscriptionInProgress,
  setTranscriptionResult,
  setCurrentLanguage
} from './state.js';
import { showError, showSuccess } from './ui-utils.js';
import Bridge from './bridge.js';

/**
 * Update the current language based on the select element
 */
export function updateLanguageDisplay() {
  const selectedOption = DOMElements.languageSelect.options[DOMElements.languageSelect.selectedIndex];
  setCurrentLanguage(selectedOption.value);
}

/**
 * Load available languages from the server
 */
export async function loadLanguages() {
  try {
    const languages = await Bridge.getAvailableLanguages();

    // Clear existing options
    DOMElements.languageSelect.innerHTML = '';

    for (const lang of languages) {
      const nameResponse = await Bridge.getLanguageName(lang);

      const option = document.createElement('option');
      option.value = lang;
      option.textContent = nameResponse;
      DOMElements.languageSelect.appendChild(option);
    }

    // Set default language (Armenian)
    DOMElements.languageSelect.value = 'hy';
    setCurrentLanguage(DOMElements.languageSelect.value);
  } catch (error) {
    console.error('Error loading languages:', error);

    // Add a fallback option for Armenian if loading fails
    DOMElements.languageSelect.innerHTML = '';
    const option = document.createElement('option');
    option.value = 'hy';
    option.textContent = 'Armenian';
    DOMElements.languageSelect.appendChild(option);

    setCurrentLanguage('hy');
    showError('Failed to load languages. Using Armenian as default.');
  }
}

/**
 * Transcribe the current audio file
 */
export async function transcribeAudio() {
  const currentFile = getCurrentFile();

  if (!currentFile) {
    showError('Please select an audio file first.');
    return;
  }

  if (isTranscriptionInProgress()) {
    return;
  }

  setTranscriptionInProgress(true);

  // Show loading state
  const originalText = DOMElements.transcribeButton.textContent;
  DOMElements.transcribeButton.textContent = 'Transcribing...';
  DOMElements.transcribeButton.disabled = true;

  // Show progress indicator
  DOMElements.progressElement.classList.remove('hidden');

  try {
    const settings = getSettings();
    const response = await Bridge.transcribeAudio(currentFile, {
      languageCode: getCurrentLanguage(),
      outputFolder: getOutputFolder(), // Use the default Downloads folder
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

      showSuccess(successMessage);

      // Display transcription result
      const result = response.result || '';
      setTranscriptionResult(result);
      DOMElements.transcriptionContent.textContent = result;
      DOMElements.outputSection.style.display = 'block';
    } else {
      showError(`Transcription failed: ${response.error}`);
      // Hide the output section when there's an error
      DOMElements.outputSection.style.display = 'none';
    }
  } catch (error) {
    showError(`Error during transcription: ${error.message}`);
  } finally {
    // Reset UI
    DOMElements.transcribeButton.textContent = originalText;
    DOMElements.transcribeButton.disabled = false;
    DOMElements.progressElement.classList.add('hidden');
    setTranscriptionInProgress(false);
  }
}
