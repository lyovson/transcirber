import DOMElements from './dom-elements.js';
import { getSettings, updateSettings } from './state.js';
import Bridge from './bridge.js';

/**
 * Save settings to localStorage
 */
export function saveSettings() {
  // Update settings object
  const newSettings = {
    apiKey: DOMElements.apiKeyInput.value.trim(),
    model: DOMElements.modelSelect.value,
    useLocalModel: DOMElements.useLocalModelCheckbox.checked
  };

  updateSettings(newSettings);

  // Save to localStorage
  localStorage.setItem('transcriber_settings', JSON.stringify(getSettings()));

  // Close modal
  DOMElements.settingsModal.style.display = 'none';
}

/**
 * Load settings from localStorage
 */
export function loadSettings() {
  const savedSettings = localStorage.getItem('transcriber_settings');

  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings);

      // Update state
      updateSettings(parsedSettings);

      // Apply settings to form elements
      DOMElements.apiKeyInput.value = parsedSettings.apiKey || '';
      DOMElements.modelSelect.value = parsedSettings.model || 'scribe_v1';
      DOMElements.useLocalModelCheckbox.checked = parsedSettings.useLocalModel || false;
    } catch (error) {
      console.error('Error parsing saved settings:', error);
    }
  }
}

/**
 * Load default output folder
 */
export async function loadDefaultOutputFolder() {
  try {
    // Get default folder
    const response = await Bridge.getDefaultFolder();

    if (response.success) {
      // Set default output folder in state
      return response.folder;
    } else {
      console.error('Failed to get default folder');
      return '';
    }
  } catch (error) {
    console.error('Error loading default output folder:', error);
    return '';
  }
}
