export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  rootDir: './',
  testMatch: ['<rootDir>/test/**/*-spec.ts'],
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: 'tsconfig.json', 
    }
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }]
  },
  moduleNameMapper: {
  '^(\\.{1,2}/.*)\\.js$': '$1', 
  },
};
