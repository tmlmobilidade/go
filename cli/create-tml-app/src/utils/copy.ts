import { existsSync } from 'fs';
import { cp, readdir, readFile, writeFile } from 'fs/promises';
import ncu from 'npm-check-updates';
import { resolve } from 'path';

const TEMPLATES_DIR = resolve(new URL('.', import.meta.url).pathname, '..', '..', 'template');

export async function getAvailableApps(): Promise<string[]> {
	return await readdir(resolve(TEMPLATES_DIR, 'apps'));
}

export async function copyApp(appName: string, targetDir: string): Promise<void> {
	const appPath = resolve(TEMPLATES_DIR, 'apps', appName);
	const targetPath = resolve(process.cwd(), targetDir);

	await cp(appPath, targetPath, { recursive: true });
}

export async function copyMonorepo(targetDir: string): Promise<void> {
	const appPath = resolve(TEMPLATES_DIR, 'base');
	const targetPath = resolve(process.cwd(), targetDir);

	await cp(appPath, targetPath, { recursive: true });
}

export async function replaceInFile(filePath: string, search: string, replace: string): Promise<void> {
	const content = await readFile(filePath, 'utf8');
	await writeFile(filePath, content.replace(search, replace));
}

export async function upgradePackages({
	packageJsonPath,
	packages,
}: {
	packageJsonPath: string
	packages: string[]
}): Promise<void> {
	// Check if package.json exists
	if (!existsSync(packageJsonPath)) {
		return;
	}

	await ncu.run({
		filter: packages,
		packageFile: packageJsonPath,
		upgrade: true,
	});
}
