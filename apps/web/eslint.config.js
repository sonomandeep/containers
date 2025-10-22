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
});
