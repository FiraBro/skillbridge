// Diagnostic tool to help identify GitHub OAuth configuration issues
console.log('=== GITHUB OAUTH DIAGNOSTICS ===');
console.log('Current window location:', window.location.href);
console.log('Environment API URL:', import.meta.env.VITE_REACT_APP_API_URL);

// Check if we're on the callback page
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');
const error = urlParams.get('error');

if (error) {
  console.error('OAuth Error:', error, urlParams.get('error_description'));
  console.log('This suggests an issue with the GitHub OAuth configuration');
} else if (code && state) {
  console.log('OAuth code and state received successfully');
  console.log('Code length:', code.length);
  console.log('State length:', state.length);
  console.log('This means GitHub successfully redirected back to your app');
} else {
  console.log('No OAuth parameters detected in URL');
}

// Check if we're in a popup window
if (window.opener && window.opener !== window) {
  console.log('Running in a popup window');
} else {
  console.log('Running in main window');
}

console.log('=== END DIAGNOSTICS ===');