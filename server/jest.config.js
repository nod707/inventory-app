module.exports = {
  testEnvironment: 'node',
  verbose: true,
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['./jest.setup.js'],
};
