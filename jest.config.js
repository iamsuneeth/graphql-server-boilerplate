module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globals: {
    request: true
  },
  setupFiles: ["<rootDir>/src/test/jest/init.ts"]
};
