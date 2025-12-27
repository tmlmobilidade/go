import { cancel, isCancel, multiselect, select, text } from '@clack/prompts';
import { existsSync } from 'fs';
import { resolve } from 'path';

export async function getProjectName() {
	const projectName = await text({
		message: 'What is your project name?',
		placeholder: 'my-monorepo',
		validate: (value) => {
			if (!value) return 'Project name is required';
			if (existsSync(resolve(process.cwd(), value))) {
				return 'Directory already exists';
			}
		},
	});

	if (isCancel(projectName)) {
		cancel('Operation cancelled');
		process.exit(0);
	}

	return projectName as string;
}

export async function getProjectScope(defaultScope: string) {
	const projectScope = (await text({
		message: 'What is your project scope? (eg. sae-alerts)',
		placeholder: defaultScope,
	})) ?? defaultScope;

	if (isCancel(projectScope)) {
		cancel('Operation cancelled');
		process.exit(0);
	}

	return projectScope as string;
}

export async function selectProjectType() {
	const repoType = await select({
		message: 'Select the type of project you want to create',
		options: [
			{
				hint: 'Create a monorepo project with multiple applications',
				label: 'Monorepo',
				value: 'monorepo',
			},
			{
				hint: 'Create a single application',
				label: 'Application',
				value: 'application',
			},
		],
	});

	return repoType as string;
}

export async function selectApps(availableApps: string[]) {
	const selectedApps = await multiselect({
		message: 'Select applications to include in your monorepo (press space to select)',
		options: availableApps.map(app => ({
			hint: `Add ${app} to your monorepo`, // Optional hint text
			label: app,
			value: app,
		})),
		required: false,
	});

	if (isCancel(selectedApps)) {
		cancel('Operation cancelled');
		process.exit(0);
	}

	return selectedApps as string[];
}

export async function selectSingleApp(availableApps: string[]) {
	const selectedApp = await select({
		message: 'Select an application to include in your project',
		options: availableApps.map(app => ({
			label: app,
			value: app,
		})),
	});

	if (isCancel(selectedApp)) {
		cancel('Operation cancelled');
		process.exit(0);
	}

	return selectedApp as string;
}
