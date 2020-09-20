module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30000,
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  setupFilesAfterEnv: ['./testing/globals.js'],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/cli/**/*",
    "!src/preview/internals/*",
    "!testing/**/*",
  ],
};
