/** @type {import('jest').Config} */
const config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  setupFiles: ['<rootDir>/../test/setup-env.ts'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/../tsconfig.spec.json',
      },
    ],
  },
  collectCoverageFrom: ['**/*.(t|j)s', '!**/*.spec.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};

module.exports = config;
