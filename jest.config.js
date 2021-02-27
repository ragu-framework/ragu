module.exports = {
  preset: 'ts-jest',
  projects: ['<rootDir>*/jest.config.js'],
  moduleDirectories: [
    'ragu-dom/node_modules',
    'ragu-server/node_modules',
  ],
  testTimeout: 30000,
};
