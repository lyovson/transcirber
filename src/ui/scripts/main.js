import { setupEventListeners } from './event-handlers.js';
import { loadSettings } from './settings.js';
import { loadLanguages } from './transcription.js';
import { loadDefaultOutputFolder } from './settings.js';
import { setOutputFolder } from './state.js';
import Bridge from './bridge.js';

/**
 * Initialize the application
 */
async function init() {
  console.log('Initializing application...');

  try {
    // Log Bridge availability
    console.log('Bridge object available:', Bridge !== undefined);
    console.log('Bridge methods:', Object.keys(Bridge));

    // Load settings from localStorage if available
    console.log('Loading settings...');
    loadSettings();

    // Set up event listeners
    console.log('Setting up event listeners...');
    setupEventListeners();

    // Load languages
    console.log('Loading languages...');
    try {
      await loadLanguages();
      console.log('Languages loaded successfully');
    } catch (error) {
      console.error('Error loading languages:', error);
    }

    // Load default output location (Downloads folder)
    console.log('Loading default output folder...');
    try {
      const defaultFolder = await loadDefaultOutputFolder();
      console.log('Default output folder:', defaultFolder);
      setOutputFolder(defaultFolder);
    } catch (error) {
      console.error('Error loading default output folder:', error);
    }

    console.log('Initialization complete');
  } catch (error) {
    console.error('Error during initialization:', error);
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);

