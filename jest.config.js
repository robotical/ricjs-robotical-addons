module.exports = {
  testPathIgnorePatterns : [
    "/node_modules/",
    "/dist/"
  ],
  roots: ['<rootDir>'],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
}
