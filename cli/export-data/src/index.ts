#!/usr/bin/env node

import { promptExportTypes } from '@/prompts/export-types.js';
import { promptFilterByStopIds } from '@/prompts/filter-stop-ids.js';
import { promptFilterTypes } from '@/prompts/filter-types.js';
import { exportValidationsRaw } from '@/tasks/apex-validations/validations-raw.js';
import chalk from 'chalk';

import { ASCII_TMLMOBILIDADE, PACKAGES_TO_UPGRADE, REPLACE_FILE_PATHS, TEMPLATE_STRING } from './consts.js';
import { promptFilterByLineIds } from './prompts/filter-line-ids.js';
import { promptFilterByPatternIds } from './prompts/filter-pattern-ids.js';
import { copyApp, copyMonorepo, getAvailableApps, replaceInFile, upgradePackages } from './utils/copy.js';
import { logger } from './utils/logger.js';
import { getProjectName, getProjectScope, selectApps, selectSingleApp } from './utils/prompts.js';

/* * */

async function main() {
	//

	//
	// Request the export types and which filters to apply

	const exportTypes = await promptExportTypes();

	const filterTypes = await promptFilterTypes();

	//
	// For the selected filters, request the filter values

	let stopIds: string[] = [];
	if (filterTypes.includes('stop-ids')) stopIds = await promptFilterByStopIds();

	let lineIds: string[] = [];
	if (filterTypes.includes('line-ids')) lineIds = await promptFilterByLineIds();

	let patternIds: string[] = [];
	if (filterTypes.includes('pattern-ids')) patternIds = await promptFilterByPatternIds();

	//
	// Iterate on the selected export types
	// and execute them sequentially.

	for (const exportType of exportTypes) {
		if (exportType === 'validations-raw') await exportValidationsRaw();
		logger.info(`Starting export for: ${chalk.green(exportType)}`);
	}

	process.exit(0);

	if (projectTypes.includes('monorepo')) {
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
