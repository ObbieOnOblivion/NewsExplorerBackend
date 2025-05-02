// jest.config.mjs
export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(your-module-name)/)'
  ],
  moduleFileExtensions: ['js', 'json'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  collectCoverage: true,
  coverageThreshold: {global:{
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  }},
  // testEnvironment: 'node',
  // setupFilesAfterEnv: ['./jest.setup.js'],
  // globalTeardown: './jest.teardown.js',
  // clearMocks: true,
  // collectCoverage: true,
  // detectOpenHandles: true,
  // transform: {
  //   '^.+\\.(t|j)sx?$': 'ts-jest'
  // },
  // moduleFileExtensions: ['js', 'ts', 'json', 'node'],
  // coveragePathIgnorePatterns: [
  //   '/node_modules/',
  //   '/config/'
  // ],
  // testMatch: [
  //   '**/__tests__/**/*.test.[jt]s?(x)',
  //   '**/?(*.)+(spec|test).[jt]s?(x)'
  // ],
  // extensionsToTreatAsEsm: ['.js'],
  // moduleNameMapper: {
  //   '^(\\.{1,2}/.*)\\.js$': '$1'
  // },
  // extensionsToTreatAsEsm: ['.ts'],
  // transform: { "\\.[jt]sx?$": "babel-jest" },
  // globals: {
  //   'ts-jest': {
  //     useESM: true, // Enable ESM support in ts-jest
  //     diagnostics: false
  //   }
  // }
};