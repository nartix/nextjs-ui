/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest', { useESM: true }],
  },
  transformIgnorePatterns: ['/node_modules/(?!@nartix/next-csrf)'],
  testMatch: ['**/tests/**/*.test.ts', '**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@nartix/edge-token$': '<rootDir>/../edge-token/src/index.ts',
  },
};
