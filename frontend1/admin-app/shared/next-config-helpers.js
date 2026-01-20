/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');

/**
 * Creates the shared alias configuration for webpack
 * For Docker builds, resolves to local ./shared folder
 * @param {string} dirname - The __dirname of the calling config file
 * @returns {Object} An object containing the @shared alias
 */
function createSharedAlias(dirname) {
  return {
    '@shared': path.resolve(dirname, './shared'),
  };
}

module.exports = { createSharedAlias };
