import antfu from "@antfu/eslint-config";

export default antfu({
  type: "lib",
  typescript: true,
  vue: true,
  ignores: ["dist/", "node_modules/", "**/*.mjs", "**/*.cjs", "*.config.*"],
  stylistic: {
    semi: true,
    indent: 2,
  },
  rules: {
    "style/semi": ["error", "always"],
    "node/prefer-global/buffer": ["error", "always"],
  },
});
