import antfu from "@antfu/eslint-config";

export default antfu({
  formatters: true,
  react: true,
  stylistic: {
    indent: 2,
    jsx: true,
    semi: true,
    quotes: "double",
  },
  rules: {
    "style/multiline-ternary": "warn",
    "style/arrow-parens": ["warn", "always"],
    "react/no-context-provider": ["off"],
    "no-console": ["error", { allow: ["warn", "error"] }],
  },
});
