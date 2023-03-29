import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  collectCoverageFrom: [
    "src/**/*.ts?(x)",
    "!src/tests/**/*.ts?(x)",
    "!src/**/*.d.ts",
    "!src/types/**/*.ts",
    "!src/**/index.ts?(x)",
    "!src/**/*.stories.ts?(x)",
  ],
  coverageDirectory: "coverage",
  testEnvironment: "jsdom",
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
};

export default config;
