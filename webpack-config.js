// @ts-check
const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;

/**
 * @param {any} webpackConfig
 * @param {boolean} isDevelopment
 * @param {boolean} isStorybook
 * */
module.exports = function updateWebpackConfig(webpackConfig, isDevelopment, isStorybook) {

	// Storybook 6 recommends not changing the Typescript/Babel config.
	// I guess that's okay, since there's nothing absolutely required in our custom config.
	if (isStorybook) {
		return;
	}

	// ts-loader is present by default in ts-webpack-builder, but here we want to change some properties.
	// So, overwrite the rules array.
	webpackConfig.module.rules = [
		{
			test: /\.tsx?$/,
			exclude: /node_modules/,
			use: [
				{
					loader: 'babel-loader',
					options: {
						presets: [['@babel/preset-env', { debug: false, targets: '> 2%, not ie <= 11' }], '@babel/preset-react'],
						// Cache won't work, since it's part of the webpack pipeline.
						cacheDirectory: false,
						cacheCompression: false
					}
				},
				{
					loader: 'ts-loader',
					options: {
						getCustomTransformers: () => ({ before: [createStyledComponentsTransformer()] }),
						onlyCompileBundledFiles: true,
						//transpileOnly: true,
					}
				}
			]
		}
	];
};