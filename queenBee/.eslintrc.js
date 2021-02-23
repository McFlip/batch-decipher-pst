module.exports = {
    root: true,
    "settings": {
        "node": {
            "resolvePaths": [__dirname]
        }
    },
    parserOptions: {
        "ecmaVersion": 2020
    },
    plugins: [
      '@typescript-eslint',
    ],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      "plugin:node/recommended"
    ],
    rules: {
        "node/no-unsupported-features/es-syntax": ["error", {
            "ignores": [
                "modules"
            ]
        }],
        "node/no-missing-import": "off",
        "node/no-unpublished-import": "off"
    }
  };