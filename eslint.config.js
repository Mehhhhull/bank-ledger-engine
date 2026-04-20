export default [
  {
    files: ['**/*.js'], //only apply to js files
    rules: {
      semi: 'error', // enforce semicolons
      'no-unused-vars': 'warn', // warn about unused variables
    },
  },
];
