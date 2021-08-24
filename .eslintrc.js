module.exports = {
	'extends': [
		'plugin:@typescript-eslint/recommended',
	],
	'plugins': ['@typescript-eslint'],
	'parser': '@typescript-eslint/parser',
	'parserOptions': {
		'project': './tsconfig.json',
		'tsconfigRootDir': __dirname,
		'ecmaVersion': 2018,
		'sourceType': 'module',
		'ecmaFeatures': {
			'jsx': true,
			'modules': true,
		}
	},
	'env': {
		'browser': true,
		'es6': true,
		'es2017': true,
		'es2020': true,
		'es2021': true,
	},
	'root': true,
	'rules': {
		// 在这里写需要覆盖的规则
	},
};
