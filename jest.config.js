module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '/src/.*\\.(test|spec).(ts|tsx|js)$',
  coverageDirectory: 'coverage',
  coverageReporters: ['cobertura'],
  testResultsProcessor: 'jest-junit-reporter',
  testTimeout: 10000,
};
