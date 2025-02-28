import Bridge from './bridge.js';

// Test function to verify Bridge functionality
async function testBridge() {
  console.log('Testing Bridge module...');

  // Log Bridge object
  console.log('Bridge object:', Bridge);
  console.log('Bridge methods:', Object.keys(Bridge));

  // Test getAvailableLanguages
  try {
    console.log('Testing getAvailableLanguages...');
    const languages = await Bridge.getAvailableLanguages();
    console.log('Available languages:', languages);
  } catch (error) {
    console.error('Error getting available languages:', error);
  }

  // Test getDefaultFolder
  try {
    console.log('Testing getDefaultFolder...');
    const defaultFolder = await Bridge.getDefaultFolder();
    console.log('Default folder:', defaultFolder);
  } catch (error) {
    console.error('Error getting default folder:', error);
  }

  console.log('Bridge test complete');
}

// Run the test when the script is loaded
testBridge();
