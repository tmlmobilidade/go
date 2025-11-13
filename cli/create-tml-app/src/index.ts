#!/usr/bin/env node

import chalk from 'chalk';

import { ASCII_TMLMOBILIDADE, PACKAGES_TO_UPGRADE, REPLACE_FILE_PATHS, TEMPLATE_STRING } from './consts.js';
import { copyApp, copyMonorepo, getAvailableApps, replaceInFile, upgradePackages } from './utils/copy.js';
import { logger } from './utils/logger.js';
import { getProjectName, getProjectScope, selectApps, selectProjectType, selectSingleApp } from './utils/prompts.js';

/* * */

export const renderTitle = () => {
	let text = ASCII_TMLMOBILIDADE;

	text = text.replace(/▓/g, chalk.dim(chalk.yellow('▓')));
	text = text.replace(/ ▄▄▄ /g, chalk.yellow(' ▄▄▄ '));
	text = text.replace(/ ▀▀▀ /g, chalk.yellow(' ▀▀▀ '));
	text = text.replace(/▐▒▒▒▌/g, chalk.yellow('▐') + chalk.white('▒▒▒') + chalk.yellow('▌'));

	console.log(text);
};

async function main() {
	renderTitle();

	const projectType = await selectProjectType();

	if (projectType === 'monorepo') {
		const projectName = await getProjectName();
		const projectScope = await getProjectScope(projectName);
		const selectedApps = await selectApps(await getAvailableApps());

		logger.info('Copying monorepo...');
		await copyMonorepo(projectName);

		// Copy Selected Applications
		for (const app of selectedApps) {
			logger.clearPreviousLine();
			logger.info(`Copying ${app}...`);
			await copyApp(app, projectName + '/apps/' + app);

			// Replace template file paths
			if (REPLACE_FILE_PATHS[app]) {
				logger.clearPreviousLine();
				logger.info(`Replacing template file paths in ${app}...`);
				for (const filePath of REPLACE_FILE_PATHS[app]) {
					const filePathWithProjectName = projectName + '/apps/' + app + '/' + filePath;
					await replaceInFile(filePathWithProjectName, TEMPLATE_STRING, projectScope);
				}
			}

			// Upgrade Packages
			logger.clearPreviousLine();
			logger.info(`Upgrading packages in ${app}...`);
			await upgradePackages({
				packageJsonPath: projectName + '/apps/' + app + '/package.json',
				packages: PACKAGES_TO_UPGRADE,
			});
		}

		// Replace env variables
		logger.clearPreviousLine();
		logger.info('Replacing env variables...');
		await replaceInFile(projectName + '/package.json', TEMPLATE_STRING, projectScope);

		// Upgrade Packages in Root
		logger.clearPreviousLine();
		logger.info('Upgrading packages in root...');
		await upgradePackages({
			packageJsonPath: projectName + '/package.json',
			packages: PACKAGES_TO_UPGRADE,
		});

		return;
	}

	if (projectType === 'application') {
		const selectedApp = await selectSingleApp(await getAvailableApps());
		const projectName = await getProjectName();
		const projectScope = await getProjectScope(projectName);

		logger.info('Copying application...');
		await copyApp(selectedApp, projectName);

		// Replace template file paths
		logger.clearPreviousLine();
		logger.info('Replacing template file paths...');
		if (REPLACE_FILE_PATHS[projectName]) {
			for (const filePath of REPLACE_FILE_PATHS[projectName]) {
				logger.info(`Replacing template file paths in ${filePath}...`);
				const filePathWithProjectName = projectName + '/' + filePath;
				await replaceInFile(filePathWithProjectName, TEMPLATE_STRING, projectScope);
			}
		}

		// Upgrade Packages
		logger.clearPreviousLine();
		logger.info('Upgrading packsages...');
		await upgradePackages({
			packageJsonPath: projectName + '/package.json',
			packages: PACKAGES_TO_UPGRADE,
		});
		return;
	}
}

main().catch(console.error);
