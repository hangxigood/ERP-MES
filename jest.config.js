/**
 * @fileoverview Jest configuration for Next.js project
 * This configuration file sets up Jest testing environment with Next.js specific settings
 */

const nextJest = require('next/jest')

/**
 * Create Jest configuration with Next.js defaults
 * @param {Object} config - Next.js configuration object
 */
const createJestConfig = nextJest({
  dir: './', // Specifies the root directory for Next.js
})

/**
 * Custom Jest configuration
 * @type {Object}
 */
const customJestConfig = {
  // Set up test environment with custom configurations
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Use jsdom environment for DOM manipulation testing
  testEnvironment: 'jest-environment-jsdom',
  
  // Configure module path aliases to match Next.js configuration
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
  },
  
  // Enable code coverage reporting
  collectCoverage: true,
  
  // Specify which files to include in coverage report
  collectCoverageFrom: [
    'app/**/*.{js,jsx}',     // Cover app directory
    'components/**/*.{js,jsx}', // Cover components directory
    'lib/**/*.{js,jsx}',     // Cover lib directory
    '!**/*.d.ts',            // Exclude TypeScript declaration files
    '!**/node_modules/**',   // Exclude node_modules
  ]
}

// Export the configured Jest settings
module.exports = createJestConfig(customJestConfig)