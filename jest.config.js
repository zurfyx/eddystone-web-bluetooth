module.exports = {
  transform: {
    '.(ts|tsx)': '<rootDir>/node_modules/ts-jest/preprocessor.js'
  },
  testMatch: [
    '**/__tests__/**/*.test.{t,j}s?(x)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
};
