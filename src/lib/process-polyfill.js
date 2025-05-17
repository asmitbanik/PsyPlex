// This file provides a process polyfill for browser environments
window.process = window.process || {
  env: {
    NODE_ENV: import.meta.env.MODE || 'development',
    npm_package_version: '1.0.0'
  }
};

export default window.process;
