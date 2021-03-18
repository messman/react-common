// @ts-check
const tswb = require('@messman/ts-webpack-builder');
const tswbConfig = require('./tswb');
const path = require('path');

/**
 * @typedef { import('@messman/ts-webpack-builder').LibraryBuildOptions } LibraryBuildOptions
 */

module.exports = (() => {

	/**
	 * @type { Partial<LibraryBuildOptions> }
	 */
	const cosmosConfig = {
		...tswbConfig,
		absoluteRoot: path.resolve(__dirname)
	};
	// Construct the config, but you don't really need it. Just the rules.
	const [_fullConfig, webpackConfig] = tswb.constructConfigs(cosmosConfig);
	// NOTE: you also need html-webpack-plugin as a dev dependency if you don't already have it.
	return {
		mode: 'development',
		target: 'web',
		resolve: {
			extensions: ['.ts', '.tsx', '.js', '.json'],
			alias: {
				'@': path.resolve(__dirname, './src')
			}
		},
		module: {
			rules: webpackConfig.module.rules
		}
	};
})();