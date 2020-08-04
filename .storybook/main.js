const path = require('path');
const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;

// https://storybook.js.org/docs/configurations/typescript-config/
module.exports = {

	stories: ['../src/**/*.story.tsx'],

	addons: ['@storybook/addon-viewport/register', '@storybook/addon-knobs/register'],

	webpackFinal: function (config) {

		config.module.rules = [
			{
				test: /\.tsx?$/,
				use: [
					{
						loader: 'babel-loader'
					},
					{
						loader: require.resolve('ts-loader'),
						options: {
							getCustomTransformers: () => ({ before: [createStyledComponentsTransformer()] })
						}
					}
				],
			}
		];

		// Taken from regular webpack build. Covered by ts-webpack-builder in main build
		config.resolve.extensions.push('.ts', '.tsx');
		config.resolve.alias['@'] = path.resolve(__dirname, '../src');

		return config;
	}
};