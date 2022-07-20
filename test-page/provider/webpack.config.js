const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	target: ['web', 'es5'],
	mode: 'development',
	watch: true,
	entry: `./index.ts`,
	output: {
		filename: `index.js`,
		path: path.resolve(__dirname, `dist/`),
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: `index.html`,
			template: `index.html`,
			inject: 'body',
		})
	],
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: [
					{
						loader: 'ts-loader',
					},
				],
				exclude: /node_modules/,
			},
		]
	},
	devServer: {
		contentBase: `./`,
		compress: true,
		disableHostCheck: true,
		progress: true,
		host: '0.0.0.0',
		port: 8008,
		hot: true
	}
};
