import aiAgent from 'eslint-config-ai-agent';

export default aiAgent({
  level: 'standard',
  typescript: true,
  react: false,         // Disable React to avoid dynamic require issues
  reactNative: false,   // Disable React Native to avoid dynamic require issues
  prettier: false,
  ignores: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '.expo/**',
    'web-build/**',
    'assets/**',
    'babel.config.js',
  ],
  overrides: {
    // Custom rules for React Native (manually added since reactNative is disabled)
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
});
