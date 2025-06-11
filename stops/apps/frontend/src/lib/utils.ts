import clsx from 'clsx';
import { ClassValue } from 'clsx';
import { promises as fs } from 'fs';
// import { readFile } from 'fs/promises';
import JSZip from 'jszip';
import path from 'path';

export function cn(...inputs: ClassValue[]) {
	return clsx(inputs);
}

export function toggleArray<T>(array: T[], value: T) {
	if (array.includes(value)) {
		return array.filter(v => v !== value);
	}
	return [...array, value];
}

export async function unzipFile(originPath: string, destinationPath: string) {
	const origin = path.resolve(originPath);
	const destination = path.resolve(destinationPath);

	const data = await fs.readFile(origin);
	const zip = await JSZip.loadAsync(data);

	for (const filename in zip.files) {
		const file = zip.files[filename];
		const filePath = path.join(destination, filename);

		if (file.dir) {
			await fs.mkdir(filePath, { recursive: true });
		}
		else {
			await fs.mkdir(path.dirname(filePath), { recursive: true });
			const content = await file.async('nodebuffer');
			await fs.writeFile(filePath, content);
		}
	}

	console.log(`Unzipped to: ${destinationPath}`);
}
