module.exports = {
  moduleFileExtensions: ['js', 'ts', 'json'],
  rootDir: '.',
  testRegex: '.*\\.(spec|test)\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
};
