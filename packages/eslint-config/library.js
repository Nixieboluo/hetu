const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

/** @type {import("eslint").Linter.Config} */
module.exports = {
	extends: ['eslint:recommended', 'prettier', 'turbo'],
	plugins: ['only-warn'],
	globals: {
		React: true,
		JSX: true,
	},
	env: {
		node: true,
	},
	settings: {
		'import/resolver': {
			typescript: {
				project,
			},
		},
	},
	ignorePatterns: [
		// Ignore dotfiles
		'.*.js',
		'node_modules/',
		'dist/',
	],
	rules: {
		'no-unused-vars': 'off',
		'no-redeclare': 'off',
	},
	overrides: [
		{
			files: ['*.js?(x)', '*.ts?(x)'],
		},
	],
};
