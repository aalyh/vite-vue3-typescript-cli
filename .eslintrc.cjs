module.exports = {
	env: {
		browser: true,
		es2021: true
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:vue/vue3-essential',
		'plugin:prettier/recommended'
	],
	overrides: [
		{
			env: {
				node: true
			},
			files: ['.eslintrc.{js,cjs}'],
			parserOptions: {
				sourceType: 'script'
			}
		}
	],
	parserOptions: {
		ecmaVersion: 'latest',
		parser: '@typescript-eslint/parser', //指定解析器 支持TypeScript语法
		sourceType: 'module'
	},
	plugins: ['@typescript-eslint', 'vue'],
	// 在此目录中配置规则覆盖默认设置
	rules: {}
};
