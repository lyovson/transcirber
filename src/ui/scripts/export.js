import DOMElements from './dom-elements.js';
import { getTranscriptionResult } from './state.js';
import { showError, padZero } from './ui-utils.js';

/**
 * Export transcription in the specified format
 * @param {string} format - The format to export (txt, srt, vtt)
 */
export function exportTranscription(format) {
  const transcriptionResult = getTranscriptionResult();

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
  DOMElements.exportOptions.classList.remove('show');
}

/**
 * Convert plain text to SRT format
 * @param {string} text - The text to convert
 * @returns {string} SRT formatted text
 */
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

/**
 * Format time for SRT format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time
 */
function formatSRTTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)},${padZero(ms, 3)}`;
}

/**
 * Convert plain text to VTT format
 * @param {string} text - The text to convert
 * @returns {string} VTT formatted text
 */
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

/**
 * Format time for VTT format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time
 */
function formatVTTTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}.${padZero(ms, 3)}`;
}

/**
 * Copy transcription to clipboard
 */
export function copyTranscription() {
  const transcriptionResult = getTranscriptionResult();

  if (!transcriptionResult) {
    showError('No transcription to copy.');
    return;
  }

  navigator.clipboard.writeText(transcriptionResult)
    .then(() => {
      // Show a temporary success message
      const originalText = DOMElements.copyButton.innerHTML;
      DOMElements.copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg> Copied!';

      setTimeout(() => {
        DOMElements.copyButton.innerHTML = originalText;
      }, 2000);
    })
    .catch(err => {
      console.error('Failed to copy: ', err);
      showError('Failed to copy to clipboard.');
    });
}
