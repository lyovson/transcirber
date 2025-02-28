/**
 * Bridge between the UI and the backend server
 * This file contains functions that communicate with the backend
 * through HTTP requests.
 */

// Base URL for API requests
const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Select an output folder using the native file dialog
 * @returns {Promise<Object>} Object containing available folders and current folder
 */
async function selectOutputFolder() {
  try {
    const response = await fetch(`${API_BASE_URL}/selectOutputFolder`);
    const data = await response.json();
    return {
      folders: data.folders || [],
      current: data.current || ''
    };
  } catch (error) {
    console.error('Error selecting output folder:', error);
    return { folders: [], current: '' };
  }
}

/**
 * Set the output folder
 * @param {string} folder - The folder path to set as output
 * @returns {Promise<Object>} Result of the operation
 */
async function setOutputFolder(folder) {
  try {
    const response = await fetch(`${API_BASE_URL}/setOutputFolder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folder }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error setting output folder:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload a file to the server
 * @param {File} file - The file to upload
 * @returns {Promise<Object>} Result of the upload operation
 */
async function uploadFile(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/uploadFile`, {
      method: 'POST',
      body: formData
    });

    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Transcribe an audio file
 * @param {string} filePath - Path to the audio file
 * @param {Object} options - Transcription options
 * @param {number} options.chunkDuration - Duration of each chunk in seconds
 * @param {string} options.languageCode - Language code for transcription
 * @param {string} options.outputFolder - Folder to save the transcription
 * @returns {Promise<Object>} Transcription result
 */
async function transcribeAudio(filePath, options) {
  try {
    const response = await fetch(`${API_BASE_URL}/transcribeAudio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePath, options }),
    });

    const result = await response.json();

    // Add information about the Markdown file if available
    if (result.success && result.outputPath) {
      result.markdownPath = result.outputPath;
    }

    return result;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred during transcription',
    };
  }
}

/**
 * Get a list of available languages for transcription
 * @returns {Promise<string[]>} List of language codes
 */
async function getAvailableLanguages() {
  try {
    const response = await fetch(`${API_BASE_URL}/getAvailableLanguages`);
    return await response.json();
  } catch (error) {
    console.error('Error getting available languages:', error);
    return ['en']; // Default to English if error
  }
}

/**
 * Get the full name of a language from its code
 * @param {string} code - Language code
 * @returns {Promise<string>} Language name
 */
async function getLanguageName(code) {
  try {
    const response = await fetch(`${API_BASE_URL}/getLanguageName?code=${code}`);
    const data = await response.json();
    return data.name || code;
  } catch (error) {
    console.error('Error getting language name:', error);
    return code; // Return the code if error
  }
}

// Export the bridge functions
window.Bridge = {
  selectOutputFolder,
  setOutputFolder,
  uploadFile,
  transcribeAudio,
  getAvailableLanguages,
  getLanguageName,
};
