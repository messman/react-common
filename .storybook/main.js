const path = require('path');
const updateWebpackConfig = require('../webpack-config.js');

// https://storybook.js.org/docs/configurations/typescript-config/
module.exports = {
	stories: ['../src/**/*.story.tsx'],
	addons: ['@storybook/addon-viewport', '@storybook/addon-knobs'],

	// Need to enable 'allowNamespaces' to prevent a babel issue in Storybook 6.1
	// "Non-declarative namespaces are only supported experimentally in Babel"
	// See https://github.com/storybookjs/storybook/issues/11218
	babel: async (options) => {
		const { presets } = options;
		const presetToMatch = '@babel/preset-typescript';
		for (let i = 0; i < presets.length; i++) {
			const preset = presets[i];
			// Preset is either string or tuple.
			if (typeof preset === 'string' && preset.indexOf(presetToMatch) !== -1) {
				// String
				presets[i] = [
					preset,
					{
						allowNamespaces: true,
					}
				];
				break;
			}
			if (Array.isArray(preset) && preset[0] && preset[0].indexOf(presetToMatch) !== -1) {
				presets[i] = [
					preset[0],
					{
						...preset[1],
						allowNamespaces: true,
					}
				];
				break;
			}
		}
		return {
			...options,
		};
	},

	webpackFinal: async function (config) {

		updateWebpackConfig(config, true, true);

		// Taken from regular webpack build
		config.resolve.alias['@'] = path.resolve(__dirname, '../src');

		//console.dir(config, { depth: null });

		return config;
	}
};
