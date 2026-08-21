import tailwind from "eslint-plugin-tailwindcss";
import tsParser from "@typescript-eslint/parser";

/**
 * Bans arbitrary Tailwind values ( bg-[#000], mt-[37px], w-[1440px] ) so drift
 * is caught mechanically, not by eye. If a value is missing, add a token to
 * tailwind.config.ts — never an inline arbitrary value. See CLAUDE.md §6.
 *
 * Run with:  npm run lint
 *
 * Two things this config gets right that are easy to get wrong:
 *  1. `files` must be set explicitly. eslint-plugin-tailwindcss's own flat
 *     presets use root-only globs (`*.tsx`), so without this NOTHING in app/ or
 *     components/ is linted and the ban silently never runs.
 *  2. A TS parser must be declared, or every .ts/.tsx file is a parse error.
 */
export default [
  { ignores: ["_archive-v1-teal/**", "components_old/**", "app/_dev_old/**", ".next/**"] },
  ...tailwind.configs["flat/recommended"],
  {
    files: ["**/*.{js,mjs,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      tailwindcss: { config: "tailwind.config.ts", callees: ["clsx", "cn", "cva"] },
    },
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/-\\[[^\\]]+\\]/]",
          message: "No arbitrary Tailwind values — add a token to tailwind.config.ts instead.",
        },
        {
          selector: "TemplateElement[value.raw=/-\\[[^\\]]+\\]/]",
          message: "No arbitrary Tailwind values — add a token to tailwind.config.ts instead.",
        },
      ],
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/no-contradicting-classname": "error",
    },
  },
];
