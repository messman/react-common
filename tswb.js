// Config file for @messman/ts-webpack-builder
// @ts-check
const updateWebpackConfig = require('./webpack-config.js');

/**
 * @typedef { import('@messman/ts-webpack-builder').LibraryBuildOptions } LibraryBuildOptions
 */

/**
 * @type { Partial<LibraryBuildOptions> }
 */
const options = {
	libraryName: 'react-common',
	isNode: false,

	// NOTE - edits to this section should be reflected in the storybook config.
	webpackConfigTransform: (webpackConfig, buildOptions) => {
		updateWebpackConfig(webpackConfig, buildOptions.isDevelopment, false);
		return webpackConfig;
	}
};

module.exports = options;