import coreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...coreWebVitals,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
  },
  {
    files: ["**/*.test.js", "**/__tests__/**", "**/__mocks__/**"],
    rules: {
      "react/display-name": "off",
      "@next/next/no-img-element": "off",
      "@next/next/no-head-element": "off",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "coverage/**", "out/**", "public/**"],
  },
];

export default eslintConfig;
