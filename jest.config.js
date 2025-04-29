/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^__tests__/(.*)$': '<rootDir>/__tests__/$1'
  },
};