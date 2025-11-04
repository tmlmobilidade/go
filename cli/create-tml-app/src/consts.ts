export { ASCII_TMLMOBILIDADE } from '@tmlmobilidade/lib';
export const TEMPLATE_STRING = '...scope...';
export const CREATE_TML_APP = 'create-tml-app';

// Replace in file
export const REPLACE_FILE_PATHS = {
	api: [
		'package.json',
		'Dockerfile',
	],
	base: [
		'package.json',
		'_deploy/compose.yml',
	],
	frontend: [
		'package.json',
		'Dockerfile',
	],
};

export const PACKAGES_TO_UPGRADE = [
	'@tmlmobilidade/*',
	'@carrismetropolitana/*',
];
