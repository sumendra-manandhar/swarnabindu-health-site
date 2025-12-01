import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Detect Vercel/Next build
const isBuild = process.env.NODE_ENV === "production";

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Add custom rules here (this is the correct place)
  {
    rules: {
      // Disable no-explicit-any ONLY for production build
      "@typescript-eslint/no-explicit-any": isBuild ? "off" : "warn",
    },
  },
];

export default eslintConfig;
