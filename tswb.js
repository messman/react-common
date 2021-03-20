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
	webpackConfigTransform: (webpackConfig, _buildOptions) => {
		updateWebpackConfig(webpackConfig, false);
		return webpackConfig;
	}
};

module.exports = options;