import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "**/.next/**",
      "**/.clerk/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/public/**",
    ],
  },

  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      indent: ["warn", 2],
      semi: ["warn", "always"],
      quotes: ["warn", "double"],
    },
  },
];

export default eslintConfig;
