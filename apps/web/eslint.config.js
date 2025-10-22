import antfu from "@antfu/eslint-config";

export default antfu({
  stylistic: {
    indent: 2,
    jsx: true,
    quotes: "double",
    semi: true,
  },
  formatters: true,
  react: true,
  rules: {
    "style/multiline-ternary": "warn",
    "style/arrow-parens": ["warn", "always"],
  },
});
