const nextJest = require("next/jest")
const createJestConfig = nextJest({ dir: "./" })

module.exports = createJestConfig({
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterFramework: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
  testPathPattern: ["**/__tests__/**/*.test.ts?(x)"],
  collectCoverageFrom: ["components/**/*.tsx", "lib/**/*.ts", "app/api/**/*.ts"],
})
