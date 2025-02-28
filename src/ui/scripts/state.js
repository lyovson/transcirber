// Application State
const state = {
  currentFile: null,
  currentFileData: null,
  currentLanguage: 'hy',
  outputFolder: '', // Will be set to Downloads folder automatically
  transcriptionInProgress: false,
  transcriptionResult: '',
  settings: {
    apiKey: '',
    model: 'scribe_v1',
    useLocalModel: false
  }
};

// State getters
export const getCurrentFile = () => state.currentFile;
export const getCurrentFileData = () => state.currentFileData;
export const getCurrentLanguage = () => state.currentLanguage;
export const getOutputFolder = () => state.outputFolder;
export const isTranscriptionInProgress = () => state.transcriptionInProgress;
export const getTranscriptionResult = () => state.transcriptionResult;
export const getSettings = () => state.settings;

// State setters
export const setCurrentFile = (file) => {
  state.currentFile = file;
};

export const setCurrentFileData = (data) => {
  state.currentFileData = data;
};

export const setCurrentLanguage = (language) => {
  state.currentLanguage = language;
};

export const setOutputFolder = (folder) => {
  state.outputFolder = folder;
};

export const setTranscriptionInProgress = (inProgress) => {
  state.transcriptionInProgress = inProgress;
};

export const setTranscriptionResult = (result) => {
  state.transcriptionResult = result;
};

export const updateSettings = (newSettings) => {
  state.settings = { ...state.settings, ...newSettings };
};

// Reset state
export const resetState = () => {
  state.currentFile = null;
  state.currentFileData = null;
  state.transcriptionResult = '';
  state.transcriptionInProgress = false;
};
