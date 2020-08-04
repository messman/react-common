// Config file for @messman/ts-webpack-builder
// @ts-check

const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;

/**
 * @typedef { import('@messman/ts-webpack-builder').LibraryBuildOptions } LibraryBuildOptions
 */

/**
 * @type { Partial<LibraryBuildOptions> }
 */
const options = {
	libraryName: 'react-common',
	isNode: false,

	webpackConfigTransform: (webpackConfig, buildOptions) => {

		// ts-loader is present by default in ts-webpack-builder, but here we want to change some properties.
		webpackConfig.module.rules = [
			{
				test: /\.tsx?$/,
				use: [
					{
						loader: 'babel-loader'
					},
					{
						loader: 'ts-loader',
						options: {
							getCustomTransformers: () => ({ before: [createStyledComponentsTransformer()] })
						}
					}
				]
			},
		];

		return webpackConfig;
	}
};

module.exports = options;