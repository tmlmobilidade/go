/* * */

import fs from 'node:fs';
import unzipper from 'unzipper';

/* * */

export async function unzipFile(zipFilePath: string, outputDir: string) {
	await fs
		.createReadStream(zipFilePath)
		.pipe(unzipper.Extract({ path: outputDir }))
		.promise();
	setDirectoryPermissions(outputDir);
}

/* * */

export function setDirectoryPermissions(dirPath: string, mode = 0o666) {
	const files = fs.readdirSync(dirPath, { withFileTypes: true });
	for (const file of files) {
		const filePath = `${dirPath}/${file.name}`;
		if (file.isDirectory()) {
			setDirectoryPermissions(filePath, mode);
		} else {
			fs.chmodSync(filePath, mode);
		}
	}
}
