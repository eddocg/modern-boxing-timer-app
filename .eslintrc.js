module.exports = {
  extends: [
    'expo',
    '@react-native-community'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    'react-native/no-unused-styles': 'warn',
    'react-native/split-platform-components': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_'
      }
    ],
    'no-console': [
      'warn',
      {
        allow: [
          'warn',
          'error'
        ]
      }
    ]
  },
  env: {
    'react-native/react-native': true,
    es2021: true,
    node: true,
    jest: true
  }
};
