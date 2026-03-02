import nextConfig from "eslint-config-next"
import nextConfigTs from "eslint-config-next/typescript"
import prettierPlugin from "eslint-plugin-prettier"
import eslintConfigPrettier from "eslint-config-prettier"

const config = [
  // Ignore generated/dependency directories
  {
    ignores: ["node_modules/**", ".next/**", "dist/**", "build/**", "coverage/**"],
  },

  // Next.js base + core-web-vitals (includes React, React Hooks, @next/next rules)
  ...nextConfig,

  // TypeScript-aware rules from eslint-config-next
  ...nextConfigTs,

  // Turn off all rules that conflict with Prettier formatting
  eslintConfigPrettier,

  // Prettier as a lint rule + custom rule overrides
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      // React Compiler compatibility warning — not relevant when Compiler is not enabled
      "react-hooks/incompatible-library": "off",
    },
  },
]

export default config
