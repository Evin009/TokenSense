import type { Config } from "jest"

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  rootDir: ".",
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
  setupFilesAfterFramework: ["<rootDir>/jest.setup.ts"],

  // Map @/ to the actual Next.js source tree
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/../../frontend/src/$1",

    // Stub Next.js internals so we don't need the full Next.js package here
    "^next/link$": "<rootDir>/mocks/next-link.tsx",
    "^next/navigation$": "<rootDir>/mocks/next-navigation.ts",
    "^next/font/(.*)$": "<rootDir>/mocks/next-font.ts",

    // Ignore CSS / image imports
    "\\.css$": "<rootDir>/mocks/style-mock.ts",
    "\\.(svg|png|jpg|jpeg|gif|webp)$": "<rootDir>/mocks/file-mock.ts",
  },

  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },

  // Allow resolving packages from the frontend's node_modules
  moduleDirectories: ["node_modules", "../../frontend/node_modules"],
}

export default config
