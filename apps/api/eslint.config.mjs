import antfu from "@antfu/eslint-config";

export default antfu({
  formatters: true,
  stylistic: {
    indent: 2,
    semi: true,
    quotes: "double",
  },
  rules: {
    "style/operator-linebreak": ["off"],
    "style/arrow-parens": ["error", "always"],
    "style/member-delimiter-style": ["error"],
    "style/brace-style": ["error", "1tbs"],
  },
});
